/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { dummyUser, dummyHostels } from "../assets/dummyData";

//after backend done and services written
import {} from '../services/backend/authServices'
import toast from "react-hot-toast";

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
    const [hostels, setHostels] = useState(dummyHostels);

    // --- Helper: Determine Role based on Input ---
    const determineRoleFromBackend = (identifier) => {
        if(identifier=='admin') return "admin";

        // Rule: Email (@) = Student, ID (No @) = Accountant
        return identifier.includes("@") ? "student" : "accountant";
    };

    // --- Fetch Hostels Functionality ---
    const fetchHostels = async () => {
        setHostelLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 500));
            setHostels(dummyHostels);
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to fetch hostels");
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

            // Backend API call simulation
            await new Promise((res) => setTimeout(res, 800));

            // Determine Role
            const detectedRole = determineRoleFromBackend(identifier);

            // Create User Data (Mock)
            const userData = { ...dummyUser, identifier: identifier, role: detectedRole };
            const isVerified = userData.isVerified;

            // Update State
            setAuth({
                isLoggedIn: true,
                isVerified: isVerified,
                role: detectedRole
            });
            setUser(userData);
            setAuthReady(true);

            return { isVerified: isVerified, role: detectedRole };
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Send Login OTP --- students only
    const sendLoginOTP = async (identifier) => {
        setLoading(true);
        try {
            if (!identifier) throw new Error("Please enter your Email or ID first");
            
            await new Promise((res) => setTimeout(res, 600));
            
            console.log(`Login OTP sent to ${identifier}`);
            return true;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // --- Login with OTP --- students only
    const loginWithOTP = async ({ identifier, otp }) => {
        setLoading(true);
        try {
            if (!identifier || !otp) throw new Error("Please enter the OTP");
            
            await new Promise((res) => setTimeout(res, 800));

            if (otp !== "123456") throw new Error("Invalid OTP");

            // Determine Role
            const detectedRole = determineRoleFromBackend(identifier);

            // Create User Data
            const userData = { ...dummyUser, identifier: identifier, role: detectedRole };
            
            // Assume OTP login always verifies the user
            const isVerified = true; 

            setAuth({
                isLoggedIn: true,
                isVerified: isVerified,
                role: detectedRole
            });
            setUser(userData);

            return { isVerified: isVerified, role: detectedRole };
        } catch (error) {
            console.log(error);
            throw new Error(error.message || "OTP Login failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Signup Functionality --- students only
    const signup = async ({ name, email, hostel, password }) => {
        setLoading(true);
        try {
            if (!name || !email || !hostel || !password) {
                throw new Error("All fields are required");
            }

            await new Promise((res) => setTimeout(res, 700));
            
            return true;
        } catch (error) {
            throw new Error(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Verify OTP (Account Verification) --- students only
    // Used when isVerified is false after password login or signup
    const verifyEmail = async ({ email, otp }) => {
        setLoading(true);
        try {
            if (!email || !otp) {
                throw new Error("Email and OTP are required");
            }

            await new Promise((res) => setTimeout(res, 500));

            // If user is partially logged in, complete the login
            if(auth.isLoggedIn){
                setAuth((prev) => ({ ...prev, isVerified: true }));
                setUser((prev) => ({ ...prev, isVerified: true }));
            }

            return true;
        } catch(error){
            console.error(error);
            throw new Error(error.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Resend OTP --- students only
    const resendOtp = async (email) => {
        setLoading(true);
        try {
            if (!email) throw new Error("Email is required");

            await new Promise((res) => setTimeout(res, 500));
            
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    // --- Logout Functionality ---
    const logout = async () => {
        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 300));

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
            toast.error(error.message || "Failed to logout");
        } finally {
            setLoading(false);
        }
    };

    // --- Forgot Password Flow --- students only
    // 1. Send OTP for Password Reset
    const sendForgotPasswordOtp = async (email) => {
        setLoading(true);
        try {
            if (!email) throw new Error("Email is required");
            await new Promise((res) => setTimeout(res, 600)); // Simulate API
            console.log(`Reset OTP sent to ${email}`);
            return true;
        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Failed to send otp");
        } finally {
            setLoading(false);
        }
    };

    // 2. Verify OTP for Password Reset
    const verifyForgotPasswordOtp = async ({ email, otp }) => {
        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 600)); // Simulate API
            if (otp !== "123456") throw new Error("Invalid OTP"); // Mock check
            return true;
        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Failed to verify otp");
        } finally {
            setLoading(false);
        }
    };

    // 3. Reset Password Final Step
    const resetPassword = async ({ email, otp, newPassword }) => {
        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 800)); // Simulate API
            console.log(`Password for ${email} reset to ${newPassword}`);
            return true;
        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Failed to send otp");
        } finally {
            setLoading(false);
        }
    };

    //change password - students only
    const changePassword = async ({ oldPassword, newPassword }) => {
        setLoading(true);
        try {
            if (!oldPassword || !newPassword) {
            throw new Error("All fields are required");
            }

            // simulate backend API
            await new Promise((res) => setTimeout(res, 600));

            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to change password");
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
        // Auth Functions
        login,
        sendLoginOTP,
        loginWithOTP,
        signup,
        verifyEmail,
        resendOtp,
        logout,
        changePassword,

        sendForgotPasswordOtp,verifyForgotPasswordOtp,resetPassword
    };
    
    // Check if user is logged in from previous session (Simulation)
    // useEffect(() => {
    //     // Keeping your hardcoded check for testing purposes
    //     setAuth({
    //         isLoggedIn: true,
    //         isVerified: true,
    //         role: "admin"
    //     });
    //     setUser(dummyUser);

    //     setAuthReady(true);
    // }, []);

    return (
        <AuthContext.Provider value={value}>
            {children} 
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;