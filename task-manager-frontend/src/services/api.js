// src/services/api.js
// Central axios instance for the entire app.
//
// WHY a custom instance instead of plain axios?
//   1. One place to set the base URL — change backend URL once, not everywhere
//   2. Request interceptor auto-attaches the JWT token to every request
//   3. Response interceptor handles 401 errors globally (auto-logout)
//
// HOW pages use this:
//   import api from '../services/api'
//   const response = await api.get('/tasks')        ← token attached automatically
//   const response = await api.post('/tasks', data) ← no manual headers needed

import axios from "axios";
console.log("ENV VALUE:", import.meta.env.VITE_API_BASE_URL);
// Create a custom axios instance with our backend's base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Runs automatically BEFORE every outgoing request.
// Reads the JWT token from localStorage and injects it into the
// Authorization header so we never have to do it manually in each page.

api.interceptors.request.use(
  (config) => {
    // Read token from localStorage (set there after login/register)
    const token = localStorage.getItem("token");

    if (token) {
      // Attach token in the format our backend's protect middleware expects
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Always return the modified config
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Runs automatically on EVERY incoming response.
// If the server returns 401 (token expired / invalid), we clear local
// storage and redirect to login — the user is logged out automatically.

api.interceptors.response.use(
  (response) => response, // Pass through successful responses untouched

  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clean up and force re-login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Hard redirect to login page
    }
    return Promise.reject(error); // Always reject so callers can catch errors
  }
);

export default api;