// controllers/taskController.js
// ─────────────────────────────────────────────────────────────
// UPDATED: getAllTasks   → now supports filter + search + sort
// NEW:     getTaskStats  → returns dashboard statistics
// ALL OTHER functions (createTask, getSingleTask, updateTask,
// deleteTask, toggleTaskCompletion) are UNCHANGED from Part 2.
// ─────────────────────────────────────────────────────────────

const Task = require("../models/Task");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Build the sort object from a query string param
// ─────────────────────────────────────────────────────────────────────────────
const buildSortOption = (sortParam) => {
  switch (sortParam) {
    case "oldest":
      return { createdAt: 1 };
    case "newest":
      return { createdAt: -1 };
    case "dueDate":
      return { dueDate: 1 };
    case "priority":
      return "__PRIORITY__";
    default:
      return { createdAt: -1 };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/tasks
// @desc    Create a new task for the logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    console.error("Create Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not create task.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/tasks
// @desc    Get all tasks for the logged-in user.
//          Supports: filter, search, sort query params
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const {
      filter = "all",
      search = "",
      sort   = "newest",
    } = req.query;

    // Always scope to the logged-in user
    const filterQuery = { user: req.user._id };

    // Completion filter
    if (filter === "completed") {
      filterQuery.completed = true;
    } else if (filter === "pending") {
      filterQuery.completed = false;
    }

    // Search filter (title OR description, case-insensitive)
    if (search.trim() !== "") {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filterQuery.$or = [
        { title:       { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const sortOption = buildSortOption(sort);

    let tasks;

    if (sortOption === "__PRIORITY__") {
      tasks = await Task.aggregate([
        { $match: filterQuery },
        {
          $addFields: {
            priorityOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$priority", "High"]   }, then: 1 },
                  { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                  { case: { $eq: ["$priority", "Low"]    }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
        { $sort: { priorityOrder: 1, createdAt: -1 } },
        { $project: { priorityOrder: 0 } },
      ]);
    } else {
      tasks = await Task.find(filterQuery).sort(sortOption);
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      appliedFilters: { filter, search, sort },
      tasks,
    });
  } catch (error) {
    console.error("Get All Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch tasks.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/tasks/stats
// @desc    Return dashboard statistics for the logged-in user's tasks
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, completed: true }),
      Task.countDocuments({ user: userId, completed: false }),
      Task.countDocuments({
        user:      userId,
        completed: false,
        dueDate:   { $lt: now, $ne: null },
      }),
    ]);

    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: `${completionRate}%`,
      },
    });
  } catch (error) {
    console.error("Get Task Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch task statistics.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/tasks/:id
// @desc    Get a single task by ID (only if it belongs to the logged-in user)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getSingleTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }
    console.error("Get Single Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch task.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/tasks/:id
// @desc    Update a task — only owner can update
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;

    const allowedUpdates = {};
    if (title !== undefined)       allowedUpdates.title = title;
    if (description !== undefined) allowedUpdates.description = description;
    if (priority !== undefined)    allowedUpdates.priority = priority;
    if (dueDate !== undefined)     allowedUpdates.dueDate = dueDate;
    if (completed !== undefined)   allowedUpdates.completed = completed;

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }
    console.error("Update Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not update task.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/tasks/:id
// @desc    Delete a task — only owner can delete
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      deletedTask: {
        id: task._id,
        title: task.title,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }
    console.error("Delete Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not delete task.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status (true ↔ false)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.completed ? "completed ✅" : "incomplete ⬜"}`,
      task,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }
    console.error("Toggle Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not toggle task.",
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTaskStats,
};