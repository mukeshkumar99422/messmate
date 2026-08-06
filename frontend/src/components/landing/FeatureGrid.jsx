import { CORE_FEATURES } from "../../assets/assets";

export default function FeatureGrid() {
  return (
    <section id="features" className="py-20 bg-gray-50 px-4 md:px-12 scroll-mt-14">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Platform Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight">
            Everything You Need For <span className="text-[#16a34a]">Effortless Dining</span>
          </h2>
        </div>

        {/* Shshifted grid columns from lg:grid-cols-4 to lg:grid-cols-3 to display the 6 features evenly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_FEATURES.map((f, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl mb-6 shadow-xs ${f.theme}`}>
                <i className={`fa-solid ${f.icon}`}></i>
              </div>
              <h3 className="font-bold text-lg text-gray-950 mb-3">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}