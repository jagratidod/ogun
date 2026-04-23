const mongoose = require('mongoose');

const productOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Admin in this case
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
      priceAtOrder: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'In Transit', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  stockDeducted: {
    type: Boolean,
    default: false
  },
  notes: String
}, {
  timestamps: true
});

const ProductOrder = mongoose.model('ProductOrder', productOrderSchema);

module.exports = ProductOrder;
