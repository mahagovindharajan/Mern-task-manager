// src/pages/Register.jsx
//
// Handles new user registration:
//   1. User fills name + email + password + confirm password
//   2. On submit → validate locally → call POST /api/auth/register
//   3. On success → call login() from AuthContext → navigate to /dashboard
//   4. On error → show backend error message inline
//
// We log the user in immediately after registration (most modern apps do this)
// instead of making them go through the login page again.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/helpers";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "", // Frontend-only field — not sent to backend
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ── Client-side validation (fast feedback, before network round-trip) ──
    if (!formData.name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Only send the three fields the backend expects.
      // confirmPassword is purely a frontend UX feature — never send it.
      const payload = {
        name:     formData.name.trim(),
        email:    formData.email.trim(),
        password: formData.password,
      };
      const { data } = await api.post("/auth/register", payload);

      // Auto-login after successful registration
      login(data.user, data.token);
      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Start managing your tasks today</p>

        {error && (
          <div style={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label htmlFor="name" style={styles.label}>Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              style={styles.input}
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              style={styles.input}
              autoComplete="new-password"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              style={{
                ...styles.input,
                // Visual indicator: red border if passwords don't match
                borderColor:
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? "#e53e3e"
                    : "#ddd",
              }}
              autoComplete="new-password"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

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
    margin:   "0 0 24px",
    color:    "#666",
    fontSize: "14px",
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
    marginTop: "20px",
    textAlign: "center",
    fontSize:  "14px",
    color:     "#666",
  },
  link: {
    color:          "#2563eb",
    textDecoration: "none",
    fontWeight:     "500",
  },
};

export default Register;