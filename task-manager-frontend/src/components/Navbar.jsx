// src/components/Navbar.jsx
// Shown on every page. Will display app name, user info, logout button.

import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Task Manager</Link>
      {isAuthenticated ? (
        <>
          <span>Hi, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;