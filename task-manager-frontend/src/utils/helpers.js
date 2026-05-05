// src/utils/helpers.js
// Pure helper functions — no React, no side effects, no imports.
// Easy to unit test in isolation.
// These will be used in TaskCard.jsx and Dashboard.jsx later.

// Format a MongoDB ISO date string into a readable format
// e.g. "2025-07-01T00:00:00.000Z" → "Jul 1, 2025"
export const formatDate = (dateString) => {
  if (!dateString) return "No due date";
  return new Date(dateString).toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  });
};

// Returns a Tailwind CSS color class based on priority string.
// Used in TaskCard to color-code priority badges.
export const getPriorityColor = (priority) => {
  const colors = {
    High:   "text-red-500",
    Medium: "text-yellow-500",
    Low:    "text-green-500",
  };
  return colors[priority] || "text-gray-500";
};

// Check if a task's due date has passed and the task isn't completed
// Returns true if the task is overdue, false otherwise
export const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  return new Date(dueDate) < new Date();
};

// Extract a readable error message from an axios error object.
// Centralising this prevents copy-pasting error handling in every catch block.
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message || // Backend sent a message
    error?.message ||                  // Axios/network error
    "Something went wrong"             // Fallback
  );
};