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
  //dummy post data
  /* { id: -> this field is not in data, assigned by backend as next serial number
    name: "Chakardhar Bhawan", residents: "boys",  -> required
    students: 0, ->always 0
    accountantContactNo: "7049049987", -> optional
    accountantEmail: "123103017@nitkkr.ac.in", -> optional
    hostelContactNo: "7049049987",  ->optional
    hostelEmail: "123103017@nitkkr.ac.in", ->required
    loginId: "acc_7", password: "1923^@lkhlk" -> required
  }*/
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
  // post data
  /*{ id: 7, -> unupdated always
    name: "Chakardhar Bhawan", -> may be updated 
    residents: "boys",  students: 200, -> unupdated always
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in", -> may be updated 
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in", -> may be updated 
    loginId: "acc_7", -> may be updated 
    password: "" or "a password" -> if empty string means password not updated
  } */
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
  //dummy data for sending to backend
  /*[ array of identifiers/emails of students] */
  //no need to send hostelId to backend
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