const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockThreshold: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'Out of Stock'
  }
}, {
  timestamps: true
});

// Update status before saving
inventorySchema.pre('save', function() {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
