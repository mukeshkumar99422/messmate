import { useContext, useState } from "react";
import StudentContext from "./StudentContext"; 
import AuthContext from "./AuthContext";

// Import backend services
import {
    changeHostelAPI,
    fetchTodayMenuAPI,
    fetchMenuByDayAPI,
    fetchExtrasByDateAPI,
    addExtraPurchaseAPI,
    fetchAnalyseExtraAPI,
    addRatingAPI
} from '../services/backend/studentServices';

const StudentContextProvider = ({ children }) => {
    // cache states
    const [todayMenu, setTodayMenu] = useState(null);
    const [fetchDate, setFetchDate] = useState(null);
    const [loadingToday, setLoadingToday] = useState(false);
    const [weeklyMenu, setWeeklyMenu] = useState({});
    const [loadingWeekly, setLoadingWeekly] = useState(false);

    // menu display state
    const [menu, setMenu] = useState(null);
    
    //cache
    const [extrasByDateCache, setExtrasByDateCache] = useState({});
    const [analyseExtraDataCache, setAnalyseExtraDataCache] = useState({});

    //actual extra and analysis data
    const [extras,setExtras] = useState([]);
    const [analyseExtraData,setAnalyseExtraData] = useState([]);
    const [loadingExtras, setLoadingExtras] = useState(false);
    const [loadingAnalyseExtra, setLoadingAnalyseExtra] = useState(false);

    const { setUser } = useContext(AuthContext);

    // --- 1. CHANGE HOSTEL ---
    const changeHostel = async (newHostelId) => {
        try {
            const data = await changeHostelAPI(newHostelId);

            // Update local user state with the data returned from backend
            setUser((prev) => ({
                ...prev,
                hostelId: data.hostelId,
                hostelName: data.hostelName,
            }));

            setMenu(null);
            setTodayMenu(null);
            setWeeklyMenu({});
            setExtrasByDateCache({});
            setExtras([]);

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to update hostel");
        }
    };

    // --- 2. FETCH MENU BY DAY ---
    const fetchMenuByDay = async (day, forceRefresh = false) => {
        if (!forceRefresh && weeklyMenu[day]) {
            setMenu(weeklyMenu[day]);
            return true;
        }
        
        setLoadingWeekly(true);
        try {
            const res = await fetchMenuByDayAPI(day);
            setWeeklyMenu((prev) => ({ ...prev, [day]: res }));
            setMenu(res);
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch menu");
        } finally {
            setLoadingWeekly(false);
        }
    };

    // --- 3. FETCH TODAY MENU ---
    const fetchTodayMenu = async (forceRefresh = false) => {
        const todayStr = new Date().toISOString().split('T')[0];
            
        if (!forceRefresh && todayMenu && fetchDate === todayStr) {
            if(fetchDate === todayStr) {
                setMenu(todayMenu);
                return true;
            }
        }
        
        setLoadingToday(true);
        try {
            const res = await fetchTodayMenuAPI();
    
            setTodayMenu(res);
            setMenu(res);
            setFetchDate(todayStr);
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch today's menu");
        } finally {
            setLoadingToday(false);
        }
    };

    // --- 4. FETCH EXTRAS BY DATE & MEAL ---
    const fetchExtrasByDate = async ({ date, meal }, forceRefresh = false) => {
        const cacheKey = `${date}_${meal}`;
        
        if (!forceRefresh && extrasByDateCache[cacheKey]) {
            setExtras(extrasByDateCache[cacheKey]);
            return;
        }

        setLoadingExtras(true);
        try {
            if (!date || !meal) throw new Error("Date and meal are required");

            const res = await fetchExtrasByDateAPI(date, meal);

            setExtrasByDateCache((prev) => ({
                ...prev,
                [cacheKey]: res
            }));
            setExtras(res);

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch extras");
        } finally {
            setLoadingExtras(false);
        }
    };

    // --- 5. ADD EXTRA PURCHASE ---
    const addExtraPurchase = async ({ date, meal, items }) => {
        try {
            await addExtraPurchaseAPI({ date, meal, items});

            setAnalyseExtraDataCache({});
            setAnalyseExtraData([]);
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Purchase failed");
        }
    };

    // --- 6. FETCH ANALYSE EXTRA DATA ---
    const fetchAnalyseExtra = async ({ rangeType, from, to, groupBy }, forceRefresh = false) => {
        const cacheKey = `${rangeType}_${from || ""}_${to || ""}_${groupBy || ""}`;
        
        if (!forceRefresh && analyseExtraDataCache[cacheKey]) {
            setAnalyseExtraData(analyseExtraDataCache[cacheKey]);
            return;
        }

        setLoadingAnalyseExtra(true);
        try {
            if (!rangeType) throw new Error("Range type is required");

            // Pass groupBy to the API
            const res = await fetchAnalyseExtraAPI(from, to, groupBy);

            setAnalyseExtraDataCache((prev) => ({
                ...prev,
                [cacheKey]: res
            }));
            setAnalyseExtraData(res);

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch analysis data");
        } finally {
            setLoadingAnalyseExtra(false);
        }
    };

    // --- 7. ADD RATING ---
    // (should we add hostelId in data also? so that data not update in wrong hostel)
    const addRating = async ({ itemId, meal, rating, tags, suggestion }) => {
        try {
            await addRatingAPI({itemId,meal,rating,tags,suggestion});
            return true;
        } catch (error) {
            console.log(error);
            throw new Error(error.response?.data?.message || "Failed to rate item");
        }
    };

    const value = {
        loadingToday, loadingWeekly,loadingExtras, loadingAnalyseExtra,
        changeHostel,
        fetchMenuByDay,
        fetchTodayMenu,
        menu,
        fetchExtrasByDate,
        addExtraPurchase,
        fetchAnalyseExtra,
        extras,
        analyseExtraData,setAnalyseExtraData,
        addRating
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};

export default StudentContextProvider;