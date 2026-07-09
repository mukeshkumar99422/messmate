import React from 'react'
import { assets } from '../../assets/assets'

function Footer() {
  return (
    <div>
      <footer className="bg-slate-950 py-12 px-6 md:px-12 text-gray-300 border-t border-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left items-center">
            <div>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                    <img src={assets.logo_dark} alt="MessMate Logo" className="h-8 opacity-90" />
                    <span className="text-xl font-bold text-white">
                        Mess<span className="text-[#16a34a]"> Mate</span>
                    </span>
                </div>
                <p className="text-sm text-gray-400">Your Smart Campus Dining Companion | NIT Kurukshetra</p>
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
  )
}

export default Footer