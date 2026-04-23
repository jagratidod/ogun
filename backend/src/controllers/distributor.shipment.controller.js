const Shipment = require('../models/shipment.model');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Receive a shipment (Update inventory)
 * @route   PATCH /api/v1/distributor/shipments/:id/receive
 * @access  Private (Distributor)
 */
exports.receiveShipment = catchAsync(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return ApiResponse.error(res, 'Shipment not found', 404);
  }

  // Ensure the logged-in distributor is the intended recipient
  if (shipment.recipient.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'You are not authorized to receive this shipment', 403);
  }

  if (shipment.status === 'Delivered') {
    return ApiResponse.error(res, 'Shipment already received', 400);
  }

  // 1. Update Shipment Status
  shipment.status = 'Delivered';
  shipment.receivedAt = Date.now();
  await shipment.save();

  // 2. Update Distributor Inventory
  for (const item of shipment.products) {
    let distributorStock = await Inventory.findOne({
      user: req.user._id,
      product: item.product
    });

    if (distributorStock) {
      distributorStock.quantity += item.quantity;
      await distributorStock.save();
    } else {
      await Inventory.create({
        user: req.user._id,
        product: item.product,
        quantity: item.quantity
      });
    }
  }

  return ApiResponse.success(res, shipment, 'Shipment received and inventory updated');
});

/**
 * @desc    Get all shipments received by Distributor
 * @route   GET /api/v1/distributor/shipments
 * @access  Private (Distributor)
 */
exports.getReceivedShipments = catchAsync(async (req, res, next) => {
  const shipments = await Shipment.find({ recipient: req.user._id })
    .populate('sender', 'name email businessName')
    .populate('products.product', 'name sku')
    .sort('-createdAt');

  return ApiResponse.success(res, shipments, 'Incoming shipments fetched successfully');
});

/**
 * @desc    Dispatch shipment to Retailer
 * @route   POST /api/v1/distributor/shipments/dispatch
 * @access  Private (Distributor)
 */
exports.dispatchToRetailer = catchAsync(async (req, res, next) => {
  const { recipientId, products } = req.body; // products: [{ product, quantity }]

  if (!products || !products.length) {
    return ApiResponse.error(res, 'No products provided for shipment', 400);
  }

  // 1. Check if Distributor has enough stock
  for (const item of products) {
    const stock = await Inventory.findOne({
      user: req.user._id,
      product: item.product
    });

    if (!stock || stock.quantity < item.quantity) {
      return ApiResponse.error(res, `Insufficient stock for product ${item.product}`, 400);
    }
  }

  // 2. Deduct stock from Distributor Inventory atomically
  for (const item of products) {
    await Inventory.findOneAndUpdate(
      { user: req.user._id, product: item.product },
      { $inc: { quantity: -item.quantity } }
    );
  }

  // 3. Create Shipment record
  const shipment = await Shipment.create({
    shipmentId: `SHP-DR-${Date.now()}`,
    sender: req.user._id,
    recipient: recipientId,
    products: products.map(p => ({
      product: p.product,
      quantity: p.quantity,
      status: 'In Transit'
    })),
    status: 'In Transit',
    dispatchedAt: Date.now()
  });

  return ApiResponse.success(res, shipment, 'Shipment dispatched to retailer and stock deducted');
});

