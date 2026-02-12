/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import AccountantContext from "../../context/AccountantContext";
import toast from "react-hot-toast";
import { getDefaultMealByTime } from "../../utils/helpers";
import CardSkeleton from "../../components/accountant/updateTodaymenu/CardSkeleton";
import ItemsNotUpdated from "../../components/common/ItemsNotUpdated";
import Header from "../../components/common/Header";

/* ---------------- CONSTANTS ---------------- */

const MEALS = ["breakfast", "lunch", "dinner"];

const MEAL_DEFAULT_TIME = {
  breakfast: { start: "07:30", end: "09:30" },
  lunch: { start: "12:30", end: "14:30" },
  dinner: { start: "19:30", end: "21:30" },
};

const todayISO = () => new Date().toISOString().split("T")[0];
const todayDay = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long" });

/* ---------------- PAGE ---------------- */

export default function UpdateTodayMenu() {
  const {
    todayMenu,
    fetchTodayMenu,
    updateTodayMenu,
    loadingToday,
  } = useContext(AccountantContext);

  const [meal, setMeal] = useState(getDefaultMealByTime());
  const [time, setTime] = useState(MEAL_DEFAULT_TIME[meal]);
  const [diet, setDiet] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- Load Today Menu ---------- */
  useEffect(() => {
    fetchTodayMenu();
  }, []);

  /* ---------- Sync Form when Meal Changes ---------- */
  useEffect(() => {
    setTime(MEAL_DEFAULT_TIME[meal]);
    setDiet([]);
    setExtras([]);

    if (todayMenu?.[meal]) {
      const data = todayMenu[meal];
      if (data.time) setTime(data.time);
      if (data.diet) setDiet(data.diet);
      if (data.extras) setExtras(data.extras);
    }
  }, [meal, todayMenu]);

  /* ---------- Handlers ---------- */
  const updateDietItem = (i, value) => {
    setDiet((prev) =>
      prev.map((d, idx) => (idx === i ? { name: value } : d))
    );
  };

  const addDietItem = () => setDiet((p) => [...p, { name: "" }]);
  const removeDietItem = (i) => setDiet((p) => p.filter((_, idx) => idx !== i));

  const updateExtra = (i, field, value) => {
    setExtras((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
    );
  };

  const addExtra = () => setExtras((p) => [...p, { name: "", price: "" }]);
  const removeExtra = (i) => setExtras((p) => p.filter((_, idx) => idx !== i));

  /* ---------- Submit ---------- */
  const handleUpdate = async () => {
    setLoading(true);
    if (!diet.length) {
      toast.error("Diet menu cannot be empty");
      setLoading(false);
      return;
    }
    const cleanDiet = diet.filter((d) => d.name.trim());
    const cleanExtras = extras.filter((e) => e.name.trim() && Number(e.price) > 0);

    if (cleanDiet.length === 0) {
      toast.error("Please add at least one valid diet item");
      setLoading(false);
      return;
    }

    try {
      await updateTodayMenu({
        date: todayISO(),
        meal,
        time,
        diet: cleanDiet,
        extras: cleanExtras,
      });
      toast.success(`${meal.charAt(0).toUpperCase() + meal.slice(1)} menu updated!`);
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
    finally{
      setLoading(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-24 px-4 md:px-8">

      {/* ---------- HEADER TITLE ---------- */}
      <Header heading={"Update Menu"} subheading={`${todayDay()}, ${todayISO()}`}/>
      
      {/* ---------- HEADER & MEAL SELECTOR ---------- */}
      <div className="max-w-7xl mx-auto mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* LEFT: Date Info */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
            {todayDay()} 
            <span className="text-gray-300 font-light text-2xl hidden md:inline">|</span> 
            <span className="text-gray-500 font-semibold text-lg hidden md:inline">{todayISO()}</span>
          </h2>
          <p className="text-sm text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${todayMenu ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${todayMenu ? 'bg-green-400' : 'bg-red-500'}`}></span>
            </span>
            {todayMenu ? 'Editing today’s menu' : "Cannot update today's menu"}
          </p>
        </div>

        {/* RIGHT: Meal Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
            {MEALS.map((m) => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition flex-1 md:flex-none whitespace-nowrap
                  ${meal === m
                    ? "bg-green-600 text-white shadow shadow-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"}
                `}
              >
                {m}
              </button>
            ))}
        </div>
      </div>


      {/* ---------- MAIN FORM CARD ---------- */}
      {loadingToday ? <CardSkeleton/> : todayMenu ? 
      (<div className="max-w-7xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        
        <div className="p-4 md:p-8 space-y-8 md:space-y-10">

          {/* SECTION 1: TIMING */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <i className="fa-regular fa-clock text-sm"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Serving Time</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {/* Start Time */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:bg-white focus-within:border-blue-500 transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={time.start}
                  onChange={(e) => setTime((t) => ({ ...t, start: e.target.value }))}
                  className="w-full bg-transparent outline-none font-semibold text-gray-700"
                />
              </div>

              {/* End Time */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:bg-white focus-within:border-blue-500 transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={time.end}
                  onChange={(e) => setTime((t) => ({ ...t, end: e.target.value }))}
                  className="w-full bg-transparent outline-none font-semibold text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* SECTION 2: DIET */}
          <div>
             <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-list-ul text-sm"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Regular Menu</h3>
            </div>

            <div className="space-y-3">
              {diet.map((d, i) => (
                <div key={i} className="flex gap-2 md:gap-3 items-center">
                  <span className="text-gray-300 font-bold text-sm w-4 text-center shrink-0">{i + 1}.</span>
                  {/* min-w-0 prevents input from forcing width on mobile */}
                  <input
                    value={d.name}
                    onChange={(e) => updateDietItem(i, e.target.value)}
                    placeholder={`Item name (eg: ${meal=="breakfast" ? "Masala Dosa" : (meal=="lunch" ? "Curd" : "Rice")})`}
                    className="flex-1 min-w-0 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-400 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                  />
                  <button
                    onClick={() => removeDietItem(i)}
                    className="h-11 w-11 md:h-10 md:w-10 shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-200 transition-colors"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              ))}
              
              <button
                onClick={addDietItem}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> Add Menu Item
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* SECTION 3: EXTRAS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-plus text-sm"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Extras / Add-ons</h3>
            </div>

            <div className="space-y-4 md:space-y-3">
              {extras.map((e, i) => (
                // Added a border/bg wrapper for mobile to visually group the fields
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-2xl border border-gray-100 sm:border-0">
                   
                   <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                      {/* Name Input */}
                      <input
                        value={e.name}
                        onChange={(ev) => updateExtra(i, "name", ev.target.value)}
                        placeholder={`Item name (eg: ${meal=="breakfast" ? "Banana" : (meal=="lunch" ? "Icecream" : "Milk")})`}
                        className="flex-1 w-full bg-white sm:bg-gray-50 border border-gray-200 sm:border-transparent focus:border-purple-400 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                      />
                      
                      {/* Price & Delete Row for Mobile */}
                      <div className="flex gap-3">
                        <div className="relative flex-1 sm:flex-none sm:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                            type="number"
                            value={e.price}
                            onChange={(ev) => updateExtra(i, "price", ev.target.value)}
                            placeholder="Price"
                            className="w-full bg-white sm:bg-gray-50 border border-gray-200 sm:border-transparent focus:border-purple-400 rounded-xl pl-7 pr-4 py-3 outline-none transition-all font-medium text-gray-700"
                            />
                        </div>
                        {/* Delete Button - Visible on same row as price for mobile */}
                        <button
                            onClick={() => removeExtra(i)}
                            className="h-11 sm:h-auto w-12 sm:w-10 shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-200 transition-colors"
                        >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>
                   </div>
                </div>
              ))}

              <button
                onClick={addExtra}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> Add Extra Item
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-gray-50 px-6 py-4 md:px-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-400 font-medium text-center sm:text-left">
              This updated menu will be shown to everyone.
            </span>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-green-200 hover:shadow-green-300 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Save Menu
                </>
              )}
            </button>
        </div>
      </div>) : <ItemsNotUpdated heading="Menu Not Found" subheading="Menu must be uploaded to update today's menu."/>}
    </div>
  );
}

