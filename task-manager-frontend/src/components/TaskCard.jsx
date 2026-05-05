// src/components/TaskCard.jsx
//
// Renders one task. Receives the task object and all action callbacks
// from Dashboard.jsx (which gets them from useTasks).
//
// Props:
//   task      — the task object from MongoDB
//   onToggle  — fn(id) toggles completion
//   onEdit    — fn(task) opens the edit form with this task
//   onDelete  — fn(id) deletes this task

import { formatDate, getPriorityColor, isOverdue } from "../utils/helpers";
import { useState } from "react";

const PRIORITY_STYLES = {
  High:   { bg: "#fff1f2", color: "#be123c", border: "#fecdd3", dot: "#e11d48" },
  Medium: { bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  Low:    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
};

const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
  const overdue = isOverdue(task.dueDate, task.completed);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(task._id);
    } else {
      // First click → ask for confirmation; auto-cancel after 3s
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div style={{
      ...styles.card,
      borderLeft: `3px solid ${task.completed ? "#22c55e" : priorityStyle.dot}`,
      opacity:     task.completed ? 0.75 : 1,
    }}>
      {/* ── Top Row: Checkbox + Title + Priority Badge ──────────────── */}
      <div style={styles.topRow}>
        {/* Completion toggle checkbox */}
        <button
          onClick={() => onToggle(task._id)}
          title={task.completed ? "Mark as pending" : "Mark as complete"}
          style={{
            ...styles.checkbox,
            background:  task.completed ? "#22c55e" : "#fff",
            borderColor: task.completed ? "#22c55e" : "#d1d5db",
          }}
        >
          {task.completed && (
            <span style={styles.checkmark}>✓</span>
          )}
        </button>

        {/* Title */}
        <h3 style={{
          ...styles.title,
          textDecoration: task.completed ? "line-through" : "none",
          color:          task.completed ? "#9ca3af" : "#111827",
        }}>
          {task.title}
        </h3>

        {/* Priority badge */}
        <span style={{
          ...styles.priorityBadge,
          background:  priorityStyle.bg,
          color:       priorityStyle.color,
          border:      `1px solid ${priorityStyle.border}`,
        }}>
          {task.priority}
        </span>
      </div>

      {/* ── Description ─────────────────────────────────────────────── */}
      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      {/* ── Meta Row: Due date + Status badge ───────────────────────── */}
      <div style={styles.metaRow}>
        {task.dueDate && (
          <span style={{
            ...styles.dueDateBadge,
            color:       overdue ? "#dc2626" : "#6b7280",
            background:  overdue ? "#fff1f2" : "#f3f4f6",
            fontWeight:  overdue ? "600" : "400",
          }}>
            {overdue ? "⚑ Overdue · " : "◷ "}
            {formatDate(task.dueDate)}
          </span>
        )}

        {task.completed && (
          <span style={styles.completedBadge}>Completed</span>
        )}
      </div>

      {/* ── Action Buttons: Edit + Delete ────────────────────────────── */}
      <div style={styles.actions}>
        <button
          onClick={() => onEdit(task)}
          style={styles.editBtn}
          title="Edit task"
        >
          ✎ Edit
        </button>

        <button
          onClick={handleDeleteClick}
          style={{
            ...styles.deleteBtn,
            background:  confirmDelete ? "#dc2626" : "#fff",
            color:       confirmDelete ? "#fff"    : "#6b7280",
            borderColor: confirmDelete ? "#dc2626" : "#e5e7eb",
          }}
          title={confirmDelete ? "Click again to confirm" : "Delete task"}
        >
          {confirmDelete ? "Confirm delete?" : "✕ Delete"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background:   "#fff",
    borderRadius: "10px",
    border:       "1px solid #f3f4f6",
    padding:      "18px 20px",
    boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
    transition:   "box-shadow 0.2s, opacity 0.2s",
  },
  topRow: {
    display:    "flex",
    alignItems: "center",
    gap:        "12px",
    marginBottom:"8px",
  },
  checkbox: {
    width:        "20px",
    height:       "20px",
    borderRadius: "50%",
    border:       "2px solid",
    cursor:       "pointer",
    flexShrink:   0,
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    transition:   "all 0.15s",
    padding:      0,
  },
  checkmark: {
    color:     "#fff",
    fontSize:  "11px",
    fontWeight:"700",
    lineHeight: 1,
  },
  title: {
    flex:       1,
    margin:     0,
    fontSize:   "15px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  priorityBadge: {
    padding:      "2px 10px",
    borderRadius: "20px",
    fontSize:     "11px",
    fontWeight:   "600",
    whiteSpace:   "nowrap",
    letterSpacing:"0.02em",
  },
  description: {
    margin:     "0 0 10px 32px",
    fontSize:   "13px",
    color:      "#6b7280",
    lineHeight: "1.5",
  },
  metaRow: {
    display:    "flex",
    alignItems: "center",
    gap:        "8px",
    marginLeft: "32px",
    marginBottom:"12px",
    flexWrap:   "wrap",
  },
  dueDateBadge: {
    fontSize:     "12px",
    padding:      "3px 8px",
    borderRadius: "6px",
  },
  completedBadge: {
    fontSize:     "11px",
    padding:      "3px 8px",
    borderRadius: "6px",
    background:   "#f0fdf4",
    color:        "#15803d",
    fontWeight:   "500",
  },
  actions: {
    display:        "flex",
    gap:            "8px",
    justifyContent: "flex-end",
    paddingTop:     "12px",
    borderTop:      "1px solid #f3f4f6",
  },
  editBtn: {
    padding:      "5px 14px",
    borderRadius: "6px",
    border:       "1px solid #e5e7eb",
    background:   "#fff",
    fontSize:     "12px",
    fontWeight:   "500",
    cursor:       "pointer",
    color:        "#374151",
  },
  deleteBtn: {
    padding:      "5px 14px",
    borderRadius: "6px",
    border:       "1px solid",
    fontSize:     "12px",
    fontWeight:   "500",
    cursor:       "pointer",
    transition:   "all 0.15s",
  },
};

export default TaskCard;