import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
import AuthContext from "../../context/AuthContext";

export default function AccountantNavbar() {
  const { logout, user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ---------- styles ---------- */

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition
      ${
        isActive
          ? "text-green-700 bg-green-100"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-xl text-base font-medium transition
      ${
        isActive
          ? "bg-green-50 text-green-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`;

  /* ---------- handlers ---------- */

  const handleLogout = async () => {
    logout();
  };

  return (
    <>
      {/* ---------- NAVBAR ---------- */}
      <nav className="fixed top-0 left-0 w-full h-14 z-40 bg-gray-50/10 shadow-sm backdrop-blur-sm">
        <div className="h-full px-4 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-6">
            <img src={assets.logo} alt="MessMate" className="h-8" />

            {/* Desktop Links */}
            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/accountant/home" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/accountant/menu" className={navLinkClass}>
                Menu
              </NavLink>
            </div>
          </div>

          {/* CENTER (Mobile only) */}
          <div className="sm:hidden text-center text-sm font-semibold text-gray-700 text-wrap">
            {user?.HostelName}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* Desktop User Name + Logout */}
            <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                    {user?.HostelName}
                </span>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl
                            bg-red-50 text-red-600 font-semibold
                            hover:bg-red-100 transition"
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Logout
                </button>
            </div>

            {/* Mobile Hamburger */}
            {!menuOpen && (
              <button
                onClick={() => setMenuOpen(true)}
                className="sm:hidden h-10 w-10 flex items-center justify-center
                           text-xl text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <i className="fa-solid fa-bars" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ---------- BACKDROP ---------- */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 sm:hidden
          ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setMenuOpen(false)}
      />

      {/* ---------- MOBILE SIDEBAR ---------- */}
      <aside
        className={`fixed top-0 right-0 z-200 h-screen w-72 bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out sm:hidden
          flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 mb-2">
          <button
            onClick={() => setMenuOpen(false)}
            className="h-10 w-10 flex items-center justify-center
                       rounded-full hover:bg-gray-100 transition"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          <img src={assets.logo} alt="Logo" className="h-6 opacity-80" />
        </div>

        {/* Links */}
        <div className="flex-1 flex flex-col px-4 pb-6 overflow-y-auto space-y-2">
          <NavLink
            to="/accountant/home"
            onClick={() => setMenuOpen(false)}
            className={mobileLinkClass}
          >
            <i className="fa-solid fa-house w-8 text-lg"></i>
            Home
          </NavLink>

          <NavLink
            to="/accountant/menu"
            onClick={() => setMenuOpen(false)}
            className={mobileLinkClass}
          >
            <i className="fa-solid fa-pen-to-square w-8 text-lg"></i>
            Menu
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center px-4 py-3 rounded-xl
                       bg-red-50 text-red-600 font-semibold
                       hover:bg-red-100 transition"
          >
            <i className="fa-solid fa-right-from-bracket w-8 text-lg"></i>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
