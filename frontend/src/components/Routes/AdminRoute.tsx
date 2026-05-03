import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // Normalize role for comparison
  const userRole = String(user?.role || "").trim().toLowerCase();
  const isAdmin = userRole === "admin";

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;

