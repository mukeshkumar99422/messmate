import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { assets } from "../assets/assets";

export default function NotFound() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const homePath = auth?.isLoggedIn ? `/${auth.role}/home` : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-green-100 px-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-green-50/50 text-center">
        
        {/* Logo */}
        <img src={assets.logo} alt="MessMate" className="h-8 mx-auto mb-8" />

        {/* Icon Badge */}
        <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-3xl">
          <i className="fa-solid fa-compass"></i>
        </div>

        {/* Message */}
        <h1 className="text-6xl font-black text-gray-800 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            Go Back
          </button>
          <Link to={homePath} className="flex-1">
            <button className="w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              <i className="fa-solid fa-house text-xs"></i>
              Go Home
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}