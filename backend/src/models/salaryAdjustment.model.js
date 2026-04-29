const mongoose = require('mongoose');

const salaryAdjustmentSchema = new mongoose.Schema({
  adjustmentId: {
    type: String,
    required: true,
    unique: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deduction', 'bonus'],
    required: true
  },
  category: {
    type: String,
    enum: ['loan_emi', 'advance_recovery', 'performance_bonus', 'referral_bonus', 'fine', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: String,
  applicableMonth: {
    type: String, // YYYY-MM
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'applied'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const SalaryAdjustment = mongoose.model('SalaryAdjustment', salaryAdjustmentSchema);

module.exports = SalaryAdjustment;
