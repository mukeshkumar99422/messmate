import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminContext from '../../context/AdminContext';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';
import { generateLoginId, generatePassword } from '../../utils/helpers';

export default function HostelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getHostelById, updateHostelDetails, loading } = useContext(AdminContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hostelData, setHostelData] = useState(null);

  //----------
  useEffect(() => {
    const data = getHostelById(id);
    if (data) {
      setHostelData({...data, password: ""});
    }
  }, [id, getHostelById]);

  //----------
  const handleToggleEdit = async () => {
    if (isEditing) {
      setIsSaving(true);
      try {
        await updateHostelDetails(id, hostelData);
        toast.success("Details updated successfully");
        setIsEditing(false);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  //------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHostelData(prev => ({ ...prev, [name]: value }));
  };

  //---------------
  const generateCredential = (field) => {
    if (field === 'loginId') {
      const id = generateLoginId();
      setHostelData(prev => ({ ...prev, loginId: id }));
    } else {
      const pass = generatePassword();
      setHostelData(prev => ({ ...prev, password: pass }));
    }
    toast.success(`New ${field} generated`);
  };

  //---------------
  if (loading || !hostelData) return <Loader text="Fetching details..." loaderNumber={2} />;

  //------------
  const inputClass = (editing) => `
    text-xs md:text-sm w-full p-3 md:p-3.5 rounded-xl border-2 transition-all duration-200 outline-none text-sm md:text-base truncate
    ${editing 
      ? 'border-green-100 bg-white focus:border-green-500 shadow-sm' 
      : 'border-transparent bg-gray-50 text-gray-700 font-medium cursor-not-allowed'}
  `;

  const labelClass = "text-[9px] md:text-[11px] font-bold text-gray-500 ml-1 uppercase text-nowrap";
  const headingClass = "text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-6";

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen ">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="overflow-hidden">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[10px] md:text-sm group text-gray-400 hover:text-green-600 mb-1 md:mb-2 flex items-center gap-2 transition-all font-semibold uppercase tracking-wider"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1"></i> 
            Back to Hostels
          </button>
          <h2 className="text-xl md:text-4xl font-bold text-gray-800 tracking-tight truncate">
            {`${hostelData.id}. ${hostelData.name}`}
          </h2>
        </div>
        
        <button 
          onClick={handleToggleEdit}
          disabled={isSaving}
          className={`w-full md:w-auto px-5 py-3 md:py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-70 text-nowrap text-sm md:text-base ${
            isEditing 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'
          }`}
        >
          {isSaving ? (
             <i className="fa-solid fa-circle-notch animate-spin text-lg"></i>
          ) : (
            <i className={`fa-solid ${isEditing ? 'fa-save' : 'fa-pen-to-square'}`}></i>
          )}
          <span>{isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Update Details')}</span>
        </button>
      </div>

      <div className="bg-white rounded-[25px] md:rounded-[35px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Row 1: General Information */}
        <div className="p-6 md:p-10 border-b border-gray-100">
          <h4 className="text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-green-500"></i> General Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            <div className="space-y-1.5">
              <label className={labelClass}>Hostel Name</label>
              <input name="name" disabled={!isEditing} className={inputClass(isEditing)} value={hostelData.name} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Resident Type</label>
              <input name="residents" disabled={true} className={inputClass(false)} value={hostelData.residents}/>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Students Registered</label>
              <input name="students" type="number" disabled={true} className={inputClass(false)} value={hostelData.students}/>
            </div>
          </div>
        </div>

        {/* Row 2: Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 md:p-10">
            <h4 className={headingClass}>Accountant Contact</h4>
            <div className="space-y-4 md:space-y-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Accountant Email</label>
                <input name="accountantEmail" disabled={!isEditing} type="email" placeholder="hostel@nitkkr.ac.in" className={inputClass(isEditing)} value={hostelData.accountantEmail} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Accountant Phone</label>
                <input name="accountantContactNo" disabled={!isEditing} type="tel" placeholder="70XXXXXXXX" className={inputClass(isEditing)} value={hostelData.accountantContactNo} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 bg-gray-50/20">
            <h4 className={headingClass}>Hostel Contact</h4>
            <div className="space-y-4 md:space-y-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Hostel Email</label>
                <input name="hostelEmail" disabled={!isEditing} required type="email" placeholder="hostel@nitkkr.ac.in" className={inputClass(isEditing)} value={hostelData.hostelEmail} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Hostel Phone</label>
                <input name="hostelContactNo" disabled={!isEditing} type="tel" placeholder="70XXXXXXXX" className={inputClass(isEditing)} value={hostelData.hostelContactNo} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Login Credentials */}
        <div className="p-6 md:p-10 bg-slate-900">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest flex items-center gap-3">
              <i className="fa-solid fa-shield-halved text-green-400"></i>
              Login Credentials
            </h4>
            {isEditing && (
              <span className="text-[9px] md:text-[10px] bg-green-500/20 text-green-400 px-2 md:px-3 py-1 rounded-full border border-green-500/30 whitespace-nowrap">
                Editing Enabled
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
             {/* Login ID Field */}
             <div className="relative group">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block ml-1">Login Identity</label>
              <div className="relative">
                <input 
                  name="loginId"
                  disabled={!isEditing}
                  className={`w-full bg-slate-800/50 p-4 pr-12 rounded-xl font-mono text-green-400 border-2 transition-all outline-none text-sm md:text-base ${
                    isEditing ? 'border-slate-600 focus:border-green-500' : 'border-transparent'
                  }`}
                  value={hostelData.loginId}
                  onChange={handleChange}
                />
                {isEditing && (
                  <button 
                    onClick={() => generateCredential('loginId')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-400 p-2 transition-colors"
                    title="Auto-generate ID"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block ml-1">Access Password</label>
              <div className="relative">
                <input 
                  name="password"
                  type={isEditing ? "text" : "password"}
                  placeholder='Password'
                  disabled={!isEditing}
                  className={`w-full bg-slate-800/50 p-4 pr-12 rounded-xl font-mono text-green-400 border-2 transition-all outline-none text-sm md:text-base ${
                    isEditing ? 'border-slate-600 focus:border-green-500' : 'border-transparent'
                  }`}
                  value={hostelData.password}
                  onChange={handleChange}
                />
                {isEditing && (
                  <button 
                    onClick={() => generateCredential('password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-400 p-2 transition-colors"
                    title="Auto-generate Password"
                  >
                    <i className="fa-solid fa-rotate"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}