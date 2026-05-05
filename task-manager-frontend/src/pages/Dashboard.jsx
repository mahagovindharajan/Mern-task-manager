// src/pages/Dashboard.jsx
//
// The main page — assembles every component using useTasks() hook.
//
// Data flow:
//   useTasks() → stats + tasks + loading states + filter state + actions
//     ↓
//   StatsBar      ← receives stats, statsLoading
//   TaskFilters   ← receives filter/search/sort state + setters
//   TaskForm      ← receives createTask / updateTask + loading
//   TaskCard[]    ← receives each task + toggleTask / onEdit / deleteTask
//   Toast         ← receives toast state

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useTasks from "../hooks/useTasks";

import StatsBar    from "../components/StatsBar";
import TaskFilters from "../components/TaskFilters";
import TaskCard    from "../components/TaskCard";
import TaskForm    from "../components/TaskForm";
import Toast       from "../components/Toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ── All task state + actions from our custom hook ──────────────────────
  const {
    tasks, stats,
    loading, statsLoading, error, toast,
    filter, setFilter,
    search, setSearch,
    sort,   setSort,
    createTask, updateTask, deleteTask, toggleTask,
  } = useTasks();

  // ── Local UI state (form visibility / which task is being edited) ──────
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask,    setEditingTask]    = useState(null);   // task object or null
  const [formLoading,    setFormLoading]    = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleCreateSubmit = async (formData) => {
    setFormLoading(true);
    const success = await createTask(formData);
    setFormLoading(false);
    if (success) setShowCreateForm(false);
  };

  const handleEditSubmit = async (formData) => {
    setFormLoading(true);
    const success = await updateTask(editingTask._id, formData);
    setFormLoading(false);
    if (success) setEditingTask(null);
  };

  // Open the edit form for a specific task
  const handleEditOpen = (task) => {
    setEditingTask(task);
    setShowCreateForm(false); // Close create form if open
    // Scroll the form into view smoothly
    setTimeout(() =>
      document.getElementById("edit-form")?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Global toast notification ─────────────────────────────── */}
      <Toast toast={toast} />

      {/* ── Header ───────────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.appName}>Task Manager</h1>
            <p style={styles.welcome}>Welcome back, {user?.name}</p>
          </div>
          <div style={styles.headerRight}>
            <button
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                setEditingTask(null);
              }}
              style={styles.newTaskBtn}
            >
              {showCreateForm ? "✕ Cancel" : "+ New Task"}
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main style={styles.main}>

        {/* Stats bar at the top */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Create task form (toggled by "+ New Task" button) */}
        {showCreateForm && (
          <TaskForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
            loading={formLoading}
          />
        )}

        {/* Edit task form (shown when a task's Edit button is clicked) */}
        {editingTask && (
          <div id="edit-form">
            <TaskForm
              initialData={editingTask}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTask(null)}
              loading={formLoading}
            />
          </div>
        )}

        {/* Filter / Search / Sort bar */}
        <TaskFilters
          filter={filter} setFilter={setFilter}
          search={search} setSearch={setSearch}
          sort={sort}     setSort={setSort}
        />

        {/* ── Task List Area ───────────────────────────────────── */}

        {/* Error state */}
        {error && (
          <div style={styles.errorBanner}>
            <strong>Error:</strong> {error}
            <button
              onClick={() => window.location.reload()}
              style={styles.retryBtn}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={styles.taskList}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonLine} />
                <div style={{ ...styles.skeletonLine, width: "60%", marginTop:"8px" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state — not loading, no error, but no tasks match */}
        {!loading && !error && tasks.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              {search ? "⌕" : filter === "completed" ? "✓" : "◈"}
            </div>
            <h3 style={styles.emptyTitle}>
              {search
                ? `No tasks matching "${search}"`
                : filter === "completed"
                  ? "No completed tasks yet"
                  : filter === "pending"
                    ? "No pending tasks — great work!"
                    : "No tasks yet"}
            </h3>
            <p style={styles.emptyText}>
              {search || filter !== "all"
                ? "Try a different search or filter."
                : 'Click "+ New Task" to create your first task.'}
            </p>
          </div>
        )}

        {/* Task cards */}
        {!loading && tasks.length > 0 && (
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={toggleTask}
                onEdit={handleEditOpen}
                onDelete={deleteTask}
              />
            ))}
            {/* Task count footer */}
            <p style={styles.taskCount}>
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} shown
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight:  "100vh",
    background: "#f9fafb",
  },
  header: {
    background:   "#fff",
    borderBottom: "1px solid #f3f4f6",
    position:     "sticky",
    top:          0,
    zIndex:       100,
    boxShadow:    "0 1px 4px rgba(0,0,0,0.04)",
  },
  headerInner: {
    maxWidth:       "900px",
    margin:         "0 auto",
    padding:        "16px 24px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    flexWrap:       "wrap",
    gap:            "12px",
  },
  appName: {
    margin:     0,
    fontSize:   "20px",
    fontWeight: "700",
    color:      "#111",
  },
  welcome: {
    margin:    "2px 0 0",
    fontSize:  "13px",
    color:     "#9ca3af",
  },
  headerRight: {
    display:    "flex",
    alignItems: "center",
    gap:        "10px",
  },
  newTaskBtn: {
    padding:      "8px 18px",
    borderRadius: "8px",
    border:       "none",
    background:   "#2563eb",
    color:        "#fff",
    fontSize:     "14px",
    fontWeight:   "600",
    cursor:       "pointer",
  },
  logoutBtn: {
    padding:      "8px 16px",
    borderRadius: "8px",
    border:       "1px solid #e5e7eb",
    background:   "#fff",
    fontSize:     "13px",
    fontWeight:   "500",
    cursor:       "pointer",
    color:        "#6b7280",
  },
  main: {
    maxWidth: "900px",
    margin:   "0 auto",
    padding:  "32px 24px",
  },
  errorBanner: {
    background:   "#fff1f2",
    border:       "1px solid #fecdd3",
    borderRadius: "10px",
    padding:      "14px 18px",
    color:        "#be123c",
    fontSize:     "14px",
    display:      "flex",
    alignItems:   "center",
    justifyContent:"space-between",
    marginBottom: "16px",
  },
  retryBtn: {
    padding:      "5px 12px",
    borderRadius: "6px",
    border:       "1px solid #fecdd3",
    background:   "#fff",
    color:        "#be123c",
    fontSize:     "12px",
    cursor:       "pointer",
  },
  taskList: {
    display:       "flex",
    flexDirection: "column",
    gap:           "12px",
  },
  skeletonCard: {
    background:   "#fff",
    borderRadius: "10px",
    border:       "1px solid #f3f4f6",
    padding:      "20px",
    animation:    "pulse 1.5s ease-in-out infinite",
  },
  skeletonLine: {
    height:       "14px",
    background:   "#f3f4f6",
    borderRadius: "6px",
    width:        "80%",
  },
  emptyState: {
    textAlign: "center",
    padding:   "64px 24px",
    color:     "#9ca3af",
  },
  emptyIcon: {
    fontSize:     "48px",
    marginBottom: "16px",
    opacity:      0.4,
  },
  emptyTitle: {
    margin:     "0 0 8px",
    fontSize:   "18px",
    fontWeight: "600",
    color:      "#374151",
  },
  emptyText: {
    margin:   0,
    fontSize: "14px",
  },
  taskCount: {
    textAlign: "center",
    fontSize:  "12px",
    color:     "#d1d5db",
    margin:    "8px 0 0",
  },
};

export default Dashboard;