import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VisitorChatWidget from '../components/VisitorChatWidget';

const PLANS = [
  {
    id: 'Starter',
    name: 'Starter',
    price: '$99',
    period: '/month',
    color: '#0ea5e9',
    features: ['5 Users Included', '3 Warehouses', '1 GB SSD Storage', 'Standard Inventory', 'Multi-Company Support'],
    badge: 'Grow'
  },
  {
    id: 'Professional',
    name: 'Professional',
    price: '$199',
    period: '/month',
    color: '#10b981',
    features: ['30 Users Included', '15 Warehouses', 'Local AI Assistant', 'Mobile Barcode Scanner', 'Finance & Advanced Reports'],
    badge: 'Popular',
    popular: true
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    color: '#8b5cf6',
    features: ['Unlimited Users & Warehouses', 'Unlimited API calls', 'Custom Integrations', '24/7 Dedicated Support', 'Dedicated Cloud Instance'],
    badge: 'Scale'
  }
];

const FAQ_DATA = [
  { q: 'Is the AI completely local and secure?', a: 'Yes. We utilize ML.NET to run an in-memory intent classifier that operates completely offline. Your ERP data never leaves your environment.' },
  { q: 'How does the mobile scanner work?', a: 'Any smartphone with a camera can securely log into your ERP tenant. Our scanner web-app instantly reads barcodes for Receiving, Put-Away, and Cycle Counting without expensive proprietary hardware.' },
  { q: 'Can we migrate our existing data?', a: 'Absolutely. SmartERP provides built-in CSV wizards to quickly onboard products, vendors, and historical stock data.' },
  { q: 'Is the SaaS multi-tenant isolation safe?', a: 'Yes. We employ advanced multi-tenant row-level isolation. Each company operates in its own logical partition, ensuring zero data bleed.' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="erp-landing-ultra">
      {/* Light Mode Premium Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
          --bg-dark: #f8fafc;
          --bg-surface: #ffffff;
          --bg-card: #ffffff;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --border-color: rgba(0, 0, 0, 0.08);
          --accent-cyan: #0ea5e9;
          --accent-purple: #8b5cf6;
          --accent-blue: #3b82f6;
        }

        body {
          margin: 0;
          background: var(--bg-dark);
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .erp-landing-ultra {
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Ambient Mesh Background */
        .ambient-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          background: radial-gradient(circle at 15% 50%, rgba(14, 165, 233, 0.08), transparent 40%),
                      radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 40%);
          filter: blur(80px);
        }

        /* Navbar */
        .ultra-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
          z-index: 1000;
          transition: all 0.3s ease;
          border-bottom: 1px solid transparent;
        }
        .ultra-nav.scrolled {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
        }
        .brand-logo {
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: -1px;
          color: var(--text-main);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 1.2rem;
        }
        .nav-links {
          display: flex; gap: 40px;
        }
        .nav-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .nav-links a:hover {
          color: var(--text-main);
        }
        .nav-actions {
          display: flex; gap: 16px;
        }
        .btn-glass {
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 10px 24px;
          border-radius: 100px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-glass:hover {
          background: rgba(0, 0, 0, 0.06);
          border-color: rgba(0, 0, 0, 0.1);
        }
        .btn-glow {
          background: var(--text-main);
          color: #fff;
          padding: 10px 24px;
          border-radius: 100px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          transition: all 0.2s;
        }
        .btn-glow:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        /* Hero Section */
        .hero-section {
          padding: 200px 5% 100px;
          text-align: center;
          position: relative;
        }
        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.2);
          border-radius: 100px;
          color: var(--accent-cyan);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 30px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .hero-title {
          font-size: clamp(3rem, 7vw, 6rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin: 0 auto 30px;
          max-width: 1000px;
          color: var(--text-main);
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--text-main), #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .gradient-accent {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          color: var(--text-muted);
          max-width: 700px;
          margin: 0 auto 50px;
          line-height: 1.6;
        }

        /* Dashboard Mockup Showcase */
        .mockup-container {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          perspective: 1000px;
        }
        .mockup-main {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 10px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.1);
          transform: rotateX(5deg) scale(0.95);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mockup-container:hover .mockup-main {
          transform: rotateX(0deg) scale(1);
        }
        .mockup-header {
          display: flex; gap: 8px; padding: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px;
        }
        .mac-dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot-r { background: #ef4444; }
        .dot-y { background: #f59e0b; }
        .dot-g { background: #10b981; }
        .mockup-body {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 20px;
          height: 500px;
          border-radius: 8px;
          background: #f1f5f9;
          overflow: hidden;
        }
        .mockup-sidebar {
          background: #f8fafc;
          padding: 20px;
          border-right: 1px solid var(--border-color);
        }
        .mockup-line {
          height: 12px;
          background: rgba(0,0,0,0.06);
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .mockup-line.short { width: 60%; }
        .mockup-line.accent { background: rgba(14, 165, 233, 0.2); }
        
        .mockup-content { padding: 30px; }
        .mockup-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .mockup-card {
          height: 100px;
          background: rgba(255,255,255,1);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .mockup-graph {
          height: 200px;
          background: rgba(255,255,255,1);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background-image: linear-gradient(transparent 90%, rgba(0,0,0,0.02) 90%), linear-gradient(90deg, transparent 90%, rgba(0,0,0,0.02) 90%);
          background-size: 20px 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        /* Floating elements */
        .float-card {
          position: absolute;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          animation: float 6s ease-in-out infinite;
        }
        .fc-1 { top: 20%; left: -5%; animation-delay: 0s; width: 220px; z-index: 5; }
        .fc-2 { bottom: 15%; right: -5%; animation-delay: -3s; width: 260px; z-index: 5; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* Section Styling */
        .section-container {
          padding: 120px 5%;
          max-width: 1300px;
          margin: 0 auto;
        }
        .section-tag {
          color: var(--accent-cyan);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 16px;
          display: block;
        }
        .section-title {
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }
        .section-desc {
          color: var(--text-muted);
          font-size: 1.2rem;
          line-height: 1.6;
          max-width: 600px;
          margin-bottom: 60px;
        }

        /* Bento Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 280px;
          gap: 24px;
        }
        .bento-item {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        .bento-item:hover {
          border-color: rgba(0,0,0,0.15);
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
        }
        .bento-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.01), transparent 40%);
          z-index: 0;
        }
        .bento-content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .bento-icon {
          width: 56px; height: 56px;
          background: rgba(14, 165, 233, 0.08);
          border: 1px solid rgba(14, 165, 233, 0.15);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          margin-bottom: auto;
          color: var(--accent-cyan);
        }
        .bento-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-main);
        }
        .bento-desc {
          color: var(--text-muted);
          line-height: 1.5;
          font-size: 0.95rem;
        }

        /* Specific Bento Sizing */
        .item-large { grid-column: span 2; grid-row: span 2; }
        .item-wide { grid-column: span 2; }
        
        .code-block {
          background: #f1f5f9;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: #059669;
          margin-top: 20px;
        }

        /* Pricing Section */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .pricing-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        .pricing-card.featured {
          background: linear-gradient(180deg, #ffffff, #f0f9ff);
          border: 2px solid rgba(14, 165, 233, 0.5);
          transform: translateY(-16px);
          box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.15);
        }
        .price-val {
          font-size: 3rem;
          font-weight: 800;
          margin: 20px 0;
          display: flex; align-items: baseline; gap: 4px;
          color: var(--text-main);
        }
        .price-val span { font-size: 1.2rem; color: var(--text-muted); font-weight: 500; }
        .pricing-features {
          list-style: none; padding: 0; margin: 30px 0;
        }
        .pricing-features li {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 16px;
          color: var(--text-muted);
        }
        .pricing-features li::before {
          content: '✓'; color: var(--accent-cyan); font-weight: 900;
        }

        /* FAQ */
        .faq-list {
          max-width: 800px;
          margin: 0 auto;
        }
        .faq-item {
          border-bottom: 1px solid var(--border-color);
        }
        .faq-q {
          padding: 24px 0;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          color: var(--text-main);
        }
        .faq-a {
          padding-bottom: 24px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Footer */
        .ultra-footer {
          border-top: 1px solid var(--border-color);
          padding: 80px 5% 40px;
          background: #f8fafc;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px;
          max-width: 1300px;
          margin: 0 auto 60px;
        }
        .footer-brand { max-width: 300px; color: var(--text-muted); line-height: 1.6; }
        .footer-col h4 { font-size: 1rem; font-weight: 700; margin-bottom: 24px; color: var(--text-main); }
        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col li { margin-bottom: 16px; }
        .footer-col a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .footer-col a:hover { color: var(--accent-cyan); }
        .footer-bottom {
          text-align: center; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 30px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
          .pricing-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
          .pricing-card.featured { transform: none; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero-section { padding-top: 150px; }
          .bento-grid { grid-template-columns: 1fr; }
          .item-large, .item-wide { grid-column: span 1; grid-row: span 1; }
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .mockup-body { grid-template-columns: 1fr; }
          .mockup-sidebar { display: none; }
          .fc-1, .fc-2 { display: none; }
        }
      `}</style>

      <div className="ambient-bg"></div>

      {/* Navigation */}
      <nav className={`ultra-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="brand-logo">
          <div className="brand-icon">E</div>
          SmartERP
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-glass">Sign In</Link>
          <Link to="/signup" className="btn-glow">Start Free Trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-pill">
          <span>✨</span> Smart ERP v4.0 is Live
        </div>
        <h1 className="hero-title">
          <span className="gradient-text">The Operating System for</span><br />
          <span className="gradient-accent">Modern Enterprise.</span>
        </h1>
        <p className="hero-desc">
          An immersive, multi-tenant SaaS platform integrating advanced Warehouse Management, Local AI offline capabilities, and seamless Barcode ecosystems—all out of the box.
        </p>

        {/* Hero Mockup */}
        <div className="mockup-container">
          <div className="float-card fc-1">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div style={{width: 40, height: 40, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'}}>📦</div>
              <div>
                <div style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)'}}>PO-2024-089</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Received in Zone A</div>
              </div>
            </div>
            <div className="progress-bar-small mt-3" style={{background: 'rgba(0,0,0,0.05)'}}>
              <div style={{width: '75%', background: '#10b981', height: '100%'}}></div>
            </div>
          </div>

          <div className="float-card fc-2">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div style={{width: 40, height: 40, borderRadius: 8, background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6'}}>🤖</div>
              <div>
                <div style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)'}}>Local AI Engine</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Offline mode active</div>
              </div>
            </div>
            <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic'}}>
              "Intent: UPGRADE_PLAN detected."
            </div>
          </div>

          <div className="mockup-main">
            <div className="mockup-header">
              <div className="mac-dot dot-r"></div>
              <div className="mac-dot dot-y"></div>
              <div className="mac-dot dot-g"></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-line" style={{marginBottom: 40}}></div>
                <div className="mockup-line short"></div>
                <div className="mockup-line accent"></div>
                <div className="mockup-line short"></div>
                <div className="mockup-line"></div>
                <div className="mockup-line short mt-5"></div>
              </div>
              <div className="mockup-content">
                <div className="mockup-line w-25 mb-4"></div>
                <div className="mockup-grid">
                  <div className="mockup-card"></div>
                  <div className="mockup-card"></div>
                  <div className="mockup-card"></div>
                </div>
                <div className="mockup-graph"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="section-container" id="features">
        <span className="section-tag">Architecture</span>
        <h2 className="section-title">Built for scale. Designed for speed.</h2>
        <p className="section-desc">Experience an ERP that doesn't feel like a legacy spreadsheet. We've completely reimagined core operations with modern technology.</p>

        <div className="bento-grid">
          
          {/* Large Item: WMS */}
          <div className="bento-item item-large">
            <div className="bento-content">
              <div className="bento-icon" style={{color: '#3b82f6'}}>🏢</div>
              <h3 className="bento-title">Advanced WMS</h3>
              <p className="bento-desc mb-4">A complete topological map of your warehouse. Define precise locations from Zones down to Aisles, Racks, Shelves, and Bins.</p>
              
              <div className="p-3 mt-auto rounded-3 border" style={{background: '#f8fafc', borderColor: 'var(--border-color)'}}>
                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>Warehouse A</span>
                  <span>Zone 1 • Aisle 4</span>
                </div>
                <div className="d-flex gap-2">
                  <div className="flex-fill p-2 rounded text-center border" style={{background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#059669', fontWeight: 600}}>Bin A1</div>
                  <div className="flex-fill p-2 rounded text-center border" style={{background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#059669', fontWeight: 600}}>Bin A2</div>
                  <div className="flex-fill p-2 rounded text-center border" style={{background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#dc2626', fontWeight: 600}}>Bin A3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wide Item: Local AI */}
          <div className="bento-item item-wide">
            <div className="bento-content">
              <div className="bento-icon" style={{color: '#8b5cf6'}}>🧠</div>
              <h3 className="bento-title">ML.NET Local AI</h3>
              <p className="bento-desc">SmartERP runs an embedded ML.NET prediction engine directly in memory. Categorize customer support tickets and analyze stock intent completely offline, with zero external API costs.</p>
              <div className="code-block">
                var engine = _predictionEnginePool.GetPredictionEngine();<br/>
                var result = engine.Predict(new UserIntent {"{"} Text = msg {"}"});<br/>
                // Result: UPGRADE_PLAN (Confidence: 98.4%)
              </div>
            </div>
          </div>

          {/* Regular Item: Scanner Hub */}
          <div className="bento-item">
            <div className="bento-content">
              <div className="bento-icon" style={{color: '#f59e0b'}}>🤳</div>
              <h3 className="bento-title">Scanner Hub</h3>
              <p className="bento-desc">Turn any smartphone into a rugged warehouse scanner. Scan POs, Lots, and Bins seamlessly.</p>
            </div>
          </div>

          {/* Regular Item: Multi-Tenant */}
          <div className="bento-item">
            <div className="bento-content">
              <div className="bento-icon" style={{color: '#0ea5e9'}}>☁️</div>
              <h3 className="bento-title">SaaS Multi-Tenant</h3>
              <p className="bento-desc">Strict row-level database isolation. Register multiple companies, switch seamlessly, and manage billing tiers.</p>
            </div>
          </div>

          {/* Wide Item: Barcode Ecosystem */}
          <div className="bento-item item-wide">
            <div className="bento-content">
              <div className="bento-icon" style={{color: '#10b981'}}>🔣</div>
              <h3 className="bento-title">Barcode Generation Ecosystem</h3>
              <p className="bento-desc">Automatically generate, format, and print specialized Code128 barcodes for Warehouses, Lots, Items, and Sales Orders directly from the dashboard.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing */}
      <section className="section-container" id="pricing">
        <span className="section-tag">Pricing</span>
        <h2 className="section-title">Simple, transparent pricing.</h2>
        <p className="section-desc">Choose the perfect plan for your organization size. Upgrade anytime.</p>

        <div className="pricing-grid">
          {PLANS.map((plan, i) => (
            <div key={plan.id} className={`pricing-card ${plan.popular ? 'featured' : ''}`}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: 0, color: plan.color}}>{plan.name}</h3>
              <div className="price-val">
                {plan.price} {plan.period && <span>{plan.period}</span>}
              </div>
              <ul className="pricing-features">
                {plan.features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
              <Link to="/signup" className="btn-glow" style={{display: 'block', textAlign: 'center', background: plan.popular ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'var(--text-main)', color: '#fff', border: plan.popular ? 'none' : 'none'}}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-container" id="faq">
        <h2 className="section-title text-center mb-5">Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQ_DATA.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => toggleFaq(i)}>
                {faq.q}
                <span style={{color: 'var(--accent-cyan)'}}>{faqOpen === i ? '−' : '+'}</span>
              </div>
              {faqOpen === i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="ultra-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-logo mb-3">
              <div className="brand-icon">E</div>
              SmartERP
            </div>
            <p>The premium, multi-tenant OS for modern enterprises. Combining advanced WMS, Local AI, and gorgeous UI.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">WMS Dashboard</a></li>
              <li><a href="#">Scanner App</a></li>
              <li><a href="#">Local AI Engine</a></li>
              <li><a href="#">Finance Module</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Data Processing</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} SmartERP Inc. All rights reserved. Built with ❤️.
        </div>
      </footer>

      {/* Visitor Chat Widget */}
      <VisitorChatWidget />
    </div>
  );
}
