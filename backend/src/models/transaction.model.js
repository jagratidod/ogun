const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'refund'],
    required: true
  },
  category: {
    type: String,
    enum: ['order_payment', 'payroll', 'bonus', 'deduction', 'retailer_payment', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductOrder'
  },
  relatedPayroll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payroll'
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  partyRole: {
    type: String,
    enum: ['distributor', 'retailer', 'employee', 'admin']
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'cash', 'system'],
    default: 'system'
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
