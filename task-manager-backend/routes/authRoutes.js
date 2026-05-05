// routes/authRoutes.js
// Routes define the URL endpoints and which controller handles them.
// Think of routes as a "traffic director" — they receive requests
// and forward them to the right controller function.

const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register → Register a new user (Public)
router.post("/register", registerUser);

// POST /api/auth/login → Login and get token (Public)
router.post("/login", loginUser);

// GET /api/auth/me → Get my profile (Private — needs JWT)
// "protect" middleware runs first, then getMe
router.get("/me", protect, getMe);

module.exports = router;