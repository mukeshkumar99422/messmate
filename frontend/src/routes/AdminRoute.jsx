import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function AdminRoute() {
  const { auth } = useContext(AuthContext);

  // Checks if the user is logged in as an admin
  return auth.role === "admin" ? <Outlet /> : <Navigate to="/login" replace />;
}