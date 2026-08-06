import React from 'react';
import { assets } from '../../assets/assets';

function Footer() {
  const currentYear = new Date().getFullYear();
  const github_repo_url = import.meta.env.VITE_GITHUB_REPO_URL;
  const linkedIn_profile_url = import.meta.env.VITE_LINKEDIN_PROFILE_URL;
  const email = import.meta.env.VITE_EMAIL;

  return (
    <footer className="bg-slate-950 py-10 px-6 md:px-12 text-gray-400 border-t border-gray-900 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        
        {/* Left Section: Branding & Location */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <img src={assets.logo_dark} alt="MessMate Logo" className="h-7 opacity-90 object-contain" />
            <span className="text-xl font-black text-white tracking-tight">
              Mess<span className="text-[#16a34a]">Mate</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Your Smart Campus Dining Companion <span className="hidden md:inline text-gray-600">|</span> <span className="block md:inline">NIT Kurukshetra</span>
          </p>
        </div>

        {/* Center Section: Social Links */}
        <div className="flex items-center justify-center gap-x-3 text-xs font-semibold text-gray-400">
          <a 
            href={github_repo_url || 'https://github.com/'} 
            target="_blank" 
            rel="noopener" 
            className="hover:text-white transition-colors duration-200"
            aria-label="Visit Github Profile"
          >
            GitHub
          </a>
          <span className="text-gray-800" aria-hidden="true">|</span>
          <a 
            href={linkedIn_profile_url || 'https://www.linkedin.com/in/profile/'} 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-white transition-colors duration-200"
            aria-label="Visit LinkedIn Profile"
          >
            LinkedIn
          </a>
          <span className="text-gray-800" aria-hidden="true">|</span>
          <a 
            href={`mailto:${email || 'email@gmail.com'}`} 
            className="hover:text-white transition-colors duration-200"
            aria-label="Send Email"
          >
            Email
          </a>
        </div>

        {/* Right Section: Copyright */}
        <div className="text-xs text-gray-500 font-medium">
          &copy; {currentYear} <span className="font-bold text-gray-300">MessMate</span>. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;