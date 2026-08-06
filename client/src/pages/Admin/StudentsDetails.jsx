/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext, useMemo } from 'react';
import AdminContext from '../../context/AdminContext';
import Loader from '../../components/common/Loader';
import ItemsNotUpdated from '../../components/common/ItemsNotUpdated';
import ConfirmOtpModal from '../../components/admin/studentsDetails/ConfirmOtpModal';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { batchRemovalBodySchema } from '../../schemas/admin.schema';
import { validateWithZod } from '../../utils/validateWithZod';
import { COURCES, BATCHES, BRANCHES } from '../../assets/assets';

export default function StudentsDetails() {
  const { hostels, fetchStudentsByHostel, loading, sendRemoveAccountsOtp, removeAccounts, fetchHostels } = useContext(AdminContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({ 
    course: 'all', 
    batch: 'all', 
    entry: 'all', 
    branch: 'all' 
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (hostels?.length > 0 && !selectedHostel) {
      setSelectedHostel(hostels[0].id);
    }
  }, [hostels]);

  // Fetch students of selected hostel
  useEffect(() => {
    if (!selectedHostel) return;
    const getStudents = async () => {
      try {
        const res = await fetchStudentsByHostel(selectedHostel);
        setStudents(res || []);
      } catch (error) {
        toast.error(error.message);
      }
    };
    getStudents();
    setSelectedIds([]); 
  }, [selectedHostel]);

  // Filtered students based on selected filters
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const roll = s.identifier.split('@')[0];
      if (roll.length < 6) return true;

      const matchCourse = filters.course === 'all' || roll[0] === filters.course;
      const matchBatch = filters.batch === 'all' || roll.substring(1, 3) === filters.batch;
      const matchEntry = filters.entry === 'all' || roll[3] === filters.entry;
      const matchBranch = filters.branch === 'all' || roll.substring(4, 6) === filters.branch;
      
      return matchCourse && matchBatch && matchEntry && matchBranch;
    });
  }, [students, filters]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) setSelectedIds([]);
    else setSelectedIds(filteredStudents.map(s => s.identifier));
  };

  //"Remove" button first sends OTP and opens the modal
  const handleInitiateDelete = async () => {
    if (selectedIds.length === 0) return;

    setSendingOtp(true);
    try {
      await sendRemoveAccountsOtp(selectedHostel);
      toast.success("Confirmation OTP sent");
      setOtpModalOpen(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendRemoveAccountsOtp(selectedHostel);
      toast.success("OTP resent");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //actual deletion happens after OTP enter
  const handleConfirmDelete = async (otp) => {
    setLoadingDelete(true);

    const { success, errors, data } = validateWithZod(batchRemovalBodySchema, {
      studentIdentifiers: selectedIds,
      otp,
    });
    if (!success) {
      toast.error(errors.otp || Object.values(errors)[0] || "Invalid input");
      setLoadingDelete(false);
      return;
    }

    try {
      const result = await removeAccounts({hostelId: selectedHostel, studentIdentifiers: data.studentIdentifiers, otp: data.otp});
      setSelectedIds([]);
      setOtpModalOpen(false);
      toast.success(`${result.deletedCount} accounts removed successfully.`);
      setStudents(students.filter(s => !selectedIds.includes(s.identifier)));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  const selectStyle = "w-full p-3 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl outline-none transition-all text-xs md:text-sm font-medium text-gray-700";
  const labelStyle = "text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-[10px] md:text-sm group text-gray-400 hover:text-green-600 mb-1 flex items-center gap-2 transition-all font-semibold uppercase tracking-widest"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1"></i> 
            Back
          </button>
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">Students Management</h2>
        </div>
      </div>

      {/* Filters Area (unchanged) */}
      <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100 mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="flex flex-col">
            <label htmlFor="hostel-select" className={labelStyle}>Hostel</label>
            <select id="hostel-select" className={selectStyle} value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)}>
              {hostels.map(h => <option key={h.id} value={h.id}>{`Hostel - ${h.id}`}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="course-select" className={labelStyle}>Course</label>
            <select id="course-select" className={selectStyle} onChange={(e) => setFilters({...filters, course: e.target.value})}>
              <option value="all">All Courses</option>
              {COURCES.map((course)=>(
                <option key={course.code} value={course.code}>{course.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="batch-select" className={labelStyle}>Batch</label>
            <select id="batch-select" className={selectStyle} onChange={(e) => setFilters({...filters, batch: e.target.value})}>
              <option value="all">All Batches</option>
              {BATCHES.map((batch) => (
                <option key={batch.code} value={batch.code}>{batch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="admission-select" className={labelStyle}>Admission</label>
            <select id="admission-select" className={selectStyle} onChange={(e) => setFilters({...filters, entry: e.target.value})}>
              <option value="all">Any Entry</option>
              <option value="1">Normal</option>
              <option value="2">Special/Lateral</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="branch-select" className={labelStyle}>Branch Code</label>
            <select id="branch-select" className={selectStyle} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
              <option value="all">All Branches</option>
              {BRANCHES.map((branch) => (
                <option key={branch.code} value={branch.code}>{branch.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? <Loader text="Synchronizing records..." loaderNumber={3} /> : (
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
          
          {/* Toolbar */}
          <div className="p-4 md:p-5 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <div 
              onClick={handleSelectAll}
              className="w-full md:w-auto flex items-center justify-center md:justify-start gap-3 cursor-pointer group bg-white px-4 py-2.5 rounded-xl border border-gray-200 active:scale-95 transition-transform"
            >
              <input 
                id="select-all-checkbox"
                type="checkbox" 
                readOnly
                checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0} 
                className="w-4 h-4 accent-green-600 cursor-pointer" 
              />
              <label htmlFor="select-all-checkbox" className="text-xs md:text-sm font-bold text-gray-600 select-none">
                {selectedIds.length === filteredStudents.length ? 'Deselect All' : `Select Filtered (${filteredStudents.length})`}
              </label>
            </div>

            {selectedIds.length > 0 && (
              <button 
                onClick={handleInitiateDelete} 
                disabled={sendingOtp}
                className="w-full md:w-auto bg-red-50 text-red-600 border border-red-100 px-6 py-2.5 rounded-2xl text-xs md:text-sm font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                <i className="fa-solid fa-trash-can"></i>
                {sendingOtp ? "Sending OTP..." : `Remove ${selectedIds.length} Students`}
              </button>
            )}
          </div>

          {/* Table*/}
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="py-12 md:py-20">
                <ItemsNotUpdated subheading="No students match the selected filter criteria." />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                    <th className="p-4 md:p-6 w-16 md:w-20 text-center">Select</th>
                    <th className="p-4 md:p-6">Student Information</th>
                    <th className="p-4 md:p-6 hidden md:table-cell">Roll No / Institution Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map(student => (
                    <tr key={student.identifier} className="group hover:bg-green-50/30 transition-colors">
                      <td className="p-4 md:p-6 text-center align-top md:align-middle">
                        <input 
                          id={`select-${student.identifier}`}
                          type="checkbox" 
                          checked={selectedIds.includes(student.identifier)} 
                          onChange={() => {
                            setSelectedIds(prev => prev.includes(student.identifier) 
                              ? prev.filter(id => id !== student.identifier) 
                              : [...prev, student.identifier]
                            );
                          }} 
                          className="w-4 h-4 md:w-5 md:h-5 accent-green-600 cursor-pointer" 
                        />
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 mt-0.5 md:hidden">
                            {student.identifier}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 hidden md:table-cell">
                        <code className="bg-gray-100 group-hover:bg-white px-3 py-1 rounded-lg text-xs lg:text-sm font-mono text-gray-600 border border-gray-200 transition-colors">
                          {student.identifier}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* OTP Confirmation Modal */}
      <ConfirmOtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onConfirm={handleConfirmDelete}
        onResend={handleResendOtp}
        count={selectedIds.length}
        loading={loadingDelete}
        resending={sendingOtp}
      />
    </div>
  );
}