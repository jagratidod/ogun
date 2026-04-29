const path = require('path');
const fs = require('fs');
const ExploreItem = require('../models/exploreItem.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

// Helper – build the public URL from a stored fileUrl
// fileUrl is already like "/uploads/explore/filename.mp4"
// We return it as-is; the client prepends the API base URL.
const buildFileUrl = (filename) => `/uploads/explore/${filename}`;

/**
 * @desc    Create a new explore item (admin uploads a file)
 * @route   POST /api/v1/admin/explore
 * @access  Private (Admin)
 */
exports.createExploreItem = catchAsync(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded. Please attach an image or video.', 400);
  }

  const { title, caption, type, views, enabled, order } = req.body;

  if (!title || !title.trim()) {
    // Clean up the uploaded file if validation fails
    fs.unlink(req.file.path, () => {});
    return ApiResponse.error(res, 'Title is required.', 400);
  }

  const fileUrl = buildFileUrl(req.file.filename);

  const item = await ExploreItem.create({
    title: title.trim(),
    caption: caption?.trim() || '',
    type: type || 'image',
    filePath: req.file.path,      // absolute disk path for future deletion
    fileUrl,                       // relative URL for clients
    views: Number(views) || 0,
    enabled: enabled !== 'false' && enabled !== false,
    order: Number(order) || 0,
    createdBy: req.user._id,
  });

  return ApiResponse.success(res, item, 'Explore item created successfully', 201);
});

/**
 * @desc    Get all explore items (admin sees all; public only enabled)
 * @route   GET /api/v1/admin/explore   (admin – all)
 * @route   GET /api/v1/explore         (public – enabled only)
 * @access  Mixed
 */
exports.getAllExploreItems = catchAsync(async (req, res) => {
  const isAdminRoute = req.baseUrl.includes('/admin');
  const filter = isAdminRoute ? {} : { enabled: true };

  const items = await ExploreItem.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return ApiResponse.success(res, items, 'Explore items fetched successfully');
});

/**
 * @desc    Update explore item metadata (optionally replace file)
 * @route   PUT /api/v1/admin/explore/:id
 * @access  Private (Admin)
 */
exports.updateExploreItem = catchAsync(async (req, res) => {
  const item = await ExploreItem.findById(req.params.id);
  if (!item) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return ApiResponse.error(res, 'Explore item not found.', 404);
  }

  const { title, caption, type, views, enabled, order } = req.body;

  // If a new file was uploaded, delete old file and replace
  if (req.file) {
    if (item.filePath && fs.existsSync(item.filePath)) {
      fs.unlink(item.filePath, (err) => {
        if (err) console.error('[EXPLORE] Failed to delete old file:', err.message);
      });
    }
    item.filePath = req.file.path;
    item.fileUrl = buildFileUrl(req.file.filename);
  }

  if (title !== undefined) item.title = title.trim();
  if (caption !== undefined) item.caption = caption.trim();
  if (type !== undefined) item.type = type;
  if (views !== undefined) item.views = Math.max(0, Number(views) || 0);
  if (enabled !== undefined) item.enabled = enabled !== 'false' && enabled !== false;
  if (order !== undefined) item.order = Number(order) || 0;

  await item.save();

  return ApiResponse.success(res, item, 'Explore item updated successfully');
});

/**
 * @desc    Bulk reorder explore items
 * @route   PATCH /api/v1/admin/explore/reorder
 * @body    { orderedIds: ['id1', 'id2', 'id3'] }
 * @access  Private (Admin)
 */
exports.reorderItems = catchAsync(async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return ApiResponse.error(res, 'orderedIds must be a non-empty array.', 400);
  }

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await ExploreItem.bulkWrite(bulkOps);

  return ApiResponse.success(res, null, 'Explore items reordered successfully');
});

/**
 * @desc    Delete explore item + physical file from disk
 * @route   DELETE /api/v1/admin/explore/:id
 * @access  Private (Admin)
 */
exports.deleteExploreItem = catchAsync(async (req, res) => {
  const item = await ExploreItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return ApiResponse.error(res, 'Explore item not found.', 404);
  }

  // Delete physical file from disk
  if (item.filePath && fs.existsSync(item.filePath)) {
    fs.unlink(item.filePath, (err) => {
      if (err) console.error('[EXPLORE] Failed to delete file:', item.filePath, err.message);
      else console.log('[EXPLORE] Deleted file:', item.filePath);
    });
  }

  return ApiResponse.success(res, null, 'Explore item deleted successfully');
});
