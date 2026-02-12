import { useState, useContext } from 'react';
import AdminContext from '../../context/AdminContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { generateIdPass } from '../../utils/helpers';

export default function AddHostel()  {
  const navigate = useNavigate();
  const { addHostel } = useContext(AdminContext);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', 
    residents: 'boys', 
    students: '0',
    accountantEmail: '', 
    accountantContactNo: '',
    hostelEmail: '',
    hostelContactNo: '',
    loginId: '', 
    password: ''
  });

  const generateCredentials = () => {
    const credentials = generateIdPass();
    
    setFormData(prev => ({ 
      ...prev, 
      loginId: credentials[0], 
      password: credentials[1] 
    }));
    toast.success("Credentials Generated");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addHostel(formData);
      toast.success("Hostel Added Successfully");
    } catch (error) {
      toast.error(error.message || "Failed to add hostel");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full p-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-green-500 transition-all duration-200 outline-none text-xs md:text-base text-gray-700";
  const labelClass = "text-[9px] md:text-[11px] font-bold text-gray-500 ml-1 uppercase text-nowrap";
  const headingClass = "text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-6";

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-[10px] md:text-sm group text-gray-400 hover:text-green-600 mb-1 flex items-center gap-2 transition-all font-semibold uppercase tracking-widest"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1"></i> 
            Back
          </button>
          <h2 className="text-xl md:text-4xl font-bold text-gray-800 tracking-tight truncate">Add New Hostel</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[25px] md:rounded-[35px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Section 1: General Information */}
        <div className="p-6 md:p-10 border-b border-gray-100">
          <h4 className="text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-green-500"></i> General Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <div className="space-y-1.5">
              <label className={labelClass}>Hostel Name <span className='text-red-500'>*</span></label>
              <input required type="text" placeholder="e.g. Chakardhar Bhawan" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Resident Type <span className='text-red-500'>*</span></label>
              <select required className={inputClass} value={formData.residents} onChange={e => setFormData({...formData, residents: e.target.value})}>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Students Registered</label>
              <input disabled placeholder="Non - editable" className={inputClass}/>
            </div>
          </div>
        </div>

        {/* Section 2: Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Accountant */}
          <div className="p-6 md:p-10">
            <h4 className={headingClass}>Accountant Contact</h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Accountant Email</label>
                <input type="email" placeholder="accountant@nitkkr.ac.in" className={inputClass} value={formData.accountantEmail} onChange={e => setFormData({...formData, accountantEmail: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Accountant Phone</label>
                <input type="tel" placeholder="70XXXXXXXX" className={inputClass} value={formData.accountantContactNo} onChange={e => setFormData({...formData, accountantContactNo: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Official */}
          <div className="p-6 md:p-10 bg-gray-50/20">
            <h4 className={headingClass}>Hostel Contact</h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Hostel Email <span className='text-red-500'>*</span></label>
                <input required type="email" placeholder="hostel@nitkkr.ac.in" className={inputClass} value={formData.hostelEmail} onChange={e => setFormData({...formData, hostelEmail: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Accountant Phone</label>
                <input type="tel" placeholder="70XXXXXXXX" className={inputClass} value={formData.hostelContactNo} onChange={e => setFormData({...formData, hostelContactNo: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Credentials (Dark UI) */}
        <div className="p-6 md:p-10 bg-slate-900">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest flex items-center gap-3">
              <i className="fa-solid fa-shield-halved text-green-400"></i> Security Credentials
            </h4>
            <button 
              type="button" 
              onClick={generateCredentials} 
              className="text-[10px] md:text-xs bg-green-500/10 text-green-400 px-4 py-2 rounded-xl border border-green-500/30 hover:bg-green-500 hover:text-white transition-all font-bold"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Generate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Account Login ID <span className='text-red-500'>*</span></label>
              <input required type="text" className="w-full bg-slate-800/50 p-4 rounded-xl font-mono text-green-400 border-2 border-transparent focus:border-green-500 outline-none transition-all" value={formData.loginId} onChange={e => setFormData({...formData, loginId: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">System Password <span className='text-red-500'>*</span></label>
              <input required type="text" className="w-full bg-slate-800/50 p-4 rounded-xl font-mono text-green-400 border-2 border-transparent focus:border-green-500 outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Submit Area */}
        <div className="p-6 md:p-8 bg-gray-100 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full md:w-fit float-right px-12 py-4 rounded-2xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <i className="fa-solid fa-circle-notch animate-spin text-lg"></i>
            ) : (
              <i className="fa-solid fa-plus-circle"></i>
            )}
            <span>{isSaving ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};