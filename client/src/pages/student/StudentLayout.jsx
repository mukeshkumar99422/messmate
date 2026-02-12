import StudentNavbar from "../../components/student/Navbar";
import { Outlet } from "react-router-dom";

export default function StudentLayout() {
  return (
    <>
      <StudentNavbar />
      <Outlet />
    </>
  );
}
