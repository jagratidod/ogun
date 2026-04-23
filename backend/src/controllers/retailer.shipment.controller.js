const Shipment = require('../models/shipment.model');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Retailer receives shipment from Distributor
 * @route   PATCH /api/v1/retailer/shipments/:id/receive
 * @access  Private (Retailer)
 */
exports.receiveShipment = catchAsync(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return ApiResponse.error(res, 'Shipment not found', 404);
  }

  // Verify recipient
  if (shipment.recipient.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Unauthorized to receive this shipment', 403);
  }

  if (shipment.status === 'Delivered') {
    return ApiResponse.error(res, 'Shipment already received', 400);
  }

  // 1. Mark as Delivered
  shipment.status = 'Delivered';
  shipment.receivedAt = Date.now();
  await shipment.save();

  // 2. Update Retailer Inventory
  for (const item of shipment.products) {
    let stock = await Inventory.findOne({
      user: req.user._id,
      product: item.product
    });

    if (stock) {
      stock.quantity += item.quantity;
      await stock.save();
    } else {
      await Inventory.create({
        user: req.user._id,
        product: item.product,
        quantity: item.quantity
      });
    }
  }

  return ApiResponse.success(res, shipment, 'Inventory updated successfully');
});

/**
 * @desc    Get all incoming shipments for Retailer
 * @route   GET /api/v1/retailer/shipments
 * @access  Private (Retailer)
 */
exports.getIncomingShipments = catchAsync(async (req, res, next) => {
  const shipments = await Shipment.find({ recipient: req.user._id })
    .populate('sender', 'name businessName email')
    .populate('products.product', 'name sku')
    .sort('-createdAt');

  return ApiResponse.success(res, shipments, 'Shipments fetched');
});
