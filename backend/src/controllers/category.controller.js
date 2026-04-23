const Category = require('../models/category.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  
  const category = await Category.create({ name, description });
  
  return ApiResponse.success(res, category, 'Category created successfully', 201);
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  return ApiResponse.success(res, categories, 'Categories fetched successfully');
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }
  
  category.isActive = false;
  await category.save();
  
  return ApiResponse.success(res, null, 'Category deleted successfully');
});
