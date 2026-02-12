import{useState} from "react";
import { dummyAdminHostelAccounts, dummyAdminStudentsData } from "../assets/dummyData"; // Adjust path
import { toast } from "react-hot-toast";
import AdminContext from "./AdminContext";


const AdminContextProvider = ({children}) => {
  const [hostels, setHostels] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Fetch Admin Hostels
  const fetchHostels = async (forceRefresh=false) => {
    if(!forceRefresh && hostels && hostels.length!=0) return true;
    setLoading(true);
    try {
      //-----
      await new Promise((res) => setTimeout(res, 600));
      const res = [...dummyAdminHostelAccounts];
      //-----

      setHostels(res);
      return true;
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to fetch hostels");
    } finally {
      setLoading(false);
    }
  };

  // 2. Add New Hostel
  const addHostel = async (hostelData) => {
    try {
      //-----
      await new Promise((res) => setTimeout(res, 600));
      //-----

      setHostels((prev) => [...prev, { ...hostelData, id: prev.length + 1, students: 0 }]);
      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error.message || "Failed to add new hostel");
    }
  };

  // 3. Get Hostel By ID
  const getHostelById = (id) => {
    return hostels.find((h) => h.id === parseInt(id));
  };

  // 4. Update Hostel Details
  const updateHostelDetails = async (id, updatedData) => {
    try {

      //-----
      await new Promise((res) => setTimeout(res, 600));
      //-----
      // await axios.put(`/api/admin/update-hostel/${id}`, updatedData)

      setHostels((prev) =>
        prev.map((h) => (h.id === parseInt(id) ? { ...h, ...updatedData } : h))
      );
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Update failed");
      return false;
    }
  };

  // 5. Fetch Students by Hostel ID
  const fetchStudentsByHostel = async (hostelId,forceRefresh=false) => {
    if(!forceRefresh && students && students[hostelId]) return students[hostelId];
    setLoading(true);
    try {
      //-----
      await new Promise((res) => setTimeout(res, 600));
      const res = [...dummyAdminStudentsData];
      //-----

      setStudents({
        ...students,
        [hostelId]: res,
      });

      return res;
    } catch (error) {
      console.log(error);
      toast.error("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  // 6. Remove Accounts
  const removeAccounts = async (hostelId, studentIdentifiers) => {
    try {
      //-----
      await new Promise((res) => setTimeout(res, 600));
      //-----

      setStudents((prev) =>{
        return {
            ...prev,
            [hostelId]: prev[hostelId].filter(s => !studentIdentifiers.includes(s.identifier)),
          }
        }
      );
      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error.message || "Failed to remove accounts")
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