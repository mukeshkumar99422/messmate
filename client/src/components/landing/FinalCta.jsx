import { Link } from "react-router-dom";

export default function FinalCta({ getStartedPath }) {
  return (
    <section className="py-20 bg-slate-950 text-center px-4 md:px-12 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
          Ready to Modernize Your Campus Experience?
        </h2>
        <p className="text-slate-400 text-sm md:text-base mb-8 max-w-lg mx-auto font-medium">
          Join hundreds of students running transactions and giving feedback daily. Get setup under 2 minutes.
        </p>
        <Link to={getStartedPath}>
          <button className="px-10 py-4 bg-[#16a34a] text-white font-bold rounded-full hover:bg-green-700 transition shadow-lg shadow-green-900/30 transform hover:-translate-y-0.5 active:scale-98">
            Experience MessMate Today
          </button>
        </Link>
      </div>
    </section>
  );
}