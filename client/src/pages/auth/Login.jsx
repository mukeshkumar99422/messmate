/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/AuthContext";
import { assets } from "../../assets/assets";
import { toastWarn } from "../../utils/helpers";

export default function Login() {
  const { login, loginWithOTP, sendLoginOTP, loading, auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- States ---
  const [loginMethod, setLoginMethod] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    otp: ""
  });

  const [errors, setErrors] = useState({});

  // --- redirect to home,dashboard if user is already loged in ---
  useEffect(() => {
    if (auth?.isLoggedIn && auth?.isVerified) {
      navigate(`/${auth.role}/home`, { replace: true });
    }
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const toggleMethod = (method) => {
    setLoginMethod(method);
    setErrors({});
    if (method === "password") {
        setOtpSent(false);
        setTimer(0);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.identifier.trim()) {
        setErrors({ identifier: "Enter Email or ID to receive OTP" });
        return;
    }
    try {
        await sendLoginOTP(formData.identifier);
        setOtpSent(true);
        setTimer(30);
        toast.success("OTP sent successfully!");
    } catch (err) {
        toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.identifier.trim()) newErrors.identifier = "Email or ID is required";
    if (loginMethod === "password" && !formData.password) newErrors.password = "Password is required";
    if (loginMethod === "otp" && !formData.otp) newErrors.otp = "Please enter the OTP";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    try {
      let res;
      if (loginMethod === "password") {
        res = await login({ 
            identifier: formData.identifier, 
            password: formData.password 
        });
      } else {
        res = await loginWithOTP({
            identifier: formData.identifier,
            otp: formData.otp
        });
      }

      if (!res.isVerified) {
        toastWarn("Account not verified");
        navigate("/verify-email", { state: { email: formData.identifier } });
        return;
      }
      
      navigate(`/${res.role}/home`, { replace: true });
      toast.success("Login successful!");

    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-green-100 px-4 font-sans text-gray-800">
      <div className="w-full max-w-100 bg-white p-8 rounded-3xl shadow-xl border border-green-50/50">
        
        {/* --- Header & Logo --- */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 mb-4 transition-shadow hover:shadow-md rounded-full">
             <img src={assets.logo3} alt="Mess Mate Logo" className="h-full w-full object-cover rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">
             {loginMethod === "password" ? "Sign in to continue" : "Password-less Login"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Identifier Input */}
          <div className="relative group">
             <i className="fas fa-user absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"></i>
             <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder={loginMethod==="otp" ? "Student Email" : "Student Email or Accountant ID"}
                className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm
                    ${errors.identifier ? "border-red-500 bg-red-50" : "border-gray-200"}`}
             />
          </div>
          {errors.identifier && <p className="text-red-500 text-xs ml-1 font-medium">{errors.identifier}</p>}

          {/* --- CONDITIONAL UI --- */}
          
          {loginMethod === "password" ? (
            /* PASSWORD FLOW */
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
               {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
               
               {/* Separated Links */}
               <div className="flex justify-between items-center mt-3 px-1">
                 <button 
                    type="button"
                    onClick={() => toggleMethod("otp")}
                    className="text-xs font-semibold text-gray-500 hover:text-green-700 transition-colors"
                 >
                    Login via OTP
                 </button>
                 <Link 
                    to="/forgot-password"
                    className="text-xs font-semibold text-green-600 hover:text-green-800 hover:underline transition-colors"
                 >
                    Forgot Password?
                 </Link>
               </div>
            </div>

          ) : (
            /* OTP FLOW */
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
               <div className="flex gap-2">
                  <div className="relative w-full">
                     <input 
                        type="text" 
                        name="otp" 
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        disabled={!otpSent}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm text-center tracking-[0.2em] font-bold text-gray-700
                           ${errors.otp ? "border-red-500 bg-red-50" : "border-gray-200"}
                           ${!otpSent ? "opacity-60 cursor-not-allowed" : ""}`} 
                     />
                  </div>
                  <button 
                     type="button"
                     onClick={handleSendOTP}
                     disabled={timer > 0 || loading}
                     className="whitespace-nowrap px-4 py-2 bg-gray-800 text-white text-xs font-semibold rounded-xl hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-28 shadow-lg shadow-gray-200"
                  >
                     {timer > 0 ? `Wait ${timer}s` : (otpSent ? "Resend" : "Get OTP")}
                  </button>
               </div>
               {errors.otp && <p className="text-red-500 text-xs ml-1 font-medium">{errors.otp}</p>}

               <div className="flex justify-end">
                 <button 
                    type="button"
                    onClick={() => toggleMethod("password")}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
                 >
                    <i className="fas fa-arrow-left text-[10px]"></i> Back to Password
                 </button>
               </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Loading..." : (
                <>
                   <i className={`fas ${loginMethod === 'otp' ? 'fa-key' : 'fa-sign-in-alt'}`}></i> 
                   {loginMethod === 'otp' ? 'Verify & Login' : 'Secure Login'}
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Don’t have an account? 
            <Link to="/signup" className="text-green-600 font-bold hover:underline ml-1">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}