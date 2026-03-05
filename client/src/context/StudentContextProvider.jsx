import { useContext, useState } from "react";
import StudentContext from "./StudentContext"; 
import AuthContext from "./AuthContext";

// Import real backend services
import {
    changeHostelAPI,
    fetchTodayMenuAPI,
    fetchMenuByDayAPI,
    fetchExtrasByDateAPI,
    addExtraPurchaseAPI,
    fetchAnalyseExtraAPI
} from '../services/backend/studentServices';

const StudentContextProvider = ({ children }) => {
    // Cache storage
    const [todayMenu, setTodayMenu] = useState(null);
    const [fetchDate, setFetchDate] = useState(null);
    const [weeklyMenu, setWeeklyMenu] = useState({});
    const [extrasByDate, setExtrasByDate] = useState({});
    const [analyseExtraData, setAnalyseExtraData] = useState({});

    const { setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // --- 1. CHANGE HOSTEL ---
    const changeHostel = async (newHostel) => {
        setLoading(true);
        try {
            if (!newHostel) throw new Error("Hostel is required");

            const data = await changeHostelAPI(newHostel);

            // Update local user state with the data returned from backend
            setUser((prev) => ({
                ...prev,
                hostelId: data.hostelId,
                hostelName: data.hostelName,
            }));

            // Clear cached menus so it fetches fresh data for the new hostel
            setTodayMenu(null);
            setWeeklyMenu({});
            setExtrasByDate({});
            setAnalyseExtraData({});

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to update hostel");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. FETCH MENU BY DAY ---
    const fetchMenuByDay = async (day, forceRefresh = false) => {
        if (!forceRefresh && weeklyMenu[day]) {
            return weeklyMenu[day];
        }
        
        setLoading(true);
        try {
            const res = await fetchMenuByDayAPI(day);
            setWeeklyMenu((prev) => ({ ...prev, [day]: res }));
            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch menu");
        } finally {
            setLoading(false);
        }
    };

    // --- 3. FETCH TODAY MENU ---
    const fetchTodayMenu = async (forceRefresh = false) => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (!forceRefresh && todayMenu && fetchDate === todayStr) {
            return todayMenu;
        }

        setLoading(true);
        try {
            const res = await fetchTodayMenuAPI();
            
            setTodayMenu(res);
            setFetchDate(todayStr);
            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch menu");
        } finally {
            setLoading(false);
        }
    };

    // --- 4. FETCH EXTRAS BY DATE & MEAL ---
    const fetchExtrasByDate = async ({ date, meal }, forceRefresh = false) => {
        const cacheKey = `${date}_${meal}`;
        
        if (!forceRefresh && extrasByDate[cacheKey]) {
            return extrasByDate[cacheKey];
        }

        setLoading(true);
        try {
            if (!date || !meal) throw new Error("Date and meal are required");

            const res = await fetchExtrasByDateAPI(date, meal);

            setExtrasByDate((prev) => ({
                ...prev,
                [cacheKey]: res
            }));

            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch extras");
        } finally {
            setLoading(false);
        }
    };

    // --- 5. ADD EXTRA PURCHASE ---
    const addExtraPurchase = async ({ date, meal, items, totalAmount }) => {
        setLoading(true);
        console.log(1);
        try {
            if (!date || !meal || !items?.length || totalAmount <= 0) {
                throw new Error("Invalid purchase data");
            }

            await addExtraPurchaseAPI({ date, meal, items, totalAmount });

            // Clear analysis cache to force refetch next time the user views history
            setAnalyseExtraData({});
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Purchase failed");
        } finally {
            setLoading(false);
        }
    };

    // --- 6. FETCH ANALYSE EXTRA DATA ---
    const fetchAnalyseExtra = async ({ rangeType, from, to }, forceRefresh = false) => {
        const cacheKey = `${rangeType}_${from || ""}_${to || ""}`;
        
        if (!forceRefresh && analyseExtraData[cacheKey]) {
            return analyseExtraData[cacheKey];
        }

        setLoading(true);
        try {
            if (!rangeType) throw new Error("Range type is required");

            const res = await fetchAnalyseExtraAPI(from, to);

            setAnalyseExtraData((prev) => ({
                ...prev,
                [cacheKey]: res
            }));
            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch analysis data");
        } finally {
            setLoading(false);
        }
    };

    const value = {
        loading,
        changeHostel,
        fetchMenuByDay,
        fetchTodayMenu,
        fetchExtrasByDate,
        addExtraPurchase,
        fetchAnalyseExtra
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};

export default StudentContextProvider;