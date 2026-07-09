import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

export default function Hero({ getStartedPath }) {
  return (
    <section className="min-h-screen pt-24 pb-16 flex flex-col-reverse lg:flex-row items-center justify-center px-4 md:px-12 max-w-7xl mx-auto gap-8 lg:gap-12">
      {/* Left Text Column */}
      <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100 mb-6">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live over NIT Kurukshetra Campus
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-950 leading-tight mb-6 tracking-tight">
          Smart Campus Dining, <br />
          <span className="bg-linear-to-r from-[#16a34a] to-emerald-600 bg-clip-text text-transparent">Simplified.</span>
        </h1>

        <p className="text-gray-600 mb-8 text-base md:text-lg leading-relaxed max-w-lg lg:max-w-none font-medium">
          Track your budget, buy add-ons seamlessly, and review dynamic daily menus. Experience a comprehensive, hassle-free dining ecosystem tailored for modern university living.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to={getStartedPath} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#16a34a] text-white rounded-xl text-md font-bold hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              Get Started Locally
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-md font-bold hover:bg-gray-50 shadow-xs transition-all active:scale-[0.98]">
              Explore Features
            </button>
          </a>
        </div>
      </div>

      {/* Right Image Space */}
      <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center animate-in fade-in zoom-in-95 duration-700">
        <img
          src={assets.heroImg}
          alt="Students using digital organized dining system dashboard"
          className="w-full h-auto drop-shadow-2xl max-w-lg lg:max-w-xl"
        />
      </div>
    </section>
  );
}