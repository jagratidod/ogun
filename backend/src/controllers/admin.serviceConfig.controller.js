const ServiceConfig = require('../models/serviceConfig.model');
const ApiResponse = require('../utils/apiResponse');

const DEFAULT_SERVICES = [
    'Mixer Grinder', 'Induction Cooktop', 'Microwave Oven', 'Water Purifier',
    'Air Fryer', 'Electric Kettle', 'Chimney', 'Dishwasher', 'Toaster',
    'Hand Blender', 'Juicer', 'Rice Cooker', 'Sandwich Maker', 'Coffee Maker', 'Food Processor'
];

const getOrCreate = async () => {
    let config = await ServiceConfig.findOne({ key: 'global' });
    if (!config) config = await ServiceConfig.create({ key: 'global', serviceTypes: DEFAULT_SERVICES });
    return config;
};

// @desc  GET /api/v1/service-config  (public — used by technician signup)
exports.getServiceConfig = async (req, res, next) => {
    try {
        const config = await getOrCreate();
        return ApiResponse.success(res, { serviceTypes: config.serviceTypes }, 'Service config fetched');
    } catch (err) { next(err); }
};

// @desc  PUT /api/v1/admin/service-config  (admin only)
exports.updateServiceConfig = async (req, res, next) => {
    try {
        const { serviceTypes } = req.body;
        if (!Array.isArray(serviceTypes)) {
            return ApiResponse.error(res, 'serviceTypes must be an array', 400);
        }
        const cleaned = [...new Set(serviceTypes.map(s => String(s).trim()).filter(Boolean))];
        if (cleaned.length === 0) {
            return ApiResponse.error(res, 'At least one service type is required', 400);
        }
        const config = await getOrCreate();
        config.serviceTypes = cleaned;
        await config.save();
        return ApiResponse.success(res, { serviceTypes: config.serviceTypes }, 'Service types updated');
    } catch (err) { next(err); }
};
