import { useState } from "react";
import { toast } from "react-hot-toast";
import AdminContext from "./AdminContext";

// Import real backend services
import {
    fetchHostelsAdminAPI,
    addHostelAPI,
    updateHostelDetailsAPI,
    fetchStudentsByHostelAPI,
    removeAccountsAPI
} from '../services/backend/adminServices';

const AdminContextProvider = ({ children }) => {
    const [hostels, setHostels] = useState([]);
    const [students, setStudents] = useState({});
    const [loading, setLoading] = useState(false);

    // 1. Fetch Admin Hostels
    const fetchHostels = async (forceRefresh = false) => {
        if (!forceRefresh && hostels && hostels.length !== 0) return true;
        setLoading(true);
        try {
            const res = await fetchHostelsAdminAPI();
            setHostels(res);
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to fetch hostels");
        } finally {
            setLoading(false);
        }
    };

    // 2. Add New Hostel
    const addHostel = async (hostelData) => {
        try {
            const newHostel = await addHostelAPI(hostelData);
            setHostels((prev) => [...prev, newHostel]);
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to add new hostel");
        }
    };

    // 3. Get Hostel By ID
    const getHostelById = (id) => {
        // String comparison ensures it matches whether id is Number or String
        return hostels.find((h) => String(h.id) === String(id));
    };

    // 4. Update Hostel Details
    const updateHostelDetails = async (id, updatedData) => {
        try {
            await updateHostelDetailsAPI(id, updatedData);

            setHostels((prev) =>
                prev.map((h) => (String(h.id) === String(id) ? { ...h, ...updatedData } : h))
            );
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Update failed");
            return false;
        }
    };

    // 5. Fetch Students by Hostel ID
    const fetchStudentsByHostel = async (hostelId, forceRefresh = false) => {
        if (!forceRefresh && students && students[hostelId]) return students[hostelId];
        
        setLoading(true);
        try {
            const res = await fetchStudentsByHostelAPI(hostelId);

            setStudents((prev) => ({
                ...prev,
                [hostelId]: res,
            }));

            return res;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error loading students");
        } finally {
            setLoading(false);
        }
    };

    // 6. Remove Accounts
    const removeAccounts = async (hostelId, studentIdentifiers) => {
        try {
            await removeAccountsAPI(studentIdentifiers);

            // Filter out the deleted students from the local state
            setStudents((prev) => ({
                ...prev,
                [hostelId]: prev[hostelId].filter(s => !studentIdentifiers.includes(s.identifier)),
            }));
            
            // Decrease the student count on the hostel card immediately
            setHostels((prev) => prev.map((h) => {
                if(String(h.id) === String(hostelId)){
                    return { ...h, students: Math.max(0, h.students - studentIdentifiers.length) }
                }
                return h;
            }));

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to remove accounts");
        }
    };

    const value = {
        hostels,
        students,
        loading,
        setLoading,
        fetchHostels,
        addHostel,
        getHostelById,
        updateHostelDetails,
        fetchStudentsByHostel,
        removeAccounts,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;