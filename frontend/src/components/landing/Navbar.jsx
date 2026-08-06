import React from 'react'
import { useContext } from 'react';
import { Link } from "react-router-dom";
import AuthContext from '../../context/AuthContext';
import { assets } from '../../assets/assets';

function Navbar() {
  const { auth } = useContext(AuthContext);

  return (
    <div>
      <nav className="fixed top-0 left-0 w-full z-50 bg-gray-50/10 backdrop-blur-sm shadow-sm flex items-center justify-between px-6 md:px-10 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={assets.logo} alt="MessMate Logo" className="h-9 md:h-10" />
          <span className="text-xl md:text-2xl font-bold text-gray-900 hidden sm:block">
            Mess<span className="text-[#16a34a]"> Mate</span>
          </span>
        </div>

        {auth?.isLoggedIn ? (
          <Link
            to={`/${auth.role}/home`}
            className="px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700 transition"
          >
            <i className="fa-solid fa-house mr-2"></i>
            Home
          </Link>
        ) : (
          <div className="flex gap-2 md:gap-3">
            <Link to="/login">
              <button className="px-3 md:px-4 py-2 border border-[#16a34a] text-[#16a34a] rounded-md hover:bg-green-100 transition">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-3 md:px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700 transition whitespace-nowrap">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Navbar