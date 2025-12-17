const Church = require("../models/church.model");

const createChurch = async (req, res) => {
  try {
    const { name, location, place_id } = req.body;
    const userId = req.user?.id || req.user?._id;

    // Validation
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, location)",
      });
    }

    // Validate location structure
    if (!location.address || !location.city || !location.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Location must include address, city, and coordinates",
      });
    }

    // Validate coordinates
    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Coordinates must be an array of [longitude, latitude]",
      });
    }

    // Create church with pending approval status
    const church = new Church({
      user_id: userId,
      name,
      location: {
        address: location.address,
        city: location.city,
        type: "Point",
        coordinates: location.coordinates, // [longitude, latitude]
      },
      place_id: place_id || null,
      approve_status: 0, // 0: pending approval
    });

    await church.save();

    // Populate user reference
    await church.populate("user_id", "name email mobile");

    res.status(201).json({
      success: true,
      message: "Church created successfully. Waiting for admin approval.",
      data: {
        church,
      },
    });
  } catch (error) {
    console.error("Create church error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating church",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllChurches = async (req, res) => {
  try {
    const userId = req.query?.user_id ? req.query?.user_id : req.user?._id || null;
    const {
      page = 1,
      limit = 10,
      approve_status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object - only get churches belonging to the user
    const filter = {
      user_id: userId || null,
    };

    // Optional filter by approval status
    if (approve_status !== undefined) {
      const status = parseInt(approve_status);
      if ([0, 1, 2].includes(status)) {
        filter.approve_status = status;
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get churches
    const churches = await Church.find(filter)
      .populate("user_id", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Church.countDocuments(filter);

    res.json({
      success: true,
      message: "Churches retrieved successfully",
      data: {
        churches,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all churches error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving churches",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getChurchById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || null;

    const church = await Church.findById(id).populate(
      "user_id",
      "name email mobile"
    );

    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Church not found",
      });
    }

    // Check if the church belongs to the user
    const churchUserId =
      church.user_id?._id?.toString() || church.user_id?.toString();
    // if (churchUserId !== userId?.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You don't have permission to access this church",
    //   });
    // }

    res.json({
      success: true,
      message: "Church retrieved successfully",
      data: {
        church,
      },
    });
  } catch (error) {
    console.error("Get church by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving church",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteChurch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || null;

    const church = await Church.findById(id);

    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Church not found",
      });
    }

    // Check if the church belongs to the user
    const churchUserId =
      church.user_id?.toString() || church.user_id?._id?.toString();
    if (churchUserId !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this church",
      });
    }

    await Church.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Church deleted successfully",
    });
  } catch (error) {
    console.error("Delete church error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting church",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateChurchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const church = await Church.findById(id);
    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Church not found",
      });
    }

    church.approve_status = status;
    await church.save();
  } catch (error) {
    console.error("Update church status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating church status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createChurch,
  getAllChurches,
  getChurchById,
  deleteChurch,
  updateChurchStatus,
};
