const Carrier = require('../models/carrier.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all carriers
 * @route   GET /api/v1/admin/carriers
 */
exports.getAllCarriers = catchAsync(async (req, res, next) => {
  const carriers = await Carrier.find({ isActive: true });
  return ApiResponse.success(res, carriers, 'Carriers fetched successfully');
});

/**
 * @desc    Create a new carrier
 * @route   POST /api/v1/admin/carriers
 */
exports.createCarrier = catchAsync(async (req, res, next) => {
  const carrier = await Carrier.create(req.body);
  return ApiResponse.success(res, carrier, 'Carrier created successfully', 201);
});

/**
 * @desc    Get carrier detail
 * @route   GET /api/v1/admin/carriers/:id
 */
exports.getCarrierById = catchAsync(async (req, res, next) => {
  const carrier = await Carrier.findById(req.params.id);
  if (!carrier) return ApiResponse.error(res, 'Carrier not found', 404);
  return ApiResponse.success(res, carrier, 'Carrier detail fetched');
});

/**
 * @desc    Update carrier
 * @route   PUT /api/v1/admin/carriers/:id
 */
exports.updateCarrier = catchAsync(async (req, res, next) => {
  const carrier = await Carrier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!carrier) return ApiResponse.error(res, 'Carrier not found', 404);
  return ApiResponse.success(res, carrier, 'Carrier updated successfully');
});

/**
 * @desc    Soft delete carrier
 * @route   DELETE /api/v1/admin/carriers/:id
 */
exports.deleteCarrier = catchAsync(async (req, res, next) => {
  const carrier = await Carrier.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!carrier) return ApiResponse.error(res, 'Carrier not found', 404);
  return ApiResponse.success(res, null, 'Carrier deactivated successfully');
});

/**
 * @desc    Rate Engine: Calculate freight cost and recommend best carrier
 * @route   GET /api/v1/admin/carriers/rate-engine
 */
exports.calculateFreight = catchAsync(async (req, res, next) => {
  const { weight, length, width, height, zone, mode } = req.query;

  if (!weight || !length || !width || !height || !zone) {
    return ApiResponse.error(res, 'Missing parameters: weight, length, width, height, zone', 400);
  }

  const actualWeight = parseFloat(weight);
  const volumetricWeight = (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 5000;
  const billedWeight = Math.max(actualWeight, volumetricWeight);

  const carriers = await Carrier.find({ isActive: true });
  
  const recommendations = carriers.map(carrier => {
    // Filter by mode if provided
    if (mode && carrier.type !== mode) return null;

    const zonePrice = carrier.pricingZones.find(p => p.zone.toLowerCase() === zone.toLowerCase());
    if (!zonePrice) return null;

    // SLA Adjustment logic (Simulated)
    const totalCost = zonePrice.basePrice + (billedWeight * zonePrice.pricePerKg);
    
    return {
      carrierId: carrier._id,
      name: carrier.name,
      type: carrier.type,
      cost: totalCost,
      sla: carrier.deliverySLA,
      billedWeight,
      reliabilityScore: 4.5, // Placeholder for future data
      isBestValue: false // Will be set below
    };
  }).filter(Boolean).sort((a, b) => a.cost - b.cost);

  // Mark the cheapest as best value
  if (recommendations.length > 0) {
    recommendations[0].isBestValue = true;
  }

  return ApiResponse.success(res, {
    metrics: {
      actualWeight,
      volumetricWeight,
      billedWeight,
      densityRatio: (actualWeight / volumetricWeight).toFixed(2)
    },
    recommendations
  }, 'Freight rates calculated');
});

