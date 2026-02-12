import { formatTimeRange } from "../../../utils/helpers";

function MealCard({ title, icon, data, delay }) {
  if (!data) return null;

  return (
    <div 
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col h-full relative group overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="h-11 w-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-2xl shadow-sm border border-green-100">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 leading-tight">{title}</h3>
          
          {/* Time Badge (Blue Theme) */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1">
            <i className="fa-regular fa-clock"></i>
            <span>{formatTimeRange(data.time)}</span>
          </div>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mb-5"></div>

      {/* Diet Section (Orange Theme) */}
      <div className="mb-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
             <div className="h-6 w-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-list-ul text-[10px]"></i>
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regular Menu</span>
        </div>

        {data.diet?.length ? (
          <ul className="space-y-2.5 pl-2">
            {data.diet.map((d, i) => (
              <li key={i} className="flex gap-3 items-start text-sm text-gray-600 group/item">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0 group-hover/item:scale-125 transition-transform"></div>
                <span className="font-medium leading-snug group-hover/item:text-gray-900 transition-colors">{d.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm italic text-gray-400 pl-8 bg-gray-50/50 py-2 rounded-lg text-center">
            Not set
          </div>
        )}
      </div>

      {/* Extras Section (Purple Theme) */}
      {data.extras?.length > 0 && (
        <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
           <div className="flex items-center gap-2 mb-3">
             <div className="h-6 w-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-plus text-[10px]"></i>
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Add-ons</span>
          </div>
          
          <div className="space-y-2">
            {data.extras.map((ex, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-3 py-2.5 rounded-xl bg-purple-50/40 border border-purple-100/50 hover:bg-purple-100/50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">
                  {ex.name}
                </span>
                <span className="text-xs font-bold text-purple-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-purple-100">
                  ₹{ex.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MealCard;