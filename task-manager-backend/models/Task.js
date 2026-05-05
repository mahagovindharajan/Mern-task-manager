// models/Task.js
// Defines the structure of a Task document in MongoDB.
// Each task is "owned" by a User via the `user` field (ObjectId reference).
// This is a one-to-many relationship: one User → many Tasks.

const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    // ── Core Fields ────────────────────────────────────────────────────

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // ── Status & Priority ──────────────────────────────────────────────

    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be Low, Medium, or High",
      },
      default: "Medium",
    },

    completed: {
      type: Boolean,
      default: false, // New tasks are always incomplete by default
    },

    // ── Scheduling ─────────────────────────────────────────────────────

    dueDate: {
      type: Date,
      default: null,
    },

    // ── Ownership — Links this task to a specific User ─────────────────
    // `ref: "User"` tells Mongoose which model to use for .populate()
    // This is how we enforce "each task belongs to one user"

    user: {
      type: mongoose.Schema.Types.ObjectId, // Stores the User's _id
      ref: "User",                           // References the User model
      required: [true, "Task must belong to a user"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Index for faster queries ────────────────────────────────────────────
// When we query "find all tasks by user", MongoDB will use this index
// instead of scanning every document — much faster at scale.
TaskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Task", TaskSchema);