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
