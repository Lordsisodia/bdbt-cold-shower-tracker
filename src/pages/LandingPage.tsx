import React from 'react';
import Navigation from '../components/landing/Navigation';
import HeroSection from '../components/landing/HeroSection';
import MissionSection from '../components/landing/MissionSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import SuccessStories from '../components/landing/SuccessStories';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <MissionSection />
      <FeaturesGrid />
      <SuccessStories />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;