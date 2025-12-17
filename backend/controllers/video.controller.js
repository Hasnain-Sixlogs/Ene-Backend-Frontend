const mongoose = require('mongoose');
const Video = require('../models/video.model');
const User = require('../models/user.model');

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get video statistics (admin)
 * GET /api/v2/admin/videos/stats
 */
const getVideoStats = async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments({ deleted_at: null });
    const published = await Video.countDocuments({
      status: 'published',
      deleted_at: null,
    });
    const drafts = await Video.countDocuments({
      status: 'draft',
      deleted_at: null,
    });

    // Calculate total views
    const totalViewsResult = await Video.aggregate([
      {
        $match: {
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
        },
      },
    ]);

    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    res.json({
      success: true,
      message: 'Video statistics retrieved successfully',
      data: {
        totalVideos,
        published,
        drafts,
        totalViews,
      },
    });
  } catch (error) {
    console.error('Get video stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving video statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all videos (admin)
 * GET /api/v2/admin/videos
 */
const getAllVideosAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter = {
      deleted_at: null,
    };

    // Status filter
    if (status && status !== 'all' && ['published', 'draft'].includes(status)) {
      filter.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get videos
    const videos = await Video.find(filter)
      .populate('uploaded_by', 'name email profile')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Video.countDocuments(filter);

    // Format response
    const formattedVideos = videos.map((video, index) => ({
      sno: skip + index + 1,
      _id: video._id,
      title: video.title,
      category: video.category,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      description: video.description,
      duration: video.duration,
      views: video.views,
      status: video.status,
      uploadDate: video.createdAt,
      uploadedBy: video.uploaded_by
        ? {
            _id: video.uploaded_by._id,
            name: video.uploaded_by.name,
            email: video.uploaded_by.email,
            profile: video.uploaded_by.profile,
          }
        : null,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    }));

    res.json({
      success: true,
      message: 'Videos retrieved successfully',
      data: {
        videos: formattedVideos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get all videos admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get video by ID (admin)
 * GET /api/v2/admin/videos/:id
 */
const getVideoByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({
      _id: id,
      deleted_at: null,
    }).populate('uploaded_by', 'name email profile');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.json({
      success: true,
      message: 'Video retrieved successfully',
      data: {
        video: {
          _id: video._id,
          title: video.title,
          category: video.category,
          videoUrl: video.video_url,
          thumbnailUrl: video.thumbnail_url,
          description: video.description,
          duration: video.duration,
          views: video.views,
          status: video.status,
          uploadDate: video.createdAt,
          uploadedBy: video.uploaded_by
            ? {
                _id: video.uploaded_by._id,
                name: video.uploaded_by.name,
                email: video.uploaded_by.email,
                profile: video.uploaded_by.profile,
              }
            : null,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get video by ID admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create video (admin)
 * POST /api/v2/admin/videos
 */
const createVideo = async (req, res) => {
  try {
    const { title, category, video_url, thumbnail_url, description, duration, status } = req.body;
    const adminId = req.user._id;
    // Validation
    if (!title || !category || !video_url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, category, video_url)',
      });
    }

    // Validate category
    const validCategories = ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    // Validate status
    if (status && !['published', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "published" or "draft"',
      });
    }

    // Create video
    const video = new Video({
      title: title.trim(),
      category,
      video_url: video_url.trim(),
      thumbnail_url: thumbnail_url || null,
      description: description || null,
      duration: duration || null,
      status: status || 'draft',
      uploaded_by: adminId,
      views: 0,
    });

    await video.save();
    await video.populate('uploaded_by', 'name email profile');

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: {
        video: {
          _id: video._id,
          title: video.title,
          category: video.category,
          videoUrl: video.video_url,
          thumbnailUrl: video.thumbnail_url,
          description: video.description,
          duration: video.duration,
          views: video.views,
          status: video.status,
          uploadDate: video.createdAt,
          uploadedBy: video.uploaded_by
            ? {
                _id: video.uploaded_by._id,
                name: video.uploaded_by.name,
                email: video.uploaded_by.email,
                profile: video.uploaded_by.profile,
              }
            : null,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update video (admin)
 * PUT /api/v2/admin/videos/:id
 */
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating sensitive fields
    delete updateData._id;
    delete updateData.uploaded_by;
    delete updateData.views;
    delete updateData.deleted_at;

    // Validate category if provided
    if (updateData.category) {
      const validCategories = ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'];
      if (!validCategories.includes(updateData.category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        });
      }
    }

    // Validate status if provided
    if (updateData.status && !['published', 'draft'].includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "published" or "draft"',
      });
    }

    // Trim string fields
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.video_url) updateData.video_url = updateData.video_url.trim();
    if (updateData.thumbnail_url) updateData.thumbnail_url = updateData.thumbnail_url.trim();
    if (updateData.description) updateData.description = updateData.description.trim();

    const video = await Video.findOneAndUpdate(
      {
        _id: id,
        deleted_at: null,
      },
      updateData,
      { new: true, runValidators: true }
    ).populate('uploaded_by', 'name email profile');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: {
        video: {
          _id: video._id,
          title: video.title,
          category: video.category,
          videoUrl: video.video_url,
          thumbnailUrl: video.thumbnail_url,
          description: video.description,
          duration: video.duration,
          views: video.views,
          status: video.status,
          uploadDate: video.createdAt,
          uploadedBy: video.uploaded_by
            ? {
                _id: video.uploaded_by._id,
                name: video.uploaded_by.name,
                email: video.uploaded_by.email,
                profile: video.uploaded_by.profile,
              }
            : null,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update video status (admin)
 * PUT /api/v2/admin/videos/:id/status
 */
const updateVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['published', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (published, draft)',
      });
    }

    const video = await Video.findOneAndUpdate(
      {
        _id: id,
        deleted_at: null,
      },
      { status },
      { new: true }
    ).populate('uploaded_by', 'name email profile');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.json({
      success: true,
      message: `Video ${status} successfully`,
      data: {
        video: {
          _id: video._id,
          title: video.title,
          status: video.status,
        },
      },
    });
  } catch (error) {
    console.error('Update video status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete video (admin)
 * DELETE /api/v2/admin/videos/:id
 */
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOneAndUpdate(
      {
        _id: id,
        deleted_at: null,
      },
      {
        deleted_at: new Date(),
      },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ==================== USER ENDPOINTS ====================

/**
 * Get all published videos (user)
 * GET /api/v2/videos
 */
const getAllVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter - only published videos
    const filter = {
      status: 'published',
      deleted_at: null,
    };

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get videos
    const videos = await Video.find(filter)
      .populate('uploaded_by', 'name profile')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Video.countDocuments(filter);

    // Format response
    const formattedVideos = videos.map((video) => ({
      _id: video._id,
      title: video.title,
      category: video.category,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      description: video.description,
      duration: video.duration,
      views: video.views,
      uploadDate: video.createdAt,
      uploadedBy: video.uploaded_by
        ? {
            _id: video.uploaded_by._id,
            name: video.uploaded_by.name,
            profile: video.uploaded_by.profile,
          }
        : null,
      createdAt: video.createdAt,
    }));

    res.json({
      success: true,
      message: 'Videos retrieved successfully',
      data: {
        videos: formattedVideos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get video by ID (user)
 * GET /api/v2/videos/:id
 */
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({
      _id: id,
      status: 'published',
      deleted_at: null,
    }).populate('uploaded_by', 'name profile');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.json({
      success: true,
      message: 'Video retrieved successfully',
      data: {
        video: {
          _id: video._id,
          title: video.title,
          category: video.category,
          videoUrl: video.video_url,
          thumbnailUrl: video.thumbnail_url,
          description: video.description,
          duration: video.duration,
          views: video.views,
          uploadDate: video.createdAt,
          uploadedBy: video.uploaded_by
            ? {
                _id: video.uploaded_by._id,
                name: video.uploaded_by.name,
                profile: video.uploaded_by.profile,
              }
            : null,
          createdAt: video.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get video by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Increment video views (user)
 * POST /api/v2/videos/:id/view
 */
const incrementVideoViews = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOneAndUpdate(
      {
        _id: id,
        status: 'published',
        deleted_at: null,
      },
      {
        $inc: { views: 1 },
      },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.json({
      success: true,
      message: 'Video view incremented',
      data: {
        views: video.views,
      },
    });
  } catch (error) {
    console.error('Increment video views error:', error);
    res.status(500).json({
      success: false,
      message: 'Error incrementing video views',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  // Admin endpoints
  getVideoStats,
  getAllVideosAdmin,
  getVideoByIdAdmin,
  createVideo,
  updateVideo,
  updateVideoStatus,
  deleteVideo,
  // User endpoints
  getAllVideos,
  getVideoById,
  incrementVideoViews,
};

