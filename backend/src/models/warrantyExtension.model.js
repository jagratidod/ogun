const mongoose = require('mongoose');

const warrantyExtensionSchema = new mongoose.Schema({
  registeredProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegisteredProduct',
    required: [true, 'Product reference is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  extensionMonths: {
    type: Number,
    required: [true, 'Extension period is required']
  },
  extensionType: {
    type: String,
    enum: ['standard', 'premium'],
    default: 'standard'
  },
  previousExpiryDate: {
    type: Date,
    required: true
  },
  newExpiryDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

const WarrantyExtension = mongoose.model('WarrantyExtension', warrantyExtensionSchema);

module.exports = WarrantyExtension;
