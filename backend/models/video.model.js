const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'],
      index: true,
    },
    video_url: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail_url: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    duration: {
      type: String, // Format: "45:30" (MM:SS or HH:MM:SS)
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
      index: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Soft delete
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
videoSchema.index({ status: 1, deleted_at: 1 });
videoSchema.index({ category: 1, status: 1, deleted_at: 1 });
videoSchema.index({ title: 'text', description: 'text' }); // Text search index

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;

