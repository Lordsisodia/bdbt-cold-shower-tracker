import React from 'react';
import CTASection from '../components/landing/CTASection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import Footer from '../components/landing/Footer';
import HeroSection from '../components/landing/HeroSection';
import MissionSection from '../components/landing/MissionSection';
import Navigation from '../components/landing/Navigation';
import SuccessStories from '../components/landing/SuccessStories';

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