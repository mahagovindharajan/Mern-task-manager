// src/components/Toast.jsx
//
// A floating notification that appears in the top-right corner.
// Receives `toast` prop = { message, type } from useTasks hook.
// `type` is "success" (green) or "error" (red).
// Auto-dismisses after 3 seconds (managed by useTasks showToast).

const Toast = ({ toast }) => {
  if (!toast) return null;

  const isSuccess = toast.type !== "error";

  return (
    <div style={{
      ...styles.toast,
      background:  isSuccess ? "#f0fdf4" : "#fff0f0",
      borderColor: isSuccess ? "#86efac" : "#fca5a5",
      color:       isSuccess ? "#166534" : "#991b1b",
    }}>
      <span style={styles.icon}>{isSuccess ? "✓" : "✕"}</span>
      {toast.message}
    </div>
  );
};

const styles = {
  toast: {
    position:     "fixed",
    top:          "24px",
    right:        "24px",
    padding:      "12px 18px",
    borderRadius: "10px",
    border:       "1px solid",
    fontSize:     "14px",
    fontWeight:   "500",
    display:      "flex",
    alignItems:   "center",
    gap:          "8px",
    boxShadow:    "0 4px 12px rgba(0,0,0,0.10)",
    zIndex:       1000,
    animation:    "slideIn 0.2s ease",
    maxWidth:     "320px",
  },
  icon: {
    fontStyle: "normal",
    fontSize:  "14px",
  },
};

export default Toast;