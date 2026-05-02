const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  direction: {
    type: String,
    enum: ['admin_to_distributor', 'distributor_to_retailer', 'retailer_to_customer'],
    required: true
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  carrier: String,
  trackingNumber: String,
  dispatchedAt: Date,
  deliveredAt: Date,
  expectedDeliveryDate: Date,
  trackingTimeline: [
    {
      status: String,
      location: String,
      timestamp: { type: Date, default: Date.now },
      note: String
    }
  ],
  notes: String
}, {
  timestamps: true
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
