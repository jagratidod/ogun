const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true
  },
  podNumber: {
    type: String,
    unique: true,
    sparse: true
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
  carrierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    default: null
  },
  carrier: String, // Legacy text field
  trackingNumber: String, // Legacy text field
  packages: [
    {
      weight: Number, // Actual weight in kg
      length: Number, // cm
      width: Number,  // cm
      height: Number, // cm
      boxCount: { type: Number, default: 1 },
      fragileType: { type: String, enum: ['None', 'Glass', 'Electronic', 'Liquid'], default: 'None' }
    }
  ],
  volumetricWeight: Number,
  billedWeight: Number,
  zone: String,
  freightCost: Number,
  dispatchedAt: Date,
  deliveredAt: Date,
  expectedDeliveryDate: Date,
  podClosed: {
    type: Boolean,
    default: false
  },
  deliveryProof: String, // URL/Path to image
  hasComplaint: {
    type: Boolean,
    default: false
  },
  complaintDetails: String,
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
