const PrayerRequest = require("../models/PrayerRequest.model");

const createPrayerRequest = async (req, res) => {
  try {
    const {
      church_id,
      date,
      time,
      name,
      dial_code,
      mobile_number,
      description,
    } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!church_id || !date || !time || !name || !mobile_number) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (church_id, date, time, name, mobile_number)",
      });
    }

    // Create prayer request
    const prayerRequest = new PrayerRequest({
      church_id,
      date,
      time,
      name,
      dial_code: dial_code || null,
      mobile_number,
      description: description || null,
      user_id: userId,
      status: "pending",
    });

    await prayerRequest.save();

    // Populate references
    await prayerRequest.populate("church_id", "name");
    if (prayerRequest.user_id) {
      await prayerRequest.populate("user_id", "name email mobile");
    }

    res.status(201).json({
      success: true,
      message: "Prayer request created successfully",
      data: {
        prayerRequest,
      },
    });
  } catch (error) {
    console.error("Create prayer request error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating prayer request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllPrayerRequests = async (req, res) => {
  try {
    const {
      church_id,
      status,
      user_id,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (church_id) {
      filter.church_id = church_id;
    }

    if (status) {
      if (["pending", "approved", "rejected"].includes(status)) {
        filter.status = status;
      }
    }

    if (user_id) {
      filter.user_id = user_id;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get prayer requests
    const prayerRequests = await PrayerRequest.find(filter)
      .populate("church_id", "name")
      .populate("user_id", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await PrayerRequest.countDocuments(filter);

    res.json({
      success: true,
      message: "Prayer requests retrieved successfully",
      data: {
        prayerRequests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all prayer requests error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving prayer requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getPrayerRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const prayerRequest = await PrayerRequest.findById(id)
      .populate("church_id", "name")
      .populate("user_id", "name email mobile");

    if (!prayerRequest) {
      return res.status(404).json({
        success: false,
        message: "Prayer request not found",
      });
    }

    res.json({
      success: true,
      message: "Prayer request retrieved successfully",
      data: {
        prayerRequest,
      },
    });
  } catch (error) {
    console.error("Get prayer request by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving prayer request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updatePrayerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      church_id,
      date,
      time,
      name,
      dial_code,
      mobile_number,
      description,
    } = req.body;

    const prayerRequest = await PrayerRequest.findById(id);

    if (!prayerRequest) {
      return res.status(404).json({
        success: false,
        message: "Prayer request not found",
      });
    }

    // Update fields
    if (church_id) prayerRequest.church_id = church_id;
    if (date) prayerRequest.date = date;
    if (time) prayerRequest.time = time;
    if (name) prayerRequest.name = name;
    if (dial_code !== undefined) prayerRequest.dial_code = dial_code;
    if (mobile_number) prayerRequest.mobile_number = mobile_number;
    if (description !== undefined) prayerRequest.description = description;

    await prayerRequest.save();

    // Populate references
    await prayerRequest.populate("church_id", "name");
    if (prayerRequest.user_id) {
      await prayerRequest.populate("user_id", "name email mobile");
    }

    res.json({
      success: true,
      message: "Prayer request updated successfully",
      data: {
        prayerRequest,
      },
    });
  } catch (error) {
    console.error("Update prayer request error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating prayer request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updatePrayerRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status (pending, approved, rejected)",
      });
    }

    const prayerRequest = await PrayerRequest.findById(id);

    if (!prayerRequest) {
      return res.status(404).json({
        success: false,
        message: "Prayer request not found",
      });
    }

    prayerRequest.status = status;
    await prayerRequest.save();

    // Populate references
    await prayerRequest.populate("church_id", "name");
    if (prayerRequest.user_id) {
      await prayerRequest.populate("user_id", "name email mobile");
    }

    res.json({
      success: true,
      message: `Prayer request ${status} successfully`,
      data: {
        prayerRequest,
      },
    });
  } catch (error) {
    console.error("Update prayer request status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating prayer request status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deletePrayerRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const prayerRequest = await PrayerRequest.findByIdAndDelete(id);

    if (!prayerRequest) {
      return res.status(404).json({
        success: false,
        message: "Prayer request not found",
      });
    }

    res.json({
      success: true,
      message: "Prayer request deleted successfully",
    });
  } catch (error) {
    console.error("Delete prayer request error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting prayer request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createPrayerRequest,
  getAllPrayerRequests,
  getPrayerRequestById,
  updatePrayerRequest,
  updatePrayerRequestStatus,
  deletePrayerRequest,
};

