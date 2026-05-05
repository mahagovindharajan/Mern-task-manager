// src/components/StatsBar.jsx
//
// Displays 4 stat cards at the top of the dashboard:
// Total / Completed / Pending / Overdue
//
// Props:
//   stats   — object from GET /api/tasks/stats (or null while loading)
//   loading — boolean, shows skeleton placeholders while fetching

const STAT_CONFIG = [
  {
    key:   "totalTasks",
    label: "Total Tasks",
    icon:  "◈",
    bg:    "#eff6ff",
    color: "#1d4ed8",
    border:"#bfdbfe",
  },
  {
    key:   "completedTasks",
    label: "Completed",
    icon:  "✓",
    bg:    "#f0fdf4",
    color: "#15803d",
    border:"#bbf7d0",
  },
  {
    key:   "pendingTasks",
    label: "Pending",
    icon:  "◷",
    bg:    "#fffbeb",
    color: "#b45309",
    border:"#fde68a",
  },
  {
    key:   "overdueTasks",
    label: "Overdue",
    icon:  "⚑",
    bg:    "#fff1f2",
    color: "#be123c",
    border:"#fecdd3",
  },
];

const StatsBar = ({ stats, loading }) => {
  return (
    <div style={styles.grid}>
      {STAT_CONFIG.map((cfg) => (
        <div
          key={cfg.key}
          style={{
            ...styles.card,
            background:  cfg.bg,
            borderColor: cfg.border,
          }}
        >
          <div style={{ ...styles.iconBox, color: cfg.color }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ ...styles.value, color: cfg.color }}>
              {loading ? (
                <span style={styles.skeleton} />
              ) : (
                stats?.[cfg.key] ?? "—"
              )}
            </div>
            <div style={styles.label}>{cfg.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap:                 "16px",
    marginBottom:        "28px",
  },
  card: {
    border:        "1px solid",
    borderRadius:  "12px",
    padding:       "18px 20px",
    display:       "flex",
    alignItems:    "center",
    gap:           "14px",
  },
  iconBox: {
    fontSize:  "22px",
    lineHeight: 1,
  },
  value: {
    fontSize:   "26px",
    fontWeight: "700",
    lineHeight: 1,
    marginBottom:"2px",
  },
  label: {
    fontSize: "12px",
    color:    "#6b7280",
    fontWeight:"500",
    letterSpacing:"0.02em",
    textTransform:"uppercase",
  },
  skeleton: {
    display:     "inline-block",
    width:       "32px",
    height:      "24px",
    background:  "#e5e7eb",
    borderRadius:"4px",
    animation:   "pulse 1.5s ease-in-out infinite",
  },
};

export default StatsBar;