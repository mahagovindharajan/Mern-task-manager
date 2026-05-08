// server.js
// This is the main entry point of our application.
// It sets up Express, connects to MongoDB, registers middleware,
// mounts routes, and starts the HTTP server.

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// ─────────────────────────────────────────────
// Load environment variables from .env file
// Must be called BEFORE using process.env anywhere
// ─────────────────────────────────────────────
dotenv.config();

// ─────────────────────────────────────────────
// Connect to MongoDB Atlas
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// Initialize Express App
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────

// Enable CORS — allows frontend (on a different port/domain) to talk to this API
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mern-task-manager-steel.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Parse incoming JSON requests (req.body will be populated)
app.use(express.json());

// Parse URL-encoded form data (for form submissions)
app.use(express.urlencoded({ extended: false }));
// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Mount auth routes — all routes in authRoutes.js will be prefixed with /api/auth
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// Health check route — useful to verify server is running
app.get("/", (req, res) => {
  res.json({ success: true, message: "Task Manager API is running 🚀" });
});

// ─────────────────────────────────────────────
// 404 Handler — For undefined routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────
// Global Error Handler
// This catches any errors passed via next(error) from anywhere in the app
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});