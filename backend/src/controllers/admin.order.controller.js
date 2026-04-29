const ProductOrder = require('../models/productOrder.model');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all orders for Admin
 * @route   GET /api/v1/admin/orders
 * @access  Private (Admin)
 */
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await ProductOrder.find()
    .populate('buyer', 'name email businessName phone')
    .populate('products.product', 'name sku images')
    .sort('-createdAt');

  return ApiResponse.success(res, orders, 'All orders fetched successfully');
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/admin/orders/:id/status
 * @access  Private (Admin)
 */
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, paymentStatus } = req.body;
  const order = await ProductOrder.findById(req.params.id);

  if (!order) {
    return ApiResponse.error(res, 'Order not found', 404);
  }

  const oldStatus = order.status;

  if (status) {
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'In Transit', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return ApiResponse.error(res, 'Invalid order status', 400);
    }
    order.status = status;
  }

  if (paymentStatus) {
    const validPaymentStatuses = ['Unpaid', 'Partial', 'Paid'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return ApiResponse.error(res, 'Invalid payment status', 400);
    }
    order.paymentStatus = paymentStatus;
  }

  // --- AUTOMATIC STOCK DEDUCTION LOGIC ---
  try {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), 'stock_logs.txt');
    const log = (msg) => {
      const time = new Date().toISOString();
      fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
      console.log(`[STOCK LOG] ${msg}`);
    };

    const mongoose = require('mongoose');
    const InventoryModel = mongoose.model('Inventory');
    const Invoice = mongoose.model('Invoice');
    const Transaction = mongoose.model('Transaction');

    const fulfillmentStatuses = ['Confirmed', 'Processing', 'In Transit', 'Completed'];
    const currentStatus = (status || '').trim();
    
    log(`START: Order ${order.orderId}, Status: ${currentStatus}, Deducted: ${order.stockDeducted}`);

    const isFulfillment = fulfillmentStatuses.some(s => s.toLowerCase() === currentStatus.toLowerCase());
    
    // --- Phase 3: Auto-Invoice Logic ---
    if (currentStatus.toLowerCase() === 'confirmed' && oldStatus.toLowerCase() !== 'confirmed') {
        const invoiceId = `INV-${order.orderId.split('-').pop()}`;
        
        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ invoiceId });
        if (!existingInvoice) {
            log(`- Creating Auto-Invoice: ${invoiceId}`);
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30); // 30 days credit period

            await Invoice.create({
                invoiceId,
                order: order._id,
                buyer: order.buyer,
                items: order.products.map(p => ({
                    product: p.product,
                    quantity: p.quantity,
                    price: p.priceAtOrder,
                    lineTotal: p.quantity * p.priceAtOrder
                })),
                subtotal: order.totalAmount,
                taxAmount: 0, // GST 0 for now as per current schema, can add 18% later
                totalAmount: order.totalAmount,
                dueDate,
                status: 'unpaid'
            });

            // Create a pending transaction for the ledger (Debit from Admin side/Receivable)
            await Transaction.create({
                transactionId: `TXN-ORD-${order.orderId.split('-').pop()}`,
                type: 'income',
                category: 'order_payment',
                description: `Invoice raised for Order ${order.orderId}`,
                amount: order.totalAmount,
                status: 'pending',
                relatedOrder: order._id,
                party: order.buyer,
                partyRole: 'distributor',
                createdBy: req.user._id
            });
        }
    }

    if (isFulfillment && !order.stockDeducted) {
      log(`Triggering deduction... Items: ${order.products?.length}`);
      
      for (const item of order.products) {
        try {
          if (!item.product) {
            log(`- Item skipped: No product ID`);
            continue;
          }

          const sellerId = order.seller?._id || order.seller || req.user._id;
          const productId = item.product?._id || item.product;

          log(`- Searching for Product: ${productId} under User: ${sellerId}`);

          let inv = await InventoryModel.findOne({ user: sellerId, product: productId });
          
          if (!inv) {
            log(`- Not found for user ${sellerId}. Trying universal search for ${productId}...`);
            inv = await InventoryModel.findOne({ product: productId });
          }

          if (inv) {
            const oldQty = inv.quantity;
            const deductionQty = Number(item.quantity) || 0;
            inv.quantity = Math.max(0, inv.quantity - deductionQty); 
            await inv.save();
            log(`- SUCCESS: ${deductionQty} units. ${oldQty} -> ${inv.quantity}`);
          } else {
            log(`- FAILED: No inventory record exists for product ${productId} anywhere.`);
          }
        } catch (itemError) {
          log(`- ITEM ERROR: ${itemError.message}`);
        }
      }
      order.stockDeducted = true;
    }

    if (currentStatus.toLowerCase() === 'cancelled' && order.stockDeducted) {
      log(`Triggering restoration...`);
      for (const item of order.products) {
        try {
          const sellerId = order.seller?._id || order.seller || req.user._id;
          const productId = item.product?._id || item.product;

          let inv = await InventoryModel.findOne({ user: sellerId, product: productId });
          if (!inv) inv = await InventoryModel.findOne({ product: productId });

          if (inv) {
            inv.quantity += (Number(item.quantity) || 0);
            await inv.save();
            log(`- RESTORED: ${item.quantity} for ${productId}`);
          }
        } catch (itemError) {
          log(`- RESTORE ERROR: ${itemError.message}`);
        }
      }
      order.stockDeducted = false;
    }
    log(`END: Logic finished for ${order.orderId}`);
  } catch (stockError) {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), 'stock_logs.txt');
    fs.appendFileSync(logPath, `[CRITICAL ERROR] ${stockError.stack}\n`);
    console.error('[STOCK ERROR]:', stockError);
  }

  // Final save for all changes
  await order.save();

  // Emit real-time update via Socket.io
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    if (io) {
      io.emit('order_status_updated', {
        orderId: order.orderId,
        mongoId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus
      });
    }
  } catch (err) {
    console.error('Socket emission failed:', err.message);
  }

  return ApiResponse.success(res, order, 'Order updated successfully');
});
