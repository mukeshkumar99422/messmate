export default function RatingSocialProof() {
  const sampleRatings = [
    { item: "Masala Dosa", meal: "Breakfast", rating: 5, tags: ["Crispy", "Perfect Spices"], note: "Best breakfast item of the week, hands down!" },
    { item: "Aloo Bhindi", meal: "Lunch", rating: 3, tags: ["Too Oily"], note: "Taste was good but could be a bit less greasy next time." }
  ];

  return (
    <section className="py-20 bg-white px-4 md:px-12 border-b border-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side Text */}
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-2">Crowdsourced Quality Control</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">
            Voice Your Preference With Our <span className="text-orange-500">Live Rating System</span>
          </h2>
          <p className="text-gray-600 leading-relaxed font-medium mb-6">
            Food quality shouldn't be a guessing game. MessMate enables students to rate individual menu components right after eating. Select quick contextual tags or leave granular improvement tips.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs shrink-0"><i className="fa-solid fa-check"></i></div>
              <span className="text-sm font-bold text-gray-700">Accountant Analytics Insights integration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs shrink-0"><i className="fa-solid fa-check"></i></div>
              <span className="text-sm font-bold text-gray-700">100% data transparency with committee members</span>
            </div>
          </div>
        </div>

        {/* Right Side Visual Cards Simulation */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 space-y-4 shadow-inner">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Live Feed Submissions</p>
          
          {sampleRatings.map((r, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{r.item} <span className="text-xs text-gray-400 font-normal">({r.meal})</span></h4>
                  <div className="flex gap-1 mt-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`${i < r.rating ? "fa-solid" : "fa-regular"} fa-star`}></i>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Verified Meal</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {r.tags.map((t, i) => (
                  <span key={i} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{t}</span>
                ))}
              </div>
              {r.note && <p className="text-xs text-gray-500 font-medium italic">"{r.note}"</p>}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}