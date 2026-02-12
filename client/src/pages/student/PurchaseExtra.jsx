/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo, useState } from "react";
import StudentContext from "../../context/StudentContext";
import ExtraCard from "../../components/student/purchaseExtra/ExtraCard";
import toast from "react-hot-toast";
import {getDefaultMealByTime, to12h, toastWarn} from "../../utils/helpers";
import ItemsNotUpdated from "../../components/common/ItemsNotUpdated";
import ConfirmModal from "../../components/student/purchaseExtra/ConfirmModal";
import ExtraSkeleton from "../../components/student/purchaseExtra/ExtraSkeleton";
import Header from "../../components/common/Header";

/* ---------------- CONSTANTS and helpers ---------------- */

const MEALS = ["breakfast", "lunch", "dinner"];

const MEAL_START_TIME = {
  breakfast: "07:00",
  lunch: "12:00",
  dinner: "19:00",
};


const canPurchaseMeal = (selectedDate, meal) => {
  const now = new Date();
  const [h, m] = MEAL_START_TIME[meal].split(":").map(Number);
  const mealDateTime = new Date(selectedDate);
  mealDateTime.setHours(h, m, 0, 0);
  return now >= mealDateTime;
};

/* ---------------- PAGE ---------------- */

export default function PurchaseExtra() {
  const { fetchExtrasByDate, addExtraPurchase } = useContext(StudentContext);

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [meal, setMeal] = useState(() => getDefaultMealByTime());
  const [extras, setExtras] = useState([]);
  const [cart, setCart] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isAllowed = canPurchaseMeal(date, meal);

  /* ---------- Fetch Extras ---------- */
  useEffect(() => {
    setCart({});
    setLoading(true);
    setIsAnimating(true);
    
    const fetchData = async () => {
      try {
        const res = await fetchExtrasByDate({ date, meal });
        setExtras(res || []);
      } catch (err) {
        toast.error(err.message || "Failed to fetch extras");
      } finally {
        setLoading(false);
        setTimeout(() => setIsAnimating(false), 300);
      }
    };
    fetchData();
  }, [date, meal]);

  /* ---------- Cart Logic ---------- */
  const increase = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.name]: {
        ...item,
        qty: (prev[item.name]?.qty || 0) + 1,
      },
    }));
  };

  const decrease = (item) => {
    setCart((prev) => {
      const qty = (prev[item.name]?.qty || 0) - 1;
      if (qty <= 0) {
        const clone = { ...prev };
        delete clone[item.name];
        return clone;
      }
      return {
        ...prev,
        [item.name]: { ...item, qty },
      };
    });
  };

  /* ---------- Total ---------- */
  const totalAmount = useMemo(() => {
    return Object.values(cart).reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  }, [cart]);

  /* ---------- Purchase ---------- */
  const handlePurchase = async () => {
    try {
      await addExtraPurchase({
        date,
        meal,
        items: Object.values(cart),
        totalAmount,
      });
      toast.success("Purchase recorded successfully");
      setConfirmOpen(false);
      setCart({});
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-32 px-4 md:px-8">
      
      {/* ---------- HEADER TITLE ---------- */}
      <Header heading={"Purchase Extras"} subheading={"Update your purchases after taking it from mess"}/>

      {/* ---------- CONTROLS CARD ---------- */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-6 md:items-center md:justify-between transition-shadow hover:shadow-md">
        
        {/* Date Selector */}
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">
            Select Date
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-regular fa-calendar text-gray-400 group-focus-within:text-green-500 transition-colors"></i>
            </div>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50  rounded-xl text-gray-700 font-semibold focus:ring-2 focus:ring-green-500/50 transition-all outline-none"
            />
          </div>
        </div>

        {/* DIVIDER (Vertical on Desktop, Hidden on Mobile) */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-1"></div>
        {/* DIVIDER (Horizontal on Mobile, Hidden on Desktop) */}
        <div className="block md:hidden h-px w-full bg-gray-100"></div>

        {/* Meal Selector */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1 md:text-right">
            Select Meal
          </label>
          <div className="flex flex-wrap gap-2">
            {MEALS.map((m) => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition flex-1 md:flex-none
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
      </div>

      {/* ---------- EXTRAS GRID ---------- */}
      {/* 4. Applied transition-opacity logic to container */}
      
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ExtraSkeleton/>
            <ExtraSkeleton/>
            <ExtraSkeleton/>
            <ExtraSkeleton/>
            <ExtraSkeleton/>
            <ExtraSkeleton/>
          </div>
        ) : extras && extras.length ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${isAnimating ? "opacity-50" : "opacity-100"}`}>
            {extras.map((item, index) => (
            <ExtraCard
              key={item.name}
              index={index}
              item={item}
              qty={cart[item.name]?.qty || 0}
              onAdd={() => increase(item)}
              onRemove={() => decrease(item)}
              delay={index * 50} /* 5. Passed delay prop */
            />
          ))}
          </div>
        ) : (
          <ItemsNotUpdated heading="No Extras Available" subheading="There are no extra items listed for this meal time yet."/>
        )}
      </div>

      {/* ---------- BOTTOM CART BAR ---------- */}
      <div className={`fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300 z-40 ${totalAmount > 0 ? "translate-y-0" : "translate-y-full"}`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total Amount</p>
            <p className="text-2xl font-extrabold text-gray-800 flex items-center gap-1">
              ₹<span className="tabular-nums">{totalAmount}</span>
            </p>
          </div>
          
          <button
            // disabled={!isAllowed}
            onClick={() => {
              if(!isAllowed){
                toastWarn(`You can purchase ${meal} items only after ${to12h(MEAL_START_TIME[meal])}`);
                return;
              }
              setConfirmOpen(true);
            }}
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2
              ${isAllowed
                ? "bg-green-600 hover:bg-green-700 hover:shadow-green-300"
                : "bg-gray-400 cursor-not-allowed shadow-none"
              }
            `}
          >
            <span>Proceed</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* ---------- CONFIRM MODAL ---------- */}
      {confirmOpen && (
        <ConfirmModal
          total={totalAmount}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handlePurchase}
          loading={loading}
        />
      )}
    </div>
  );
}