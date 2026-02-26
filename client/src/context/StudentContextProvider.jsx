import { useContext, useState } from "react";
import StudentContext from "./StudentContext"; 
import AuthContext from "./AuthContext";
import { dummyTodayMenuStudent, dummyMenuStudent, dummyExtraItems,dummyAnalyseExtraResponse } from "../assets/dummyData";

//after backend done and services written
import {} from '../services/backend/studentServices'


const StudentContextProvider = ({children})=>{
    //cache storage
    //home page
    const [todayMenu, setTodayMenu] = useState(null);
    const [fetchDate, setFetchDate] = useState(null);
    const [weeklyMenu, setWeeklyMenu] = useState({});

    //purchase extra page
    const [extrasByDate, setExtrasByDate] = useState({});

    //analyse extra page
    const [analyseExtraData, setAnalyseExtraData] = useState({});

    const {setUser, hostels} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);


    //change hostel functionality
    const changeHostel = async (newHostel) => {
        setLoading(true);
        try {
            if (!newHostel) {
                throw new Error("Hostel is required");
            }

            // simulate backend API
            await new Promise((res) => setTimeout(res, 500));

            // update local user state
            setUser((prev) => ({
                ...prev,
                hostelId: newHostel,
                hostelName: (hostels.find(h=> h.id==newHostel)).name,
            }));

            //remove cached menus
            setTodayMenu(null);
            setWeeklyMenu({});
            setExtrasByDate({});

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to update hostel");
        } finally {
            setLoading(false);
        }
    };

    //fetch menu by day
    //at backend 1st check in today updated menu collection of today date-> meal wise,
    //if not found then fetch from stanard menu collection.
    const fetchMenuByDay = async (day,forceRefresh=false) =>{
        if (!forceRefresh && weeklyMenu[day]) {
            return weeklyMenu[day];
        }
        setLoading(true);
        try {
            
            // --simulate backend API
            await new Promise((res) => setTimeout(res, 500));
            const res = {
                ...dummyMenuStudent,
                day
            };
            // --

            setWeeklyMenu((prev) => ({...prev, [day]: res}));
            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to fetch menu");
        } finally {
            setLoading(false);
        }
    }

    //fetch today menu
    const fetchTodayMenu = async (forceRefresh=false) =>{
        if (!forceRefresh && todayMenu) {
            if(fetchDate === new Date().toISOString().split('T')[0]){
                return todayMenu;
            }
        }
        setLoading(true);
        try {
            
            // --simulate backend API
            await new Promise((res) => setTimeout(res, 500));
            const res = {
                ...dummyTodayMenuStudent,
            };
            // --

            setTodayMenu(res);
            setFetchDate(new Date().toISOString().split('T')[0]);
            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to fetch menu");
        }
        finally {
            setLoading(false);
        }
    }

    // fetch extras by date & meal
    //at backend 1st check in today updated menu collection of that date-> meal wise,
    //if not found then fetch from stanard menu collection.
    const fetchExtrasByDate = async ({ date, meal }, forceRefresh=false) => {
        if (!forceRefresh && extrasByDate[`${date}_${meal}`]) {
            return extrasByDate[`${date}_${meal}`];
        }
        setLoading(true);
        try {
            if (!date || !meal) {
                throw new Error("Date and meal are required");
            }

            // --- simulate backend API
            await new Promise((res) => setTimeout(res, 500));
            const res = [...dummyExtraItems]; // hardcoded for now
            // ---

            setExtrasByDate((prev) => ({
                ...prev,
                [`${date}_${meal}`]: res
            }));

            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to fetch extras");
        } finally {
            setLoading(false);
        }
    };

    // add extra purchase
    //dummy extra purchase data
    /*{
        date:"2025-12-12",
        meal:"breakfast",
        items:[
            { id: "ex_101", name: "Paneer Butter Masala", unitPrice: 40, qty: 3},
            { id: "ex_102", name: "Extra Rice", unitPrice: 10, qty: 1},
        ]
        totalAmount: 299,
    } */
    const addExtraPurchase = async ({ date, meal, items, totalAmount }) => {
        setLoading(true);
        try {
            if (!date || !meal || !items?.length || totalAmount <= 0) {
            throw new Error("Invalid purchase data");
            }

            // --- simulate backend API
            await new Promise((res) => setTimeout(res, 700));
            // ---

            //remove analyse cache to force refetch next time
            setAnalyseExtraData({});
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Purchase failed");
        } finally {
            setLoading(false);
        }
    };

    // fetch analyse extra data
    const fetchAnalyseExtra = async ({ rangeType, from, to }, forceRefresh=false) => {
        if(!forceRefresh && analyseExtraData[`${rangeType}_${from || ""}_${to || ""}`]){
            return analyseExtraData[`${rangeType}_${from || ""}_${to || ""}`];
        }
        setLoading(true);
        try {
            if (!rangeType) {
                throw new Error("Range type is required");
            }

            // ---- simulate backend API ----
            await new Promise((res) => setTimeout(res, 1000));
            const res = [...dummyAnalyseExtraResponse,];
            // --------------------------------

            setAnalyseExtraData((prev)=>{
                return {
                    ...prev,
                    [`${rangeType}_${from || ""}_${to || ""}`]: res
                }
            })
            return res;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to fetch analysis data");
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
    return(
        <StudentContext.Provider value = {value}>
            {children}
        </StudentContext.Provider>
    )
}

export default StudentContextProvider;