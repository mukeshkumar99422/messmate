import { useState, useContext } from 'react';
import AdminContext from '../../context/AdminContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { generateIdPass } from '../../utils/helpers';
import { createHostelSchema } from '../../schemas/admin.schema';
import { validateWithZod } from '../../utils/validateWithZod';

export default function AddHostel()  {
  const navigate = useNavigate();
  const { addHostel } = useContext(AdminContext);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
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

  //----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  //------------
  const generateCredentials = () => {
    const credentials = generateIdPass();
    
    setFormData(prev => ({ 
      ...prev, 
      loginId: credentials[0], 
      password: credentials[1] 
    }));
    toast.success("Credentials Generated");
  };

  //----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const {success, errors, data} = validateWithZod(createHostelSchema, formData);
    if(!success) {
      setErrors(errors);
      setIsSaving(false);
      return;
    }
    
    try {
      await addHostel(data);
      toast.success("Hostel Added Successfully");
    } catch (error) {
      toast.error(error.message || "Failed to add hostel");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (error) => `w-full p-3.5 rounded-xl border-2 ${error ? "border-red-400 bg-red-50 text-red-600 focus:border-red-600" : "border-gray-100 bg-gray-50  text-gray-700 focus:bg-white focus:border-green-500"}  transition-all duration-200 outline-none text-xs md:text-base`;
  const credentialInputClass = (error) => `w-full p-4 rounded-xl font-mono border-2 ${error ? "border-red-400 bg-red-50 text-red-600 focus:border-red-600" : "border-transparent bg-slate-800/50 text-green-400 focus:border-green-500 focus:bg-slate-900"} outline-none transition-all`;
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
              <label htmlFor='hostel-name' className={labelClass}>Hostel Name <span className='text-red-500'>*</span></label>
              <input id='hostel-name' name='name' required type="text" placeholder="e.g. Chakardhar Bhawan" className={inputClass(errors.name)} value={formData.name} onChange={handleChange} />
              {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor='resident-type' className={labelClass}>Resident Type <span className='text-red-500'>*</span></label>
              <select id='resident-type' name='residents' required className={inputClass(errors.residents)} value={formData.residents} onChange={handleChange}>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
              {errors.residents && <p className="text-red-500 text-xs mt-1 ml-1">{errors.residents}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor='students-registered' className={labelClass}>Students Registered</label>
              <input id='students-registered' name='students' disabled placeholder="Non - editable" className={inputClass(errors.students)} value={formData.students} onChange={handleChange} />
              {errors.students && <p className="text-red-500 text-xs mt-1 ml-1">{errors.students}</p>}
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
                <label htmlFor='acc-email' className={labelClass}>Accountant Email</label>
                <input id='acc-email' name='accountantEmail' type="email" placeholder="accountant@nitkkr.ac.in" className={inputClass(errors.accountantEmail)} value={formData.accountantEmail} onChange={handleChange} />
                {errors.accountantEmail && <p className="text-red-500 text-xs mt-1 ml-1">{errors.accountantEmail}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor='acc-phone' className={labelClass}>Accountant Phone</label>
                <input id='acc-phone' name='accountantContactNo' type="tel" placeholder="70XXXXXXXX" className={inputClass(errors.accountantContactNo)} value={formData.accountantContactNo} onChange={handleChange} />
                {errors.accountantContactNo && <p className="text-red-500 text-xs mt-1 ml-1">{errors.accountantContactNo}</p>}
              </div>
            </div>
          </div>

          {/* Official */}
          <div className="p-6 md:p-10 bg-gray-50/20">
            <h4 className={headingClass}>Hostel Contact</h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor='hostel-email' className={labelClass}>Hostel Email <span className='text-red-500'>*</span></label>
                <input id='hostel-email' name='hostelEmail' required type="email" placeholder="hostel@nitkkr.ac.in" className={inputClass(errors.hostelEmail)} value={formData.hostelEmail} onChange={handleChange} />
                {errors.hostelEmail && <p className="text-red-500 text-xs mt-1 ml-1">{errors.hostelEmail}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor='hostel-phone' className={labelClass}>Hostel Phone</label>
                <input id='hostel-phone' name='hostelContactNo' type="tel" placeholder="70XXXXXXXX" className={inputClass(errors.hostelContactNo)} value={formData.hostelContactNo} onChange={handleChange} />
                {errors.hostelContactNo && <p className="text-red-500 text-xs mt-1 ml-1">{errors.hostelContactNo}</p>}
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
              <label htmlFor='acc-login-id' className="text-[10px] font-black text-slate-500 uppercase ml-1">Account Login ID <span className='text-red-500'>*</span></label>
              <input id='acc-login-id' name='loginId' required type="text" className={credentialInputClass(errors.loginId)} value={formData.loginId} onChange={handleChange} />
              {errors.loginId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.loginId}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor='acc-pass' className="text-[10px] font-black text-slate-500 uppercase ml-1">System Password <span className='text-red-500'>*</span></label>
              <input id='acc-pass' name='password' required type="text" className={credentialInputClass(errors.password)} value={formData.password} onChange={handleChange} />
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
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