// src/services/taskService.js
//
// Every task-related API call lives here.
// Dashboard and hooks import from this file — never call api.js directly.
// This means if the backend URL structure ever changes, you fix it in ONE place.
//
// Every function returns the `data` object from the axios response,
// so callers get the clean payload without unpacking `.data` themselves.

import api from "./api";

const taskService = {

  // GET /api/tasks?filter=...&search=...&sort=...
  // Pass an object like { filter: "pending", search: "meeting", sort: "dueDate" }
  getAllTasks: async (params = {}) => {
    const { data } = await api.get("/tasks", { params });
    return data; // { success, count, tasks, appliedFilters }
  },

  // GET /api/tasks/stats
  getStats: async () => {
    const { data } = await api.get("/tasks/stats");
    return data; // { success, stats: { totalTasks, completedTasks, ... } }
  },

  // POST /api/tasks
  createTask: async (taskData) => {
    const { data } = await api.post("/tasks", taskData);
    return data; // { success, task }
  },

  // PUT /api/tasks/:id
  updateTask: async (id, taskData) => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    return data; // { success, task }
  },

  // DELETE /api/tasks/:id
  deleteTask: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data; // { success, message }
  },

  // PATCH /api/tasks/:id/toggle
  toggleTask: async (id) => {
    const { data } = await api.patch(`/tasks/${id}/toggle`);
    return data; // { success, task }
  },
};

export default taskService;