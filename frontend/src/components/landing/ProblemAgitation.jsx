import { PAIN_POINTS } from "../../assets/assets";

export default function ProblemAgitation() {
  return (
    <section className="py-20 bg-white border-t border-b border-gray-100 px-4 md:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">The Mess Dilemma</span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">
          Tired of Campus Dining Uncertainty?
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-12 font-medium">
          Campus life moves quickly. Guessing menus, running into human entry tracking errors, and facing non-transparent end-of-month statements adds unnecessary overhead. MessMate resolves this by bringing complete clarity to the table.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {PAIN_POINTS.map((item, idx) => (
            <div key={idx} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/70">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg mb-4 shadow-xs">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}