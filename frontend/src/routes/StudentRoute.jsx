import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function StudentRoute() {
  const {auth} = useContext(AuthContext);

  if (auth.role !== "student") return <Navigate to="/login"/>;
  if (!auth.isVerified) return <Navigate to="/verify-email"/>;

  return <Outlet />;
}
