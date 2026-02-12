import { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import StudentContext from "../../context/StudentContext";
import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

export default function ProfilePopup({ onClose }) {
  const { user, logout} = useContext(AuthContext);
  const { loading } = useContext(StudentContext); 
  // const navigate = useNavigate();

  // Functionality when component mounts and unmounts
  useEffect(() => {
    // Close on ESC key press
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);

    // Scroll lock
    document.body.style.overflow = "hidden";

    // Cleanup on unmount
    return () => {
        window.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "auto";
    }
  }, [onClose]);

  const handleLogout = async () => {
    logout();
    onClose();
  };

  if (!user) return null;

  return (
    // 1. OVERLAY: Make this scrollable (overflow-y-auto)
    <div 
      className="fixed inset-0 z-100 overflow-y-auto bg-slate-700/60 "
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* 2. WRAPPER: Ensures centering, but allows expansion when zoomed */}
      <div className="flex min-h-full items-center justify-center p-4">
        
        {/* 3. MODAL: No fixed height. Let it grow naturally. */}
        <div 
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all relative"
          onClick={(e) => e.stopPropagation()} 
        >
          
          {/* --- Header Section --- */}
          <div className="relative bg-linear-to-r from-emerald-600 to-green-500 px-6 py-8 text-center">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              aria-label="Close profile"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center text-emerald-600 text-3xl font-bold shadow-lg border-4 border-white/30">
              {user.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
            </div>
            <h2 className="mt-3 text-xl font-bold text-white tracking-wide">
              {user.name}
            </h2>
            <p className="text-emerald-100 text-sm font-medium opacity-90">
              Student Profile
            </p>
          </div>

          {/* --- Content Body --- */}
          {/* Removed max-h and overflow-y-auto from here so the WHOLE modal scrolls if needed */}
          <div className="px-6 py-6 space-y-6">
            
            {/* Read-Only Info */}
            <div className="space-y-4">
              <InfoItem icon="fa-solid fa-id-card" label="Email" value={user.identifier} />
              <InfoItem icon="fa-solid fa-user-graduate" label="Role" value="Student" />
            </div>

            <hr className="border-gray-100" />

            {/* Editable Sections */}
            <div className="space-y-4">
              <HostelSection currentHostel={user.hostelId} hostelName={user.hostelName} />
              <PasswordSection />
            </div>
          </div>

          {/* --- Footer --- */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <i className="fa-solid fa-right-from-bracket"></i>
              )}
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Sub-Components ----------------

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
        <i className={`${icon} text-lg`}></i>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-gray-700 text-sm font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

function HostelSection({ currentHostel, hostelName }) {
  const { changeHostel, loading} = useContext(StudentContext);
  const {hostels} = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(currentHostel || "");

  const handleSubmit = async () => {
    if (!selectedHostel) return;
    try {
      await changeHostel(selectedHostel);
      toast.success("Hostel updated successfully");
      setIsOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors shrink-0 ${isOpen ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            <i className="fa-solid fa-building"></i>
          </div>
          <div>
            <p className="font-medium text-gray-700 text-sm">Hostel Allocation</p>
            <p className="text-xs text-gray-400">{`Hostel - ${currentHostel}, ${hostelName.toUpperCase()}`}</p>
          </div>
        </div>
        <i className={`fa-solid fa-chevron-right text-gray-400 text-xs transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}></i>
      </button>

      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600 focus:shadow-[0_0_8px_rgba(22,163,74,0.3)] transition-all cursor-pointer"
              >
                <option value="" disabled>Select a hostel</option>
                {hostels.map((hostel,index) => (
                  <option key={index} value={hostel.id}>{`Hostel - ${hostel.id}, ${String(hostel.residents).toUpperCase()}`}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedHostel}
              className="px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center min-w-12"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <i className="fa-solid fa-check"></i>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordSection() {
  const { changePassword, loading } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ oldPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: ""
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    if (name === "newPassword") {
        setErrors({
        ...errors,
        newPassword: validatePassword(value)
        });
    }
  };


    const validatePassword = (password) => {
        const regex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        return regex.test(password)
            ? ""
            : "Minimum 8 characters with at least one special character";
    };

    const handleSubmit = async () => {
        const newPassErr = validatePassword(data.newPassword);

        if (!data.oldPassword || newPassErr) {
            setErrors({
            ...errors,
            newPassword: newPassErr
            });
            return;
        }

        try {
            await changePassword(data);
            toast.success("Password updated");
            setData({ oldPassword: "", newPassword: "" });
            setErrors({ oldPassword: "", newPassword: "" });
            setIsOpen(false);
        } catch (err) {
            toast.error(err.message);
        }
    };


  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors shrink-0 ${isOpen ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            <i className="fa-solid fa-key"></i>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-700 text-sm">Security</p>
            <p className="text-xs text-gray-400">Change password</p>
          </div>
        </div>
        <i className={`fa-solid fa-chevron-right text-gray-400 text-xs transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}></i>
      </button>

      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
          <Input 
            type="password" 
            name="oldPassword" 
            placeholder="Current Password" 
            value={data.oldPassword} 
            onChange={handleChange} 
            error={errors.oldPassword}
          />
          <Input 
            type="password" 
            name="newPassword" 
            placeholder="New Password" 
            value={data.newPassword} 
            onChange={handleChange} 
            error={errors.newPassword}
          />
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-emerald-400 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <>
      <input
        {...props}
        className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg text-sm
          ${error ? "border-red-500" : "border-gray-300"}
          focus:outline-none focus:border-green-600
          focus:shadow-[0_0_8px_rgba(22,163,74,0.3)]
          transition-all`}
      />
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </>
  );
}
