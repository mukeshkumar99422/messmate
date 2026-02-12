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
    <div className="bg-gray-50">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-gray-50/10 backdrop-blur shadow-sm flex items-center justify-between px-6 md:px-10 py-4">
        <div className="flex items-center gap-2">
          <img src={assets.logo} alt="MessMate" className="h-9 md:h-10" />
          <span className="text-xl md:text-2xl font-bold text-[#16a34a] hidden sm:block">
            MessMate
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
      <section className="min-h-screen pt-28 flex flex-col-reverse md:flex-row items-center justify-center px-6 md:px-12 gap-12
        bg-linear-to-br from-green-50 via-gray-50 to-green-100">

        {/* TEXT */}
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Smart Mess Diet <br />
            <span className="text-[#16a34a]">Management System</span>
          </h1>

          <p className="text-gray-700 mb-8 text-sm md:text-base">
            View daily menus, purchase extra items, and track your spending —
            all from a single smart platform.
          </p>

          <Link to={getStartedPath}>
            <button className="px-7 py-3 mb-4 bg-[#16a34a] text-white rounded-md text-lg hover:bg-green-700 transition shadow-md">
              <i className="fa-solid fa-rocket mr-2"></i>
              Get Started
            </button>
          </Link>
        </div>

        {/* IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={assets.heroImg}
            alt="Mess illustration"
            className="w-[90%] sm:w-[80%] md:w-full max-w-lg md:max-w-xl drop-shadow-2xl"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-100 py-16 px-6 md:px-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
          Why Choose <span className="text-[#16a34a]">MessMate?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

          <Feature
            icon="fa-utensils"
            title="Daily Diet Menu"
            text="Check breakfast, lunch, and dinner menus anytime."
          />
          <Feature
            icon="fa-cart-plus"
            title="Extra Purchases"
            text="Add extra items easily and see total instantly."
          />
          <Feature
            icon="fa-chart-line"
            title="Spending Analytics"
            text="Analyze spending daily, weekly, or monthly."
          />
          <Feature
            icon="fa-clipboard-list"
            title="Easy Management"
            text="Accountants manage menus without hassle."
          />

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-200 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">MessMate</span>. All rights reserved.
      </footer>

    </div>
  );
}

/* Feature Card */
function Feature({ icon, title, text }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition">
      <i className={`fa-solid ${icon} text-3xl text-[#16a34a] mb-4`}></i>
      <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}
