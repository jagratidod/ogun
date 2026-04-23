const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  saleId: {
    type: String,
    required: true,
    unique: true
  },
  retailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: String
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
      },
      priceAtSale: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Credit'],
    default: 'Cash'
  },
  notes: String
}, {
  timestamps: true
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
