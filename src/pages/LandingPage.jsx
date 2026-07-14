import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VisitorChatWidget from '../components/VisitorChatWidget';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Advanced Scroll Reveal Animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="erp-corporate-landing">
      <div className="erp-mesh-bg"></div>
      
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  :root {
    --erp-primary: #0052cc;
    --erp-primary-hover: #0047b3;
    --erp-secondary: #0a1128;
    --erp-bg: #f8fbff;
    --erp-bg-alt: #ffffff;
    --erp-text: #172b4d;
    --erp-text-muted: #5e6c84;
    --erp-border: #e1e4e8;
    --erp-accent: #00b8d9;
    --erp-glass: rgba(255, 255, 255, 0.75);
    --erp-glass-border: rgba(255, 255, 255, 0.4);
  }

  body {
    margin: 0;
    font-family: 'Inter', -apple-system, sans-serif;
    background-color: var(--erp-bg);
    color: var(--erp-text);
    line-height: 1.6;
    overflow-x: hidden;
  }

  .erp-corporate-landing {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
  }

  /* Animated Mesh Background */
  .erp-mesh-bg {
    position: absolute;
    top: -20%; left: -10%; right: -10%; bottom: 0;
    background: radial-gradient(circle at 15% 50%, rgba(0, 184, 217, 0.15), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(0, 82, 204, 0.15), transparent 25%);
    z-index: 0;
    pointer-events: none;
    animation: floatingMesh 15s ease-in-out infinite alternate;
  }
  @keyframes floatingMesh {
    0% { transform: translateY(0) scale(1); }
    100% { transform: translateY(5%) scale(1.05); }
  }

  /* Glassmorphic Navbar */
  .erp-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5%;
    background: transparent;
    z-index: 1000;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    border-bottom: 1px solid transparent;
  }
  .erp-nav.scrolled {
    background: var(--erp-glass);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid var(--erp-glass-border);
  }
  
  .erp-logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--erp-primary);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.5px;
    z-index: 10;
  }
  .erp-logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--erp-primary), var(--erp-accent));
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 82, 204, 0.3);
  }
  
  .erp-nav-links {
    display: flex;
    gap: 32px;
    z-index: 10;
  }
  .erp-nav-links a {
    color: var(--erp-text);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.3s;
  }
  .erp-nav-links a:hover {
    color: var(--erp-primary);
  }
  
  .erp-nav-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 10;
  }
  
  /* Buttons */
  .erp-btn-ghost {
    color: var(--erp-text);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s;
  }
  .erp-btn-ghost:hover {
    background: rgba(9, 30, 66, 0.05);
  }
  .erp-btn-primary {
    background: linear-gradient(135deg, var(--erp-primary), #003d99);
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 10px 24px;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 14px rgba(0, 82, 204, 0.3);
    border: 1px solid transparent;
  }
  .erp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 82, 204, 0.4);
  }
  
  .erp-btn-secondary {
    background-color: var(--erp-glass);
    backdrop-filter: blur(8px);
    color: var(--erp-text);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 10px 24px;
    border-radius: 8px;
    border: 1px solid var(--erp-glass-border);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 14px rgba(9, 30, 66, 0.05);
  }
  .erp-btn-secondary:hover {
    background-color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(9, 30, 66, 0.1);
  }

  /* Hero Section */
  .erp-hero {
    padding: 180px 5% 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    gap: 60px;
    position: relative;
    z-index: 10;
  }
  .erp-hero-content {
    flex: 1;
    max-width: 600px;
    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .erp-hero h1 {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 24px;
    letter-spacing: -1.5px;
    background: linear-gradient(135deg, var(--erp-secondary) 0%, var(--erp-primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .erp-hero p {
    font-size: 1.25rem;
    color: var(--erp-text-muted);
    margin: 0 0 40px;
    line-height: 1.6;
    font-weight: 400;
  }
  .erp-hero-actions {
    display: flex;
    gap: 16px;
  }

  /* Floating Dashboard Mockup */
  .erp-hero-visual {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    animation: float 6s ease-in-out infinite;
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  .erp-dashboard-mockup {
    width: 100%;
    max-width: 600px;
    background: var(--erp-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--erp-glass-border);
    border-radius: 16px;
    box-shadow: 0 30px 60px rgba(0, 82, 204, 0.12);
    overflow: hidden;
  }
  .erp-mockup-header {
    height: 40px;
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid var(--erp-glass-border);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
  }
  .erp-mac-dot { width: 12px; height: 12px; border-radius: 50%; }
  .erp-dot-r { background: #ff5f56; }
  .erp-dot-y { background: #ffbd2e; }
  .erp-dot-g { background: #27c93f; }
  
  .erp-mockup-body { display: flex; height: 350px; }
  .erp-mockup-sidebar {
    width: 25%;
    background: rgba(255, 255, 255, 0.3);
    border-right: 1px solid var(--erp-glass-border);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .erp-mockup-content { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 24px; background: rgba(255,255,255,0.7); }
  .erp-mockup-bar { height: 12px; background: #dfe1e6; border-radius: 6px; width: 100%; }
  .erp-mockup-grid { display: flex; gap: 16px; }
  .erp-mockup-card {
    flex: 1; height: 100px; background: #ffffff; border-radius: 8px; padding: 16px;
    box-shadow: 0 4px 12px rgba(9, 30, 66, 0.05);
    display: flex; flex-direction: column; gap: 12px;
  }

  /* Scroll Animations */
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .animate-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Stats Strip */
  .erp-stats-strip {
    background: #ffffff;
    border-top: 1px solid var(--erp-glass-border);
    border-bottom: 1px solid var(--erp-glass-border);
    padding: 60px 5%;
    position: relative;
    z-index: 10;
  }
  .erp-stats-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    text-align: center;
  }
  .erp-stat-item h3 {
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--erp-primary);
    margin: 0 0 8px;
    background: linear-gradient(135deg, var(--erp-primary) 0%, var(--erp-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .erp-stat-item p {
    font-size: 1rem;
    color: var(--erp-text-muted);
    font-weight: 600;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  /* General Sections */
  .erp-section {
    padding: 120px 5%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }
  .erp-section-header {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 60px;
  }
  .erp-section-header h2 {
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--erp-secondary);
    margin: 0 0 16px;
    letter-spacing: -1px;
  }
  .erp-section-header p {
    font-size: 1.15rem;
    color: var(--erp-text-muted);
    margin: 0;
  }

  /* Modules Grid */
  .erp-modules-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  .erp-module-card {
    background: var(--erp-glass);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--erp-glass-border);
    border-radius: 16px;
    padding: 40px 32px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 30px rgba(9, 30, 66, 0.03);
    position: relative;
    overflow: hidden;
  }
  .erp-module-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, var(--erp-primary), var(--erp-accent));
    opacity: 0;
    transition: opacity 0.4s;
  }
  .erp-module-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 82, 204, 0.1);
    border-color: rgba(0, 82, 204, 0.2);
    background: #ffffff;
  }
  .erp-module-card:hover::before {
    opacity: 1;
  }
  .erp-module-icon {
    font-size: 2.5rem;
    color: var(--erp-primary);
    margin-bottom: 24px;
    background: linear-gradient(135deg, rgba(0,82,204,0.1), rgba(0,184,217,0.1));
    width: 72px; height: 72px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 16px;
  }
  .erp-module-card h4 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 12px;
    color: var(--erp-secondary);
  }
  .erp-module-card p {
    font-size: 1.05rem;
    color: var(--erp-text-muted);
    margin: 0;
  }

  
  /* Use Cases Grid */
  .erp-use-cases-grid { display: flex; flex-direction: column; gap: 24px; }
  .erp-use-case-card { display: flex; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(9,30,66,0.04); transition: transform 0.4s; border: 1px solid var(--erp-glass-border); }
  .erp-use-case-card:hover { transform: scale(1.02); box-shadow: 0 20px 40px rgba(0,82,204,0.1); }
  .erp-use-case-visual { width: 250px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .erp-use-case-visual::after { content: ''; position: absolute; inset: 0; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent); transform: translateX(-100%); transition: transform 0.6s; }
  .erp-use-case-card:hover .erp-use-case-visual::after { transform: translateX(100%); }
  .erp-use-case-content { flex: 1; padding: 40px; }
  .erp-use-case-content h4 { font-size: 1.5rem; font-weight: 800; color: var(--erp-secondary); margin: 0 0 16px; }
  .erp-use-case-content p { font-size: 1.1rem; color: var(--erp-text-muted); margin: 0; line-height: 1.6; }
  
  @media (max-width: 768px) {
    .erp-use-case-card { flex-direction: column; }
    .erp-use-case-visual { width: 100%; height: 160px; }
    .erp-use-case-content { padding: 24px; }
  }

  /* Features Split */
  .erp-split-section {
    display: flex;
    align-items: center;
    gap: 80px;
  }
  .erp-split-content { flex: 1; }
  .erp-split-content h3 { font-size: 2.5rem; font-weight: 800; color: var(--erp-secondary); margin: 0 0 24px; letter-spacing: -1px; }
  .erp-split-content p { font-size: 1.15rem; color: var(--erp-text-muted); margin: 0 0 32px; }
  .erp-feature-list { list-style: none; padding: 0; margin: 0 0 40px; display: flex; flex-direction: column; gap: 16px; }
  .erp-feature-list li { font-size: 1.1rem; color: var(--erp-secondary); display: flex; align-items: center; gap: 12px; font-weight: 600; }
  .erp-feature-list li::before { content: '✓'; color: #ffffff; font-weight: 800; background: linear-gradient(135deg, var(--erp-primary), var(--erp-accent)); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.85rem; box-shadow: 0 4px 10px rgba(0,82,204,0.3); }
  
  .erp-split-visual { flex: 1; display: flex; justify-content: center; }
  .erp-visual-box { width: 100%; max-width: 500px; background: linear-gradient(135deg, var(--erp-primary) 0%, var(--erp-accent) 100%); border-radius: 24px; padding: 50px 40px; color: white; box-shadow: 0 30px 60px rgba(0, 82, 204, 0.3); transform: perspective(1000px) rotateY(-8deg); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  .erp-visual-box:hover { transform: perspective(1000px) rotateY(0deg) scale(1.05); }
  .erp-visual-box h4 { font-size: 1.8rem; margin: 0 0 16px; font-weight: 800; }
  .erp-visual-box p { opacity: 0.9; margin: 0 0 24px; font-size: 1.1rem; }
  
  /* Pricing */
  .erp-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .erp-pricing-card { background: var(--erp-glass); backdrop-filter: blur(10px); border: 1px solid var(--erp-glass-border); border-radius: 24px; padding: 40px; text-align: center; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; }
  .erp-pricing-card:hover { transform: translateY(-12px); box-shadow: 0 30px 60px rgba(9, 30, 66, 0.08); background: #ffffff; }
  .erp-pricing-card.popular { border-color: rgba(0, 82, 204, 0.3); box-shadow: 0 20px 40px rgba(0, 82, 204, 0.15); background: #ffffff; }
  .erp-pricing-card.popular::before { content: 'Most Popular'; position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--erp-primary), var(--erp-accent)); color: white; font-size: 0.75rem; font-weight: 800; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(0,82,204,0.3); }
  .erp-pricing-card h4 { font-size: 1.5rem; color: var(--erp-secondary); margin: 0 0 16px; font-weight: 800; }
  .erp-price { font-size: 4rem; font-weight: 800; color: var(--erp-secondary); margin: 0 0 8px; letter-spacing: -1.5px; }
  .erp-price span { font-size: 1rem; color: var(--erp-text-muted); font-weight: 600; letter-spacing: 0; }
  .erp-pricing-card p { color: var(--erp-text-muted); margin: 0 0 32px; font-size: 1.05rem; }
  .erp-pricing-features { list-style: none; padding: 0; margin: 0 0 40px; text-align: left; display: flex; flex-direction: column; gap: 16px; }
  .erp-pricing-features li { color: var(--erp-text); font-size: 1.05rem; display: flex; align-items: center; gap: 12px; font-weight: 500; }
  .erp-pricing-features li i { color: var(--erp-primary); font-weight: bold; }

  /* Footer */
  .erp-footer { background: var(--erp-secondary); color: #ffffff; padding: 100px 5% 40px; position: relative; z-index: 10; }
  .erp-footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; }
  .erp-footer-brand h3 { font-size: 2rem; margin: 0 0 24px; font-weight: 800; }
  .erp-footer-brand p { color: #8993a4; line-height: 1.6; margin: 0; font-size: 1.1rem; }
  .erp-footer-links h4 { font-size: 1.2rem; margin: 0 0 24px; font-weight: 700; color: #ffffff; }
  .erp-footer-links ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
  .erp-footer-links a { color: #8993a4; text-decoration: none; transition: color 0.2s; font-size: 1rem; }
  .erp-footer-links a:hover { color: #ffffff; }
  .erp-footer-bottom { max-width: 1200px; margin: 80px auto 0; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); color: #8993a4; font-size: 0.95rem; display: flex; justify-content: space-between; }

  /* Mobile Responsive */
  @media (max-width: 992px) {
    .erp-hero { flex-direction: column; text-align: center; padding-top: 140px; }
    .erp-hero-content { margin: 0 auto; }
    .erp-hero h1 { font-size: 3rem; }
    .erp-hero-actions { justify-content: center; }
    .erp-split-section { flex-direction: column; }
    .erp-modules-grid { grid-template-columns: repeat(2, 1fr); }
    .erp-pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin-left: auto; margin-right: auto; }
    .erp-footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .erp-nav { padding: 0 20px; }
    .erp-nav-links { display: none; }
    .erp-nav-actions { gap: 8px; }
    .erp-btn-ghost, .erp-btn-primary, .erp-btn-secondary { padding: 8px 16px; font-size: 0.85rem; }
    .erp-hero { padding: 120px 20px 60px; }
    .erp-hero h1 { font-size: 2.2rem; margin-bottom: 16px; }
    .erp-hero p { font-size: 1.05rem; margin-bottom: 32px; }
    .erp-hero-actions { flex-direction: column; width: 100%; gap: 12px; }
    .erp-hero-actions a { width: 100%; }
    .erp-modules-grid { grid-template-columns: 1fr; }
    .erp-stats-container { flex-direction: column; gap: 40px; }
    .erp-footer-grid { grid-template-columns: 1fr; gap: 40px; }
    .erp-split-content h3 { font-size: 1.8rem; }
    .erp-visual-box { transform: none; }
    .erp-visual-box:hover { transform: translateY(-4px); }
  }
`}</style>


      {/* Navigation */}
      <nav className={`erp-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="erp-logo">
          <div className="erp-logo-icon">E</div>
          SmartERP
        </Link>
        <div className="erp-nav-links">
          <a href="#modules">Modules</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#">Resources</a>
        </div>
        <div className="erp-nav-actions">
          <Link to="/login" className="erp-btn-ghost">Log In</Link>
          <Link to="/signup" className="erp-btn-primary">Start Free Trial</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="erp-hero">
        <div className="erp-hero-content">
          <h1>Enterprise Resource Planning, Simplified.</h1>
          <p>A unified system to manage your warehouse operations, inventory, and customer relationships with built-in AI and mobile barcode scanning.</p>
          <div className="erp-hero-actions">
            <Link to="/signup" className="erp-btn-primary">Start Free Trial</Link>
            <a href="#modules" className="erp-btn-secondary">Explore Modules</a>
          </div>
        </div>
        <div className="erp-hero-visual">
          <div className="erp-dashboard-mockup">
            <div className="erp-mockup-header">
              <div className="erp-mac-dot erp-dot-r"></div>
              <div className="erp-mac-dot erp-dot-y"></div>
              <div className="erp-mac-dot erp-dot-g"></div>
            </div>
            <div className="erp-mockup-body">
              <div className="erp-mockup-sidebar">
                <div className="erp-mockup-bar" style={{ width: '80%', marginBottom: 24 }}></div>
                <div className="erp-mockup-bar"></div>
                <div className="erp-mockup-bar"></div>
                <div className="erp-mockup-bar" style={{ width: '60%' }}></div>
              </div>
              <div className="erp-mockup-content">
                <div className="erp-mockup-bar" style={{ width: '40%', height: 16, marginBottom: 32 }}></div>
                <div className="erp-mockup-bar" style={{ width: '100%', height: 120 }}></div>
                <div className="erp-mockup-grid">
                  <div className="erp-mockup-card">
                    <div className="erp-mockup-bar" style={{ width: '50%' }}></div>
                    <div className="erp-mockup-bar" style={{ width: '80%' }}></div>
                  </div>
                  <div className="erp-mockup-card">
                    <div className="erp-mockup-bar" style={{ width: '40%' }}></div>
                    <div className="erp-mockup-bar" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Strip */}
      <section className="erp-stats-strip animate-on-scroll">
        <div className="erp-stats-container">
          <div className="erp-stat-item">
            <h3>99.99%</h3>
            <p>Uptime SLA</p>
          </div>
          <div className="erp-stat-item">
            <h3>10M+</h3>
            <p>Items Scanned</p>
          </div>
          <div className="erp-stat-item">
            <h3>Local AI</h3>
            <p>Offline Processing</p>
          </div>
          <div className="erp-stat-item">
            <h3>100%</h3>
            <p>Data Isolation</p>
          </div>
        </div>
      </section>

      {/* Core Modules */}
      <section className="erp-section animate-on-scroll" id="modules">
        <div className="erp-section-header">
          <h2>Core System Modules</h2>
          <p>Everything you need to run your enterprise smoothly, integrated into one cohesive platform.</p>
        </div>
        <div className="erp-modules-grid">
          <div className="erp-module-card">
            <div className="erp-module-icon">🏢</div>
            <h3>Warehouse Management</h3>
            <p>Complete topological mapping. Track inventory precisely down to Zones, Aisles, Racks, Shelves, and Bins.</p>
          </div>
          <div className="erp-module-card">
            <div className="erp-module-icon">🔣</div>
            <h3>Barcode Ecosystem</h3>
            <p>Generate, print, and track Code128 barcodes for lots, items, and precise warehouse locations.</p>
          </div>
          <div className="erp-module-card">
            <div className="erp-module-icon">📱</div>
            <h3>Mobile Scanner Hub</h3>
            <p>Turn standard smartphones into rugged warehouse scanners. Instantly perform cycle counts and receiving.</p>
          </div>
          <div className="erp-module-card">
            <div className="erp-module-icon">🧠</div>
            <h3>ML.NET Local AI</h3>
            <p>Embedded machine learning for offline intent classification. Analyze text securely without external APIs.</p>
          </div>
          <div className="erp-module-card">
            <div className="erp-module-icon">☁️</div>
            <h3>SaaS Multi-Tenant</h3>
            <p>Strict row-level database isolation ensures that data from multiple companies never overlaps.</p>
          </div>
          <div className="erp-module-card">
            <div className="erp-module-icon">💬</div>
            <h3>Integrated Support</h3>
            <p>Built-in communication channels connecting tenants directly with Super Admins for rapid support and plan upgrades.</p>
          </div>
        </div>
      </section>

      
      {/* Use Cases Section */}
      <section className="erp-section animate-on-scroll" id="use-cases" style={{ background: 'var(--erp-glass)', position: 'relative' }}>
        <div className="erp-section-header">
          <h2>Built for Real-World Operations</h2>
          <p>Discover how modern enterprises leverage SmartERP to eliminate bottlenecks.</p>
        </div>
        <div className="erp-use-cases-grid">
          <div className="erp-use-case-card">
            <div className="erp-use-case-visual" style={{ background: 'linear-gradient(135deg, #0052cc, #00b8d9)' }}>
              <div style={{ fontSize: '4rem' }}>🏭</div>
            </div>
            <div className="erp-use-case-content">
              <h4>Manufacturing & Assembly</h4>
              <p>Track raw materials from receiving dock to Work-In-Progress (WIP). Automatically generate Bills of Materials (BOM) and enforce rigid lot-tracking to ensure FDA/ISO regulatory compliance across the entire assembly line.</p>
            </div>
          </div>
          <div className="erp-use-case-card">
            <div className="erp-use-case-visual" style={{ background: 'linear-gradient(135deg, #ff5f56, #ff9a44)' }}>
              <div style={{ fontSize: '4rem' }}>📦</div>
            </div>
            <div className="erp-use-case-content">
              <h4>High-Volume E-Commerce</h4>
              <p>Eliminate costly mis-picks with strictly enforced FIFO (First-In, First-Out) dispatching logic. Mobile barcode scanners guide packers through optimal aisle routes to slash fulfillment times by up to 60%.</p>
            </div>
          </div>
          <div className="erp-use-case-card">
            <div className="erp-use-case-visual" style={{ background: 'linear-gradient(135deg, #27c93f, #00a8ff)' }}>
              <div style={{ fontSize: '4rem' }}>🌐</div>
            </div>
            <div className="erp-use-case-content">
              <h4>Multi-Region Logistics</h4>
              <p>Seamlessly transfer inventory between global warehouses in real-time. Maintain absolute visibility into deep hierarchical storage locations including Zones, Aisles, Racks, Shelves, and individual Bins.</p>
            </div>
          </div>
        </div>
      </section>

{/* Deep Dive Feature */}
      <section className="erp-section" id="features">
        <div className="erp-split-section">
          <div className="erp-split-visual" style={{background: '#f4f5f7', backgroundImage: 'radial-gradient(#dfe1e6 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            {/* Visual representation placeholder */}
            <div style={{textAlign: 'center'}}>
               <div style={{fontSize: '3rem', marginBottom: 16}}>🔒</div>
               <div style={{fontSize: '1.25rem', color: 'var(--erp-secondary)'}}>Enterprise-Grade Security</div>
            </div>
          </div>
          <div className="erp-split-content">
            <h2>Built for Scale and Security</h2>
            <p>SmartERP is engineered to handle massive throughput while keeping your organizational data strictly partitioned.</p>
            <ul className="erp-split-list">
              <li><strong>Row-Level Security:</strong> Tenant ID filtering on every database transaction.</li>
              <li><strong>Offline Inference:</strong> AI classification models run in-memory on your server, ensuring privacy.</li>
              <li><strong>Real-time Analytics:</strong> Process thousands of barcode scans per minute with zero latency.</li>
              <li><strong>Audit Logging:</strong> Comprehensive history of user actions and inventory movements.</li>
            </ul>
            <Link to="/signup" className="erp-btn-primary" style={{display: 'inline-block', marginTop: 24}}>Create Your Instance</Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="erp-section animate-on-scroll" id="pricing">
        <div className="erp-section-header">
          <h2>Transparent SaaS Pricing</h2>
          <p>Choose a plan that scales with your business operations.</p>
        </div>
        <div className="erp-pricing-grid">
          <div className="erp-pricing-card">
            <h3 style={{color: 'var(--erp-text-muted)', fontSize: '1.2rem', margin: '0 0 8px'}}>Starter</h3>
            <p style={{margin: 0, color: 'var(--erp-text)', fontWeight: 500}}>For small warehouses</p>
            <div className="erp-price">$99<span>/mo</span></div>
            <ul className="erp-pricing-features">
              <li>Up to 5 Users</li>
              <li>3 Warehouse Locations</li>
              <li>Standard Inventory Tracking</li>
              <li>Community Support</li>
            </ul>
            <Link to="/signup" className="erp-btn-secondary" style={{display: 'block', textAlign: 'center'}}>Select Starter</Link>
          </div>
          
          <div className="erp-pricing-card popular">
            <div className="erp-popular-badge">Most Recommended</div>
            <h3 style={{color: 'var(--erp-primary)', fontSize: '1.2rem', margin: '0 0 8px'}}>Professional</h3>
            <p style={{margin: 0, color: 'var(--erp-text)', fontWeight: 500}}>For growing distributors</p>
            <div className="erp-price">$199<span>/mo</span></div>
            <ul className="erp-pricing-features">
              <li>Up to 30 Users</li>
              <li>15 Warehouse Locations</li>
              <li>Local AI Assistant Enabled</li>
              <li>Mobile Barcode Scanner Hub</li>
              <li>Priority Email Support</li>
            </ul>
            <Link to="/signup" className="erp-btn-primary" style={{display: 'block', textAlign: 'center'}}>Select Professional</Link>
          </div>

          <div className="erp-pricing-card">
            <h3 style={{color: 'var(--erp-text-muted)', fontSize: '1.2rem', margin: '0 0 8px'}}>Enterprise</h3>
            <p style={{margin: 0, color: 'var(--erp-text)', fontWeight: 500}}>For large scale operations</p>
            <div className="erp-price">Custom</div>
            <ul className="erp-pricing-features">
              <li>Unlimited Users & Warehouses</li>
              <li>Custom API Integrations</li>
              <li>Dedicated Cloud Instance</li>
              <li>24/7 Dedicated Support</li>
              <li>On-premise deployment option</li>
            </ul>
            <Link to="/signup" className="erp-btn-secondary" style={{display: 'block', textAlign: 'center'}}>Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="erp-footer">
        <div className="erp-footer-grid">
          <div className="erp-footer-brand">
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8}}>
              <div className="erp-logo-icon" style={{background: '#ffffff', color: 'var(--erp-primary)'}}>E</div>
              SmartERP
            </div>
            <p>The definitive operating system for modern warehousing, manufacturing, and distribution enterprises.</p>
          </div>
          <div>
            <h4>Solutions</h4>
            <ul>
              <li><a href="#">Warehouse Management</a></li>
              <li><a href="#">Barcode Automation</a></li>
              <li><a href="#">AI Inference</a></li>
              <li><a href="#">Mobile Scanning</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Partners</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Service Level Agreement</a></li>
            </ul>
          </div>
        </div>
        <div className="erp-footer-bottom">
          <span>&copy; {new Date().getFullYear()} SmartERP Systems Inc. All rights reserved.</span>
          <span>English (US)</span>
        </div>
      </footer>

      {/* Visitor Chat Widget */}
      <VisitorChatWidget />
    </div>
  );
}
