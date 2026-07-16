import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import VisitorChatWidget from '../components/VisitorChatWidget';

// Import Landing Components
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ProductHighlights from '../components/landing/ProductHighlights';
import EnterpriseWorkflow from '../components/landing/EnterpriseWorkflow';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import IndustriesSection from '../components/landing/IndustriesSection';
import CarouselSection from '../components/landing/CarouselSection';
import PricingSection from '../components/landing/PricingSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="mind-landing-page" style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#0f172a', overflowX: 'hidden', width: '100%' }}>

      {/* Global CSS for MIND ERP Light Theme */}
      <style>{`
        :root {
          --mind-primary: #4f46e5;
          --mind-primary-glow: rgba(79, 70, 229, 0.15);
          --mind-info: #06b6d4;
          --mind-text-main: #0f172a;
          --mind-text-muted: #64748b;
          --mind-bg: #f8fafc;
          --mind-surface: #ffffff;
          --mind-border: rgba(0, 0, 0, 0.06);
          --mind-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
        }
        html, body {
          background-color: var(--mind-bg);
          color: var(--mind-text-main);
          overflow-x: hidden;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .mind-hero-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            radial-gradient(circle at 15% 30%, rgba(79, 70, 229, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 85% 60%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 1) 0%, transparent 60%);
          z-index: 0;
          pointer-events: none;
        }
        .glass-nav {
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
          border-bottom: 1px solid var(--mind-border) !important;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--mind-border);
          box-shadow: var(--mind-shadow);
        }
        .text-mind-main { color: var(--mind-text-main) !important; }
        .text-mind-muted { color: var(--mind-text-muted) !important; }
        
        .fs-7 { font-size: 0.9rem; }
        .cursor-pointer { cursor: pointer; }
        
        /* Typography overrides for light mode */
        h1, h2, h3, h4, h5, h6 {
          color: var(--mind-text-main);
          font-weight: 700;
          letter-spacing: -0.5px;
        }
      `}</style>

      {/* Progress Bar */}
      <motion.div
        className="position-fixed top-0 start-0 right-0 z-3"
        style={{ height: '3px', width: '100%', scaleX, transformOrigin: '0%', background: 'linear-gradient(90deg, var(--mind-primary), var(--mind-info))' }}
      />

      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ProductHighlights />
      <CarouselSection />
      <EnterpriseWorkflow />
      <WhyChooseUs />
      <IndustriesSection />
      <PricingSection />
      <Footer />

      <VisitorChatWidget />
    </div>
  );
}
