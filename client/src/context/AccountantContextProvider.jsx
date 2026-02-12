import AccountantContext from "./AccountantContext";
import { useState } from "react";
import { dummyTodayMenu, dummyWeeklyMenu } from "../assets/dummyData";

//after backend done and services written
import {} from '../services/backend/accountantServices'

const AccountantContextProvider = ({ children }) => {
  const [todayMenu, setTodayMenu] = useState(null);
  const [fetchDate, setFetchDate] = useState(null);

  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [lastUpdatedOn, setLastUpdatedOn] = useState(null);

  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // -------- Fetch Today's Menu --------
  const fetchTodayMenu = async () => {
    if (todayMenu) {
      if(fetchDate === new Date().toISOString().split('T')[0]) {
        return true;
      }
    }
    setLoadingToday(true);
    try {
      //-----
      await new Promise((res) => setTimeout(res, 600));
      const res = {...dummyTodayMenu};
      //-----

      setFetchDate(new Date().toISOString().split('T')[0]);
      setTodayMenu(res);
      return true;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to fetch today's menu");
    } finally {
      setLoadingToday(false);
    }
  };

  // -------- Fetch Weekly Menu (cached) --------
  const fetchWeeklyMenu = async () => {
    if (weeklyMenu) {
      return true;
    }

    setLoadingWeekly(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      const res = {...dummyWeeklyMenu};

      setWeeklyMenu(res.menu);
      setLastUpdatedOn(res.updatedOn);
      return true;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to fetch weekly menu");
    } finally {
      setLoadingWeekly(false);
    }
  };

  //update todays menu
  /*dummy req:
  {
  date: "2026-02-03",
  meal: "lunch",
  time: {
    start: "12:30",
    end: "14:30"
  },
  diet: [
    { name: "Rice" },
    { name: "Dal" },
    { name: "Paneer Curry" }
  ],
  extras: [
    { name: "Curd", price: 10 }
  ]
}
*/
  const updateTodayMenu = async ({date, meal, time, diet, extras})=>{
    try {
      if(!meal || !date || !time || !diet || !extras) throw new Error("All fields are required");

      await new Promise((res)=>setTimeout(res,600));

      //update menu
      setTodayMenu((prev)=>{
        if(!prev) return prev;

        return {
          ...prev,
            [meal] : {
              time,
              diet,
              extras,
              updated: true
            }
        }
      });
      return true;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to Update today menu")
    }
  }

  //fetch menu from image
  //req structure: form data
  const extractWeeklyMenuFromImage = async (image) => {
    if (!image) throw new Error("Image is required");

    try {
      const formData = new FormData();
      formData.append("image", image);
      //---- change after backend done and services will be written
      await new Promise((res) => setTimeout(res, 800));
      const extractedMenu = { ...dummyWeeklyMenu.menu};
      //-----

      return extractedMenu;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to extract menu from image");
    } 
  };

  //upload menu
  //req structure:-
  /* menu: {
    monday: {
      breakfast: {
        time: { start: "07:30", end: "09:30" },
        diet: [{ name: "Idli" }, { name: "Sambar" }, { name: "Chutney" }],
        extras: [{ name: "Extra Idli", price: 20 }]
      },
      lunch: {
        time: { start: "12:30", end: "14:30" },
        diet: [{ name: "Rice" }, { name: "Dal" }, { name: "Paneer Curry" }],
        extras: [{ name: "Curd", price: 10 }]
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Veg Curry" }],
        extras: []
      }
    }, tue,wed,thur,fri,sat,sun
 } */
  const uploadWeeklyMenu = async (data)=>{
    if(!data) throw new Error("Data is required");

    try {
      //---- change after backend done and services will be written
      await new Promise((res) => setTimeout(res, 800));
      //-----

      //will update here menu state after.
      setWeeklyMenu(null);

      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error.message || "Failed to Upload menu");
    }
  }


  const value = {
    todayMenu,
    weeklyMenu,
    lastUpdatedOn,
    
    fetchTodayMenu,
    fetchWeeklyMenu,

    loadingToday,
    loadingWeekly,

    updateTodayMenu,
    uploadWeeklyMenu,
    extractWeeklyMenuFromImage
  };

  return (
    <AccountantContext.Provider value={value}>
      {children}
    </AccountantContext.Provider>
  );
};

export default AccountantContextProvider;
