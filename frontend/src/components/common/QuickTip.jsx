import { useState, useEffect, useRef } from "react";

export default function QuickTip({ text, position = "bottom-right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const posClass = {
    "bottom-right": "bottom-20 right-4 sm:bottom-6 sm:right-6",
    "bottom-left": "bottom-20 left-4 sm:bottom-6 sm:left-6",
    "top-right": "top-20 right-4",
  }[position];

  return (
    <div ref={ref} className={`fixed ${posClass} z-30`}>
      {/* Tip bubble */}
      {open && (
        <div className="absolute bottom-14 right-0 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-2.5">
            <i className="fa-solid fa-lightbulb text-amber-400 mt-0.5"></i>
            <p className="text-sm font-medium text-gray-600 leading-snug">{text}</p>
          </div>
          {/* little arrow */}
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45"></div>
        </div>
      )}

      {/* Floating icon button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Quick tip"
        className={`h-11 w-11 rounded-full shadow-lg flex items-center justify-center text-lg transition-all active:scale-90
          ${open
            ? "bg-green-600 text-white shadow-green-200"
            : "bg-white text-green-600 border border-gray-100 hover:bg-green-50"
          }`}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-circle-info"}`}></i>
      </button>
    </div>
  );
}