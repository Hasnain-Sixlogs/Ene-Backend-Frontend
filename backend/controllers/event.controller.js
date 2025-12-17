const Event = require("../models/event.model");

const createEvent = async (req, res) => {
  try {
    const {
      event_name,
      description,
      event_type,
      start_date,
      start_time,
      end_date,
      end_time,
      virtual_link_or_location,
    } = req.body;
    // const userId = req.user?._id;

    // Validation
    if (!event_name) {
      return res.status(400).json({
        success: false,
        message: "Please provide event name",
      });
    }

    // if (!userId) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Unauthorized. User ID is required.",
    //   });
    // }

    // Create event
    const event = new Event({
      event_name,
      description: description || null,
      event_type: event_type || null,
      start_date: start_date || null,
      start_time: start_time || null,
      end_date: end_date || null,
      end_time: end_time || null,
      virtual_link_or_location: virtual_link_or_location || null,
      // user_id: userId,
      status: "pending",
    });

    await event.save();

    // Populate user reference
    // await event.populate("user_id", "name email mobile");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        event,
      },
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const {
      user_id,
      event_type,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (user_id) {
      filter.user_id = user_id;
    }

    if (event_type) {
      filter.event_type = event_type;
    }

    if (status) {
      if (["pending", "approved", "rejected"].includes(status)) {
        filter.status = status;
      }
    }

    // Date range filter
    if (start_date || end_date) {
      filter.start_date = {};
      if (start_date) {
        filter.start_date.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.start_date.$lte = new Date(end_date);
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get events
    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      message: "Events retrieved successfully",
      data: {
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving events",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event retrieved successfully",
      data: {
        event,
      },
    });
  } catch (error) {
    console.error("Get event by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      event_name,
      description,
      event_type,
      start_date,
      start_time,
      end_date,
      end_time,
      virtual_link_or_location,
    } = req.body;
    const userId = req.user?.id || req.user?._id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user owns the event (optional: can be removed if admins can edit any event)
    if (event.user_id.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this event",
      });
    }

    // Update fields
    if (event_name) event.event_name = event_name;
    if (description !== undefined) event.description = description;
    if (event_type !== undefined) event.event_type = event_type;
    if (start_date !== undefined) event.start_date = start_date;
    if (start_time !== undefined) event.start_time = start_time;
    if (end_date !== undefined) event.end_date = end_date;
    if (end_time !== undefined) event.end_time = end_time;
    if (virtual_link_or_location !== undefined)
      event.virtual_link_or_location = virtual_link_or_location;

    await event.save();

    // Populate user reference
    // await event.populate("user_id", "name email mobile");

    res.json({
      success: true,
      message: "Event updated successfully",
      data: {
        event,
      },
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status (pending, approved, rejected)",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.status = status;
    await event.save();

    // Populate user reference
    // await event.populate("user_id", "name email mobile");

    res.json({
      success: true,
      message: `Event ${status} successfully`,
      data: {
        event,
      },
    });
  } catch (error) {
    console.error("Update event status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating event status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user owns the event (optional: can be removed if admins can delete any event)
    if (event.user_id.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this event",
      });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      status,
      event_type,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {
      user_id: userId,
    };

    if (status) {
      if (["pending", "approved", "rejected"].includes(status)) {
        filter.status = status;
      }
    }

    if (event_type) {
      filter.event_type = event_type;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get events
    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      message: "Your events retrieved successfully",
      data: {
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get my events error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving your events",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getMyEvents,
};

