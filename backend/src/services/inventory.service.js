const Inventory = require('../models/inventory.model');
const ProductOrder = require('../models/productOrder.model');

class InventoryService {
  /**
   * Recalculates sales velocity and prediction days for all active items.
   */
  async updateIntelligence() {
    const inventories = await Inventory.find().populate('product');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const inv of inventories) {
      // Find orders for this product in last 30 days
      const orders = await ProductOrder.find({
        'products.product': inv.product._id,
        status: 'Completed',
        createdAt: { $gte: thirtyDaysAgo }
      });

      let totalSold = 0;
      orders.forEach(order => {
        const item = order.products.find(p => p.product.toString() === inv.product._id.toString());
        if (item) totalSold += item.quantity;
      });

      // Daily velocity
      const velocity = totalSold / 30;
      inv.stockVelocity = parseFloat(velocity.toFixed(2));

      // Prediction
      if (velocity > 0) {
        inv.predictionDays = Math.floor(inv.quantity / velocity);
      } else {
        inv.predictionDays = 999;
      }

      await inv.save();
    }
  }

  /**
   * Gets items that are predicted to stock out soon.
   */
  async getCriticalAlerts(daysThreshold = 7) {
    return await Inventory.find({
      predictionDays: { $lte: daysThreshold },
      quantity: { $gt: 0 }
    }).populate('product user', 'name businessName shopName email');
  }
}

module.exports = new InventoryService();
