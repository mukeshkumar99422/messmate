import AccountantContext from "./AccountantContext";
import { useState } from "react";

// Import real backend services
import {
  fetchTodayMenuAPI,
  fetchWeeklyMenuAPI,
  updateTodayMenuAPI,
  updateItemPriceAPI,
  uploadWeeklyMenuAPI,
  extractWeeklyMenuFromImageAPI,
  fetchOrGenerateReviewAnalysisAPI
} from '../services/backend/accountantServices';
import { getApiError } from "../utils/helpers";

const AccountantContextProvider = ({ children }) => {
  const [todayMenu, setTodayMenu] = useState(null);
  const [fetchDate, setFetchDate] = useState(null);

  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [lastUpdatedOn, setLastUpdatedOn] = useState(null);

  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  const [reviewAnalysis, setReviewAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // -------- 1. Fetch Today's Menu --------
  const fetchTodayMenu = async (forceRefresh = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (!forceRefresh && todayMenu && fetchDate === todayStr) return true;
    
    setLoadingToday(true);
    try {
      const res = await fetchTodayMenuAPI();

      setTodayMenu(res);
      setFetchDate(todayStr);
      return true;
    } catch (error) {
      throw getApiError(error);
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
      // If menu is not found (404), just return gracefully so UI can show the upload screen
      if(error.response?.status === 404){
         setWeeklyMenu(null);
         setLastUpdatedOn(null);
         return false;
      }
      throw getApiError(error);
    } finally {
      setLoadingWeekly(false);
    }
  };

  // -------- 3. Update Today's Menu --------
  const updateTodayMenu = async ({date, meal, time, diet, extras})=>{
    try {
      await updateTodayMenuAPI({ date, meal, time, diet, extras });

      setTodayMenu(null);
      setFetchDate(null);
      fetchTodayMenu(true); // Force refresh to get the updated menu
      return true;
    } catch (error) {
      throw getApiError(error);
    }
  }

  // ---------update price of item-----------------
  const updateItemPrice = async ({itemId, newPrice}) => {
    try {
        await updateItemPriceAPI({itemId, newPrice});
        return true;
    } catch (error) {
      throw getApiError(error);
    }
  };

  // -------- 4. Extract Menu From Image (Gemini) --------
  const extractWeeklyMenuFromImage = async (image) => {
    if (!image) throw new Error("Image is required");

    try {
      const formData = new FormData();
      formData.append("image", image);
      
      const extractedMenu = await extractWeeklyMenuFromImageAPI(formData);

      return extractedMenu;
    } catch (error) {
      throw getApiError(error);
    } 
  };

  // -------- 5. Upload Weekly Menu --------
  const uploadWeeklyMenu = async (data) => {
    try {
      await uploadWeeklyMenuAPI(data);

      setWeeklyMenu(null);
      setTodayMenu(null);
      setFetchDate(null);
      setLastUpdatedOn(new Date().toISOString());

      return true;
    } catch (error) {
      throw getApiError(error);
    }
  }

  // -------- 6. analyse reviews --------
  const fetchOrGenerateReviewAnalysis = async (forceFresh = false) => {
    setLoadingAnalysis(true);
    try {
      const res = await fetchOrGenerateReviewAnalysisAPI(forceFresh);
      
      if (res.hasData) {
        setReviewAnalysis(res.analysis);
        return { hasData: true, data: res.analysis };
      } else {
        setReviewAnalysis(null);
        return { hasData: false, message: res.message };
      }
    } catch (error) {
      throw getApiError(error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const value = {
    todayMenu,
    weeklyMenu,
    lastUpdatedOn,
    
    fetchTodayMenu,
    fetchWeeklyMenu,

    loadingToday,
    loadingWeekly,

    updateTodayMenu,
    updateItemPrice,
    uploadWeeklyMenu,
    extractWeeklyMenuFromImage,

    reviewAnalysis,
    loadingAnalysis,
    fetchOrGenerateReviewAnalysis
  };

  return (
    <AccountantContext.Provider value={value}>
      {children}
    </AccountantContext.Provider>
  );
};

export default AccountantContextProvider;