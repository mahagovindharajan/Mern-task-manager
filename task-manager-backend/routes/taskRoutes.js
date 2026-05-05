// routes/taskRoutes.js
// Changes from Part 2:
//   1. Import getTaskStats from the controller
//   2. Register GET /stats ABOVE /:id routes (order matters — see comment)

const express = require("express");
const router  = express.Router();

const {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTaskStats, // ← new import
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

// Lock down every route in this file with JWT protection
router.use(protect);

// ── Stats route ───────────────────────────────────────────────────────────────
// ⚠️  MUST be declared BEFORE /:id routes.
//
// Why? Express matches routes top-to-bottom in registration order.
// If /:id were first, a GET /api/tasks/stats request would match it
// with id = "stats", then fail with a CastError when Mongoose tries
// to cast "stats" into a MongoDB ObjectId.
//
// Keeping /stats above /:id ensures it matches the literal string first.
router.get("/stats", getTaskStats);

// ── Collection routes ─────────────────────────────────────────────────────────
router
  .route("/")
  .get(getAllTasks)   // GET  /api/tasks       → fetch all my tasks
  .post(createTask); // POST /api/tasks        → create a new task

// ── Single resource routes ────────────────────────────────────────────────────
router
  .route("/:id")
  .get(getSingleTask) // GET    /api/tasks/:id → get one task
  .put(updateTask)    // PUT    /api/tasks/:id → update one task
  .delete(deleteTask);// DELETE /api/tasks/:id → delete one task

// ── Special action route ──────────────────────────────────────────────────────
// PATCH is used here (not PUT) because we're doing a partial update —
// toggling just one field, not replacing the whole document
router.patch("/:id/toggle", toggleTaskCompletion); // PATCH /api/tasks/:id/toggle

module.exports = router;