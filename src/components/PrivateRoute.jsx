import { Navigate, Outlet } from "react-router-dom";
import useSession from "../hooks/useSession";

const PrivateRoute = ({
  isAuthenticated,
  children,
}) => {
  const sessionIsAuthenticated = useSession();
  const authenticated = isAuthenticated ?? sessionIsAuthenticated;

  if (authenticated) {
    return <Navigate to="/products" replace />;
  }

  return children ?? <Outlet />;
};

export default PrivateRoute;