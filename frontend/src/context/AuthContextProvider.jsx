/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import toast from "react-hot-toast";
import { memoryAccessToken, refreshAccessToken, setMemoryToken } from '../services/backend/api';

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
import { getApiError } from "../utils/helpers";

const AuthContextProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isLoggedIn: false,
        isVerified: false,
        role: null
    });
    const [authReady, setAuthReady] = useState(false);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
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
            throw getApiError(error);
        } finally {
            setHostelLoading(false);
        }
    };

    // --- Login Functionality (Password) ---
    const login = async ({ identifier, password }) => {
        setLoading(true);
        try {
            // Backend API call
            const userData = await loginAPI({ identifier, password });

            // Save access token securely in our axios client closure memory space
            setMemoryToken(userData.accessToken);

            setAuth({
                isLoggedIn: true,
                isVerified: userData.isVerified,
                role: userData.role
            });
            setUser(userData);
            setAuthReady(true);

            return { isVerified: userData.isVerified, role: userData.role };
        } catch (error) {
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Signup Functionality --- students only
    const signup = async ({ name, identifier, hostel, password }) => {
        setLoading(true);
        try {
            await signupAPI({ name, identifier, hostel, password });
            
            return true;
        } catch (error) {
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Verify OTP (Account Verification) --- students only
    const verifyEmail = async ({ email, otp }) => {
        setLoading(true);
        try {
            await verifyEmailAPI({ email, otp });
            return true;
        } catch(error){
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Resend OTP --- students only
    const resendOtp = async (email) => {
        setLoading(true);
        try {
            await resendOtpAPI(email);
            
            return true;
        } catch (error) {
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Send Login OTP ---
    const sendLoginOTP = async (identifier) => {
        setLoading(true);
        try {
            await sendLoginOtpAPI(identifier);
            
            return true;
        } catch (error) {
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Login with OTP ---
    const loginWithOTP = async ({ identifier, otp }) => {
        setLoading(true);
        try {
            const userData = await loginWithOtpAPI({ identifier, otp });

            setMemoryToken(userData.accessToken);
            setAuth({
                isLoggedIn: true,
                isVerified: userData.isVerified,
                role: userData.role
            });
            setUser(userData);

            return { isVerified: userData.isVerified, role: userData.role };
        } catch (error) {
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };


    // --- Forgot Password Flow ---
    const sendForgotPasswordOtp = async (identifier) => {
        setLoading(true);
        try {
            await sendForgotPasswordOtpAPI(identifier);
            
            return true;
        } catch (error) {
            throw getApiError(error);
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
            throw getApiError(error);
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
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Change Password --- students only
    const changePassword = async ({ oldPassword, newPassword }) => {
        setLoading(true);
        try {
            const response = await changePasswordAPI({ oldPassword, newPassword });
            
            if (response && response.accessToken) {
                setMemoryToken(response.accessToken);
            }

            return true;
        } catch (error) {
            throw getApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Logout Functionality ---
    const logout = async () => {
        setIsLoggingOut(true);
        setLoading(true);
        try {
            await logoutAPI();

            setAuth({
                isLoggedIn: false,
                isVerified: false,
                role: null
            });
            setUser(null);
            setMemoryToken(null);
            
            toast.success("Logged out successfully");
            return true;
        } catch (error) {
            toast.error(getApiError(error).message || "Failed to logout");
        } finally {
            setLoading(false);
            setIsLoggingOut(false);
        }
    };

    const value = {
        fetchHostels, hostels, hostelLoading,
        auth, authReady,
        user,
        loading,
        isLoggingOut,
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
                // try to initialize existing session(access token)
                await refreshAccessToken();

                // get current user data(using access token)
                const userData = await getMeAPI();
                
                setAuth({
                    isLoggedIn: true,
                    isVerified: userData.isVerified,
                    role: userData.role
                });
                setUser(userData);
            } catch (error) {
                setAuth({ isLoggedIn: false, isVerified: false, role: null });
                setUser(null);
            } finally {
                setAuthReady(true);
            }
        };

        const bootstrap = async () => {
            try { await fetchHostels(); } catch (e) { console.error('Hostels fetch failed', e); }
            await checkSession();
        };
        bootstrap();
        
    }, []);


    useEffect(() => {
        const handleSessionExpired = () => {
            setAuth({ isLoggedIn: false, isVerified: false, role: null });
            setUser(null);
            setMemoryToken(null);
        };
    
        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, []);

    return (
        <AuthContext.Provider value={value}>
            {children}
            {/* stop any activity during logging out */}
            {isLoggingOut && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0)',
                    touchAction: 'none',
                    pointerEvents: 'auto'
                }} />
            )}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;