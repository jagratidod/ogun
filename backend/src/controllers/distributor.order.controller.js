const ProductOrder = require('../models/productOrder.model');
const Product = require('../models/product.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get all available products (Admin products)
 */
exports.getAvailableProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ status: 'active' }).sort('-createdAt');
  return ApiResponse.success(res, products, 'Products fetched successfully');
});

/**
 * @desc    Place an order to Admin
 */
exports.placeOrder = catchAsync(async (req, res, next) => {
  const { items, notes } = req.body;
  
  if (!items || items.length === 0) {
    return ApiResponse.error(res, 'No items in order', 400);
  }

  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return ApiResponse.error(res, `Product ${item.productId} not found`, 404);
    }
    
    // For distributors, we use the distributorPrice
    const itemTotal = product.distributorPrice * item.quantity;
    totalAmount += itemTotal;
    
    processedItems.push({
      product: product._id,
      quantity: item.quantity,
      priceAtOrder: product.distributorPrice
    });
  }

  // Find the correct seller for these products
  // We look at the inventory record for the first product to see who owns it
  const Inventory = require('../models/inventory.model');
  const firstItemInv = await Inventory.findOne({ product: items[0].productId });
  const sellerId = firstItemInv ? firstItemInv.user : null;

  if (!sellerId) {
    // Fallback to any admin if no inventory record found
    const User = require('../models/user.model');
    const defaultAdmin = await User.findOne({ role: 'admin' });
    if (!defaultAdmin) return ApiResponse.error(res, 'No admin seller found', 404);
    var finalSellerId = defaultAdmin._id;
  } else {
    var finalSellerId = sellerId;
  }

  const order = await ProductOrder.create({
    orderId: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
    buyer: req.user._id,
    seller: finalSellerId,
    products: processedItems,
    totalAmount,
    notes,
    status: 'Pending'
  });
  
  // 4. Credit Reward Points to Distributor for placing order
  const RewardService = require('../services/rewardService');
  await RewardService.creditPoints(req.user._id, 'distributor', 'perOrderPlaced', `Order placed to Admin: ${order.orderId}`);
  
  return ApiResponse.success(res, order, 'Order placed successfully', 201);
});

/**
 * @desc    Get Distributor's personal orders
 */
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await ProductOrder.find({ buyer: req.user._id })
    .populate('products.product', 'name sku images')
    .sort('-createdAt');
    
  return ApiResponse.success(res, orders, 'Orders fetched successfully');
});

/**
 * @desc    Get orders received from retailers
 * @route   GET /api/v1/distributor/retailer-orders
 * @access  Private (Distributor)
 */
exports.getRetailerOrders = catchAsync(async (req, res, next) => {
    const orders = await ProductOrder.find({ 
        seller: req.user._id,
        orderType: 'retailer_to_distributor'
    })
    .populate('buyer', 'name email shopName businessName phone')
    .populate('products.product', 'name sku images unit')
    .sort('-createdAt');

    return ApiResponse.success(res, orders, 'Retailer orders fetched successfully');
});

/**
 * @desc    Distributor updates retailer order status
 * @route   PATCH /api/v1/distributor/retailer-orders/:id/status
 * @access  Private (Distributor)
 */
exports.updateRetailerOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const order = await ProductOrder.findById(req.params.id);

    if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
    }

    // Verify this distributor is the seller (Admins can bypass)
    console.log('[DEBUG] Order Seller:', order.seller?.toString());
    console.log('[DEBUG] Current User:', req.user._id?.toString());
    console.log('[DEBUG] User Role:', req.user.role);

    if (req.user.role !== 'admin' && order.seller.toString() !== req.user._id.toString()) {
        return ApiResponse.error(res, `Forbidden: Seller mismatch. Order belongs to distributor ${order.seller}`, 403);
    }

    if (status) {
        order.status = status;
        
        // --- STOCK DEDUCTION FOR SELLER (Distributor) ---
        const fulfillmentStatuses = ['Confirmed', 'Processing', 'In Transit', 'Completed'];
        if (fulfillmentStatuses.includes(status) && !order.stockDeducted) {
            const Inventory = require('../models/inventory.model');
            
            for (const item of order.products) {
                const inv = await Inventory.findOne({ 
                    user: order.seller, 
                    product: item.product 
                });
                
                if (inv) {
                    inv.quantity = Math.max(0, inv.quantity - item.quantity);
                    await inv.save();
                }
            }
            order.stockDeducted = true;
        }

        // --- STOCK ADDITION FOR BUYER (Retailer) ---
        if (status === 'Completed' && !order.stockAddedToBuyer) {
            const Inventory = require('../models/inventory.model');
            
            for (const item of order.products) {
                let buyerInv = await Inventory.findOne({ 
                    user: order.buyer, 
                    product: item.product 
                });
                
                if (buyerInv) {
                    buyerInv.quantity += item.quantity;
                    await buyerInv.save();
                } else {
                    await Inventory.create({
                        user: order.buyer,
                        product: item.product,
                        quantity: item.quantity
                    });
                }
            }
            order.stockAddedToBuyer = true;

            // --- FINANCIAL LEDGER RECORDING ---
            const Transaction = require('../models/transaction.model');
            const txnId = `ORD-${order.orderId}-${Date.now()}`;
            
            // 1. Record income for Distributor
            await Transaction.create({
                transactionId: `INC-${txnId}`,
                type: 'income',
                category: 'order_payment',
                description: `Sale to Retailer - Order ${order.orderId}`,
                amount: order.totalAmount,
                party: order.seller,
                partyRole: 'distributor',
                status: 'completed'
            });

            // 2. Record expense for Retailer
            await Transaction.create({
                transactionId: `EXP-${txnId}`,
                type: 'expense',
                category: 'order_payment',
                description: `Purchase from Distributor - Order ${order.orderId}`,
                amount: order.totalAmount,
                party: order.buyer,
                partyRole: 'retailer',
                status: 'completed'
            });

            // --- REWARD POINTS FOR SELLER (Distributor) ---
            const RewardService = require('../services/rewardService');
            await RewardService.creditPoints(order.seller, 'distributor', 'perOrderDispatched', `Fulfilled Retailer Order: ${order.orderId}`);
        }
    }

    await order.save();

    // Emit real-time update
    try {
        const { getIO } = require('../config/socket');
        const io = getIO();
        if (io) {
            io.emit('order_status_updated', {
                orderId: order.orderId,
                status: order.status
            });
        }
    } catch (err) {
        console.error('Socket emission failed:', err.message);
    }

    return ApiResponse.success(res, order, 'Retailer order updated successfully');
});
