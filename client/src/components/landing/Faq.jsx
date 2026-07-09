import { useState } from "react";
import { FAQS } from "../../assets/assets";

export default function Faq() {
  const [open, setOpen] = useState(() => Array(FAQS.length).fill(false));

  return (
    <section className="py-20 bg-gray-50 px-4 md:px-12 border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Got Questions?</span>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((item, idx) => {
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-xs">
                <button onClick={() => setOpen(prev => prev.map((val, i) => i === idx ? !val : val))} className="w-full flex justify-between items-center p-5 font-bold text-left text-gray-800 text-sm md:text-base outline-none transition-colors hover:bg-gray-50/50">
                  <span>{item.q}</span>
                  <i className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${open[idx] ? "rotate-180 text-green-600" : ""}`}></i>
                </button>
                {open[idx] && (
                  <div className="p-5 pt-0 text-sm text-gray-500 font-medium leading-relaxed border-t border-gray-50 bg-gray-50/20 animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}