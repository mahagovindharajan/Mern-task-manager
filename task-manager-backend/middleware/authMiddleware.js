// middleware/authMiddleware.js
// Middleware runs BEFORE your route handler.
// This middleware checks if a valid JWT token is present in the request.
// If valid → attach user to req and allow access.
// If invalid → block the request with a 401 error.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if Authorization header exists and starts with "Bearer"
    // Token format in header: "Authorization: Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract the token part (index 1 after splitting by space)
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. If no token found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please log in.",
      });
    }

    // 3. Verify the token using our secret key
    // jwt.verify() throws an error if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "user_id_here", iat: ..., exp: ... }

    // 4. Find the user from the decoded token's ID
    // This confirms the user still exists in the database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    // 5. Attach user to request object so route handlers can access it
    req.user = user;

    // 6. Call next() to pass control to the next middleware/route handler
    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }

    console.error("Auth Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

module.exports = { protect };