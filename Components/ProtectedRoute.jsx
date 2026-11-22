import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiry");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
};

export const hasValidSession = () => {
  const token = localStorage.getItem("token");
  const expiry = Number(localStorage.getItem("tokenExpiry") || 0);

  if (!token) return false;

  if (expiry && Date.now() >= expiry) {
    clearAuthStorage();
    return false;
  }

  return true;
};

export const requireAuthAction = (navigate, callback, location = null) => {
  const rawUser = localStorage.getItem("user");
  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  if (!hasValidSession() || !user) {
    toast.error("Please sign in to access this feature.");
    navigate("/login", { state: location ? { from: location } : undefined });
    return;
  }

  if (typeof callback === "function") {
    callback();
  }
};

// ======================================================
// ProtectedRoute
// - Allows browsing public routes like "/" without login
// - Blocks mandatory protected routes if not logged in or expired
// - If adminOnly is set, also blocks non-admin users
// ======================================================
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const rawUser = localStorage.getItem("user");

  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  if (!hasValidSession() || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    toast.error("Admin access required.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
