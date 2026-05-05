// src/components/ProtectedRoute.jsx
//
// A gate component that sits between React Router and any private page.
// It asks one question: "Is there a valid token in AuthContext?"
//
//   YES → render the page normally
//   NO  → redirect to /login, replacing history so "back" doesn't return here
//
// Usage in App.jsx:
//   <Route path="/dashboard" element={
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   }/>
//
// The `replace` prop on <Navigate> is important — without it, clicking
// "back" from the login page would return to the blocked route, triggering
// another redirect loop.

import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Not logged in — send to login, replace history entry
    return <Navigate to="/login" replace />;
  }

  // Logged in — render the actual page
  return children;
};

export default ProtectedRoute;