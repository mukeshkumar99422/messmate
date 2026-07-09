// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ProblemAgitation from "../components/landing/ProblemAgitation";
import FeatureGrid from "../components/landing/FeatureGrid";
import RatingSocialProof from "../components/landing/RatingSocialProof";
import Faq from "../components/landing/Faq";
import FinalCta from "../components/landing/FinalCta";
import Footer from "../components/landing/Footer";

export default function Landing() {
  const { auth } = useContext(AuthContext);
  const getStartedPath = auth?.isLoggedIn
    ? `/${auth.role}/home`
    : "/signup";

  return (
    <div className="bg-gray-50 font-sans antialiased text-gray-800">

      {/* ============================================================
          1. NAVBAR
          ============================================================ */}
      <Navbar/>

      {/* ============================================================
          2. MODULAR SECTIONS
          ============================================================ */}
      
      {/* Module 1: Hero Segment */}
      <Hero getStartedPath={getStartedPath} />

      {/* Module 2: Pain Point Real-world Aggravation */}
      <ProblemAgitation />

      {/* Module 3: Clean Feature Matrix Container */}
      <FeatureGrid />

      {/* Module 4: Live Item Rating/Feedback System Section */}
      <RatingSocialProof />

      {/* Module 5: Frequently Asked Questions */}
      <Faq />

      {/* Module 6: High-converting Closing Call-To-Action */}
      <FinalCta getStartedPath={getStartedPath} />

      {/* ============================================================
          3. FOOTER
          ============================================================ */}
      <Footer/>
    </div>
  );
}