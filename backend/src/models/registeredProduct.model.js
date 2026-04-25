const mongoose = require('mongoose');

const registeredProductSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  storeName: {
    type: String,
    trim: true
  },
  purchaseMode: {
    type: String,
    enum: ['Offline', 'Online'],
    default: 'Offline'
  },
  productUsage: {
    type: String,
    enum: ['Residential', 'Commercial'],
    default: 'Residential'
  },
  warrantyPeriod: {
    type: Number,
    default: 12 // months
  },
  warrantyStartDate: {
    type: Date
  },
  warrantyExpiryDate: {
    type: Date
  },
  installationDate: {
    type: Date
  },
  installedBy: {
    type: String,
    enum: ['Company', 'Local', 'Self'],
    default: 'Company'
  },
  invoiceImage: {
    url: String,
    public_id: String
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  amcOption: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Auto-set warranty dates before saving
registeredProductSchema.pre('save', async function () {
  if (this.isNew || this.isModified('purchaseDate') || this.isModified('warrantyPeriod')) {
    if (this.purchaseDate) {
      this.warrantyStartDate = this.purchaseDate;
      const expiry = new Date(this.purchaseDate);
      const period = parseInt(this.warrantyPeriod) || 12;
      expiry.setMonth(expiry.getMonth() + period);
      this.warrantyExpiryDate = expiry;
    }
  }
});

const RegisteredProduct = mongoose.model('RegisteredProduct', registeredProductSchema);

module.exports = RegisteredProduct;
