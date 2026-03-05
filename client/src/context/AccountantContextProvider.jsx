import AccountantContext from "./AccountantContext";
import { useState } from "react";

// Import real backend services
import {
  fetchTodayMenuAPI,
  fetchWeeklyMenuAPI,
  updateTodayMenuAPI,
  uploadWeeklyMenuAPI,
  extractWeeklyMenuFromImageAPI
} from '../services/backend/accountantServices';

const AccountantContextProvider = ({ children }) => {
  const [todayMenu, setTodayMenu] = useState(null);
  const [fetchDate, setFetchDate] = useState(null);

  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [lastUpdatedOn, setLastUpdatedOn] = useState(null);

  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // -------- 1. Fetch Today's Menu --------
  const fetchTodayMenu = async (forceRefresh = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (!forceRefresh && todayMenu) {
      if(fetchDate === todayStr) {
        return true;
      }
    }
    
    setLoadingToday(true);
    try {
      const res = await fetchTodayMenuAPI();

      setFetchDate(todayStr);
      setTodayMenu(res);
      return true;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || "Failed to fetch today's menu");
    } finally {
      setLoadingToday(false);
    }
  };

  // -------- 2. Fetch Weekly Menu --------
  const fetchWeeklyMenu = async (forceRefresh = false) => {
    if (!forceRefresh && weeklyMenu) {
      return true;
    }

    setLoadingWeekly(true);
    try {
      const res = await fetchWeeklyMenuAPI();

      setWeeklyMenu(res.menu);
      setLastUpdatedOn(res.updatedOn);
      return true;
    } catch (error) {
      console.error(error);
      // If menu is not found (404), just return gracefully so UI can show the upload screen
      if(error.response?.status === 404){
         setWeeklyMenu(null);
         setLastUpdatedOn(null);
         return false;
      }
      throw new Error(error.response?.data?.message || "Failed to fetch weekly menu");
    } finally {
      setLoadingWeekly(false);
    }
  };

  // -------- 3. Update Today's Menu --------
  const updateTodayMenu = async ({date, meal, time, diet, extras})=>{
    try {
      if(!meal || !date || !time || !diet || !extras) throw new Error("All fields are required");

      await updateTodayMenuAPI({ date, meal, time, diet, extras });

      // Optimistically update local state so we don't have to refetch
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
      throw new Error(error.response?.data?.message || "Failed to update today's menu");
    }
  }

  // -------- 4. Extract Menu From Image (Gemini) --------
  const extractWeeklyMenuFromImage = async (image) => {
    if (!image) throw new Error("Image is required");

    try {
      const formData = new FormData();
      formData.append("image", image);
      
      const extractedMenu = await extractWeeklyMenuFromImageAPI(formData);

      return extractedMenu;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || "Failed to extract menu from image");
    } 
  };

  // -------- 5. Upload Weekly Menu --------
  const uploadWeeklyMenu = async (data) => {
    if(!data) throw new Error("Data is required");

    try {
      await uploadWeeklyMenuAPI(data);

      // Clear cache so the app is forced to fetch the new menu data on the next render
      setWeeklyMenu(null);
      setTodayMenu(null);

      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error.response?.data?.message || "Failed to upload menu");
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