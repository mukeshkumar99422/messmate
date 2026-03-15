/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext, useMemo } from 'react';
import AdminContext from '../../context/AdminContext';
import Loader from '../../components/common/Loader';
import ItemsNotUpdated from '../../components/common/ItemsNotUpdated';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function StudentsDetails() {
  const { hostels, fetchStudentsByHostel, loading, removeAccounts, fetchHostels } = useContext(AdminContext);
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  
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

  //when hostel changes
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

  //filter students based on roll number patterns
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

  //select/deselect all
  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) setSelectedIds([]);
    else setSelectedIds(filteredStudents.map(s => s.identifier));
  };

  //delete selected accounts
  const handleDelete = async () => {
    try {
      if (window.confirm(`Delete ${selectedIds.length} selected accounts? This cannot be undone.`)) {
        await removeAccounts(selectedHostel, selectedIds);
        setSelectedIds([]);
        toast.success("Accounts removed successfully");
        setStudents(students.filter(s=>!selectedIds.includes(s.identifier)));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //courses
  const courses = [
    { code: '1', name: 'B.Tech' },
    { code: '2', name: 'M.Tech' },
    { code: '3', name: 'PhD' },
    { code: '4', name: 'MCA' },
  ]

  //batches
  const currentYear = new Date().getFullYear();
  const batches = Array.from(
    {length: 5},
    (_, i) => ({code: (currentYear - i).toString().slice(-2), name: (currentYear - i).toString()})
  );

  //branches
  const branches = [
    { code: '01', name: 'Civil' },
    { code: '02', name: 'CSE' },
    { code: '03', name: 'IT' },
    { code: '04', name: 'EE' },
    { code: '05', name: 'ECE' },
    { code: '06', name: 'Mechanical' },
    { code: '07', name: 'PIE' },
    { code: '08', name: 'AI-ML' },
    { code: '09', name: 'IIOT' },
    { code: '10', name: 'M&C' },
  ]


  // Styles
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

      {/* Filters Area */}
      <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100 mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="flex flex-col">
            <label className={labelStyle}>Hostel</label>
            <select className={selectStyle} value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)}>
              {hostels.map(h => <option key={h.id} value={h.id}>{`Hostel - ${h.id}`}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Course</label>
            <select className={selectStyle} onChange={(e) => setFilters({...filters, course: e.target.value})}>
              <option value="all">All Courses</option>
              {
                courses.map((course)=>(
                  <option key={course.code} value={course.code}>
                    {course.name}
                  </option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Batch</label>
            <select className={selectStyle} onChange={(e) => setFilters({...filters, batch: e.target.value})}>
              <option value="all">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.code} value={batch.code}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Admission</label>
            <select className={selectStyle} onChange={(e) => setFilters({...filters, entry: e.target.value})}>
              <option value="all">Any Entry</option>
              <option value="1">Normal</option>
              <option value="2">Special/Lateral</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Branch Code</label>
            <select className={selectStyle} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.code} value={branch.code}>
                  {branch.name}
                </option>
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
                type="checkbox" 
                readOnly
                checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0} 
                className="w-4 h-4 accent-green-600 cursor-pointer" 
              />
              <span className="text-xs md:text-sm font-bold text-gray-600">
                {selectedIds.length === filteredStudents.length ? 'Deselect All' : `Select Filtered (${filteredStudents.length})`}
              </span>
            </div>

            {selectedIds.length > 0 && (
              <button 
                onClick={handleDelete} 
                className="w-full md:w-auto bg-red-50 text-red-600 border border-red-100 px-6 py-2.5 rounded-2xl text-xs md:text-sm font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-trash-can"></i>
                Remove {selectedIds.length} Students
              </button>
            )}
          </div>

          {/* Table */}
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
                          {/* Visible only on mobile */}
                          <span className="text-[10px] font-mono text-gray-400 mt-0.5 md:hidden">
                            {student.identifier}
                          </span>
                        </div>
                      </td>
                      {/* Visible only on desktop */}
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
    </div>
  );
}