import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

export default function Sidebar() {
  const { logout, isLoggingOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin/home", icon: "fa-house", label: "Dashboard" },
    { to: "/admin/add-hostel", icon: "fa-plus", label: "Add Hostel" },
    { to: "/admin/students-details", icon: "fa-user-group", label: "Students" },
  ];

  const handleLogout = async () => {
    logout();
  };

  return (
    <div className="w-16 md:w-64 h-dvh bg-white border-r border-gray-200 flex flex-col p-2 pb-4 transition-all duration-300 shadow-sm">
      
      {/* Logo Section */}
      <div 
        className="flex items-center justify-between mb-10 px-2" 
      >
        <img src={assets.logo} alt="Logo" className="w-12 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/')}/>
        <span className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden md:block">
          Admin
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({isActive}) => `
              relative group flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200
              ${isActive
                ? "text-green-700 bg-green-100"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}
            `}
          >
            <i className={`fa-solid ${item.icon} text-lg w-6 text-center`}></i>
            <span className="font-medium hidden md:block">{item.label}</span>
            
            {/* Tooltip for Mobile */}
            <span className="absolute left-16 bg-gray-900 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 md:hidden pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button 
        onClick={handleLogout} 
        disabled={isLoggingOut}
        className="group mt-auto flex items-center gap-4 p-3.5 rounded-xl 
                    bg-red-50 text-red-600 font-semibold
                    hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? (
          <i className="fa-solid fa-circle-notch fa-spin text-lg w-6 text-center"></i>
        ) : (
          <i className="fa-solid fa-right-from-bracket text-lg w-6 text-center"></i>
        )}
        <span className="font-medium hidden md:block">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
      </button>
    </div>
  );
};