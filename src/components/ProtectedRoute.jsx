import { Navigate, Outlet } from "react-router-dom";
import useSession from "../hooks/useSession";

const ProtectedRoute = ({
  isAuthenticated,
  children,
}) => {
  const sessionIsAuthenticated = useSession();
  const authenticated = isAuthenticated ?? sessionIsAuthenticated;

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
