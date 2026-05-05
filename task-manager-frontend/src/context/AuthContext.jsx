// src/context/AuthContext.jsx
//
// The single source of truth for authentication across the entire app.
// Any component — no matter how deeply nested — can access user info
// and call login/logout without any prop drilling.
//
// Flow on app start:
//   1. useState initializer reads token + user from localStorage
//   2. If found → user is considered logged in immediately (no flicker)
//   3. If not found → user and token are null → redirected to /login
//
// Flow on login/register:
//   1. Page calls login(userData, token) after successful API response
//   2. State updates → every subscribed component re-renders
//   3. localStorage is written → survives page refresh
//
// Flow on logout:
//   1. logout() clears state + localStorage
//   2. App.jsx redirects to /login via ProtectedRoute

import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ── Initialize from localStorage ────────────────────────────────────────
  // The () => ... form is a "lazy initializer" — it only runs once on mount,
  // not on every re-render. Important for performance since localStorage
  // reads are synchronous.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      // If localStorage data is corrupted JSON, start fresh
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // ── login() ──────────────────────────────────────────────────────────────
  // Called by both Login.jsx and Register.jsx after a successful API call.
  // useCallback prevents this function from being recreated on every render,
  // which matters when it's passed as a prop or used in useEffect deps.
  const login = useCallback((userData, authToken) => {
    // Update React state (triggers re-render for all consuming components)
    setUser(userData);
    setToken(authToken);

    // Persist to localStorage (survives browser refresh / tab close)
    localStorage.setItem("user",  JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  }, []);

  // ── logout() ─────────────────────────────────────────────────────────────
  // Wipes both in-memory state and localStorage.
  // After this runs, isAuthenticated becomes false and ProtectedRoute
  // automatically kicks the user to /login.
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  // ── updateUser() ─────────────────────────────────────────────────────────
  // Useful later when the user edits their profile — update state without
  // changing the token or triggering a full re-login.
  const updateUser = useCallback((updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem("user", JSON.stringify(merged));
  }, [user]);

  // ── Context value ─────────────────────────────────────────────────────────
  // Everything downstream components can access via useAuth()
  const contextValue = {
    user,                         // { id, name, email } or null
    token,                        // JWT string or null
    isAuthenticated: !!token,     // Boolean convenience flag
    login,                        // fn(userData, token)
    logout,                       // fn()
    updateUser,                   // fn(partialUserData)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};