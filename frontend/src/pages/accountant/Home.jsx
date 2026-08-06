/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState} from "react";
import AccountantContext from "../../context/AccountantContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import MealCard from "../../components/common/MealCard";
import MealCardSkeleton from "../../components/common/MealCardSkeleton";
import ItemsNotUpdated from "../../components/common/ItemsNotUpdated";
import Header from "../../components/common/Header";
import { hasMenuData } from "../../utils/helpers";


export default function AccountantHome() {
  const { fetchTodayMenu, loadingToday, todayMenu } = useContext(AccountantContext);
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);


  /* ---------- FETCH TODAY MENU ---------- */
  useEffect(() => { 
    let isMounted = true;

    const fetchData = async () => {
      setIsAnimating(true);
      try {
        await fetchTodayMenu(false);
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || "Failed to load today's menu");
        }
      }
      finally{
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              setIsAnimating(false);
            }
          }, 300);
        }
        
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-24 px-4 md:px-8">
      
      {/* ---------- HEADER ---------- */}
      <Header heading={"Today’s Menu"} subheading={"Overview of meals scheduled for today"}/>

      {/* ---------- CONTENT ---------- */}
      <div className="max-w-7xl mx-auto min-h-100">
        {loadingToday ? (
          /* SKELETON LOADER STATE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MealCardSkeleton />
            <MealCardSkeleton />
            <MealCardSkeleton />
          </div>
        ) : hasMenuData(todayMenu) ? (
          /* ACTUAL DATA STATE */
          <>
          {/* ---------- UPDATE BUTTON (TOP) ---------- */}
          <div className="flex justify-center mb-7">
            <button 
            onClick={()=>{navigate('/accountant/update-today-menu')}}
            className="px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 transition-all active:scale-95 flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square"></i>
              Update Today's Menu
            </button>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${isAnimating ? "opacity-50" : "opacity-100"}`}>
            
            <MealCard
              title="Breakfast"
              icon="fa-mug-hot"
              data={todayMenu.breakfast}
              delay={0}
            />

            <MealCard
              title="Lunch"
              icon="fa-bowl-rice"
              data={todayMenu.lunch}
              delay={100}
            />

            <MealCard
              title="Dinner"
              icon="fa-utensils"
              data={todayMenu.dinner}
              delay={200}
            />

          </div>
          </>
        ) : (
          /* EMPTY STATE */
          <ItemsNotUpdated heading="Menu Not Found" subheading="Please upload the menu first."/>
        )}
      </div>
      
    </div>
  );
}

