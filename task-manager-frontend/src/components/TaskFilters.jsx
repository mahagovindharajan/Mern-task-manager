// src/components/TaskFilters.jsx
//
// Contains all three controls:
//   1. Filter buttons: All / Completed / Pending
//   2. Search input (debounced — explained inline)
//   3. Sort dropdown
//
// Props: all values and setters come from useTasks() via Dashboard.

import { useState, useEffect } from "react";

const FILTER_OPTIONS = [
  { value: "all",       label: "All" },
  { value: "completed", label: "Completed" },
  { value: "pending",   label: "Pending" },
];

const SORT_OPTIONS = [
  { value: "newest",   label: "Newest first" },
  { value: "oldest",   label: "Oldest first" },
  { value: "priority", label: "By priority" },
  { value: "dueDate",  label: "By due date" },
];

const TaskFilters = ({ filter, setFilter, search, setSearch, sort, setSort }) => {
  // ── Debounced search ───────────────────────────────────────────────────
  // We keep a LOCAL input value that updates on every keystroke (instant feedback).
  // But we only call setSearch (which triggers an API request) after the user
  // stops typing for 400ms. This prevents firing a request on every single key.
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 400); // 400ms debounce delay

    // Cleanup: cancel the previous timer if the user types again before it fires
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  return (
    <div style={styles.wrapper}>
      {/* ── Filter Buttons ─────────────────────────────────────────── */}
      <div style={styles.filterGroup}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              ...styles.filterBtn,
              ...(filter === opt.value ? styles.filterBtnActive : {}),
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Search Input ───────────────────────────────────────────── */}
      <div style={styles.searchWrapper}>
        <span style={styles.searchIcon}>⌕</span>
        <input
          type="text"
          placeholder="Search tasks..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={styles.searchInput}
        />
        {/* Clear button — only shown when there's a search term */}
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(""); setSearch(""); }}
            style={styles.clearBtn}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Sort Dropdown ──────────────────────────────────────────── */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        style={styles.select}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  wrapper: {
    display:        "flex",
    flexWrap:       "wrap",
    gap:            "12px",
    alignItems:     "center",
    marginBottom:   "24px",
  },
  filterGroup: {
    display: "flex",
    gap:     "6px",
  },
  filterBtn: {
  padding: "8px 16px",
  borderRadius: "20px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: "13px",
  fontWeight: "500",
  color: "#6b7280",
  cursor: "pointer",
  transition: "all 0.15s",
  whiteSpace: "nowrap",
},

filterBtnActive: {
  background: "#2563eb",
  border: "1px solid #2563eb",
  color: "#fff",
},
  searchWrapper: {
    position:    "relative",
    display:     "flex",
    alignItems:  "center",
    flex:        "1",
    minWidth:    "200px",
    maxWidth:    "320px",
  },
  searchIcon: {
    position:    "absolute",
    left:        "12px",
    color:       "#9ca3af",
    fontSize:    "18px",
    pointerEvents:"none",
  },
  searchInput: {
    width:        "100%",
    padding:      "8px 36px 8px 34px",
    borderRadius: "20px",
    border:       "1px solid #e5e7eb",
    fontSize:     "14px",
    outline:      "none",
    boxSizing:    "border-box",
    background:   "#f9fafb",
    color:        "#111",
  },
  clearBtn: {
    position:  "absolute",
    right:     "10px",
    background:"none",
    border:    "none",
    color:     "#9ca3af",
    cursor:    "pointer",
    fontSize:  "12px",
    padding:   "2px 4px",
    lineHeight:1,
  },
  select: {
    padding:      "8px 12px",
    borderRadius: "8px",
    border:       "1px solid #e5e7eb",
    background:   "#fff",
    fontSize:     "13px",
    fontWeight:   "500",
    color:        "#374151",
    cursor:       "pointer",
    outline:      "none",
    minWidth:     "140px",
  },
};

export default TaskFilters;