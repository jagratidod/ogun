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
  carrier: String,
  trackingNumber: String,
  dispatchedAt: Date,
  deliveredAt: Date,
  notes: String
}, {
  timestamps: true
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
