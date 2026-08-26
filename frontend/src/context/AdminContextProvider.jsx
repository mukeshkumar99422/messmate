import { useState } from "react";
import { toast } from "react-hot-toast";
import AdminContext from "./AdminContext";

// Import real backend services
import {
    fetchHostelsAdminAPI,
    addHostelAPI,
    updateHostelDetailsAPI,
    sendRemoveHostelOtpAPI,
    removeHostelAPI,
    fetchStudentsByHostelAPI,
    sendRemoveAccountsOtpAPI,
    removeAccountsAPI
} from '../services/backend/adminServices';
import { getApiError } from "../utils/helpers";
import { newIdempotencyKey } from "../utils/helpers";

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
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Add New Hostel
    const addHostel = async (hostelData) => {
        const idempotencyKey = newIdempotencyKey();
        try {
            const newHostel = await addHostelAPI(hostelData, idempotencyKey);
            setHostels([]);
            return newHostel;
        } catch (error) {
            throw getApiError(error);
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
            throw getApiError(error);
        }
    };

    // 5. Send OTP for hostel removal confirmation
    const sendRemoveHostelOtp = async (hostelId) => {
        try {
            await sendRemoveHostelOtpAPI(hostelId);
            return true;
        } catch (error) {
            throw getApiError(error);
        }
    };

    // 6. Remove Hostel (cascading)
    const removeHostel = async (hostelId, otp) => {
        try {
            const result = await removeHostelAPI(hostelId, otp);

            setHostels((prev) => prev.filter((h) => String(h.id) !== String(hostelId)));
            setStudents((prev) => {
                const clone = { ...prev };
                delete clone[hostelId];
                return clone;
            });

            return result;
        } catch (error) {
            throw getApiError(error);
        }
    };

    // 7. Fetch Students by Hostel ID
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
            toast.error(getApiError(error).message || "Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    // 8. Send OTP for removal confirmation
    const sendRemoveAccountsOtp = async (hostelId) => {
        try {
            await sendRemoveAccountsOtpAPI(hostelId);
            return true;
        } catch (error) {
            throw getApiError(error);
        }
    };

    // 9. Remove Accounts (now requires otp)
    const removeAccounts = async ({hostelId, studentIdentifiers, otp}) => {
        try {
            const result = await removeAccountsAPI(hostelId, studentIdentifiers, otp);

            setStudents((prev) => ({
                ...prev,
                [hostelId]: prev[hostelId].filter(s => !studentIdentifiers.includes(s.identifier)),
            }));

            setHostels((prev) => prev.map((h) => {
                if(String(h.id) === String(hostelId)){
                    return { ...h, students: Math.max(0, h.students - studentIdentifiers.length) }
                }
                return h;
            }));

            return result;
        } catch (error) {
            throw getApiError(error);
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
        sendRemoveHostelOtp,
        removeHostel,
        fetchStudentsByHostel,
        sendRemoveAccountsOtp,
        removeAccounts,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;