const User = require("../models/user.model");
const Church = require("../models/church.model");
const Event = require("../models/event.model");
const Notes = require("../models/note.model");
const FollowUpRequest = require("../models/followUpRequest.model");
const PrayerRequest = require("../models/prayerRequest.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateToken,
  generaterefresh_token,
  verifyToken,
  verifyrefresh_token,
} = require("../utils/jwt");
const crypto = require("crypto");
const fetch = require("node-fetch");

/**
 * Admin login with email only
 * POST /api/v2/auth/signin
 */
const adminSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find admin user by email and role
    const admin = await User.findOne({
      email: email,
      role: "admin",
      deleted_at: null,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate access token (short-lived: 15 minutes)
    const accessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "15m" }
    );

    // Generate refresh token (long-lived: 7 days)
    const refresh_token = generaterefresh_token(admin._id);

    // Store refresh token in user document
    admin.refresh_token = refresh_token;
    await admin.save();

    // Return admin data (without password and sensitive info)
    const adminObj = admin.toObject();
    delete adminObj.password;
    delete adminObj.otp;
    delete adminObj.refresh_token;

    res.json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: adminObj,
        accessToken,
        refresh_token,
      },
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    res.status(500).json({
      success: false,
      message: "Error during admin login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Admin logout
 * POST /api/v2/auth/logout
 */
const adminLogout = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Clear refresh token from database
    const admin = await User.findById(userId);
    if (admin) {
      admin.refresh_token = null;
      await admin.save();
    }

    res.json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Refresh access token
 * POST /api/v2/auth/refresh
 */
const refresh_token = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Please provide refresh token",
      });
    }

    // Verify refresh token
    const decoded = verifyrefresh_token(refresh_token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Find admin and verify refresh token matches
    const admin = await User.findOne({
      _id: decoded.id,
      role: "admin",
      refresh_token: refresh_token,
      deleted_at: null,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "15m" }
    );

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get current admin info
 * GET /api/v2/auth/me
 */
const getAdminMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const admin = await User.findOne({
      _id: userId,
      role: "admin",
      deleted_at: null,
    }).select("-password -otp -refresh_token");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Admin info retrieved successfully",
      data: {
        admin,
      },
    });
  } catch (error) {
    console.error("Get admin me error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving admin info",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Request password reset
 * POST /api/v2/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email",
      });
    }

    // Find admin by email
    const admin = await User.findOne({
      email: email,
      role: "admin",
      deleted_at: null,
    });

    // Don't reveal if admin exists for security
    if (!admin) {
      return res.json({
        success: true,
        message: "If the account exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in admin document
    admin.reset_password_token = resetToken;
    admin.reset_password_expiry = resetTokenExpiry;
    await admin.save();

    // TODO: Send email with reset token
    // For now, we'll return the token in development mode only
    const response = {
      success: true,
      message: "If the account exists, a password reset link has been sent",
    };

    if (process.env.NODE_ENV === "development") {
      response.data = {
        resetToken, // Remove this in production
      };
    }

    res.json(response);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing forgot password request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Reset password with token
 * POST /api/v2/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide token, new password, and confirm password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find admin with valid reset token
    const admin = await User.findOne({
      reset_password_token: token,
      reset_password_expiry: { $gt: new Date() },
      role: "admin",
      deleted_at: null,
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password (will be hashed by pre-save hook)
    admin.password = newPassword;
    admin.reset_password_token = null;
    admin.reset_password_expiry = null;
    admin.refresh_token = null; // Invalidate all refresh tokens
    await admin.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const admin = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== DASHBOARD ====================
/**
 * Get dashboard statistics
 * GET /api/v2/admin/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total users (excluding admins and deleted)
    const totalUsers = await User.countDocuments({
      role: { $ne: "admin" },
      deleted_at: null,
    });

    // Get total pastors (users who have created churches)
    const totalPrayers = await PrayerRequest.countDocuments();

    // Get total bibles from DBT API
    // Strategy: Try DBT API with longer timeout, but only wait 2 seconds max
    // If DBT API responds quickly, use it; otherwise use fallback
    let totalBibles = 0;
    
    // Get fallback count first
    const bibleIds = await Notes.distinct("bible_id");
    totalBibles = bibleIds.length;
    console.log(`[DBT API] Fallback count from notes: ${totalBibles}`);
    
    // Try DBT API with longer timeout (15s), but only wait 2 seconds for response
    const dbtApiPromise = (async () => {
      const startTime = Date.now();
      try {
        const dbtApiUrl = "https://4.dbt.io/api/bibles?v=4&key=851b4b78-fcf6-47fc-89c7-4e8d11446e26";
        console.log(`[DBT API] Attempting to fetch from: ${dbtApiUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`[DBT API] Request timeout after 15 seconds`);
          controller.abort();
        }, 15000); // Longer timeout for slow networks
        
        const response = await fetch(dbtApiUrl, {
          headers: {
            'User-Agent': 'Ene-Backend/1.0',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        const elapsed = Date.now() - startTime;
        console.log(`[DBT API] Response received in ${elapsed}ms, status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          const count = data.meta?.pagination?.total || 0;
          console.log(`[DBT API] Success! Total bibles: ${count}`);
          return count;
        } else {
          console.error(`[DBT API] HTTP error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (error.name === 'AbortError') {
          console.error(`[DBT API] Request aborted after ${elapsed}ms (timeout)`);
        } else {
          console.error(`[DBT API] Error after ${elapsed}ms:`, error.message);
        }
      }
      return null;
    })();
    
    // Wait for DBT API response - longer timeout on Cloud Run (production)
    // Locally it takes ~2 seconds, so 3 seconds is enough
    // On Cloud Run it takes 10+ seconds, so we need 15 seconds there
    const isProduction = process.env.NODE_ENV === 'production';
    const waitTime = isProduction ? 15000 : 3000; // 15s on Cloud Run, 3s locally
    
    try {
      const dbtCount = await Promise.race([
        dbtApiPromise,
        new Promise(resolve => setTimeout(() => {
          console.log(`[DBT API] Timeout after ${waitTime/1000} seconds - using fallback`);
          resolve(null);
        }, waitTime))
      ]);
      
      if (dbtCount !== null && dbtCount > 0) {
        console.log(`[DBT API] Using DBT API count: ${dbtCount}`);
        totalBibles = dbtCount;
      } else {
        console.log(`[DBT API] Using fallback count: ${totalBibles}`);
      }
    } catch (error) {
      console.error(`[DBT API] Promise.race error:`, error.message);
      // Already using fallback, ignore
    }

    // Get total events
    const totalEvents = await Event.countDocuments({});

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        totalUsers,
        totalPrayers,
        totalBibles,
        totalEvents,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user registration chart data (monthly breakdown)
 * GET /api/v2/admin/dashboard/registration-chart
 */
const getRegistrationChart = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get start and end dates for the year
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st

    // Get all users registered in the year (excluding admins and deleted)
    const users = await User.find({
      role: { $ne: "admin" },
      deleted_at: null,
      createdAt: { $gte: startDate, $lte: endDate },
    }).select("createdAt");

    // Initialize monthly data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = months.map((month) => ({
      month,
      users: 0,
    }));

    // Count users by month
    users.forEach((user) => {
      const monthIndex = new Date(user.createdAt).getMonth();
      monthlyData[monthIndex].users++;
    });

    res.json({
      success: true,
      message: "Registration chart data retrieved successfully",
      data: {
        year: currentYear,
        monthlyData,
      },
    });
  } catch (error) {
    console.error("Get registration chart error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving registration chart data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get survey results (Jesus Christ acceptance)
 * GET /api/v2/admin/dashboard/survey-results
 */
const getSurveyResults = async (req, res) => {
  try {
    // Count users by lord_accepted status
    // Assuming: "Yes" means they accepted, "No" means they rejected, default is "Not Sure"
    const totalYes = await User.countDocuments({
      lord_accepted: "Yes",
      role: { $ne: "admin" },
      deleted_at: null,
    });

    const totalNo = await User.countDocuments({
      lord_accepted: "No",
      role: { $ne: "admin" },
      deleted_at: null,
    });

    // Not sure includes default value and "I still have Questions"
    const totalNotSure = await User.countDocuments({
      $or: [
        {
          lord_accepted: `No "I still have Questions"`,
        },
        { lord_accepted: { $exists: false } },
        { lord_accepted: null },
      ],
      role: { $ne: "admin" },
      deleted_at: null,
    });

    res.json({
      success: true,
      message: "Survey results retrieved successfully",
      data: {
        totalYes,
        totalNo,
        totalNotSure,
        total: totalYes + totalNo + totalNotSure,
      },
    });
  } catch (error) {
    console.error("Get survey results error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving survey results",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get recent users list
 * GET /api/v2/admin/dashboard/recent-users
 */
const getRecentUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {
      role: { $ne: "admin" },
      deleted_at: null,
    };

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get users
    const users = await User.find(filter)
      .select("-password -otp -refresh_token -reset_password_token")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await User.countDocuments(filter);

    // Format users for response
    const formattedUsers = users.map((user, index) => ({
      sno: skip + index + 1,
      _id: user._id,
      image: user.profile || null,
      name: user.name,
      email: user.email || "N/A",
      mobileNumber: user.mobile || "N/A",
      location: user.location?.address || "N/A",
      city: user.location?.city || "N/A",
      createdAt: user.createdAt,
    }));

    res.json({
      success: true,
      message: "Recent users retrieved successfully",
      data: {
        users: formattedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get recent users error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving recent users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get total users count (for chart)
 * GET /api/v2/admin/dashboard/total-users
 */
const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: { $ne: "admin" },
      deleted_at: null,
    });

    res.json({
      success: true,
      message: "Total users count retrieved successfully",
      data: {
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Get total users error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving total users count",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== USERS MANAGEMENT ====================

/**
 * Get all users (admin)
 * GET /api/v2/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {
      role: { $ne: "admin" },
      deleted_at: null,
    };

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get users
    const users = await User.find(filter)
      .select("-password -otp -refresh_token -reset_password_token")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await User.countDocuments(filter);

    // Format users for response
    const formattedUsers = users.map((user, index) => ({
      sno: skip + index + 1,
      _id: user._id,
      image: user.profile || null,
      name: user.name,
      email: user.email || "N/A",
      mobileNumber: user.mobile || "N/A",
      location: user.location?.address || "N/A",
      city: user.location?.city || "N/A",
      createdAt: user.createdAt,
    }));

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: formattedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user by ID (admin)
 * GET /api/v2/admin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: { $ne: "admin" },
      deleted_at: null,
    }).select("-password -otp -refresh_token -reset_password_token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update user (admin)
 * PUT /api/v2/admin/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.deleted_at;
    delete updateData.email;
    delete updateData.mobile;
    delete updateData.country_code;

    // Handle location update - ensure proper GeoJSON format
    if (updateData.location) {
      // Get existing user to preserve coordinates if not provided
      const existingUser = await User.findById(id).select("location");
      const existingLocation = existingUser?.location?.toObject() || {};
      
      const { address, city, lat, lng, coordinates } = updateData.location;
      
      // Build location object with proper GeoJSON format
      const locationUpdate = {
        address: address !== undefined ? address : (existingLocation.address || null),
        city: city !== undefined ? city : (existingLocation.city || null),
        type: "Point",
        coordinates: coordinates || 
          (lng !== undefined && lat !== undefined ? [Number(lng), Number(lat)] : 
          (existingLocation.coordinates || [0, 0]))
      };
      
      updateData.location = locationUpdate;
    }

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        role: { $ne: "admin" },
        deleted_at: null,
      },
      updateData,
      { new: true, runValidators: true }
    ).select("-password -otp -refresh_token -reset_password_token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== PASTOR REQUESTS MANAGEMENT ====================

/**
 * Get all pastor requests (churches)
 * GET /api/v2/admin/pastor-requests
 */
const getAllPastorRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    // Status filter (approve_status: 0=pending, 1=rejected, 2=approved)
    if (status) {
      if (status === "pending") filter.approve_status = 0;
      else if (status === "approved") filter.approve_status = 2;
      else if (status === "rejected") filter.approve_status = 1;
    }

    // Search filter
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get churches with populated user data
    const churches = await Church.find(filter)
      .populate("user_id", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Church.countDocuments(filter);

    // Format response
    const formattedRequests = churches.map((church, index) => ({
      sno: skip + index + 1,
      _id: church._id,
      name: church.user_id?.name || "N/A",
      email: church.user_id?.email || "N/A",
      phone: church.user_id?.mobile || "N/A",
      church: church.name,
      status:
        church.approve_status === 0
          ? "pending"
          : church.approve_status === 2
          ? "approved"
          : "rejected",
      requestDate: church.createdAt,
      churchData: church,
    }));

    res.json({
      success: true,
      message: "Pastor requests retrieved successfully",
      data: {
        requests: formattedRequests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all pastor requests error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving pastor requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get pastor request by ID
 * GET /api/v2/admin/pastor-requests/:id
 */
const getPastorRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const church = await Church.findById(id).populate(
      "user_id",
      "name email mobile"
    );

    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Pastor request not found",
      });
    }

    res.json({
      success: true,
      message: "Pastor request retrieved successfully",
      data: {
        request: {
          _id: church._id,
          name: church.user_id?.name || "N/A",
          email: church.user_id?.email || "N/A",
          phone: church.user_id?.mobile || "N/A",
          church: church.name,
          status:
            church.approve_status === 0
              ? "pending"
              : church.approve_status === 2
              ? "approved"
              : "rejected",
          requestDate: church.createdAt,
          churchData: church,
        },
      },
    });
  } catch (error) {
    console.error("Get pastor request by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving pastor request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update pastor request status
 * PUT /api/v2/admin/pastor-requests/:id/status
 */
const updatePastorRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status (pending, approved, rejected)",
      });
    }

    // Map status to approve_status
    const approveStatus =
      status === "pending" ? 0 : status === "approved" ? 2 : 1;

    const church = await Church.findByIdAndUpdate(
      id,
      { approve_status: approveStatus },
      { new: true }
    ).populate("user_id", "name email mobile");

    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Pastor request not found",
      });
    }

    res.json({
      success: true,
      message: `Pastor request ${status} successfully`,
      data: {
        request: {
          _id: church._id,
          name: church.user_id?.name || "N/A",
          email: church.user_id?.email || "N/A",
          phone: church.user_id?.mobile || "N/A",
          church: church.name,
          status: status,
          requestDate: church.createdAt,
          churchData: church,
        },
      },
    });
  } catch (error) {
    console.error("Update pastor request status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating pastor request status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete pastor request
 * DELETE /api/v2/admin/pastor-requests/:id
 */
const deletePastorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const church = await Church.findByIdAndDelete(id);

    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Pastor request not found",
      });
    }

    res.json({
      success: true,
      message: "Pastor request deleted successfully",
    });
  } catch (error) {
    console.error("Delete pastor request error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting pastor request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== FOLLOW-UP REQUESTS MANAGEMENT ====================

/**
 * Get follow-up request statistics
 * GET /api/v2/admin/follow-up-requests/stats
 */
const getFollowUpStats = async (req, res) => {
  try {
    const pending = await FollowUpRequest.countDocuments({ status: "pending" });
    const inProgress = await FollowUpRequest.countDocuments({
      status: "in_progress",
    });
    const completed = await FollowUpRequest.countDocuments({
      status: "completed",
    });
    const total = await FollowUpRequest.countDocuments({});

    res.json({
      success: true,
      message: "Follow-up statistics retrieved successfully",
      data: {
        pending,
        inProgress,
        completed,
        total,
      },
    });
  } catch (error) {
    console.error("Get follow-up stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving follow-up statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all follow-up requests
 * GET /api/v2/admin/follow-up-requests
 */
const getAllFollowUpRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    // Status filter
    if (status && ["pending", "in_progress", "completed"].includes(status)) {
      filter.status = status;
    }

    // Type filter
    if (type && type !== "all") {
      filter.type = type;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get follow-up requests
    const requests = await FollowUpRequest.find(filter)
      .populate("assigned_to_id", "name email")
      .populate("user_id", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await FollowUpRequest.countDocuments(filter);

    // Format response
    const formattedRequests = requests.map((request, index) => ({
      sno: skip + index + 1,
      _id: request._id,
      name: request.name,
      contact:
        request.contact ||
        `${request.email || ""}${request.email && request.phone ? ", " : ""}${
          request.phone || ""
        }`,
      email: request.email,
      phone: request.phone,
      type: request.type,
      assignedTo:
        request.assigned_to || request.assigned_to_id?.name || "Unassigned",
      dueDate: request.due_date,
      status: request.status,
      description: request.description,
      notes: request.notes,
      createdAt: request.createdAt,
    }));

    res.json({
      success: true,
      message: "Follow-up requests retrieved successfully",
      data: {
        requests: formattedRequests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all follow-up requests error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving follow-up requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create follow-up request
 * POST /api/v2/admin/follow-up-requests
 */
const createFollowUpRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      contact,
      type,
      assigned_to,
      assigned_to_id,
      due_date,
      description,
      notes,
      user_id,
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide name",
      });
    }

    const adminId = req.user?.id || req.user?._id;

    const followUpRequest = new FollowUpRequest({
      name,
      email: email || null,
      phone: phone || null,
      contact: contact || null,
      type: type || "Other",
      assigned_to: assigned_to || null,
      assigned_to_id: assigned_to_id || null,
      due_date: due_date || null,
      description: description || null,
      notes: notes || null,
      user_id: user_id || null,
      created_by: adminId,
      status: "pending",
    });

    await followUpRequest.save();

    await followUpRequest.populate("assigned_to_id", "name email");
    if (followUpRequest.user_id) {
      await followUpRequest.populate("user_id", "name email mobile");
    }

    res.status(201).json({
      success: true,
      message: "Follow-up request created successfully",
      data: {
        request: followUpRequest,
      },
    });
  } catch (error) {
    console.error("Create follow-up request error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating follow-up request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get follow-up request by ID
 * GET /api/v2/admin/follow-up-requests/:id
 */
const getFollowUpRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await FollowUpRequest.findById(id)
      .populate("assigned_to_id", "name email")
      .populate("user_id", "name email mobile");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow-up request not found",
      });
    }

    res.json({
      success: true,
      message: "Follow-up request retrieved successfully",
      data: {
        request,
      },
    });
  } catch (error) {
    console.error("Get follow-up request by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving follow-up request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update follow-up request
 * PUT /api/v2/admin/follow-up-requests/:id
 */
const updateFollowUpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating sensitive fields
    delete updateData._id;
    delete updateData.created_by;

    const request = await FollowUpRequest.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assigned_to_id", "name email")
      .populate("user_id", "name email mobile");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow-up request not found",
      });
    }

    res.json({
      success: true,
      message: "Follow-up request updated successfully",
      data: {
        request,
      },
    });
  } catch (error) {
    console.error("Update follow-up request error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating follow-up request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update follow-up request status
 * PUT /api/v2/admin/follow-up-requests/:id/status
 */
const updateFollowUpRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid status (pending, in_progress, completed)",
      });
    }

    const request = await FollowUpRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("assigned_to_id", "name email")
      .populate("user_id", "name email mobile");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow-up request not found",
      });
    }

    res.json({
      success: true,
      message: `Follow-up request status updated to ${status}`,
      data: {
        request,
      },
    });
  } catch (error) {
    console.error("Update follow-up request status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating follow-up request status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete follow-up request
 * DELETE /api/v2/admin/follow-up-requests/:id
 */
const deleteFollowUpRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await FollowUpRequest.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow-up request not found",
      });
    }

    res.json({
      success: true,
      message: "Follow-up request deleted successfully",
    });
  } catch (error) {
    console.error("Delete follow-up request error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting follow-up request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== CHURCH MANAGEMENT ====================

/**
 * Get church statistics
 * GET /api/v2/admin/churches/stats
 */
const getChurchStats = async (req, res) => {
  try {
    // Total churches (approved only)
    const totalChurches = await Church.countDocuments({
      approve_status: 2, // approved
    });

    // Total members (users associated with churches)
    const totalMembers = await User.countDocuments({
      church_id: { $ne: null },
      role: { $ne: "admin" },
      deleted_at: null,
    });

    // Active churches (approved and available)
    const activeChurches = await Church.countDocuments({
      approve_status: 2, // approved
      church_status: 1, // active
      is_availability: 1, // available
    });

    res.json({
      success: true,
      message: "Church statistics retrieved successfully",
      data: {
        totalChurches,
        totalMembers,
        activeChurches,
      },
    });
  } catch (error) {
    console.error("Get church stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving church statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all churches (admin)
 * GET /api/v2/admin/churches
 */
const getAllChurchesAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    // Status filter (church_status: 1=active, 0=inactive)
    if (status) {
      if (status === "active") {
        filter.church_status = 1;
        filter.is_availability = 1;
      } else if (status === "inactive") {
        filter.$or = [{ church_status: 0 }, { is_availability: 0 }];
      }
    }

    // Search filter (by name, pastor name, or location)
    if (search) {
      // First, find users matching the search (for pastor name)
      const matchingUsers = await User.find({
        $or: [{ name: { $regex: search, $options: "i" } }],
        role: { $ne: "admin" },
        deleted_at: null,
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);

      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        ...(userIds.length > 0 ? [{ user_id: { $in: userIds } }] : []),
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get churches with populated user data
    const churches = await Church.find(filter)
      .populate("user_id", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Church.countDocuments(filter);

    // Format response with member counts
    const formattedChurches = await Promise.all(
      churches.map(async (church, index) => {
        // Count members for this church
        const membersCount = await User.countDocuments({
          church_id: church._id,
          role: { $ne: "admin" },
          deleted_at: null,
        });

        // Determine status
        const isActive =
          church.church_status === 1 && church.is_availability === 1;

        return {
          sno: skip + index + 1,
          _id: church._id,
          churchName: church.name,
          pastor: church.user_id?.name || "N/A",
          pastorId: church.user_id?._id || null,
          location: church.location?.address
            ? `${church.location.city || ""}, ${church.location.address || ""}`
            : church.location?.city || "N/A",
          city: church.location?.city || "N/A",
          address: church.location?.address || "N/A",
          members: membersCount,
          phone: church.user_id?.mobile || "N/A",
          email: church.user_id?.email || "N/A",
          status: isActive ? "Active" : "Inactive",
          churchStatus: church.church_status,
          isAvailability: church.is_availability,
          approveStatus: church.approve_status,
          placeId: church.place_id,
          coordinates: church.location?.coordinates || null,
          createdAt: church.createdAt,
          updatedAt: church.updatedAt,
        };
      })
    );

    res.json({
      success: true,
      message: "Churches retrieved successfully",
      data: {
        churches: formattedChurches,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all churches admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving churches",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get church by ID (admin)
 * GET /api/v2/admin/churches/:id
 */
const getChurchByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

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

    // Count members for this church
    const membersCount = await User.countDocuments({
      church_id: church._id,
      role: { $ne: "admin" },
      deleted_at: null,
    });

    // Determine status
    const isActive = church.church_status === 1 && church.is_availability === 1;

    const formattedChurch = {
      _id: church._id,
      churchName: church.name,
      pastor: church.user_id?.name || "N/A",
      pastorId: church.user_id?._id || null,
      location: church.location?.address
        ? `${church.location.city || ""}, ${church.location.address || ""}`
        : church.location?.city || "N/A",
      city: church.location?.city || "N/A",
      address: church.location?.address || "N/A",
      members: membersCount,
      phone: church.user_id?.mobile || "N/A",
      email: church.user_id?.email || "N/A",
      status: isActive ? "Active" : "Inactive",
      churchStatus: church.church_status,
      isAvailability: church.is_availability,
      approveStatus: church.approve_status,
      placeId: church.place_id,
      coordinates: church.location?.coordinates || null,
      churchData: church,
      createdAt: church.createdAt,
      updatedAt: church.updatedAt,
    };

    res.json({
      success: true,
      message: "Church retrieved successfully",
      data: {
        church: formattedChurch,
      },
    });
  } catch (error) {
    console.error("Get church by ID admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving church",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update church (admin)
 * PUT /api/v2/admin/churches/:id
 */
const updateChurchAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating sensitive fields
    delete updateData._id;
    delete updateData.user_id;

    const church = await Church.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user_id", "name email mobile");

    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Church not found",
      });
    }

    res.json({
      success: true,
      message: "Church updated successfully",
      data: {
        church,
      },
    });
  } catch (error) {
    console.error("Update church admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating church",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete church (admin)
 * DELETE /api/v2/admin/churches/:id
 */
const deleteChurchAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const church = await Church.findByIdAndDelete(id);

    if (!church) {
      return res.status(404).json({
        success: false,
        message: "Church not found",
      });
    }

    res.json({
      success: true,
      message: "Church deleted successfully",
    });
  } catch (error) {
    console.error("Delete church admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting church",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== PRAYER REQUESTS MANAGEMENT ====================

/**
 * Get prayer request statistics
 * GET /api/v2/admin/prayer-requests/stats
 */
const getPrayerRequestStats = async (req, res) => {
  try {
    const totalRequests = await PrayerRequest.countDocuments({});
    const pending = await PrayerRequest.countDocuments({ status: "pending" });
    const approved = await PrayerRequest.countDocuments({ status: "approved" });
    const rejected = await PrayerRequest.countDocuments({ status: "rejected" });

    res.json({
      success: true,
      message: "Prayer request statistics retrieved successfully",
      data: {
        totalRequests,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    console.error("Get prayer request stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving prayer request statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all prayer requests (admin)
 * GET /api/v2/admin/prayer-requests
 */
const getAllPrayerRequestsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    // Status filter
    if (
      status &&
      status !== "all" &&
      ["pending", "approved", "rejected"].includes(status)
    ) {
      filter.status = status;
    }

    // Search filter (by name, email, church name, or user name)
    if (search) {
      // First, find users matching the search (for user name/email)
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        role: { $ne: "admin" },
        deleted_at: null,
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);

      // Find churches matching the search
      const matchingChurches = await Church.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const churchIds = matchingChurches.map((church) => church._id);

      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile_number: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        ...(userIds.length > 0 ? [{ user_id: { $in: userIds } }] : []),
        ...(churchIds.length > 0 ? [{ church_id: { $in: churchIds } }] : []),
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get prayer requests with populated data
    const prayerRequests = await PrayerRequest.find(filter)
      .populate("church_id", "name")
      .populate("user_id", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await PrayerRequest.countDocuments(filter);

    // Format response
    const formattedRequests = prayerRequests.map((request, index) => ({
      sno: skip + index + 1,
      _id: request._id,
      user: request.user_id
        ? {
            _id: request.user_id._id,
            name: request.user_id.name,
            email: request.user_id.email || "N/A",
            mobile: request.user_id.mobile || "N/A",
          }
        : null,
      name: request.name,
      email: request.user_id?.email || "N/A",
      phone: request.dial_code
        ? `${request.dial_code} ${request.mobile_number}`
        : request.mobile_number || "N/A",
      mobileNumber: request.mobile_number,
      dialCode: request.dial_code,
      church: request.church_id?.name || "N/A",
      churchId: request.church_id?._id || null,
      status: request.status,
      requestDate: request.date,
      time: request.time,
      description: request.description,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));

    res.json({
      success: true,
      message: "Prayer requests retrieved successfully",
      data: {
        prayerRequests: formattedRequests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all prayer requests admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving prayer requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get prayer request by ID (admin)
 * GET /api/v2/admin/prayer-requests/:id
 */
const getPrayerRequestByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const prayerRequest = await PrayerRequest.findById(id)
      .populate("church_id", "name location")
      .populate("user_id", "name email mobile");

    if (!prayerRequest) {
      return res.status(404).json({
        success: false,
        message: "Prayer request not found",
      });
    }

    const formattedRequest = {
      _id: prayerRequest._id,
      user: prayerRequest.user_id
        ? {
            _id: prayerRequest.user_id._id,
            name: prayerRequest.user_id.name,
            email: prayerRequest.user_id.email || "N/A",
            mobile: prayerRequest.user_id.mobile || "N/A",
          }
        : null,
      name: prayerRequest.name,
      email: prayerRequest.user_id?.email || "N/A",
      phone: prayerRequest.dial_code
        ? `${prayerRequest.dial_code} ${prayerRequest.mobile_number}`
        : prayerRequest.mobile_number || "N/A",
      mobileNumber: prayerRequest.mobile_number,
      dialCode: prayerRequest.dial_code,
      church: prayerRequest.church_id?.name || "N/A",
      churchId: prayerRequest.church_id?._id || null,
      status: prayerRequest.status,
      requestDate: prayerRequest.date,
      time: prayerRequest.time,
      description: prayerRequest.description,
      createdAt: prayerRequest.createdAt,
      updatedAt: prayerRequest.updatedAt,
      prayerRequestData: prayerRequest,
    };

    res.json({
      success: true,
      message: "Prayer request retrieved successfully",
      data: {
        prayerRequest: formattedRequest,
      },
    });
  } catch (error) {
    console.error("Get prayer request by ID admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving prayer request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update prayer request (admin)
 * PUT /api/v2/admin/prayer-requests/:id
 */
const updatePrayerRequestAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating sensitive fields
    delete updateData._id;

    const prayerRequest = await PrayerRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
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
      message: "Prayer request updated successfully",
      data: {
        prayerRequest,
      },
    });
  } catch (error) {
    console.error("Update prayer request admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating prayer request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update prayer request status (admin)
 * PUT /api/v2/admin/prayer-requests/:id/status
 */
const updatePrayerRequestStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status (pending, approved, rejected)",
      });
    }

    const prayerRequest = await PrayerRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
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
      message: `Prayer request ${status} successfully`,
      data: {
        prayerRequest,
      },
    });
  } catch (error) {
    console.error("Update prayer request status admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating prayer request status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete prayer request (admin)
 * DELETE /api/v2/admin/prayer-requests/:id
 */
const deletePrayerRequestAdmin = async (req, res) => {
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
    console.error("Delete prayer request admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting prayer request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  adminSignin,
  adminLogout,
  refresh_token,
  getAdminMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  // Dashboard
  getDashboardStats,
  getRegistrationChart,
  getSurveyResults,
  getRecentUsers,
  getTotalUsers,
  // Users Management
  getAllUsers,
  getUserById,
  updateUser,
  // Pastor Requests
  getAllPastorRequests,
  getPastorRequestById,
  updatePastorRequestStatus,
  deletePastorRequest,
  // Follow-Up Requests
  getFollowUpStats,
  getAllFollowUpRequests,
  createFollowUpRequest,
  getFollowUpRequestById,
  updateFollowUpRequest,
  updateFollowUpRequestStatus,
  deleteFollowUpRequest,
  // Church Management
  getChurchStats,
  getAllChurchesAdmin,
  getChurchByIdAdmin,
  updateChurchAdmin,
  deleteChurchAdmin,
  // Prayer Requests Management
  getPrayerRequestStats,
  getAllPrayerRequestsAdmin,
  getPrayerRequestByIdAdmin,
  updatePrayerRequestAdmin,
  updatePrayerRequestStatusAdmin,
  deletePrayerRequestAdmin,
};
