/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import toast from "react-hot-toast";

//after backend done and services written
import {
    fetchHostelsAPI,
    loginAPI,
    signupAPI,
    logoutAPI,
    verifyEmailAPI,
    resendOtpAPI,
    sendLoginOtpAPI,
    loginWithOtpAPI,
    sendForgotPasswordOtpAPI,
    verifyForgotPasswordOtpAPI,
    resetPasswordAPI,
    changePasswordAPI,
    getMeAPI
} from '../services/backend/authServices';

const AuthContextProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isLoggedIn: false,
        isVerified: false,
        role: null
    });
    const [authReady, setAuthReady] = useState(false);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hostelLoading, setHostelLoading] = useState(false);
    const [hostels, setHostels] = useState([]);

    // --- Fetch Hostels Functionality ---
    const fetchHostels = async () => {
        setHostelLoading(true);
        try {
            const data = await fetchHostelsAPI();
            setHostels(data);
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch hostels");
        } finally {
            setHostelLoading(false);
        }
    };

    // --- Login Functionality (Password) ---
    const login = async ({ identifier, password }) => {
        setLoading(true);
        try {
            if (!identifier || !password) {
                throw new Error("All fields are required");
            }

            // Backend API call
            const userData = await loginAPI({ identifier, password });

            setAuth({
                isLoggedIn: true,
                isVerified: userData.isVerified,
                role: userData.role
            });
            setUser(userData);
            setAuthReady(true);

            return { isVerified: userData.isVerified, role: userData.role };
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Signup Functionality --- students only
    const signup = async ({ name, identifier, hostel, password }) => {
        setLoading(true);
        try {
            if (!name || !identifier || !hostel || !password) {
                throw new Error("All fields are required");
            }

            await signupAPI({ name, identifier, hostel, password });
            
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Verify OTP (Account Verification) --- students only
    const verifyEmail = async ({ email, otp }) => {
        setLoading(true);
        try {
            if (!email || !otp) {
                throw new Error("Email and OTP are required");
            }

            await verifyEmailAPI({ email, otp });

            // If user is partially logged in, complete the login
            if (auth.isLoggedIn) {
                setAuth((prev) => ({ ...prev, isVerified: true }));
                setUser((prev) => ({ ...prev, isVerified: true }));
            }

            return true;
        } catch(error){
            console.error(error);
            throw new Error(error.response?.data?.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Resend OTP --- students only
    const resendOtp = async (email) => {
        setLoading(true);
        try {
            if (!email) throw new Error("Email is required");

            await resendOtpAPI(email);
            
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    // --- Send Login OTP --- students only
    const sendLoginOTP = async (identifier) => {
        setLoading(true);
        try {
            if (!identifier) throw new Error("Please enter your Email or ID first");
            
            await sendLoginOtpAPI(identifier);
            
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    // --- Login with OTP --- students only
    const loginWithOTP = async ({ identifier, otp }) => {
        setLoading(true);
        try {
            if (!identifier || !otp) throw new Error("Please enter the OTP");
            
            const userData = await loginWithOtpAPI({ identifier, otp });

            setAuth({
                isLoggedIn: true,
                isVerified: userData.isVerified,
                role: userData.role
            });
            setUser(userData);

            return { isVerified: userData.isVerified, role: userData.role };
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "OTP Login failed");
        } finally {
            setLoading(false);
        }
    };


    // --- Forgot Password Flow --- students only
    const sendForgotPasswordOtp = async (identifier) => {
        setLoading(true);
        try {
            if (!identifier) throw new Error("Email is required");
            
            await sendForgotPasswordOtpAPI(identifier);
            
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyForgotPasswordOtp = async ({ identifier, otp }) => {
        setLoading(true);
        try {
            await verifyForgotPasswordOtpAPI({ identifier, otp });
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to verify OTP");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async ({ identifier, otp, newPassword }) => {
        setLoading(true);
        try {
            await resetPasswordAPI({ identifier, otp, newPassword });
            
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    // --- Change Password --- students only
    const changePassword = async ({ oldPassword, newPassword }) => {
        setLoading(true);
        try {
            if (!oldPassword || !newPassword) {
                throw new Error("All fields are required");
            }

            await changePasswordAPI({ oldPassword, newPassword });

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    // --- Logout Functionality ---
    const logout = async () => {
        setLoading(true);
        try {
            await logoutAPI();

            setAuth({
                isLoggedIn: false,
                isVerified: false,
                role: null
            });
            setUser(null);
            
            toast.success("Logged out successfully");
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to logout");
        } finally {
            setLoading(false);
        }
    };

    const value = {
        fetchHostels, hostels, hostelLoading,
        auth, authReady,
        user,
        loading,
        setAuth, setUser,
        login,
        sendLoginOTP,
        loginWithOTP,
        signup,
        verifyEmail,
        resendOtp,
        logout,
        changePassword,
        sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword
    };
    
    // Check if user is logged in from previous session
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Try to fetch the user profile using the httpOnly cookie
                const userData = await getMeAPI();
                
                setAuth({
                    isLoggedIn: true,
                    isVerified: userData.isVerified,
                    role: userData.role
                });
                setUser(userData);
            } catch (error) {
                console.log("No active session found.");
            } finally {
                setAuthReady(true);
            }
        };

        fetchHostels();
        checkSession();
        
    }, []);

    return (
        <AuthContext.Provider value={value}>
            {children} 
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;