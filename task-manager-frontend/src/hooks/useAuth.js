// src/hooks/useAuth.js
// A thin wrapper around useContext(AuthContext).
//
// WHY a custom hook?
//   1. Cleaner imports — `useAuth()` vs `useContext(AuthContext)`
//   2. Built-in safety — throws a helpful error if used outside <AuthProvider>
//      instead of silently returning undefined and causing confusing bugs
//
// USAGE in any component:
//   import useAuth from '../hooks/useAuth'
//   const { user, login, logout, isAuthenticated } = useAuth()

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);

  // If context is null, the component is being used outside <AuthProvider>.
  // This gives a clear error message instead of a cryptic "cannot read
  // property of undefined" crash somewhere deeper in the component tree.
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }

  return context;
};

export default useAuth;