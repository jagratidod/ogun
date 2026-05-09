const mongoose = require('mongoose');

const carrierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['courier', 'transport', 'local'],
    required: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  apiKey: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true
  },
  deliverySLA: {
    type: Number, // Typical delivery days
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pricingZones: [
    {
      zone: { type: String, required: true }, // e.g., "North", "West", "Zone-A"
      minWeight: { type: Number, default: 0 },
      maxWeight: { type: Number, default: 9999 },
      basePrice: { type: Number, default: 0 },
      pricePerKg: { type: Number, required: true }
    }
  ],
  contactPerson: String,
  phone: String,
  email: String
}, {
  timestamps: true
});

const Carrier = mongoose.model('Carrier', carrierSchema);

module.exports = Carrier;
