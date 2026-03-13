import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import StudentRoute from "./StudentRoute";
import AccountantRoute from "./AccountantRoute";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/SignUp";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";

import StudentLayout from "../pages/student/StudentLayout";
import StudentHome from "../pages/student/Home";
import PurchaseExtra from "../pages/student/PurchaseExtra";
import AnalyseExtra from "../pages/student/AnalyseExtra";

import AccountantLayout from "../pages/accountant/AccountantLayout";
import AccountantHome from "../pages/accountant/Home";
import Menu from "../pages/accountant/Menu.jsx";
import UpdateMenu from "../pages/accountant/UpdateMenu";
import UpdateTodayMenu from "../pages/accountant/UpdateTodayMenu";

import AdminLayout from "../pages/Admin/AdminLayout.jsx";
import AdminRoute from "./AdminRoute.jsx"
import AdminHome from "../pages/Admin/Home.jsx"
import AddHostel from "../pages/Admin/AddHostel.jsx";
import HostelDetails from "../pages/Admin/HostelDetails.jsx";
import StudentsDetails from "../pages/Admin/StudentsDetails.jsx";

export default function AppRoutes() {
  return (
    <>
    <Routes>

      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword/>}/>

      {/* Student */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StudentRoute />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route path="home" element={<StudentHome />} />
            <Route path="purchase-extra" element={<PurchaseExtra />} />
            <Route path="analyse-extra" element={<AnalyseExtra />} />
          </Route>
        </Route>
      </Route>

      {/* Accountant */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AccountantRoute />}>
          <Route path="/accountant" element={<AccountantLayout />}>
            <Route path="home" element={<AccountantHome />} />
            <Route path="menu" element={<Menu />} />
            <Route path="update-menu" element={<UpdateMenu />} />
            <Route path="update-today-menu" element={<UpdateTodayMenu />} />
          </Route>
        </Route>
      </Route>

      {/* Admin Routes - NEW SECTION */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="home" element={<AdminHome />} />
            <Route path="hostel/:id" element={<HostelDetails />} />
            <Route path="add-hostel" element={<AddHostel />} />
            <Route path="students-details" element={<StudentsDetails />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<h1>404 Not Found</h1>} />

    </Routes>
    </>
  );
}
