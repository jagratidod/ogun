const mongoose = require('mongoose');

const productQuerySchema = new mongoose.Schema({
  queryId: {
    type: String,
    unique: true
  },
  retailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  requestedQuantity: {
    type: Number,
    default: 1
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Acknowledged', 'Processing', 'Fulfilled', 'Rejected'],
    default: 'Pending'
  },
  adminNote: {
    type: String,
    trim: true
  },
  distributorNote: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const ProductQuery = mongoose.model('ProductQuery', productQuerySchema);
module.exports = ProductQuery;
