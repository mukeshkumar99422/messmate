/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/AuthContext";
import { assets } from "../../assets/assets";

export default function Signup() {
  const { signup, loading, auth, hostels, fetchHostels } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- States ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hostel: "",
    password: "",
    c_password: ""
  });

  const [errors, setErrors] = useState({});

  // --- Effects ---
  
  // Redirect if logged in
  useEffect(() => {
    if (auth?.isLoggedIn && auth?.isVerified) {
      navigate(`/${auth.role}/home`, { replace: true });
    }
  }, [auth, navigate]);

  // Fetch hostels on mount
  useEffect(() => {
    fetchHostels();
  }, []); 

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear specific error when user starts typing again
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) newErrors.name = "Name is required";

    // Email validation (Check domain, but keep ID format loose for flexibility)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@nitkkr\.ac\.in$/;
    if (!formData.email) {
        newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please use your official @nitkkr.ac.in email";
    }

    // Hostel validation
    if (!formData.hostel) newErrors.hostel = "Please select your hostel";

    // Password validation
    const PassRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!formData.password) {
        newErrors.password = "Password is required";
    } else if (!PassRegex.test(formData.password.trim())) {
        newErrors.password = "Password must contain atleas 8 characters and atleast one special character";
    }

    // Confirm Password validation
    if (formData.password !== formData.c_password) {
        newErrors.c_password = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        hostel: formData.hostel,
        password: formData.password
      });

      toast.success("Signup successful! Please verify OTP.");
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-green-100 px-4 font-sans text-gray-800 py-10">
      <div className="w-full max-w-105 bg-white p-8 rounded-3xl shadow-xl border border-green-50/50">
        
        {/* --- Header & Logo --- */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 mb-4 transition-shadow hover:shadow-md rounded-full">
             <img src={assets.logo3} alt="App Logo" className="h-full w-full object-cover rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">
             Join Mess Mate today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 1. Name */}
          <div className="relative group">
             <i className="fas fa-user absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"></i>
             <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm
                    ${errors.name ? "border-red-500 bg-red-50" : "border-gray-200"}`}
             />
          </div>
          {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name}</p>}

          {/* 2. Email */}
          <div className="relative group">
             <i className="fas fa-envelope absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"></i>
             <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="College Email (@nitkkr.ac.in)"
                className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm
                    ${errors.email ? "border-red-500 bg-red-50" : "border-gray-200"}`}
             />
          </div>
          {errors.email && <p className="text-red-500 text-xs ml-1 font-medium">{errors.email}</p>}

          {/* 3. Hostel Select */}
          <div className="relative group">
             <i className="fas fa-building absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"></i>
             <select
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                className={`w-full pl-11 pr-10 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer text-sm text-gray-700
                    ${errors.hostel ? "border-red-500 bg-red-50" : "border-gray-200"}
                    ${!formData.hostel ? "text-gray-400" : ""}`} // Pale text if placeholder
             >
                <option value="" disabled>Select Hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id} className="text-gray-700">
                    {`Hostel - ${hostel.id}, ${String(hostel.residents).toUpperCase()}`}
                  </option>
                ))}
             </select>
             {/* Custom Dropdown Arrow */}
             <i className="fas fa-chevron-down absolute right-4 top-4 text-xs text-gray-400 pointer-events-none"></i>
          </div>
          {errors.hostel && <p className="text-red-500 text-xs ml-1 font-medium">{errors.hostel}</p>}

          {/* 4. Password */}
          <div className="relative group">
             <i className="fas fa-lock absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"></i>
             <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full pl-11 pr-11 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm
                    ${errors.password ? "border-red-500 bg-red-50" : "border-gray-200"}`}
             />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-green-600 transition-colors focus:outline-none"
             >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
             </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs ml-1 font-medium">{errors.password}</p>}

          {/* 5. Confirm Password */}
          <div className="relative group">
             <i className="fas fa-lock absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"></i>
             <input
                type={showConfirmPassword ? "text" : "password"}
                name="c_password"
                value={formData.c_password}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`w-full pl-11 pr-11 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm
                    ${errors.c_password ? "border-red-500 bg-red-50" : "border-gray-200"}`}
             />
             <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-green-600 transition-colors focus:outline-none"
             >
                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
             </button>
          </div>
          {errors.c_password && <p className="text-red-500 text-xs ml-1 font-medium">{errors.c_password}</p>}


          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing up..." : (
                <>
                   <i className="fas fa-user-plus"></i> 
                   Create Account
                </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Already have an account? 
            <Link to="/login" className="text-green-600 font-bold hover:underline ml-1">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}