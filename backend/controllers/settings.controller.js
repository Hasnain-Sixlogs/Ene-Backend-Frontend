const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { processUploadedFile, getFileUrl } = require("../utils/fileUpload");

/**
 * Update Profile Information
 * PUT /api/v2/admin/settings/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, bio } = req.body;

    // Validate input
    const updateData = {};
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      updateData.name = name.trim();
    }
    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }

    // Handle profile image upload
    if (req.file) {
      try {
        const profileImagePath = await processUploadedFile(req.file, 'profiles');
        if (profileImagePath) {
          updateData.profile = profileImagePath;
        }
      } catch (uploadError) {
        console.error("Profile image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading profile image",
          error: process.env.NODE_ENV === "development" ? uploadError.message : undefined,
        });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -otp -refresh_token -reset_password_token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert profile image path to signed URL if needed
    let userObj = user.toObject();
    if (userObj.profile) {
      try {
        userObj.profile = await getFileUrl(userObj.profile);
      } catch (urlError) {
        console.error("Error getting file URL:", urlError);
        // Keep original path if URL generation fails
      }
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: userObj,
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

/**
 * Update Security Settings
 * PUT /api/v2/admin/settings/security
 */
const updateSecurity = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { currentPassword, newPassword, confirmPassword, two_factor_auth, login_alerts } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {};

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password",
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match",
        });
      }

      // Set new password (will be hashed by pre-save hook)
      updateData.password = newPassword;
    }

    // Handle two-factor authentication
    if (two_factor_auth !== undefined) {
      updateData.two_factor_auth = Boolean(two_factor_auth);
    }

    // Handle login alerts
    if (login_alerts !== undefined) {
      updateData.login_alerts = Boolean(login_alerts);
    }

    // Update user
    if (Object.keys(updateData).length > 0) {
      Object.assign(user, updateData);
      await user.save();
    }

    // Return updated user without sensitive data
    const updatedUser = await User.findById(userId).select("-password -otp -refresh_token -reset_password_token");

    res.json({
      success: true,
      message: "Security settings updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update security error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating security settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update Appearance Settings
 * PUT /api/v2/admin/settings/appearance
 */
const updateAppearance = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { theme, compact_mode, animations } = req.body;

    const updateData = {};

    // Validate and update theme
    if (theme !== undefined) {
      if (!["light", "dark", "system"].includes(theme)) {
        return res.status(400).json({
          success: false,
          message: "Invalid theme. Must be 'light', 'dark', or 'system'",
        });
      }
      updateData.theme = theme;
    }

    // Update compact mode
    if (compact_mode !== undefined) {
      updateData.compact_mode = Boolean(compact_mode);
    }

    // Update animations
    if (animations !== undefined) {
      updateData.animations = Boolean(animations);
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
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
      message: "Appearance settings updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update appearance error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appearance settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Settings
 * GET /api/v2/admin/settings
 */
const getSettings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select("-password -otp -refresh_token -reset_password_token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert profile image path to signed URL if needed
    let userObj = user.toObject();
    if (userObj.profile) {
      try {
        userObj.profile = await getFileUrl(userObj.profile);
      } catch (urlError) {
        console.error("Error getting file URL:", urlError);
        // Keep original path if URL generation fails
      }
    }

    res.json({
      success: true,
      data: userObj,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  updateProfile,
  updateSecurity,
  updateAppearance,
  getSettings,
};

