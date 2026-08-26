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
import { getApiError } from "../utils/helpers";
import { newIdempotencyKey } from "../utils/helpers";

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
        const idempotencyKey = newIdempotencyKey();
        try {
            const data = await changeHostelAPI(newHostelId, idempotencyKey);

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
            throw getApiError(error);
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
            throw getApiError(error);
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
            throw getApiError(error);
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
            throw getApiError(error);
        } finally {
            setLoadingExtras(false);
        }
    };

    // --- 5. ADD EXTRA PURCHASE ---
    const addExtraPurchase = async ({ date, meal, items }) => {
        const idempotencyKey = newIdempotencyKey();
        try {
            await addExtraPurchaseAPI({ date, meal, items}, idempotencyKey);

            setAnalyseExtraDataCache({});
            setAnalyseExtraData([]);
            return true;
        } catch (error) {
            throw getApiError(error);
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
            throw getApiError(error);
        } finally {
            setLoadingAnalyseExtra(false);
        }
    };

    // --- 7. ADD RATING ---
    // (should we add hostelId in data also? so that data not update in wrong hostel)
    const addRating = async ({ itemId, meal, rating, tags, suggestion }) => {
        const idempotencyKey = newIdempotencyKey();
        try {
            await addRatingAPI({itemId,meal,rating,tags,suggestion}, idempotencyKey);
            return true;
        } catch (error) {
            throw getApiError(error);
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