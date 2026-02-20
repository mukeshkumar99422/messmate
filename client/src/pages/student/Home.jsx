/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useContext } from "react";
import StudentContext from "../../context/StudentContext";
import toast from "react-hot-toast";
import MealCard from "../../components/common/MealCard";
import ItemsNotUpdated from "../../components/common/ItemsNotUpdated";
import MealCardSkeleton from "../../components/common/MealCardSkeleton";
import Header from "../../components/common/Header";
import { DAYS } from "../../assets/assets";
import DaySelector from "../../components/common/DaySelector";


export default function Home() {
  const { fetchTodayMenu, fetchMenuByDay } = useContext(StudentContext);

  const [selectedDay, setSelectedDay] = useState("today");
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [menu, setMenu] = useState(null);

  // Fetch menu logic
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setIsAnimating(true);
      try {
        const res = selectedDay === "today"
            ? await fetchTodayMenu()
            : await fetchMenuByDay(selectedDay);
        setMenu(res);
      } catch (err) {
        toast.error(err.message || "Failed to fetch menu");
      } finally {
        setLoading(false);
        setTimeout(() => setIsAnimating(false), 300);
      }
    };

    fetchMenu();
  }, [selectedDay]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/50 to-white pt-16 pb-20 px-4 md:px-8">
      
      {/* --- HEADER --- */}
      <Header heading={"Mess Menu"} subheading={"Check out daily meals and available extras"}/>

      {/* --- DAY SELECTOR (Sticky) --- */}
      <DaySelector onClickHandler={setSelectedDay} activeDay={selectedDay} days={["today",...DAYS]}/>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto min-h-100">
        {loading ? (
          /* SKELETON LOADER STATE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MealCardSkeleton />
            <MealCardSkeleton />
            <MealCardSkeleton />
          </div>
        ) : menu ? (
          /* ACTUAL DATA STATE */
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${isAnimating ? "opacity-50" : "opacity-100"}`}>
            
            <MealCard
              title="Breakfast"
              icon="fa-mug-hot"
              time={menu.breakfast?.time} 
              data={menu.breakfast}
              delay={0}
            />

            <MealCard
              title="Lunch"
              icon="fa-bowl-rice"
              time={menu.lunch?.time}
              data={menu.lunch}
              delay={100}
            />

            <MealCard
              title="Dinner"
              icon="fa-utensils"
              time={menu.dinner?.time}
              data={menu.dinner}
              delay={200}
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

