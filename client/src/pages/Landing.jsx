import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { assets } from "../assets/assets";

export default function Landing() {
  const { auth } = useContext(AuthContext);

  const getStartedPath = auth?.isLoggedIn
    ? `/${auth.role}/home`
    : "/signup";

  return (
    <div className="bg-gray-50 font-sans">

      {/* NAVBAR */}
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

      {/* HERO SECTION */}
      <section className="min-h-screen pt-28 pb-12 flex flex-col-reverse md:flex-row items-center justify-center px-6 md:px-12 gap-12
        bg-linear-to-br from-green-50 via-gray-50 to-green-100">

        {/* TEXT */}
        <div className="max-w-2xl text-center md:text-left flex flex-col items-center md:items-start">
          
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-950 leading-tight mb-6 tracking-tighter">
            Smart Campus Dining,<br />
            <span className="text-[#16a34a]">Simplified.</span>
          </h1>

          <p className="text-gray-700 mb-10 text-base md:text-lg leading-relaxed max-w-lg md:max-w-none">
            From tracking your budget to planning your next meal—experience a seamless, digital dining management platform designed for the modern campus.
          </p>

          <Link to={getStartedPath}>
            <button className="px-8 py-4 bg-[#16a34a] text-white rounded-full text-lg font-bold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-green-200 flex items-center gap-3 transform hover:-translate-y-0.5">
              Experience MessMate
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </Link>
        </div>

        {/* IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={assets.heroImg}
            alt="Students enjoying organized dining experience"
            className="w-[90%] sm:w-[80%] md:w-full max-w-lg md:max-w-xl drop-shadow-2xl"
          />
        </div>
      </section>

      {/* NARRATIVE SECTION - Adds Authenticity */}
      <section className="py-20 bg-white px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-8">Tired of Dining Uncertainty?</p>
          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            We know campus life is hectic. Waiting in line just to find out what's on the menu, losing track of extra purchases, and mystery billing at the end of the month puts unnecessary stress on your studies. <span className="font-semibold text-gray-800">MessMate was built to change that.</span> We bring transparency, efficiency, and modern technology to university messes.
          </p>
          <div className="h-1 w-20 bg-green-200 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-100 py-20 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-950 tracking-tight">
            Everything you need for <span className="text-[#16a34a]">Effortless Dining</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature
              icon="fa-utensils"
              title="Live Menu Hub"
              text="Never wonder 'what's for dinner?' again. Access breakfast, lunch, and dinner menus instantly, anytime, anywhere."
            />
            <Feature
              icon="fa-cart-plus"
              title="Seamless Add-ons"
              text="Craving extra? Purchase special items effortlessly through your digital account and see cost updates in real-time."
            />
            <Feature
              icon="fa-chart-pie"
              title="Smart Budgeting"
              text="Stay financially aware. Track your dining expenses daily, weekly, or monthly with intuitive visual analytics."
            />
            <Feature
              icon="fa-user-tie"
              title="Admin Empowerment"
              text="Streamlined operational tools for mess accountants to manage menus, track inventory, and eliminate billing errors."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 py-12 px-6 md:px-12 text-gray-300 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left items-center">
            <div>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                    <img src={assets.logo_dark} alt="MessMate Logo" className="h-8 opacity-90" />
                    <span className="text-xl font-bold text-white">
                        Mess<span className="text-[#16a34a]"> Mate</span>
                    </span>
                </div>
                <p className="text-sm text-gray-400">Modernizing campus dining, one meal at a time.</p>
            </div>
            <div className="text-sm text-gray-400">
                Created with <i className="fa-solid fa-heart text-red-500 mx-1"></i> for smarter universities.
            </div>
            <div className="text-sm">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-white">MessMate</span>. All rights reserved.
            </div>
        </div>
      </footer>

    </div>
  );
}

/* Feature Card - Improved styling for better look */
function Feature({ icon, title, text }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group flex flex-col items-center text-center transform hover:-translate-y-1">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6 border border-green-100 group-hover:bg-[#16a34a] transition-colors duration-300">
        <i className={`fa-solid ${icon} text-3xl text-[#16a34a] group-hover:text-white transition-colors duration-300`}></i>
      </div>
      <h3 className="font-bold text-xl mb-3 text-gray-950 tracking-tight">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
    </div>
  );
}