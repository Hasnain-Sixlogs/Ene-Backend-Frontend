const { verifyToken } = require("../utils/jwt");

/**
 * Authentication middleware
 */
const authenticate = (req, res, next) => {
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
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = {
  authenticate,
};
