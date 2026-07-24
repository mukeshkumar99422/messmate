import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "../components/common/Loader";

import StudentRoute from "./StudentRoute";
import AccountantRoute from "./AccountantRoute";
import AdminRoute from "./AdminRoute.jsx";

const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/SignUp"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));

const StudentLayout = lazy(() => import("../pages/student/StudentLayout"));
const StudentHome = lazy(() => import("../pages/student/Home"));
const PurchaseExtra = lazy(() => import("../pages/student/PurchaseExtra"));
const AnalyseExtra = lazy(() => import("../pages/student/AnalyseExtra"));

const AccountantLayout = lazy(() => import("../pages/accountant/AccountantLayout"));
const AccountantHome = lazy(() => import("../pages/accountant/Home"));
const Menu = lazy(() => import("../pages/accountant/Menu.jsx"));
const UpdateMenu = lazy(() => import("../pages/accountant/UpdateMenu"));
const UpdateTodayMenu = lazy(() => import("../pages/accountant/UpdateTodayMenu"));
const AnalyseReviews = lazy(() => import("../pages/accountant/AnalyseReviews.jsx"));

const AdminLayout = lazy(() => import("../pages/Admin/AdminLayout.jsx"));
const AdminHome = lazy(() => import("../pages/Admin/Home.jsx"));
const AddHostel = lazy(() => import("../pages/Admin/AddHostel.jsx"));
const HostelDetails = lazy(() => import("../pages/Admin/HostelDetails.jsx"));
const StudentsDetails = lazy(() => import("../pages/Admin/StudentsDetails.jsx"));

const NotFound = lazy(() => import("../pages/NotFound.jsx"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader text="Loading interface..." /></div>}>
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
              <Route path="analyse-reviews" element={<AnalyseReviews />} />
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
        <Route path="*" element={<NotFound/>} />

      </Routes>
    </Suspense>
  );
}
