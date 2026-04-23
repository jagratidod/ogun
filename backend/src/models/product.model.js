const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Base price is required']
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required']
  },
  distributorPrice: {
    type: Number,
    required: [true, 'Distributor price is required']
  },
  retailerPrice: {
    type: Number,
    required: [true, 'Retailer price is required']
  },
  description: {
    type: String
  },
  images: [
    {
      url: String,
      public_id: String
    }
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  unit: {
    type: String,
    default: 'units'
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
