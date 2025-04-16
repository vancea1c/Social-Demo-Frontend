import { JSX } from "react";
import { useAuth } from "../Components/AuthContext";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: JSX.Element;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  console.log("ProtectedRoute:", { isAuthenticated, loading });
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign_in" replace />;
  }

  return children;
};

export default ProtectedRoute;
