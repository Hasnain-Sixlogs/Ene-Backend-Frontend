const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../utils/jwt");

const generateOTP = () => {
  // return Math.floor(1000 + Math.random() * 9000);
  return 1234;
};

const sendOTP = async (mobile, otp) => {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log(`OTP for ${mobile}: ${otp}`);
  return true;
};

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      countryCode,
      password,
      confirmPassword,
      address,
      city,
      lat,
      lng,
      deviceType,
      deviceToken,
      fcmToken,
      appLanguage = "en",
    } = req.body;

    // Validation
    if (!name || !mobile || !countryCode || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ mobile: mobile }, ...(email ? [{ email }] : [])],
      deleted_at: null,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this mobile number or email",
      });
    }

    // Validate location
    // if (
    //   !location ||
    //   !location.coordinates ||
    //   !location.address ||
    //   !location.city
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Location information is required",
    //   });
    // }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      name,
      email: email || null,
      mobile: mobile,
      country_code: countryCode,
      password, // Will be hashed by pre-save hook
      location: {
        address: address || null,
        city: city || null,
        type: "Point",
        coordinates: [lng || 0, lat || 0],
      },
      otp,
      otp_expiry: otpExpiry,
      device_type: deviceType || null,
      device_token: deviceToken || null,
      fcm_token: fcmToken || null,
      app_language: appLanguage,
    });

    await user.save();

    // Send OTP
    await sendOTP(mobile, otp);

    // Return user data (without password and OTP)
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your mobile number.",
      data: {
        user: userObj,
        otp: otp, // Remove this in production - only for testing
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const signin = async (req, res) => {
  try {
    const {
      emailOrMobile,
      password,
      rememberMe = false,
      deviceType,
      deviceToken,
      fcmToken,
    } = req.body;

    // Validation
    if (!emailOrMobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/phone and password",
      });
    }

    // Find user by email or mobile
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
      deleted_at: null,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update device info if provided
    if (deviceType || deviceToken || fcmToken) {
      if (deviceType) user.device_type = deviceType;
      if (deviceToken) user.device_token = deviceToken;
      if (fcmToken) user.fcm_token = fcmToken;
      await user.save();
    }

    // Generate token with expiry based on rememberMe
    const tokenExpiry = rememberMe ? "30d" : "7d";
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: tokenExpiry,
    });

    // Return user data
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;

    res.json({
      success: true,
      message: "Sign in successful",
      data: {
        user: userObj,
        token,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: "Error during sign in",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email,
      deleted_at: null,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists and is valid
    if (!user.otp || !user.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Clear OTP
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;

    res.json({
      success: true,
      message: "Your mobile number has been verified successfully",
      data: {
        user: userObj,
        token,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error during OTP verification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email,
      deleted_at: null,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user OTP
    user.otp = otp;
    user.otp_expiry = otpExpiry;
    await user.save();

    // Send OTP
    await sendOTP(email, otp);

    res.json({
      success: true,
      message: "OTP has been resent to your email",
      data: {
        otp: otp, // Remove this in production - only for testing
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Error resending OTP",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const socialLogin = async (req, res) => {
  try {
    const {
      socialType,
      socialToken,
      name,
      email,
      mobile,
      countryCode,
      deviceType,
      deviceToken,
      fcmToken,
      appLanguage = "en",
    } = req.body;

    // Validation
    if (!socialType || !socialToken) {
      return res.status(400).json({
        success: false,
        message: "Please provide social type and token",
      });
    }

    if (!["google", "apple"].includes(socialType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid social type. Supported types: google, apple",
      });
    }

    // TODO: Verify social token with provider (Google/Apple)
    // For now, we'll trust the token from client
    // In production, verify the token with the respective provider

    // Find or create user
    let user = await User.findOne({
      $or: [
        { email: email },
        { mobile: mobile },
        { social_token: socialToken, social_type: socialType },
      ],
      deleted_at: null,
    });

    if (user) {
      // Update social login info if not set
      if (!user.social_token || !user.social_type) {
        user.social_token = socialToken;
        user.social_type = socialType;
        await user.save();
      }
    } else {
      // Create new user
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required for new social login",
        });
      }

      user = new User({
        name,
        email,
        mobile: mobile || null,
        country_code: countryCode || "+1",
        password: Math.random().toString(36).slice(-12), // Random password for social login
        social_token: socialToken,
        social_type: socialType,
        device_type: deviceType || null,
        device_token: deviceToken || null,
        fcm_token: fcmToken || null,
        app_language: appLanguage,
      });

      // If phone number provided, generate OTP
      if (mobile) {
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otp_expiry = otpExpiry;
        await sendOTP(mobile, otp);
      }

      await user.save();
    }

    // Update device info
    if (deviceType || deviceToken || fcmToken) {
      if (deviceType) user.device_type = deviceType;
      if (deviceToken) user.device_token = deviceToken;
      if (fcmToken) user.fcm_token = fcmToken;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Check if OTP exists before deleting from userObj
    const hasOTP = !!user.otp;

    // Return user data
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;

    const response = {
      success: true,
      message: hasOTP
        ? "Social login successful. Please verify your mobile number."
        : "Social login successful",
      data: {
        user: userObj,
        token,
      },
    };

    // Include OTP if mobile verification needed
    if (hasOTP) {
      response.data.otp = user.otp; // Remove this in production
    }

    res.json(response);
  } catch (error) {
    console.error("Social login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during social login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { emailOrMobile } = req.body;

    if (!emailOrMobile) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
      deleted_at: null,
    });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: "If the account exists, a password reset link has been sent",
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otp_expiry = otpExpiry;
    await user.save();

    // Send OTP via SMS or Email
    if (user.mobile) {
      await sendOTP(user.mobile, otp);
    }
    // TODO: Send email if email exists

    res.json({
      success: true,
      message: "Password reset OTP has been sent",
      data: {
        otp: otp, // Remove this in production - only for testing
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing forgot password request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { emailOrMobile, otp, newPassword, confirmPassword } = req.body;

    if (!emailOrMobile || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
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

    // Find user
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
      deleted_at: null,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log(user.otp);
    console.log(otp);
    // Verify OTP
    if (!user.otp || user.otp !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

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

const setLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Please provide language code",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.app_language = language;
    await user.save();

    res.json({
      success: true,
      message: "Language preference updated successfully",
      data: {
        app_language: language,
      },
    });
  } catch (error) {
    console.error("Set language error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating language preference",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const acceptLord = async (req, res) => {
  try {
    const { lord_accepted } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!lord_accepted) {
      return res.status(400).json({
        success: false,
        message: "Please provide lord Accepted text",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.lord_accepted = lord_accepted;
    await user.save();

    res.json({
      success: true,
      message: "lord accepted text updated successfully",
      data: {
        lord_accepted: lord_accepted,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accepting Lord",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { ...rest } = req.body;
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    
    // Don't allow updating sensitive fields
    delete rest.password;
    delete rest.role;
    delete rest._id;
    delete rest.deleted_at;
    delete rest.email;
    delete rest.mobile;
    delete rest.country_code;
    
    // Handle location update - ensure proper GeoJSON format
    if (rest.location) {
      const existingUser = await User.findById(userId).select("location");
      const existingLocation = existingUser?.location?.toObject() || {};
      
      const { address, city, lat, lng, coordinates } = rest.location;
      
      // Build location object with proper GeoJSON format
      rest.location = {
        address: address !== undefined ? address : (existingLocation.address || null),
        city: city !== undefined ? city : (existingLocation.city || null),
        type: "Point",
        coordinates: coordinates || 
          (lng !== undefined && lat !== undefined ? [Number(lng), Number(lat)] : 
          (existingLocation.coordinates || [0, 0]))
      };
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const updatedUser = await User.findByIdAndUpdate(userId, rest, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
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
module.exports = {
  signup,
  signin,
  verifyOTP,
  resendOTP,
  socialLogin,
  forgotPassword,
  resetPassword,
  setLanguage,
  acceptLord,
  updateProfile,
};
