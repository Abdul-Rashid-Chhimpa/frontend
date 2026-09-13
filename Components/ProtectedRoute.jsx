import { Navigate } from "react-router-dom";

// ======================================================
// ProtectedRoute
// - Blocks access if the user isn't logged in (no token/user)
// - If adminOnly is set, also blocks non-admin users
// ======================================================
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
