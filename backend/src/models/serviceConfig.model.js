const mongoose = require('mongoose');

const serviceConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'global', unique: true },
    serviceTypes: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

const ServiceConfig = mongoose.model('ServiceConfig', serviceConfigSchema);
module.exports = ServiceConfig;
