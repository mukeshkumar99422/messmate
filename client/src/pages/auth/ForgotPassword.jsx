import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/AuthContext";
import { forgotPasswordSchema } from "../../schemas/auth.schema";
import { validateWithZod } from "../../utils/validateWithZod";

export default function ForgotPassword() {
  const { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    otp: "",
    new: "",
    confirm: "",
  })
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);  // Steps: 1=identifier, 2=OTP, 3=New Password
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  //handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // --------form submit handlers------------

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    const {success, errors, data} = validateWithZod(forgotPasswordSchema, {identifier: formData.identifier, otp: "123456", new: "12!@qwQW", confirm: "12!@qwQW"});
    if(!success) {
      setErrors(errors);
      return;
    }

    try {
      await sendForgotPasswordOtp(data.identifier);
      setStep(2);
      setTimer(30);
      toast.success("OTP sent to your email");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const {success, errors, data} = validateWithZod(forgotPasswordSchema, {identifier: formData.identifier, otp: formData.otp, new: "12!@qwQW", confirm: "12!@qwQW"});
    if(!success) {
      setErrors(errors);
      return;
    }

    try {
      await verifyForgotPasswordOtp({ identifier: data.identifier, otp: data.otp });
      setStep(3);
      toast.success("OTP Verified");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const {success, errors, data} = validateWithZod(forgotPasswordSchema, {identifier: formData.identifier, otp: formData.otp, new: formData.new, confirm: formData.confirm});
    if(!success) {
      setErrors(errors);
      return;
    }

    try {
      await resetPassword({ identifier: data.identifier, otp: data.otp, newPassword: data.new });
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();

    const {success, errors} = validateWithZod(forgotPasswordSchema, {identifier: formData.identifier, otp: "123456", new: "12!@qwQW", confirm: "12!@qwQW"});
    if(!success) {
      setErrors(errors);
      return;
    }

    try {
      await sendForgotPasswordOtp(formData.identifier);
      setTimer(30);
      toast.success("OTP Resent");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-green-100 px-4 font-sans text-gray-800">
      <div className="w-full max-w-100 bg-white p-8 rounded-3xl shadow-xl border border-green-50/50">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 mb-4 transition-shadow hover:shadow-md rounded-full bg-green-50 flex items-center justify-center text-green-600 text-2xl">
             {step === 1 && <i className="fas fa-key"></i>}
             {step === 2 && <i className="fas fa-envelope-open-text"></i>}
             {step === 3 && <i className="fas fa-lock"></i>}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium text-center px-4">
            {step === 1 && "Enter your email to receive a reset code."}
            {step === 2 && `Enter the code sent to ${formData.identifier}`}
            {step === 3 && "Create a strong new password."}
          </p>
        </div>

        {/* --- STEP 1: identifier --- */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative group">
               <i className="fas fa-envelope absolute left-4 top-3.5 text-gray-400 z-10"></i>
               <input
                  type="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Enter your registered email or ID"
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm
                      ${errors.identifier ? "border-red-500 bg-red-50" : "border-gray-200"}`}
               />
            </div>
            {errors.identifier && <p className="text-red-500 text-xs ml-1 font-medium">{errors.identifier}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 flex justify-center items-center gap-2 mt-2"
            >
              {loading ? "Loading..." : "Send OTP"} <i className="fas fa-arrow-right"></i>
            </button>
          </form>
        )}

        {/* --- STEP 2: OTP --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
             <div className="flex gap-2">
                <input 
                   type="text" 
                   name="otp"
                   value={formData.otp}
                   onChange={handleChange}
                   placeholder="6-digit Code"
                   maxLength={6}
                   className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-center tracking-widest font-bold text-lg
                        ${errors.otp ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
             </div>
             {errors.otp && <p className="text-red-500 text-xs ml-1 font-medium -mt-3">{errors.otp}</p>}
             
             <div className="flex justify-between items-center text-xs font-medium">
               <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800">
                 Change Email
               </button>
               {timer > 0 ? (
                 <span className="text-gray-400">Resend in {timer}s</span>
               ) : (
                 <button type="button" onClick={handleResend} className="text-green-600 hover:underline">
                   Resend Code
                 </button>
               )}
             </div>

             <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 flex justify-center items-center gap-2"
            >
              {loading ? "Loading..." : "Verify Code"}
            </button>
          </form>
        )}

        {/* --- STEP 3: RESET --- */}
        {step === 3 && (
           <form onSubmit={handleResetPassword} className="space-y-4">
             {/* New Password */}
             <div className="relative group">
                <i className="fas fa-lock absolute left-4 top-3.5 text-gray-400 z-10"></i>
                <input
                    type={showPass ? "text" : "password"}
                    name="new"
                    value={formData.new}
                    onChange={handleChange}
                    placeholder="New Password"
                    className={`w-full pl-11 pr-11 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm
                        ${errors.new ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
                <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-green-600 transition-colors focus:outline-none"
                >
                    <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
                {errors.new && <p className="text-red-500 text-xs ml-1 font-medium mt-1">{errors.new}</p>}
             </div>

             {/* Confirm Password */}
             <div className="relative group">
                <i className="fas fa-lock absolute left-4 top-3.5 text-gray-400 z-10"></i>
                <input
                    type={showConfirmPass ? "text" : "password"}
                    name="confirm"
                    value={formData.confirm}
                    onChange={handleChange}
                    placeholder="Confirm New Password"
                    className={`w-full pl-11 pr-11 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm
                        ${errors.confirm ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-green-600 transition-colors focus:outline-none"
                >
                    <i className={`fas ${showConfirmPass ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
                {errors.confirm && <p className="text-red-500 text-xs ml-1 font-medium mt-1">{errors.confirm}</p>}
             </div>

             <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 flex justify-center items-center gap-2 mt-2"
            >
              {loading ? "Loading..." : "Reset Password"} <i className="fas fa-check"></i>
            </button>
           </form>
        )}

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2">
            <i className="fas fa-arrow-left text-xs"></i> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}