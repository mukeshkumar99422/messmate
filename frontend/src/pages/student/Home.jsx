/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useContext } from "react";
import StudentContext from "../../context/StudentContext";
import toast from "react-hot-toast";
import MealCard from "../../components/common/MealCard";
import ItemsNotUpdated from "../../components/common/ItemsNotUpdated";
import MealCardSkeleton from "../../components/common/MealCardSkeleton";
import Header from "../../components/common/Header";
import DaySelector from "../../components/common/DaySelector";
import MealSelector from "../../components/common/MealSelector";
import { DAYS, MEALS } from "../../assets/assets";
import { hasMenuData, getDefaultMealByTime } from "../../utils/helpers";


/* ---------------- COMPONENT ---------------- */

export default function Home() {
  const { fetchTodayMenu, fetchMenuByDay, menu, loadingWeekly , loadingToday} = useContext(StudentContext);

  const [selectedDay, setSelectedDay] = useState("today");
  const [activeMeal, setActiveMeal] = useState(getDefaultMealByTime());
  const [isAnimating, setIsAnimating] = useState(false);

  const loading = loadingToday || loadingWeekly;

  // Fetch menu logic
  useEffect(() => {
    let isMounted = true;
    const fetchMenu = async () => {
      setIsAnimating(true);
      try {
        selectedDay === "today" ? await fetchTodayMenu() : await fetchMenuByDay(selectedDay);
      } catch (error) {
        if (isMounted) toast.error(error.message || "Failed to load menu");
      } finally {
        if (isMounted) setTimeout(() => isMounted && setIsAnimating(false), 300);
      }
    };
    fetchMenu();
    return () => { isMounted = false; };
  }, [selectedDay, menu]);

  const isMenuAvailable = hasMenuData(menu);

  const MEAL_META = {
    breakfast: { title: "Breakfast", icon: "fa-mug-hot" },
    lunch: { title: "Lunch", icon: "fa-bowl-rice" },
    dinner: { title: "Dinner", icon: "fa-utensils" },
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/50 to-white pt-16 pb-20 px-4 md:px-8">
      
      {/* --- HEADER --- */}
      <Header heading={"Mess Menu"} subheading={"Check out daily meals and available extras"}/>

      {/* --- DAY SELECTOR (Sticky) --- */}
      <DaySelector onClickHandler={setSelectedDay} activeDay={selectedDay} days={["today",...DAYS]}/>

      {/* --- MEAL SELECTOR (Breakfast / Lunch / Dinner) --- */}
      <MealSelector activeMeal={activeMeal} onClickHandler={setActiveMeal} meals={MEALS}/>

      {/* --- CONTENT --- */}
      <div className="max-w-2xl mx-auto min-h-100">
        {loading ? (
          /* SKELETON LOADER STATE */
          <MealCardSkeleton />
        ) : isMenuAvailable ? (
          /* ACTUAL DATA STATE */
          <div className={`transition-opacity duration-500 ${isAnimating ? "opacity-50" : "opacity-100"}`}>
            <MealCard
              title={MEAL_META[activeMeal].title}
              icon={MEAL_META[activeMeal].icon}
              data={menu?.[activeMeal]}
              delay={0}
            />
          </div>
        ) : (
          /* EMPTY STATE */
          <ItemsNotUpdated heading="Menu Not Found" subheading="The menu of this day is not uploaded yet."/>
        )}
      </div>
    </div>
  );
}