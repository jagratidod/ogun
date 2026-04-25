const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Retailer', 'Distributor', 'Sales Executive', 'Staff'],
    required: true 
  },
  metric: {
    type: String,
    enum: ['rev', 'qty', 'retailers', 'srv'],
    default: 'rev'
  },
  targetValue: { type: Number, required: true },
  awardPoints: { type: Number, required: true },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Expired'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Target', targetSchema);
