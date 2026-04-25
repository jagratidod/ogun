const RegisteredProduct = require('../models/registeredProduct.model');
const WarrantyExtension = require('../models/warrantyExtension.model');
const ServiceRequest = require('../models/serviceRequest.model');
const ApiResponse = require('../utils/apiResponse');

// ═══════════════════════════════════════════════
//  PRODUCT REGISTRATION
// ═══════════════════════════════════════════════

// @desc    Register a new product
// @route   POST /api/v1/customer/products/register
exports.registerProduct = async (req, res, next) => {
    try {
        const {
            productName, serialNumber, category, purchaseDate,
            invoiceNumber, storeName, purchaseMode, productUsage,
            warrantyPeriod, installationDate, installedBy,
            customerName, mobileNumber, email, city, state, amcOption
        } = req.body;

        // Basic validation before DB call
        if (!productName || !serialNumber || !purchaseDate || !customerName || !mobileNumber) {
            return ApiResponse.error(res, 'Missing required registration fields', 400);
        }

        // Check if serial number already registered
        const existing = await RegisteredProduct.findOne({ serialNumber: serialNumber.trim() });
        if (existing) {
            return ApiResponse.error(res, 'This serial number is already registered. If you believe this is an error, please contact support.', 400);
        }

        // Prepare product data
        const productData = {
            customer: req.user._id,
            productName: productName.trim(),
            serialNumber: serialNumber.trim(),
            category: category || 'other',
            purchaseDate: new Date(purchaseDate),
            invoiceNumber: invoiceNumber ? invoiceNumber.trim() : undefined,
            storeName: storeName ? storeName.trim() : undefined,
            purchaseMode: ['Offline', 'Online'].includes(purchaseMode) ? purchaseMode : 'Offline',
            productUsage: ['Residential', 'Commercial'].includes(productUsage) ? productUsage : 'Residential',
            warrantyPeriod: parseInt(warrantyPeriod) || 12,
            installedBy: ['Company', 'Local', 'Self'].includes(installedBy) ? installedBy : 'Company',
            customerName: customerName.trim(),
            mobileNumber: mobileNumber.trim(),
            email: email ? email.trim().toLowerCase() : undefined,
            city: city.trim(),
            state: state.trim(),
            amcOption: amcOption === 'Yes' || amcOption === 'true' || amcOption === true
        };

        // Handle File Upload to Cloudinary (from req.file)
        if (req.file) {
            productData.invoiceImage = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }

        // Handle installation date if provided and valid
        if (installationDate && !isNaN(new Date(installationDate).getTime())) {
            productData.installationDate = new Date(installationDate);
        }

        const product = await RegisteredProduct.create(productData);

        return ApiResponse.success(res, product, 'Product registered successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all registered products for logged-in customer
// @route   GET /api/v1/customer/products
exports.getMyProducts = async (req, res, next) => {
    try {
        const products = await RegisteredProduct.find({ customer: req.user._id })
            .sort({ createdAt: -1 });

        // Auto-update status for expired warranties
        const now = new Date();
        for (const p of products) {
            if (p.warrantyExpiryDate && p.warrantyExpiryDate < now && p.status === 'active') {
                p.status = 'expired';
                await p.save();
            }
        }

        return ApiResponse.success(res, products, 'Products fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product detail
// @route   GET /api/v1/customer/products/:id
exports.getProductDetail = async (req, res, next) => {
    try {
        const product = await RegisteredProduct.findOne({
            _id: req.params.id,
            customer: req.user._id
        });

        if (!product) {
            return ApiResponse.error(res, 'Product not found', 404);
        }

        return ApiResponse.success(res, product, 'Product detail fetched');
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════════════
//  WARRANTY EXTENSION
// ═══════════════════════════════════════════════

// @desc    Extend warranty for a product
// @route   POST /api/v1/customer/products/:id/extend-warranty
exports.extendWarranty = async (req, res, next) => {
    try {
        const { extensionMonths, extensionType, amount } = req.body;

        const product = await RegisteredProduct.findOne({
            _id: req.params.id,
            customer: req.user._id
        });

        if (!product) {
            return ApiResponse.error(res, 'Product not found', 404);
        }

        const previousExpiry = product.warrantyExpiryDate;
        const newExpiry = new Date(previousExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + parseInt(extensionMonths));

        // Create extension record
        const extension = await WarrantyExtension.create({
            registeredProduct: product._id,
            customer: req.user._id,
            extensionMonths: parseInt(extensionMonths),
            extensionType: extensionType || 'standard',
            previousExpiryDate: previousExpiry,
            newExpiryDate: newExpiry,
            amount: amount || 0
        });

        // Update the product's warranty expiry
        product.warrantyExpiryDate = newExpiry;
        product.warrantyPeriod = product.warrantyPeriod + parseInt(extensionMonths);
        product.status = 'active';
        await product.save();

        return ApiResponse.success(res, { extension, product }, 'Warranty extended successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Get warranty extension history
// @route   GET /api/v1/customer/warranty-history
exports.getWarrantyHistory = async (req, res, next) => {
    try {
        const extensions = await WarrantyExtension.find({ customer: req.user._id })
            .populate('registeredProduct', 'productName serialNumber category')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, extensions, 'Warranty history fetched');
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════════════
//  SERVICE REQUESTS
// ═══════════════════════════════════════════════

// @desc    Raise service request (only for registered products)
// @route   POST /api/v1/customer/service-requests
exports.raiseServiceRequest = async (req, res, next) => {
    try {
        const { registeredProductId, issueCategory, issueDescription, serviceAddress, contactNumber, priority } = req.body;

        // Verify product is registered and belongs to this customer
        const product = await RegisteredProduct.findOne({
            _id: registeredProductId,
            customer: req.user._id
        });

        if (!product) {
            return ApiResponse.error(res, 'Product not found or not registered under your account. Please register the product first.', 400);
        }

        const serviceRequest = await ServiceRequest.create({
            customer: req.user._id,
            registeredProduct: registeredProductId,
            issueCategory,
            issueDescription,
            serviceAddress: serviceAddress || `${product.city}, ${product.state}`,
            contactNumber: contactNumber || product.mobileNumber,
            priority: priority || 'Medium',
            history: [{
                status: 'Open',
                note: 'Service request raised by customer',
                updatedBy: req.user._id
            }]
        });

        return ApiResponse.success(res, serviceRequest, 'Service request created successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all service requests for logged-in customer
// @route   GET /api/v1/customer/service-requests
exports.getMyServiceRequests = async (req, res, next) => {
    try {
        const requests = await ServiceRequest.find({ customer: req.user._id })
            .populate('registeredProduct', 'productName serialNumber category')
            .populate('assignedTechnician', 'name email')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, requests, 'Service requests fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get single service request detail
// @route   GET /api/v1/customer/service-requests/:id
exports.getServiceRequestDetail = async (req, res, next) => {
    try {
        const request = await ServiceRequest.findOne({
            _id: req.params.id,
            customer: req.user._id
        })
            .populate('registeredProduct')
            .populate('assignedTechnician', 'name email')
            .populate('history.updatedBy', 'name');

        if (!request) {
            return ApiResponse.error(res, 'Service request not found', 404);
        }

        return ApiResponse.success(res, request, 'Service request detail fetched');
    } catch (error) {
        next(error);
    }
};
