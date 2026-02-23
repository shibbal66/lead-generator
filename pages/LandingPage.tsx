import React from "react";
import "../styles/landing.css";
import {
  LandingNavbar,
  HeroSection,
  StatsSection,
  AboutSection,
  ValueSection,
  FAQSection,
  ContactSection,
  LandingFooter
} from "../components/landing";


const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <ValueSection />
        <FAQSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
