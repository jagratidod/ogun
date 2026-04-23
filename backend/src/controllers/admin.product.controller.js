const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');


const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Create a new product with images
 * @route   POST /api/v1/admin/products
 * @access  Private (Admin)
 */
exports.createProduct = catchAsync(async (req, res, next) => {
  const { name, sku, category, price, mrp, distributorPrice, retailerPrice, description, initialStock, unit } = req.body;
  console.log('[PRODUCT] Creating with unit:', unit);

  // Handle uploaded images (supporting both single and multiple uploads)
  const imageList = [];
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      imageList.push({ url: file.path, public_id: file.filename });
    });
  } else if (req.file) {
    imageList.push({ url: req.file.path, public_id: req.file.filename });
  }

  const product = await Product.create({
    name: name?.trim(),
    sku: sku?.trim(),
    category: category?.trim(),
    price: Number(price) || 0,
    mrp: Number(mrp) || 0,
    distributorPrice: Number(distributorPrice) || 0,
    retailerPrice: Number(retailerPrice) || 0,
    description: description?.trim(),
    images: imageList,
    unit: unit || 'units'
  });

  // Initialize Admin Inventory (Factory/Warehouse)
  const inventory = await Inventory.create({
    user: req.user._id,
    product: product._id,
    quantity: Number(initialStock) || 0
  });

  return ApiResponse.success(res, { product, inventory }, 'Product created successfully');
});

/**
 * @desc    Get Admin Inventory
 * @route   GET /api/v1/admin/inventory
 * @access  Private (Admin)
 */
exports.getAdminInventory = catchAsync(async (req, res, next) => {
  const inventory = await Inventory.find({ user: req.user._id })
    .populate('product', 'name sku category image')
    .sort('-updatedAt');

  return ApiResponse.success(res, inventory, 'Admin inventory fetched successfully');
});

/**
 * @desc    Get all products
 * @route   GET /api/v1/admin/products
 * @access  Private (Admin)
 */
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find().sort('-createdAt').lean();
  
  if (!req.user || !req.user._id) {
    return ApiResponse.success(res, products, 'Products fetched successfully');
  }

  // Fetch Admin's inventory to show current stock
  const inventory = await Inventory.find({ user: req.user._id }).lean();
  const inventoryMap = {};
  inventory.forEach(item => {
    if (item.product) {
      inventoryMap[item.product.toString()] = item.quantity;
    }
  });

  const productsWithStock = products.map(product => ({
    ...product,
    quantity: inventoryMap[product._id.toString()] || 0
  }));

  return ApiResponse.success(res, productsWithStock, 'Products fetched successfully');
});

/**
 * @desc    Get product by ID
 * @route   GET /api/v1/admin/products/:id
 * @access  Private (Admin)
 */
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) {
    return ApiResponse.error(res, 'Product not found', 404);
  }
  
  // Also fetch stock for this product
  const inventory = await Inventory.findOne({ user: req.user._id, product: product._id }).lean();
  const productWithStock = {
    ...product,
    quantity: inventory ? inventory.quantity : 0
  };

  return ApiResponse.success(res, productWithStock, 'Product details fetched');
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/admin/products/:id
 */
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return ApiResponse.error(res, 'Product not found', 404);
  }
  // Also remove from inventory
  await Inventory.deleteMany({ product: req.params.id });
  
  return ApiResponse.success(res, null, 'Product and related inventory records deleted');
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/admin/products/:id
 */
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { name, sku, category, price, mrp, distributorPrice, retailerPrice, description, initialStock, unit } = req.body;
  console.log('[PRODUCT] Updating with unit:', unit);
  
  let product = await Product.findById(req.params.id);
  if (!product) {
    return ApiResponse.error(res, 'Product not found', 404);
  }

  // Handle images
  if (req.file) {
    product.images = [{ url: req.file.path, public_id: req.file.filename }];
  } else if (req.files && req.files.length > 0) {
    product.images = req.files.map(f => ({ url: f.path, public_id: f.filename }));
  }

  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku;
  if (category !== undefined) product.category = category.trim();
  if (price !== undefined) product.price = Number(price);
  if (mrp !== undefined) product.mrp = Number(mrp);
  if (distributorPrice !== undefined) product.distributorPrice = Number(distributorPrice);
  if (retailerPrice !== undefined) product.retailerPrice = Number(retailerPrice);
  if (description !== undefined) product.description = description;
  if (unit !== undefined) product.unit = unit;

  await product.save();

  // Update Inventory
  if (initialStock !== undefined) {
    console.log(`[INVENTORY] Updating Stock for Product ${product._id}: ${initialStock} (User: ${req.user._id})`);
    const invUpdate = await Inventory.findOneAndUpdate(
      { user: req.user._id, product: product._id },
      { quantity: Number(initialStock) || 0 },
      { upsert: true, new: true }
    );
    console.log(`[INVENTORY] Update Result:`, invUpdate ? invUpdate.quantity : 'FAILED');
  }

  // Fetch updated product with stock to return
  const finalInventory = await Inventory.findOne({ user: req.user._id, product: product._id }).lean();
  const result = {
    ...product.toObject(),
    quantity: finalInventory ? finalInventory.quantity : 0
  };

  return ApiResponse.success(res, result, 'Product and inventory updated successfully');
});

/**
 * @desc    Get Low Stock Alerts
 * @route   GET /api/v1/admin/inventory/alerts
 * @access  Private (Admin)
 */
exports.getLowStockAlerts = catchAsync(async (req, res, next) => {
  // Use 100 as the hard threshold as per user request
  const alerts = await Inventory.find({
    user: req.user._id,
    quantity: { $lte: 100 }
  })
  .populate('product', 'name sku category images')
  .sort('quantity');

  return ApiResponse.success(res, alerts, 'Low stock alerts fetched successfully');
});

/**
 * @desc    Get Global Inventory Overview Analytics
 * @route   GET /api/v1/admin/inventory/overview
 */
exports.getInventoryOverview = catchAsync(async (req, res, next) => {
  // 1. Fetch all inventory records (Admin + Distributors)
  const allInventory = await Inventory.find().populate('product', 'name category price');
  const distributors = await require('../models/user.model').find({ role: 'distributor' });

  // 2. Metrics Calculation
  let totalUnits = 0;
  let totalValue = 0;
  const categoryMap = {};
  const distributorMap = {};

  // Initialize distributor map
  distributors.forEach(d => {
    distributorMap[d._id.toString()] = { name: d.businessName || d.name, value: 0 };
  });

  allInventory.forEach(item => {
    if (!item.product) return;
    
    const qty = Number(item.quantity) || 0;
    totalUnits += qty;
    totalValue += qty * (item.product.price || 0);

    // Category Distribution
    const cat = item.product.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + qty;

    // Distributor-wise (only if owned by a distributor)
    const ownerId = item.user.toString();
    if (distributorMap[ownerId]) {
      distributorMap[ownerId].value += qty;
    }
  });

  const categoryDistribution = Object.keys(categoryMap).map(name => ({
    name,
    value: categoryMap[name]
  }));

  const distributorStock = Object.values(distributorMap)
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  // 3. Stock trend (Dummy for now, could be real if we had a movement log)
  const stockTrend = [
    { month: 'Jan', stock: Math.floor(totalUnits * 0.8) },
    { month: 'Feb', stock: Math.floor(totalUnits * 0.9) },
    { month: 'Mar', stock: totalUnits }
  ];

  return ApiResponse.success(res, {
    totalUnits,
    totalValue,
    lowStockCount: allInventory.filter(i => i.quantity <= 100).length,
    categoryDistribution,
    distributorStock,
    stockTrend
  }, 'Inventory analytics generated');
});
