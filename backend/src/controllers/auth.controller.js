const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const Token = require('../models/token.model');
const sendEmail = require('../config/mail');
const ApiResponse = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Dev convenience: fixed OTP to unblock development without SMTP/email delivery.
// Enabled by default when NODE_ENV !== 'production'. Disable with DUMMY_OTP_ENABLED=false.
const DUMMY_OTP_CODE = String(process.env.DUMMY_OTP_CODE || '123456');
const DUMMY_OTP_ENABLED =
    process.env.NODE_ENV !== 'production' &&
    String(process.env.DUMMY_OTP_ENABLED || 'true').toLowerCase() === 'true';

// Utility: Sign Tokens
const signTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
    return { accessToken, refreshToken };
};

// @desc    Register a new Distributor or Retailer
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
    try {
        const { email, password, name, role, businessName, shopName, location, distributorId } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !name || !role) {
            return ApiResponse.error(res, "Email, Name, and Role are required", 400);
        }

        const allowedRoles = ['distributor', 'retailer'];
        if (!allowedRoles.includes(role)) {
            return ApiResponse.error(res, "Invalid role for registration. Allowed: distributor, retailer.", 400);
        }

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return ApiResponse.error(res, "A user with this email already exists", 400);
        }

        const user = await User.create({
            email: normalizedEmail,
            password, // If provided (admins/sub-admins), otherwise empty for OTP users
            name,
            role,
            subRole: null, // Initial registration doesn't assign sub-roles
            isActive: false, // Partner accounts require approval/activation by Admin
            businessName: businessName || null,
            shopName: shopName || null,
            location: location || null,
            distributor: distributorId || null
        });

        return ApiResponse.success(res, {
            id: user._id,
            email: user.email,
            role: user.role
        }, "Registration submitted. Your account will be enabled after Admin approval.", 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Request OTP for Login/Signup
// @route   POST /api/v1/auth/request-otp
exports.requestOTP = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !role) {
            return ApiResponse.error(res, "Email and Intended Role are required", 400);
        }

        const allowedRoles = ['admin', 'distributor', 'retailer', 'customer', 'sales_executive'];
        if (!allowedRoles.includes(role)) {
            return ApiResponse.error(res, "Invalid role for OTP request", 400);
        }

        // Check if user exists for Non-Customer roles
        const user = await User.findOne({ email: normalizedEmail });

        const autoCreateRoles = ['customer', 'sales_executive'];
        const isAutoCreateRole = autoCreateRoles.includes(role);

        if (!isAutoCreateRole && !user) {
            return ApiResponse.error(res, `The email ${normalizedEmail} is not registered as ${role.toUpperCase()}. Please contact Admin for access.`, 403);
        }

        if (user && user.role !== role) {
            return ApiResponse.error(res, `Identity Mismatch: This email is registered as ${user.role.toUpperCase()}, but you are trying to access the ${role.toUpperCase()} portal.`, 403);
        }

        // Block inactive accounts early
        if (user && !user.isActive) {
            return ApiResponse.error(res, "Your account is currently disabled. Please contact System Administrator.", 403);
        }

        // Dev-mode: skip email delivery and persist a fixed OTP code.
        if (DUMMY_OTP_ENABLED) {
            const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY) * 60 * 1000);
            await OTP.findOneAndUpdate(
                { email: normalizedEmail },
                { code: DUMMY_OTP_CODE, expiresAt, attempts: 0, verified: false },
                { upsert: true, new: true }
            );

            // Keep message stable for frontend UX; OTP will always be DUMMY_OTP_CODE in dev.
            return ApiResponse.success(res, null, "OTP sent successfully to your enterprise mail.");
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY) * 60 * 1000);

        // Send Email
        const message = `Your OGUN security token is: ${otpCode}. It expires in ${parseInt(process.env.OTP_EXPIRY)} minutes.`;
        const html = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2D8F9C;">OGUN APPLIANCES</h2>
                <p>Use the following security token to verify your identity:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E0128A; margin: 20px 0;">${otpCode}</div>
                <p style="font-size: 12px; color: #666;">This token expires in ${parseInt(process.env.OTP_EXPIRY)} minutes. If you did not request this, please ignore this email.</p>
            </div>
        `;

        // Save OTP to DB (update if exists) BEFORE sending, but rollback if mail fails.
        const otpDoc = await OTP.findOneAndUpdate(
            { email: normalizedEmail },
            { code: otpCode, expiresAt, attempts: 0, verified: false },
            { upsert: true, new: true }
        );

        try {
            await sendEmail({
                email: normalizedEmail,
                subject: 'Your OGUN Security Token',
                message,
                html
            });
        } catch (mailErr) {
            // Avoid false-positive "OTP sent" when SMTP rejected the recipient.
            await OTP.deleteOne({ _id: otpDoc._id });
            mailErr.statusCode = mailErr.statusCode || 502;
            throw mailErr;
        }

        return ApiResponse.success(res, null, "OTP sent successfully to your enterprise mail.");
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and Login
// @route   POST /api/v1/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp, name, role } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const providedOtp = String(otp || '').trim();

        if (!normalizedEmail || !providedOtp || !role) {
            return ApiResponse.error(res, "Missing required fields", 400);
        }

        const allowedRoles = ['admin', 'distributor', 'retailer', 'customer', 'sales_executive'];
        if (!allowedRoles.includes(role)) {
            return ApiResponse.error(res, "Invalid role for OTP verification", 400);
        }

        const isDummyOtp = DUMMY_OTP_ENABLED && providedOtp === DUMMY_OTP_CODE;

        let otpRecord = null;
        if (!isDummyOtp) {
            otpRecord = await OTP.findOne({ email: normalizedEmail });

            if (!otpRecord) {
                return ApiResponse.error(res, "OTP record not found. Request a new one.", 404);
            }

            if (otpRecord.expiresAt < Date.now()) {
                return ApiResponse.error(res, "OTP expired", 400);
            }

            if (otpRecord.attempts >= parseInt(process.env.OTP_ATTEMPT_LIMIT)) {
                return ApiResponse.error(res, "Too many failed attempts. Request a new OTP.", 400);
            }

            if (otpRecord.code !== providedOtp) {
                otpRecord.attempts += 1;
                await otpRecord.save();
                return ApiResponse.error(res, "Invalid OTP code", 400);
            }
        } else {
            // If a record exists, clean it up after successful login (below).
            otpRecord = await OTP.findOne({ email: normalizedEmail });
        }

        // Valid OTP -> Find or Create User
        let user = await User.findOne({ email: normalizedEmail });

        if (!user && (role === 'customer' || role === 'sales_executive')) {
            user = await User.create({
                email: normalizedEmail,
                name: name || email.split('@')[0],
                role: role,
                isActive: true,
                salesExecutiveData: {
                    assignedArea: 'General',
                    totalPoints: 0
                }
            });
        }

        if (!user) {
            return ApiResponse.error(res, "User not found after verification", 404);
        }

        if (user.role !== role) {
            return ApiResponse.error(res, "Role mismatch during verification", 403);
        }

        if (role !== 'customer' && !user.isActive) {
            return ApiResponse.error(res, "Account pending approval or currently disabled. Please contact Admin.", 403);
        }

        // Generate Tokens
        const { accessToken, refreshToken } = signTokens(user._id);

        // Save Refresh Token
        const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // match env config
        await Token.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: refreshExpires
        });

        // Clean up OTP (if present)
        if (otpRecord?._id) {
            await OTP.deleteOne({ _id: otpRecord._id });
        }

        user.lastLogin = Date.now();
        await user.save();

        return ApiResponse.success(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subRole: user.subRole,
                permissions: user.permissions
            },
            accessToken,
            refreshToken
        }, "Verification successful");

    } catch (error) {
        next(error);
    }
};

// @desc    Admin Login (Password Based)
// @route   POST /api/v1/auth/admin/login
exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return ApiResponse.error(res, "Please provide email and password", 400);
        }

        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user || user.role !== 'admin') {
            return ApiResponse.error(res, "Unauthorized access", 401);
        }

        const isMatch = await user.comparePassword(password, user.password);
        if (!isMatch) {
            return ApiResponse.error(res, "Invalid credentials", 401);
        }

        if (!user.isActive) {
            return ApiResponse.error(res, "This account has been deactivated", 403);
        }

        const { accessToken, refreshToken } = signTokens(user._id);

        // Save Refresh Token
        const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await Token.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: refreshExpires
        });

        user.lastLogin = Date.now();
        await user.save();

        return ApiResponse.success(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subRole: user.subRole,
                permissions: user.permissions
            },
            accessToken,
            refreshToken
        }, "Admin login successful");

    } catch (error) {
        next(error);
    }
};

// @desc    Refresh Access Token
// @route   POST /api/v1/auth/refresh
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return ApiResponse.error(res, "Refresh token required", 400);
        }

        const tokenDoc = await Token.findOne({ token: refreshToken });
        if (!tokenDoc) {
            return ApiResponse.error(res, "Invalid refresh token", 401);
        }

        if (tokenDoc.expiresAt < Date.now()) {
            await Token.deleteOne({ _id: tokenDoc._id });
            return ApiResponse.error(res, "Refresh token expired. Please login again.", 401);
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            await Token.deleteOne({ _id: tokenDoc._id });
            return ApiResponse.error(res, "Invalid or expired refresh token", 401);
        }
        const { accessToken, refreshToken: newRefreshToken } = signTokens(decoded.id);

        // Rotate refresh token
        tokenDoc.token = newRefreshToken;
        tokenDoc.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await tokenDoc.save();

        return ApiResponse.success(res, {
            accessToken,
            refreshToken: newRefreshToken
        }, "Token refreshed");

    } catch (error) {
        next(error);
    }
};

// @desc    Get all active distributors (for registration selection)
// @route   GET /api/v1/auth/distributors
exports.getDistributors = async (req, res, next) => {
    try {
        const distributors = await User.find({ role: 'distributor', isActive: true })
            .select('name businessName location');
        return ApiResponse.success(res, distributors, "Distributors fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await Token.deleteOne({ token: refreshToken });
        }
        return ApiResponse.success(res, null, "Logged out successfully");
    } catch (error) {
        next(error);
    }
};

// @desc    Technician Self-Registration
// @route   POST /api/v1/auth/technician/register
exports.registerTechnician = async (req, res, next) => {
    try {
        const { name, email, password, phone, location, services } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!name || !normalizedEmail || !password) {
            return ApiResponse.error(res, 'Name, email and password are required', 400);
        }

        if (!phone || !/^[6-9]\d{9}$/.test(String(phone).trim())) {
            return ApiResponse.error(res, 'A valid 10-digit mobile number is required', 400);
        }

        if (!services || !Array.isArray(services) || services.length === 0) {
            return ApiResponse.error(res, 'Please select at least one service you can provide', 400);
        }

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return ApiResponse.error(res, 'An account with this email already exists', 400);
        }

        const technician = await User.create({
            name,
            email: normalizedEmail,
            password,
            phone: phone || null,
            location: location || null,
            services,
            role: 'admin',
            subRole: 'technician',
            isActive: false,
            approvalStatus: 'pending'
        });

        return ApiResponse.success(res, {
            id: technician._id,
            name: technician.name,
            email: technician.email,
            approvalStatus: technician.approvalStatus
        }, 'Registration submitted. Your account will be activated after admin approval.', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Technician Login (Password Based)
// @route   POST /api/v1/auth/technician/login
exports.technicianLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return ApiResponse.error(res, 'Email and password are required', 400);
        }

        const user = await User.findOne({ email: normalizedEmail, subRole: { $in: ['technician', 'technician_manager'] } }).select('+password');

        if (!user) {
            return ApiResponse.error(res, 'No technician account found with this email', 401);
        }

        const isMatch = await user.comparePassword(password, user.password);
        if (!isMatch) {
            return ApiResponse.error(res, 'Invalid credentials', 401);
        }

        if (user.approvalStatus === 'pending') {
            return ApiResponse.error(res, 'Your account is pending admin approval. Please wait.', 403);
        }

        if (user.approvalStatus === 'rejected') {
            return ApiResponse.error(res, 'Your account has been rejected. Please contact admin.', 403);
        }

        if (!user.isActive) {
            return ApiResponse.error(res, 'Your account is currently deactivated. Contact admin.', 403);
        }

        const { accessToken, refreshToken } = signTokens(user._id);

        const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await Token.create({ userId: user._id, token: refreshToken, expiresAt: refreshExpires });

        user.lastLogin = Date.now();
        await user.save();

        return ApiResponse.success(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subRole: user.subRole,
                permissions: user.permissions
            },
            accessToken,
            refreshToken
        }, 'Login successful');
    } catch (error) {
        next(error);
    }
};
