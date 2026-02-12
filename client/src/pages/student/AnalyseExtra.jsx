/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo, useState } from "react";
import StudentContext from "../../context/StudentContext";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import ItemsNotUpdated from "../../components/common/ItemsNotUpdated";
import AnalyseExtraSkeleton from "../../components/student/analyseExtra/AnalyseExtraSkeleton";
import { resolveRange, toastWarn } from "../../utils/helpers";
import Header from "../../components/common/Header";

/* ---------------- CONSTANTS and helpers ---------------- */

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last month", value: "1m" },
  { label: "Last year", value: "1y" },
  { label: "Overall", value: "all" },
];

const GROUPING_OPTIONS = ["daily", "weekly", "monthly"];

const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

const allowedGroupings = (range) => {
  if (range === "7d") return ["daily"];
  if (range === "1m") return ["daily", "weekly"];
  return ["weekly", "monthly"];
};


/* ---------------- COMPONENT ---------------- */

export default function AnalyseExtra() {
  const { fetchAnalyseExtra } = useContext(StudentContext);

  // -- UI States
  const [range, setRange] = useState("1m");
  const [month, setMonth] = useState("");
  const [groupBy, setGroupBy] = useState("daily");

  // -- Data States
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Network load
  const [isComputing, setIsComputing] = useState(false); // General Processing
  const [isComputingTrend, setIsComputingTrend] = useState(false); // Trend specific
  const [randomLoaderVariant, setRandomLoaderVariant] = useState(Math.floor(Math.random() * 4) + 1); // For varied loader styles

  //on month change handleer
  const monthChangeHandler = (e) =>{
    e.preventDefault();
    const selectedValue = e.target.value;
    
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    //works even for december is selected
    if (selectedValue > currentMonthStr) {
      toastWarn("Future months cannot be seleted");
      
      return; 
    }

    setMonth(selectedValue);
    if (selectedValue) setGroupBy("monthly");
  }


  // compute from, to
  const { from, to } = useMemo(
    () => resolveRange(range, month),
    [range, month]
  );

  // change loader when range or month changes
  useEffect(() => {
    setRandomLoaderVariant(Math.floor(Math.random() * 4) + 1);
  }, [range, month]);

  /* ---------- 1. FETCH DATA ---------- */
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setRawData(null);
      
      try {
        const res = await fetchAnalyseExtra({
          rangeType: month ? "month" : range,
          from,
          to,
        });
        if (isMounted) {
          setRawData(res);
          setIsComputing(true);
          setIsComputingTrend(true);
        }
      } catch (err) {
        toast.error(err.message || "Failed to fetch analytics");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [range, month, from, to]);

  /* ---------- 2. COMPUTE GENERAL STATS ---------- */
  const generalStats = useMemo(() => {
    if (!rawData) return null;

    let totalAmount = 0;
    let totalItemCount = 0;
    const mealMap = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
    const itemMap = {};
    const daySet = new Set();

    rawData.forEach((p) => {      
      let currentPurchaseTotal = 0;

      if (p.items && Array.isArray(p.items)) {
        p.items.forEach((i) => {
          const amt = i.qty * i.unitPrice;
          currentPurchaseTotal += amt;
          totalItemCount += i.qty;

          itemMap[i.name] = itemMap[i.name] || { qty: 0, amount: 0 };
          itemMap[i.name].qty += i.qty;
          itemMap[i.name].amount += amt;
        });
      }

      totalAmount += currentPurchaseTotal;

      const mealKey = p.meal ? p.meal.toLowerCase() : "others";
      mealMap[mealKey] = (mealMap[mealKey] || 0) + currentPurchaseTotal;

      daySet.add(p.date);
    });

    // Sort items by quantity for the Top 7 list
    const itemsSorted = Object.entries(itemMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty);

    const topItems = itemsSorted.slice(0, 7);
    if (itemsSorted.length > 7) {
      const others = itemsSorted.slice(7).reduce(
        (acc, i) => {
          acc.qty += i.qty;
          acc.amount += i.amount;
          return acc;
        },
        { name: "Others", qty: 0, amount: 0 }
      );
      topItems.push(others);
    }

    return {
      total: totalAmount,
      count: totalItemCount,
      avgPerDay: daySet.size > 0 ? Math.round(totalAmount / daySet.size) : 0,
      pie: Object.keys(mealMap)
        .filter((k) => mealMap[k] > 0)
        .map((k) => ({
          name: k.charAt(0).toUpperCase() + k.slice(1),
          value: mealMap[k],
        })),
      items: topItems,
    };
  }, [rawData]);

  /* ---------- 3. COMPUTE TREND STATS ---------- */
  const trendStats = useMemo(() => {
    if (!rawData) return [];

    const trendMap = {};

    rawData.forEach((p) => {
      const [day, month, year] = p.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const amount = p.totalAmount;
      let key = isoDate;

      if (groupBy === "monthly") {
        key = isoDate.slice(0, 7); 
      } else if (groupBy === "weekly") {
        const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
        const days = Math.floor((dateObj - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((dateObj.getDay() + 1 + days) / 7);
        key = `${year}-W${weekNum}`;
      }

      trendMap[key] = (trendMap[key] || 0) + amount;
    });

    return Object.entries(trendMap)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rawData, groupBy]);

  /* ---------- 4. DELAY SIMULATION ---------- */
  useEffect(() => {
    if (generalStats) {
      const timer = setTimeout(() => setIsComputing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [generalStats]);

  useEffect(() => {
    setIsComputingTrend(true);
    const timer = setTimeout(() => setIsComputingTrend(false), 500);
    return () => clearTimeout(timer);
  }, [groupBy, rawData]);

  /* ---------------- HANDLERS ---------------- */

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    setMonth("");
    setGroupBy(allowedGroupings(newRange)[0]);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-24 px-4 md:px-8">
      
      {/* --- HEADER --- */}
      <Header
      heading={"Extra Purchase Analysis"}
      subheading={
        <>
          <p>Get insights about your purchases between</p>
          {from} <span className="text-gray-300 mx-2">→</span> {to}
        </>
      }/>

      {/* --- CONTROLS --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-6 md:items-start">
        
        {/* LEFT: Quick Range */}
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Select Range
          </label>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((r) => {
              const isActive = range === r.value && !month;
              return (
                <button
                  key={r.value}
                  onClick={() => handleRangeChange(r.value)}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "bg-green-600 text-white shadow-md shadow-green-200"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DIVIDER (Vertical on Desktop, Hidden on Mobile) */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-1"></div>
        {/* DIVIDER (Horizontal on Mobile, Hidden on Desktop) */}
        <div className="block md:hidden h-px w-full bg-gray-100"></div>

        {/* RIGHT: Month Input */}
        <div className="w-full md:w-auto">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1 md:text-right">
            Select Specific Month
          </label>
          <input
            type="month"
            value={month}
            max={new Date().toISOString().slice(0, 7)}
            onChange={monthChangeHandler}
            className={`w-full md:w-56 px-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/50 transition-all
              ${
                month
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white"
              }`}
          />
        </div>

      </div>

      {/* --- CONTENT --- */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader text="Fetching analytics..." loaderNumber={randomLoaderVariant}/>
        </div>
      ) : !rawData || rawData.length === 0 ? (
        <ItemsNotUpdated heading="Purchase Data Not Found" subheading="No purchases found in this range."/>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* ROW 1: OVERALL & ITEMS */}
          {isComputing ? (
            <div className="grid md:grid-cols-2 gap-8">
              <AnalyseExtraSkeleton />
              <AnalyseExtraSkeleton />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* CARD 1: OVERALL SPENDING */}
              <Section 
                title="Overall Spending" 
                icon="fa-chart-pie"
              >
                <div className="flex flex-col items-center justify-center mb-6">
                  <h3 className="text-4xl font-extrabold text-gray-800">
                    ₹{generalStats.total.toLocaleString()}
                  </h3>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      <i className="fa-solid fa-box-open text-green-500"></i>
                      {generalStats.count} items
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      <i className="fa-regular fa-calendar-check text-orange-500"></i>
                      ₹{generalStats.avgPerDay}/day avg
                    </span>
                  </div>
                </div>
                <div className="h-62.5 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generalStats.pie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {generalStats.pie.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Section>

              {/* CARD 2: ITEM WISE */}
              <Section 
                title="Item-wise Spending" 
                icon="fa-list-ul"
              >
                <div className="h-85 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generalStats.items} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={90} 
                        tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                        interval={0}
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="qty" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            </div>
          )}

          {/* CARD 3: TREND (Separate Loading State) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Header for Card 3 */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i className={`fa-solid fa-arrow-trend-up text-green-600 bg-green-50 p-2 rounded-lg`}></i>
                Spending Trend Analysis
              </h2>
              
              <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
                {GROUPING_OPTIONS.map((g) => {
                  const isDisabled = !allowedGroupings(range).includes(g) && !month;
                  return (
                    <button
                      key={g}
                      disabled={isDisabled}
                      onClick={() => setGroupBy(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                        ${
                          groupBy === g
                            ? "bg-white text-green-700 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }
                        ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content for Card 3 */}
            {isComputingTrend ? (
               <div className="animate-pulse bg-gray-50 rounded-xl h-75 w-full flex items-center justify-center border border-dashed border-gray-200">
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                     <i className="fa-solid fa-chart-line text-3xl"></i>
                     <span className="text-sm font-medium">Recalculating trend...</span>
                  </div>
               </div>
            ) : (
                <div className="h-75 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendStats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#9ca3af' }} 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#9ca3af' }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6, stroke: "#bbf7d0", strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <i className={`fa-solid ${icon} text-green-600 bg-green-50 p-2 rounded-lg`}></i>
        {title}
      </h2>
      {children}
    </div>
  );
}