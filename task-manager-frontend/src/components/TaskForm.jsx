// src/components/TaskForm.jsx
//
// Dual-purpose form — works for both CREATE and EDIT.
//   - No `initialData` prop → Create mode (empty fields, "Add Task" button)
//   - With `initialData` prop → Edit mode (pre-filled, "Save Changes" button)
//
// Props:
//   initialData  — task object to edit (optional)
//   onSubmit     — async fn(formData) → returns true/false from useTasks
//   onCancel     — fn() to close the form
//   loading      — boolean while API call is in progress

import { useState } from "react";

const EMPTY_FORM = {
  title:       "",
  description: "",
  priority:    "Medium",
  dueDate:     "",
};

const TaskForm = ({ initialData = null, onSubmit, onCancel, loading }) => {
  const isEdit = Boolean(initialData);

  // Pre-fill for edit mode; blank for create mode
  const [formData, setFormData] = useState(() => {
    if (!initialData) return EMPTY_FORM;
    return {
      title:       initialData.title       || "",
      description: initialData.description || "",
      priority:    initialData.priority    || "Medium",
      // MongoDB stores ISO date — slice to "YYYY-MM-DD" for <input type="date">
      dueDate:     initialData.dueDate
                     ? initialData.dueDate.slice(0, 10)
                     : "",
    };
  });

  const [fieldError, setFieldError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldError) setFieldError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title.trim()) {
      setFieldError("Task title is required.");
      return;
    }

    // Build payload — only send dueDate if it has a value
    const payload = {
      title:       formData.title.trim(),
      description: formData.description.trim(),
      priority:    formData.priority,
      ...(formData.dueDate && { dueDate: formData.dueDate }),
    };

    const success = await onSubmit(payload);

    // If successful and creating (not editing), reset to empty form
    if (success && !isEdit) {
      setFormData(EMPTY_FORM);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.heading}>
        {isEdit ? "Edit Task" : "New Task"}
      </h3>

      {fieldError && (
        <p style={styles.fieldError}>{fieldError}</p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Title */}
        <div style={styles.row}>
          <input
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task title *"
            style={styles.input}
            autoFocus
            required
          />
        </div>

        {/* Description */}
        <div style={styles.row}>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            style={styles.textarea}
            rows={3}
          />
        </div>

        {/* Priority + Due Date — side by side */}
        <div style={styles.twoCol}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Due Date</label>
            <input
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              style={styles.input}
              // Prevent selecting dates in the past for new tasks
              min={!isEdit ? new Date().toISOString().slice(0, 10) : undefined}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor:  loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Saving..."
              : isEdit ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    background:   "#fff",
    borderRadius: "12px",
    border:       "1px solid #e5e7eb",
    padding:      "24px",
    marginBottom: "24px",
    boxShadow:    "0 2px 8px rgba(0,0,0,0.06)",
  },
  heading: {
    margin:     "0 0 16px",
    fontSize:   "16px",
    fontWeight: "600",
    color:      "#111",
  },
  fieldError: {
    color:        "#dc2626",
    fontSize:     "13px",
    marginBottom: "12px",
    padding:      "8px 12px",
    background:   "#fff1f2",
    borderRadius: "6px",
  },
  form: {
    display:       "flex",
    flexDirection: "column",
    gap:           "14px",
  },
  row: {
    width: "100%",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:     "12px",
  },
  fieldGroup: {
    display:       "flex",
    flexDirection: "column",
    gap:           "5px",
  },
  label: {
    fontSize:   "12px",
    fontWeight: "500",
    color:      "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  input: {
    width:        "100%",
    padding:      "9px 12px",
    borderRadius: "8px",
    border:       "1px solid #e5e7eb",
    fontSize:     "14px",
    outline:      "none",
    boxSizing:    "border-box",
    color:        "#111",
    background:   "#fafafa",
  },
  textarea: {
    width:        "100%",
    padding:      "9px 12px",
    borderRadius: "8px",
    border:       "1px solid #e5e7eb",
    fontSize:     "14px",
    outline:      "none",
    resize:       "vertical",
    boxSizing:    "border-box",
    color:        "#111",
    background:   "#fafafa",
    fontFamily:   "inherit",
  },
  select: {
    width:        "100%",
    padding:      "9px 12px",
    borderRadius: "8px",
    border:       "1px solid #e5e7eb",
    fontSize:     "14px",
    outline:      "none",
    background:   "#fafafa",
    color:        "#111",
    cursor:       "pointer",
    boxSizing:    "border-box",
  },
  actions: {
    display:        "flex",
    justifyContent: "flex-end",
    gap:            "10px",
    marginTop:      "4px",
  },
  cancelBtn: {
    padding:      "9px 18px",
    borderRadius: "8px",
    border:       "1px solid #e5e7eb",
    background:   "#fff",
    fontSize:     "14px",
    fontWeight:   "500",
    cursor:       "pointer",
    color:        "#374151",
  },
  submitBtn: {
    padding:      "9px 20px",
    borderRadius: "8px",
    border:       "none",
    background:   "#2563eb",
    color:        "#fff",
    fontSize:     "14px",
    fontWeight:   "500",
    cursor:       "pointer",
  },
};

export default TaskForm;