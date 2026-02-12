import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function AccountantRoute() {
  const {auth} = useContext(AuthContext);

  return auth.role === "accountant" ? <Outlet /> : <Navigate to="/login" />;
}
