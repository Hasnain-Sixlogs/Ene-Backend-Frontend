const { verifyToken } = require("../utils/jwt");
const User = require("../models/user.model");

/**
 * Middleware to authenticate admin users
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please provide a token.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Verify user is admin
    const admin = await User.findOne({
      _id: decoded.id,
      role: "admin",
      deleted_at: null,
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.user = decoded;
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = {
  authenticateAdmin,
};

