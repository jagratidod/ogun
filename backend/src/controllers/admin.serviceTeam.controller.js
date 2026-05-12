const User = require('../models/user.model');
const ServiceTarget = require('../models/serviceTarget.model');
const ServiceRequest = require('../models/serviceRequest.model');
const ApiResponse = require('../utils/apiResponse');
const serviceTeamService = require('../services/serviceTeam.service');

// @desc    Get service team hierarchy
// @route   GET /api/v1/admin/service-team/hierarchy
exports.getHierarchy = async (req, res, next) => {
    try {
        const members = await User.find({ serviceRole: { $ne: null } })
            .select('name email serviceRole serviceRegion serviceArea reportsTo phone')
            .populate('reportsTo', 'name serviceRole')
            .sort({ serviceRole: 1 });

        // Helper to build tree
        const buildTree = (parentId = null) => {
            return members
                .filter(m => String(m.reportsTo?._id || m.reportsTo) === String(parentId))
                .map(m => ({
                    ...m.toObject(),
                    children: buildTree(m._id)
                }));
        };

        const root = members.filter(m => !m.reportsTo);
        const tree = root.map(m => ({
            ...m.toObject(),
            children: buildTree(m._id)
        }));

        return ApiResponse.success(res, tree, 'Service hierarchy fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get service team members
// @route   GET /api/v1/admin/service-team/members
exports.getMembers = async (req, res, next) => {
    try {
        const { role, region } = req.query;
        const query = { serviceRole: { $ne: null } };
        if (role) query.serviceRole = role;
        if (region) query.serviceRegion = region;

        const members = await User.find(query)
            .select('-password')
            .populate('reportsTo', 'name serviceRole')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, members, 'Service team members fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Assign service role and hierarchy
// @route   PATCH /api/v1/admin/service-team/members/:id/assign
exports.assignServiceRole = async (req, res, next) => {
    try {
        const { serviceRole, serviceRegion, serviceArea, reportsTo } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) return ApiResponse.error(res, 'User not found', 404);

        if (serviceRole) user.serviceRole = serviceRole;
        if (serviceRegion) user.serviceRegion = serviceRegion;
        if (serviceArea !== undefined) user.serviceArea = serviceArea;
        if (reportsTo !== undefined) user.reportsTo = reportsTo || null;

        await user.save();
        return ApiResponse.success(res, user, 'Service role assigned successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Remove from service hierarchy
// @route   PATCH /api/v1/admin/service-team/members/:id/remove
exports.removeFromHierarchy = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return ApiResponse.error(res, 'User not found', 404);

        user.serviceRole = null;
        user.serviceRegion = null;
        user.serviceArea = null;
        user.reportsTo = null;

        await user.save();
        return ApiResponse.success(res, null, 'Removed from service hierarchy');
    } catch (error) {
        next(error);
    }
};

// @desc    Set targets for service team
// @route   POST /api/v1/admin/service-team/targets
exports.setTargets = async (req, res, next) => {
    try {
        const { assignments } = req.body; // Array of { assignedTo, serviceRole, period, targets }

        const results = await Promise.all(assignments.map(async (item) => {
            return await ServiceTarget.findOneAndUpdate(
                { assignedTo: item.assignedTo, period: item.period },
                { 
                    serviceRole: item.serviceRole,
                    targets: item.targets,
                    status: 'Active'
                },
                { upsert: true, new: true }
            );
        }));

        return ApiResponse.success(res, results, 'Service targets updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Get service targets
// @route   GET /api/v1/admin/service-team/targets
exports.getTargets = async (req, res, next) => {
    try {
        const { period, role } = req.query;
        const query = {};
        if (period) query.period = period;
        if (role) query.serviceRole = role;

        const targets = await ServiceTarget.find(query)
            .populate('assignedTo', 'name email serviceRole serviceRegion');

        return ApiResponse.success(res, targets, 'Service targets fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get performance dashboard
// @route   GET /api/v1/admin/service-team/performance
exports.getPerformanceDashboard = async (req, res, next) => {
    try {
        const { level, region, period } = req.query;
        const currentPeriod = period || new Date().toISOString().slice(0, 7);

        let query = { period: currentPeriod };
        if (level) query.serviceRole = level;

        const targets = await ServiceTarget.find(query)
            .populate('assignedTo', 'name serviceRegion serviceArea');

        // If region filter applied on populated data
        let filtered = targets;
        if (region) {
            filtered = targets.filter(t => t.assignedTo?.serviceRegion === region);
        }

        return ApiResponse.success(res, filtered, 'Performance data fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get individual performance
// @route   GET /api/v1/admin/service-team/performance/:id
exports.getIndividualPerformance = async (req, res, next) => {
    try {
        const history = await ServiceTarget.find({ assignedTo: req.params.id })
            .sort({ period: -1 });

        return ApiResponse.success(res, history, 'Individual performance history fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get leaderboard
// @route   GET /api/v1/admin/service-team/leaderboard
exports.getLeaderboard = async (req, res, next) => {
    try {
        const { period, region } = req.query;
        const currentPeriod = period || new Date().toISOString().slice(0, 7);

        const targets = await ServiceTarget.find({ period: currentPeriod, serviceRole: 'service_engineer' })
            .populate('assignedTo', 'name serviceRegion serviceArea')
            .lean();

        let filtered = targets;
        if (region) {
            filtered = targets.filter(t => t.assignedTo?.serviceRegion === region);
        }

        // Calculate a score for ranking
        const ranked = filtered.map(t => {
            const revScore = t.targets.revenue ? (t.actuals.revenue / t.targets.revenue) * 40 : 0;
            const csatScore = (t.actuals.csat || 0) * 0.4; // max 40
            const tatScore = t.targets.tat && t.actuals.tat ? (t.targets.tat / t.actuals.tat) * 20 : 0; // lower is better
            
            return {
                ...t,
                compositeScore: Math.min(100, Math.round(revScore + csatScore + tatScore))
            };
        }).sort((a, b) => b.compositeScore - a.compositeScore);

        return ApiResponse.success(res, ranked, 'Service leaderboard fetched');
    } catch (error) {
        next(error);
    }
};
