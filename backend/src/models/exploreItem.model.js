const mongoose = require('mongoose');

const exploreItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
      default: '',
    },
    type: {
      type: String,
      enum: ['image', 'video', 'reel'],
      required: [true, 'Media type is required'],
    },
    // Relative path on disk  e.g.  uploads/explore/1714300000000-myvideo.mp4
    filePath: {
      type: String,
      required: true,
    },
    // Public URL served to clients  e.g.  /uploads/explore/1714300000000-myvideo.mp4
    fileUrl: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    // Lower order = appears first in the grid
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Default sort by order ascending, then newest first
exploreItemSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('ExploreItem', exploreItemSchema);
