import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const user = localStorage.getItem("mediora_user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}