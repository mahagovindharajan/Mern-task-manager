// src/pages/Login.jsx
//
// Handles user login end-to-end:
//   1. User fills out email + password
//   2. On submit → call POST /api/auth/login via api.js
//   3. On success → call login() from AuthContext → navigate to /dashboard
//   4. On error → show the backend's error message inline
//
// Notice we import `api` (our custom axios instance) instead of plain axios.
// The interceptors in api.js automatically attach the JWT to future requests.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/helpers";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email:    "",
    password: "",
  });
  const [error,   setError]   = useState("");   // inline error message
  const [loading, setLoading] = useState(false); // disables button during request

  // ── Handlers ──────────────────────────────────────────────────────────────
  // Single handler for all inputs — uses the `name` attribute to know which
  // field to update. Avoids writing a separate handler per field.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error as soon as the user starts typing again — better UX
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent full page reload
    setLoading(true);
    setError("");

    // Basic client-side validation before hitting the network
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      // api.js has baseURL set to http://localhost:5000/api, so this calls
      // POST http://localhost:5000/api/auth/login
      const { data } = await api.post("/auth/login", formData);

      // data = { success: true, token: "...", user: { id, name, email } }
      // Store in context AND localStorage via login()
      login(data.user, data.token);

      // Navigate to dashboard — replace so /login isn't in history
      navigate("/dashboard", { replace: true });

    } catch (err) {
      // getErrorMessage extracts the most useful error string from the
      // axios error object (see utils/helpers.js)
      setError(getErrorMessage(err));
    } finally {
      // Always re-enable the button, whether success or failure
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {/* Inline error banner — only shown when `error` has a value */}
        {error && (
          <div style={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={styles.input}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor:  loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

// ── Minimal inline styles ────────────────────────────────────────────────────
// These will be replaced by Tailwind / CSS modules in Part 6 (full UI).
// Kept here so the page is functional and testable right now.
const styles = {
  page: {
    minHeight:      "100vh",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    padding:        "16px",
    background:     "#f5f5f5",
  },
  card: {
    background:   "#ffffff",
    borderRadius: "12px",
    padding:      "40px",
    width:        "100%",
    maxWidth:     "420px",
    boxShadow:    "0 2px 16px rgba(0,0,0,0.08)",
  },
  title: {
    margin:     "0 0 6px",
    fontSize:   "24px",
    fontWeight: "600",
    color:      "#111",
  },
  subtitle: {
    margin:    "0 0 24px",
    color:     "#666",
    fontSize:  "14px",
  },
  errorBanner: {
    background:   "#fff0f0",
    border:       "1px solid #ffc0c0",
    borderRadius: "8px",
    color:        "#c00",
    padding:      "10px 14px",
    fontSize:     "14px",
    marginBottom: "16px",
  },
  form: {
    display:       "flex",
    flexDirection: "column",
    gap:           "16px",
  },
  fieldGroup: {
    display:       "flex",
    flexDirection: "column",
    gap:           "6px",
  },
  label: {
    fontSize:   "14px",
    fontWeight: "500",
    color:      "#333",
  },
  input: {
    padding:      "10px 12px",
    borderRadius: "8px",
    border:       "1px solid #ddd",
    fontSize:     "15px",
    outline:      "none",
    transition:   "border-color 0.2s",
    width:        "100%",
    boxSizing:    "border-box",
  },
  button: {
    marginTop:    "8px",
    padding:      "12px",
    borderRadius: "8px",
    border:       "none",
    background:   "#2563eb",
    color:        "#fff",
    fontSize:     "16px",
    fontWeight:   "500",
    cursor:       "pointer",
    transition:   "opacity 0.2s",
  },
  footer: {
    marginTop:  "20px",
    textAlign:  "center",
    fontSize:   "14px",
    color:      "#666",
  },
  link: {
    color:          "#2563eb",
    textDecoration: "none",
    fontWeight:     "500",
  },
};

export default Login;