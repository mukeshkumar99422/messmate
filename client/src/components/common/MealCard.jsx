import { useState, useContext } from "react";
import { formatTimeRange } from "../../utils/helpers";
import RateItem from "./RateItem";
import AuthContext from "../../context/AuthContext";

function MealCard({ title, icon, data, delay }) {
  // 1. Context states to determine rendering privileges
  const { auth } = useContext(AuthContext);
  const isStudent = auth?.role?.toLowerCase() === "student";

  // 2. Modal states for student ratings
  const [showRateItem, setShowRateItem] = useState(false);
  const [itemToRate, setItemToRate] = useState(null);
  const [itemTypeToRate, setItemTypeToRate] = useState(null);
  const mealToRate = title.toLowerCase();

  if (!data) return null;

  // Determine update status tag (if provided by backend POJO layout)
  const isUpdated = data.updated === true || data.updated === false ? data.updated : null;

  // Click handler that fails silently for non-students
  const handleItemClick = (name, type) => {
    if (!isStudent) return; 
    setItemToRate(name);
    setItemTypeToRate(type);
    setShowRateItem(true);
  };

  return (
    <div
      className="bg-white rounded-3xl border border-gray-100 shadow-sm  p-5 flex flex-col h-full relative group hover:shadow-md transition-shadow duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* --- Header Section --- */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shadow-sm border bg-green-50 text-green-700 border-green-100">
            <i className={`fa-solid ${icon}`}></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">{title}</h2>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1">
              <i className="fa-regular fa-clock"></i>
              <span>{formatTimeRange(data.time)}</span>
            </div>
          </div>
        </div>

        {/* Status Tag (Updated vs Original) - Only displays if attribute is boolean */}
        {isUpdated !== null && (
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
              isUpdated
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}
          >
            {isUpdated ? "Updated" : "Original"}
          </span>
        )}
      </div>

      {/* Decorative Divider */}
      <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mb-5"></div>

      {/* --- Regular Diet Menu Section --- */}
      <div className="flex-1 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-list-ul text-[10px]"></i>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regular Menu</span>
        </div>

        {data.diet?.length > 0 ? (
          <div className="space-y-2.5">
            {data.diet.map((item, i) => (
              <div
                key={i}
                onClick={() => handleItemClick(item.name, "diet")}
                className={`w-full px-3 py-2.5 rounded-xl border transition-all duration-200 
                  ${isStudent 
                    ? "bg-orange-50/60 border-orange-100/50 cursor-pointer hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm" 
                    : "bg-orange-50/40 border-orange-100/50 text-gray-700 font-semibold cursor-default"
                  }`}
              >
                <span className="text-sm font-semibold">{item.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm italic text-gray-400 py-2 rounded-lg text-center bg-gray-50/50">
            Not set
          </div>
        )}
      </div>

      {/* --- Extras / Add-ons Section --- */}
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
                onClick={() => handleItemClick(ex.name, "extra")}
                className={`w-full px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all duration-200 
                  ${isStudent 
                    ? "bg-purple-50/60 border-purple-100/50 cursor-pointer hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm" 
                    : "bg-purple-50/40 border-purple-100/50 text-gray-700 font-semibold cursor-default"
                  }`}
              >
                <span className="text-sm font-semibold">{ex.name}</span>
                <span className="text-xs font-bold text-purple-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-purple-100">
                  ₹{ex.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Student Rate Item Modal Overlay --- */}
      {showRateItem && isStudent && (
        <RateItem
          itemName={itemToRate}
          itemType={itemTypeToRate}
          meal={mealToRate}
          onClose={() => setShowRateItem(false)}
        />
      )}
    </div>
  );
}

export default MealCard;