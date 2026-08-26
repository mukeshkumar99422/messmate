/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/AuthContext";
import { assets } from "../../assets/assets";
import { verifyEmailSchema } from "../../schemas/auth.schema";
import { validateWithZod } from "../../utils/validateWithZod";

export default function VerifyEmail() {
  const { verifyEmail, auth, loading, resendOtp } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if already logged in and verified
  useEffect(() => {
    if (auth?.isLoggedIn && auth?.isVerified) {
      navigate(`/${auth.role}/home`, { replace: true });
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    otp: ""
  });
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [loadingResend, setLoadingResend] = useState(false);
  
  // Load email from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setFormData({...formData, email: location.state.email});
      setResendTimer(30); // Start timer automatically on load
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  //onchange handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  //form submit handler
  const handleVerify = async (e) => {
    e.preventDefault();

    const {success, errors, data} = validateWithZod(verifyEmailSchema, formData);
    if(!success) {
      setErrors(errors);
      return;
    }

    try {
      await verifyEmail(data);
      toast.success("Email verified successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "OTP Verification failed");
    }
  };

  const handleResendOtp = async () => {
    setLoadingResend(true);

    const {success, errors, data} = validateWithZod(verifyEmailSchema, {email: formData.email, otp: "123456"});
    
    if(!success) {
      setErrors(errors);
      return;
    }

    try {
      await resendOtp(data.email);
      toast.success("OTP resent successfully");
      setResendTimer(30);
      setErrors({}); // Clear previous errors
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    }
    finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-green-100 px-4 font-sans text-gray-800">
      <div className="w-full max-w-100 bg-white p-8 rounded-3xl shadow-xl border border-green-50/50">
        
        {/* --- Header & Logo --- */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 mb-4 transition-shadow hover:shadow-md rounded-full">
             {/* Ensure you have assets.logo3 or similar */}
             <img src={assets.logo3} alt="App Logo" className="h-full w-full object-cover rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Verify Your Email</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium text-center">
             We've sent a 6-digit code to your email. Enter it below to continue.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          
          {/* 1. Email Field (Read-Only) */}
          <div className="relative group opacity-80">
             <i className="fas fa-envelope absolute left-4 top-3.5 text-gray-400 z-10"></i>
             <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none text-sm text-gray-600 cursor-not-allowed font-medium"
             />
             {errors.email && <p className="text-red-500 text-xs ml-1 font-medium">{errors.email}</p>}
          </div>

          {/* 2. OTP Input & Resend Button Container */}
          <div className="space-y-3">
             <div className="flex gap-2">
                 {/* OTP Input */}
                <div className="relative w-full">
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter OTP"
                      maxLength={6}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm text-center tracking-[0.2em] font-bold text-gray-700
                          ${errors.otp ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                    />
                </div>
                
                {/* Resend Button aligned next to input */}
                 <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    // Updated classes to match Login page button style (fixed width, layout)
                    className="whitespace-nowrap px-4 py-3 bg-gray-800 text-white text-xs font-semibold rounded-xl hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-28 shadow-lg shadow-gray-200"
                 >
                    {resendTimer > 0 ? `Wait ${resendTimer}s` : "Resend"}
                 </button>
             </div>
             {/* Error message below the flex container */}
             {errors.otp && <p className="text-red-500 text-xs ml-1 font-medium">{errors.otp}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (loadingResend ? "Sending OTP..." : "Verifying...") : (
                <>
                   <i className="fas fa-check-circle"></i> 
                   Verify Email
                </>
            )}
          </button>
        </form>

        {/* Footer Link back to Login */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Wrong email or need help? 
            <button onClick={() => navigate('/login')} className="text-green-600 font-bold hover:underline ml-1">
              Back to Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}