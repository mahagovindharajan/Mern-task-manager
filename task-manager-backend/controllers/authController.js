// controllers/authController.js
// Controllers contain the actual business logic for each route.
// Keeping logic here (instead of in routes) makes code cleaner and testable.

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────
// HELPER: Generate JWT Token
// Extracted into a helper to avoid repeating code
// ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },               // Payload: what we embed inside the token
    process.env.JWT_SECRET,        // Secret key to sign the token
    { expiresIn: process.env.JWT_EXPIRE } // Token expiry (e.g., "7d")
  );
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    // 1. Destructure fields from request body
    const { name, email, password } = req.body;

    // 2. Basic input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // 3. Check if user already exists with that email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        // 409 = Conflict
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 4. Create new user
    // Note: Password hashing happens automatically via the pre-save hook in User.js
    const user = await User.create({ name, email, password });

    // 5. Generate JWT token for the newly registered user
    const token = generateToken(user._id);

    // 6. Send success response
    // We never send the password back — not even the hashed one
    res.status(201).json({
      // 201 = Created
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors (e.g., invalid email format)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
// ─────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    // 1. Destructure credentials from request body
    const { email, password } = req.body;

    // 2. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 3. Find user by email
    // We use .select("+password") because password has select:false in the schema
    // Without this, the password field won't be included in the query result
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // ⚠️ Use a vague message intentionally — don't reveal whether email exists
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Compare entered password with the hashed password in DB
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT token
    const token = generateToken(user._id);

    // 6. Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get currently logged-in user's profile
// @access  Private (requires JWT token)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is attached by the authMiddleware after token verification
    // We fetch fresh data from DB (excluding password)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { registerUser, loginUser, getMe };