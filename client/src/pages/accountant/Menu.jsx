/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState} from "react";
import AccountantContext from "../../context/AccountantContext";
import toast from "react-hot-toast";
import { replace, useNavigate } from "react-router-dom";
import MealCard from "../../components/accountant/menu/MealCard";
import ItemsNotUpdated from "../../components/common/ItemsNotUpdated";
import DaySkeleton from "../../components/accountant/menu/DaySkeleton";
import Header from "../../components/common/Header";



export default function Menu() {
  const { fetchWeeklyMenu, loadingWeekly,weeklyMenu } = useContext(AccountantContext);
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const fetchData = async () => {
      try {
        await fetchWeeklyMenu();
      } catch (error) {
        toast.error(error.message || "Failed to load weekly menu");
      } finally {
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-28 px-4 md:px-8">
      
      {/* ---------- HEADER ---------- */}
      <Header heading={"Weekly Menu"} subheading={"Standard mess menu for all days"}/>

      {/* ---------- UPDATE BUTTON ---------- */}
      <div className="flex justify-center mb-7">
      <button 
      onClick={()=>{navigate('/accountant/update-menu', replace)}}
      className="px-10 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 transition-all active:scale-95 flex items-center gap-2">
          <i className="fa-solid fa-pen-to-square"></i>
          Update Full Menu
      </button>
      </div>

      {/* ---------- CONTENT ---------- */}
      {loadingWeekly ? (
        <div className="max-w-7xl mx-auto space-y-10">
          {[...Array(3)].map((_, i) => (
            <DaySkeleton key={i} />
          ))}
        </div>
      ) : !weeklyMenu ? (
        <ItemsNotUpdated heading="No Weekly Menu Found" subheading="The weekly menu has not been uploaded yet."/>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10">
          
          {Object.entries(weeklyMenu).map(([day, meals]) => (
            <div
              key={day}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
            >
              {/* Day Header */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize flex items-center gap-2">
                <i className="fa-solid fa-calendar-day text-green-600"></i>
                {day}
              </h2>

              {/* Meals */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${isAnimating ? "opacity-50" : "opacity-100"}`}>
                <MealCard
                  title="Breakfast"
                  icon="fa-mug-hot"
                  data={meals.breakfast}
                  delay={0}
                  
                />
                <MealCard
                  title="Lunch"
                  icon="fa-bowl-rice"
                  data={meals.lunch}
                  delay={100}
                />
                <MealCard
                  title="Dinner"
                  icon="fa-utensils"
                  data={meals.dinner}
                  delay={200}
                />
              </div>
            </div>
          ))}

          {/* ---------- UPDATE BUTTON ---------- */}
          <div className="flex justify-center pt-4">
            <button 
            onClick={()=>{navigate('/accountant/update-menu', replace)}}
            className="px-10 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 transition-all active:scale-95 flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square"></i>
              Update Full Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



