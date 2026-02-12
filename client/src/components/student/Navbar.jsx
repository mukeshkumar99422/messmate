import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import AuthContext from "../../context/AuthContext";
import ProfilePopup from "../../components/student/ProfilePopup";

export default function StudentNavbar() {
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Style for Desktop Links
  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm font-medium ${
      isActive
        ? "text-green-700 bg-green-100"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  // Style for Mobile Sidebar Links (Larger touch targets)
  const mobileLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
      isActive
        ? "bg-green-50 text-green-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-14 z-40 bg-gray-50/10 shadow-sm backdrop-blur-sm">
        <div className="h-full px-4 flex items-center justify-between">
          
          {/* LEFT: Logo & Desktop Menu */}
          <div className="flex items-center gap-6">
            <img src={assets.logo} alt="MessMate" className="h-8" onClick={()=>{navigate("/")}}/>

            {/* Desktop Links */}
            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/student/home" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/student/purchase-extra" className={navLinkClass}>
                Purchase Extra
              </NavLink>
              <NavLink to="/student/analyse-extra" className={navLinkClass}>
                Analyse Extra
              </NavLink>
            </div>
          </div>

          {/* RIGHT: Profile & Toggle */}
          <div className="flex items-center gap-3">
            
            {/* Desktop Profile */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Hi, <span className="font-semibold">{user?.name}</span>
              </span>
              <button
                onClick={() => setProfileOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition"
              >
                <i className="fa-solid fa-user"></i>
              </button>
            </div>

            {/* Mobile Hamburger Icon (Only visible when menu is closed) */}
            {!menuOpen && (
              <button
                onClick={() => setMenuOpen(true)}
                className="sm:hidden h-10 w-10 flex items-center justify-center text-xl text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <i className="fa-solid fa-bars" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BACKDROP */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 sm:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* RIGHT SLIDE MENU (Sidebar) */}
      <aside
        className={`fixed top-0 right-0 z-200 h-screen w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out sm:hidden flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header with Close Button (Top-Left corner of sidebar) */}
        <div className="flex items-center justify-between p-4 mb-2">
           {/* The Close "Cross" Icon - Moving with sidebar */}
          <button
            onClick={() => setMenuOpen(false)}
            className="h-10 w-10 flex items-center justify-center rounded-full   hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          
          {/* Optional: Logo inside sidebar for branding */}
          <img src={assets.logo} alt="Logo" className="h-6 opacity-80" />
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-6">
          
          {/* Links Section */}
          <div className="space-y-2">
            <NavLink
              to="/student/home"
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass}
            >
              <i className="fa-solid fa-house w-8 text-lg"></i>
              Home
            </NavLink>

            <NavLink
              to="/student/purchase-extra"
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass}
            >
              <i className="fa-solid fa-cart-shopping w-8 text-lg"></i>
              Purchase Extra
            </NavLink>

            <NavLink
              to="/student/analyse-extra"
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass}
            >
              <i className="fa-solid fa-chart-pie w-8 text-lg"></i>
              Analyse Extra
            </NavLink>
          </div>

          {/* Bottom Section: Profile */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                setMenuOpen(false);
                setProfileOpen(true);
              }}
              className="w-full flex items-center px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-green-600 shadow-sm group-hover:scale-105 transition-transform">
                 <i className="fa-solid fa-user"></i>
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm font-semibold text-gray-800">My Profile</p>
                <p className="text-xs text-gray-500">View settings</p>
              </div>
              <i className="fa-solid fa-chevron-right ml-auto text-gray-400 text-xs"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* PROFILE POPUP */}
      {profileOpen && <ProfilePopup onClose={() => setProfileOpen(false)} />}
    </>
  );
}