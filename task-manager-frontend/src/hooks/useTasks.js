// src/hooks/useTasks.js
//
// Custom hook that owns ALL task state and operations.
// Dashboard.jsx just calls this hook — it doesn't manage any task logic itself.
//
// Separation of concerns:
//   useTasks.js  → WHAT data exists and HOW to change it
//   Dashboard.jsx → HOW to display it
//
// This also makes logic reusable — any future page can call useTasks()
// and get the full task system for free.

import { useState, useEffect, useCallback } from "react";
import taskService from "../services/taskService";
import { getErrorMessage } from "../utils/helpers";

const useTasks = () => {
  // ── Core data ──────────────────────────────────────────────────────────
  const [tasks,  setTasks]  = useState([]);
  const [stats,  setStats]  = useState(null);

  // ── UI state ───────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,        setError]        = useState("");
  const [toast,        setToast]        = useState(null); // { message, type }

  // ── Filter / search / sort state ───────────────────────────────────────
  const [filter, setFilter] = useState("all");    // "all" | "completed" | "pending"
  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState("newest");

  // ── Toast helper ───────────────────────────────────────────────────────
  // Shows a message for 3 seconds then auto-dismisses
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch tasks ────────────────────────────────────────────────────────
  // useCallback so this function reference stays stable — safe to put in
  // useEffect dependency arrays without causing infinite loops.
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await taskService.getAllTasks({ filter, search, sort });
      setTasks(data.tasks);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter, search, sort]); // Re-fetch whenever any of these change

  // ── Fetch stats ────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await taskService.getStats();
      setStats(data.stats);
    } catch (err) {
      console.error("Stats error:", err);
      // Stats failure is non-critical — don't block the whole dashboard
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Auto-fetch on mount and when filters change ────────────────────────
  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Create ─────────────────────────────────────────────────────────────
  const createTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      showToast("Task created successfully!");
      fetchTasks();  // Refresh list
      fetchStats();  // Refresh counts
      return true;   // Signal success to the form (so it can close/reset)
    } catch (err) {
      showToast(getErrorMessage(err), "error");
      return false;
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────
  const updateTask = async (id, taskData) => {
    try {
      await taskService.updateTask(id, taskData);
      showToast("Task updated successfully!");
      fetchTasks();
      fetchStats();
      return true;
    } catch (err) {
      showToast(getErrorMessage(err), "error");
      return false;
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const deleteTask = async (id) => {
    // Optimistic UI: remove from list instantly, restore if API fails
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await taskService.deleteTask(id);
      showToast("Task deleted.");
      fetchStats(); // Update counts after delete
    } catch (err) {
      setTasks(previous); // Restore on failure
      showToast(getErrorMessage(err), "error");
    }
  };

  // ── Toggle completion ──────────────────────────────────────────────────
  const toggleTask = async (id) => {
    // Optimistic UI: flip the boolean instantly
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const data = await taskService.toggleTask(id);
      // Sync with server's actual value (ground truth)
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? data.task : t))
      );
      fetchStats();
    } catch (err) {
      fetchTasks(); // Full re-fetch to restore correct state on failure
      showToast(getErrorMessage(err), "error");
    }
  };

  return {
    // Data
    tasks,
    stats,
    // UI state
    loading,
    statsLoading,
    error,
    toast,
    // Filters
    filter, setFilter,
    search, setSearch,
    sort,   setSort,
    // Actions
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    fetchTasks,
  };
};

export default useTasks;