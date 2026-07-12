import { assets } from '../../assets/assets'; 

function Footer() {
  const currentYear = new Date().getFullYear();
  const github_repo_url = import.meta.env.VITE_GITHUB_REPO_URL;
  const linkedIn_profile_url = import.meta.env.VITE_LINKEDIN_PROFILE_URL;
  const email = import.meta.env.VITE_EMAIL;

  return (
    <footer className="border-t border-gray-100 bg-gray-100/50 py-6 px-6 md:px-10 font-sans mt-auto relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-500">
        
        {/* Left Side: Logo & Description */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <img src={assets.logo} alt="MessMate Logo" className="h-6 opacity-80" />
            <span className="font-bold text-gray-800 tracking-tight">
              Mess<span className="text-[#16a34a]"> Mate</span>
            </span>
          </div>
          <p className="text-[10px] md:text-xs text-gray-600 text-center md:text-left">
            Your Smart Campus Dining Companion | Nit Kurukshetra
          </p>
        </div>

        {/* Center Section: Social Links */}
        <div className="flex items-center justify-center gap-x-3 text-xs font-semibold text-gray-500">
          <a 
            href={github_repo_url || 'https://github.com/'} 
            target="_blank" 
            rel="noopener" 
            className="hover:text-black transition-colors duration-200"
            aria-label="Visit Github Profile"
          >
            GitHub
          </a>
          <span className="text-gray-500" aria-hidden="true">|</span>
          <a 
            href={linkedIn_profile_url || 'https://www.linkedin.com/in/profile/'} 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-black transition-colors duration-200"
            aria-label="Visit LinkedIn Profile"
          >
            LinkedIn
          </a>
          <span className="text-gray-500" aria-hidden="true">|</span>
          <a 
            href={`mailto:${email || 'email@gmail.com'}`} 
            target='_blank'
            className="hover:text-black transition-colors duration-200"
            aria-label="Send Email"
          >
            Email
          </a>
        </div>

        {/* Right Side: Copyright */}
        <div className="bg-white px-4 py-2 rounded-full shadow-inner border border-gray-100">
          <p className="text-[11px] md:text-xs font-medium text-gray-600 text-center md:text-left">
            © {currentYear} MessMate. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;