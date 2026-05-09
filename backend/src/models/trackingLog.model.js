const mongoose = require('mongoose');

const trackingLogSchema = new mongoose.Schema({
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true,
    index: true
  },
  podNumber: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: [
      'Shipment Created', 
      'Packed', 
      'Dispatched', 
      'In Transit', 
      'Reached Hub', 
      'Out for Delivery', 
      'Delivered', 
      'Failed Delivery', 
      'Returned'
    ],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  remarks: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const TrackingLog = mongoose.model('TrackingLog', trackingLogSchema);

module.exports = TrackingLog;
