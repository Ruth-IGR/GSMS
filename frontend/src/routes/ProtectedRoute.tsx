import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

type Props = {
  allowedRoles?: string[];
  redirectTo?: string;
};

const ProtectedRoute = ({ allowedRoles, redirectTo = "/login" }: Props) => {
  const { isAuthed, user } = useAuth();

  if (!isAuthed) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

