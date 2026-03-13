import { assets } from '../../assets/assets'; 

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-100/50 py-6 px-6 md:px-10 font-sans mt-auto relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-500">
        
        {/* Left Side: Logo & Description */}
        <div className="flex flex-col items-center md:items-start gap-2 order-2 md:order-1">
          <div className="flex items-center gap-2">
            <img src={assets.logo_dark} alt="MessMate Logo" className="h-6 opacity-80" />
            <span className="font-bold text-gray-800 tracking-tight">
              Mess<span className="text-[#16a34a]">Mate</span>
            </span>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 text-center md:text-left">
            Your Smart Campus Dining Companion | Nit Kurukshetra
          </p>
        </div>

        {/* Right Side: Copyright */}
        <div className="order-1 md:order-2 bg-white px-4 py-2 rounded-full shadow-inner border border-gray-100">
          <p className="text-[11px] md:text-xs font-medium text-gray-600">
            © {currentYear} MessMate. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;