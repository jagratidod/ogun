const Shipment = require('../models/shipment.model');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Create a shipment (Dispatch stock to Distributor)
 * @route   POST /api/v1/admin/shipments
 * @access  Private (Admin)
 */
exports.createShipment = catchAsync(async (req, res, next) => {
  const { recipientId, products, carrier, trackingNumber, notes } = req.body;

  // 1. Verify Admin has stock
  for (const item of products) {
    const adminStock = await Inventory.findOne({
      user: req.user._id,
      product: item.product
    });

    if (!adminStock || adminStock.quantity < item.quantity) {
      return ApiResponse.error(res, `Insufficient stock for product ${item.product}`, 400);
    }
  }

  // 2. Deduct stock from Admin
  for (const item of products) {
    await Inventory.findOneAndUpdate(
      { user: req.user._id, product: item.product },
      { $inc: { quantity: -item.quantity } }
    );
  }

  // 3. Create Shipment record
  const shipment = await Shipment.create({
    shipmentId: `SHP-${uuidv4().substring(0, 8).toUpperCase()}`,
    sender: req.user._id,
    recipient: recipientId,
    products,
    carrier,
    trackingNumber,
    notes,
    status: 'In Transit',
    dispatchedAt: Date.now()
  });

  return ApiResponse.success(res, shipment, 'Shipment dispatched successfully and stock deducted from Admin inventory');
});

/**
 * @desc    Get Admin dispatched shipments
 * @route   GET /api/v1/admin/shipments
 * @access  Private (Admin)
 */
exports.getAdminShipments = catchAsync(async (req, res, next) => {
  const shipments = await Shipment.find({ sender: req.user._id })
    .populate('recipient', 'name email businessName')
    .populate('products.product', 'name sku')
    .sort('-createdAt');

  return ApiResponse.success(res, shipments, 'Dispatched shipments fetched successfully');
});


/**
 * @desc    Get all shipments sent by Admin
 * @route   GET /api/v1/admin/shipments
 * @access  Private (Admin)
 */
exports.getAllShipments = catchAsync(async (req, res, next) => {
  const shipments = await Shipment.find({ sender: req.user._id })
    .populate('recipient', 'name email businessName')
    .populate('products.product', 'name sku')
    .sort('-createdAt');
    
  return ApiResponse.success(res, shipments, 'Shipments fetched successfully');
});
