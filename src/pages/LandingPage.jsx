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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="erp-corporate-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --erp-primary: #0052cc;
          --erp-primary-hover: #0047b3;
          --erp-secondary: #172b4d;
          --erp-bg: #ffffff;
          --erp-bg-alt: #f4f5f7;
          --erp-text: #172b4d;
          --erp-text-muted: #5e6c84;
          --erp-border: #dfe1e6;
          --erp-accent: #00b8d9;
        }

        body {
          margin: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--erp-bg);
          color: var(--erp-text);
          line-height: 1.6;
        }

        .erp-corporate-landing {
          min-height: 100vh;
        }

        /* Navbar */
        .erp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
          background: #ffffff;
          z-index: 1000;
          transition: box-shadow 0.3s;
          border-bottom: 1px solid transparent;
        }
        .erp-nav.scrolled {
          box-shadow: 0 4px 12px rgba(9, 30, 66, 0.05);
          border-bottom: 1px solid var(--erp-border);
        }
        .erp-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--erp-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.5px;
        }
        .erp-logo-icon {
          width: 32px;
          height: 32px;
          background-color: var(--erp-primary);
          color: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .erp-nav-links {
          display: flex;
          gap: 32px;
        }
        .erp-nav-links a {
          color: var(--erp-text-muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .erp-nav-links a:hover {
          color: var(--erp-primary);
        }
        .erp-nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .erp-btn-ghost {
          color: var(--erp-text);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .erp-btn-ghost:hover {
          background: var(--erp-bg-alt);
        }
        .erp-btn-primary {
          background-color: var(--erp-primary);
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 10px 24px;
          border-radius: 4px;
          transition: background 0.2s, transform 0.1s;
          box-shadow: 0 2px 4px rgba(0, 82, 204, 0.2);
        }
        .erp-btn-primary:hover {
          background-color: var(--erp-primary-hover);
        }
        .erp-btn-primary:active {
          transform: translateY(1px);
        }

        /* Hero */
        .erp-hero {
          padding: 160px 5% 100px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          gap: 60px;
        }
        .erp-hero-content {
          flex: 1;
          max-width: 600px;
        }
        .erp-hero h1 {
          font-size: 3.5rem;
          font-weight: 700;
          color: var(--erp-secondary);
          line-height: 1.1;
          margin: 0 0 24px;
          letter-spacing: -1px;
        }
        .erp-hero p {
          font-size: 1.25rem;
          color: var(--erp-text-muted);
          margin: 0 0 40px;
          line-height: 1.6;
        }
        .erp-hero-actions {
          display: flex;
          gap: 16px;
        }
        .erp-btn-secondary {
          background-color: #ffffff;
          color: var(--erp-text);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 10px 24px;
          border-radius: 4px;
          border: 1px solid var(--erp-border);
          transition: all 0.2s;
        }
        .erp-btn-secondary:hover {
          background-color: var(--erp-bg-alt);
          border-color: #c1c7d0;
        }

        .erp-hero-visual {
          flex: 1;
          display: flex;
          justify-content: flex-end;
        }
        .erp-dashboard-mockup {
          width: 100%;
          max-width: 600px;
          background: #ffffff;
          border: 1px solid var(--erp-border);
          border-radius: 8px;
          box-shadow: 0 20px 40px rgba(9, 30, 66, 0.08);
          overflow: hidden;
        }
        .erp-mockup-header {
          height: 32px;
          background: var(--erp-bg-alt);
          border-bottom: 1px solid var(--erp-border);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 6px;
        }
        .erp-mac-dot {
          width: 10px; height: 10px; border-radius: 50%;
        }
        .erp-dot-r { background: #ff5655; }
        .erp-dot-y { background: #ffbc2a; }
        .erp-dot-g { background: #28c840; }
        .erp-mockup-body {
          display: flex;
          height: 340px;
        }
        .erp-mockup-sidebar {
          width: 120px;
          background: #fafbfc;
          border-right: 1px solid var(--erp-border);
          padding: 16px;
        }
        .erp-mockup-content {
          flex: 1;
          padding: 24px;
          background: #ffffff;
        }
        .erp-mockup-bar {
          height: 8px;
          background: var(--erp-border);
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .erp-mockup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 24px;
        }
        .erp-mockup-card {
          height: 80px;
          border: 1px solid var(--erp-border);
          border-radius: 6px;
          padding: 12px;
        }

        /* Stats Strip */
        .erp-stats-strip {
          background: var(--erp-secondary);
          padding: 48px 5%;
          color: #ffffff;
        }
        .erp-stats-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-around;
          text-align: center;
        }
        .erp-stat-item h3 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--erp-accent);
        }
        .erp-stat-item p {
          margin: 8px 0 0;
          font-size: 0.9rem;
          font-weight: 500;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Modules Section */
        .erp-section {
          padding: 100px 5%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .erp-section-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .erp-section-header h2 {
          font-size: 2.25rem;
          color: var(--erp-secondary);
          margin: 0 0 16px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .erp-section-header p {
          font-size: 1.15rem;
          color: var(--erp-text-muted);
          max-width: 600px;
          margin: 0 auto;
        }
        
        .erp-modules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .erp-module-card {
          background: #ffffff;
          border: 1px solid var(--erp-border);
          border-radius: 8px;
          padding: 32px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .erp-module-card:hover {
          box-shadow: 0 12px 24px rgba(9, 30, 66, 0.05);
          transform: translateY(-2px);
          border-color: #c1c7d0;
        }
        .erp-module-icon {
          width: 48px;
          height: 48px;
          background: var(--erp-bg-alt);
          color: var(--erp-primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 24px;
        }
        .erp-module-card h3 {
          font-size: 1.25rem;
          color: var(--erp-secondary);
          margin: 0 0 12px;
          font-weight: 600;
        }
        .erp-module-card p {
          color: var(--erp-text-muted);
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.6;
        }

        /* Split Feature Section */
        .erp-split-section {
          display: flex;
          align-items: center;
          gap: 80px;
          margin-top: 100px;
        }
        .erp-split-content {
          flex: 1;
        }
        .erp-split-content h2 {
          font-size: 2rem;
          color: var(--erp-secondary);
          margin: 0 0 20px;
        }
        .erp-split-content p {
          font-size: 1.1rem;
          color: var(--erp-text-muted);
          margin: 0 0 24px;
        }
        .erp-split-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .erp-split-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          color: var(--erp-text);
        }
        .erp-split-list li::before {
          content: '✓';
          color: var(--erp-primary);
          font-weight: bold;
        }
        .erp-split-visual {
          flex: 1;
          background: var(--erp-bg-alt);
          border-radius: 8px;
          height: 400px;
          border: 1px solid var(--erp-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--erp-text-muted);
          font-weight: 500;
        }

        /* Pricing Section */
        .erp-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 48px;
        }
        .erp-pricing-card {
          background: #ffffff;
          border: 1px solid var(--erp-border);
          border-radius: 8px;
          padding: 40px;
          text-align: left;
        }
        .erp-pricing-card.popular {
          border: 2px solid var(--erp-primary);
          box-shadow: 0 12px 24px rgba(0, 82, 204, 0.08);
          position: relative;
        }
        .erp-popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--erp-primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 100px;
          text-transform: uppercase;
        }
        .erp-price {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--erp-secondary);
          margin: 24px 0 8px;
        }
        .erp-price span {
          font-size: 1rem;
          color: var(--erp-text-muted);
          font-weight: 500;
        }
        .erp-pricing-features {
          list-style: none;
          padding: 0;
          margin: 32px 0;
          border-top: 1px solid var(--erp-border);
          padding-top: 24px;
        }
        .erp-pricing-features li {
          margin-bottom: 12px;
          color: var(--erp-text-muted);
          font-size: 0.95rem;
        }

        /* Footer */
        .erp-footer {
          background: var(--erp-secondary);
          color: #ffffff;
          padding: 80px 5% 40px;
          margin-top: 80px;
        }
        .erp-footer-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }
        .erp-footer-brand p {
          color: #8993a4;
          font-size: 0.9rem;
          margin-top: 16px;
        }
        .erp-footer h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 24px;
          color: #ffffff;
        }
        .erp-footer ul {
          list-style: none; padding: 0; margin: 0;
        }
        .erp-footer li { margin-bottom: 12px; }
        .erp-footer a {
          color: #8993a4;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .erp-footer a:hover {
          color: #ffffff;
        }
        .erp-footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #8993a4;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
        }

        @media (max-width: 992px) {
          .erp-hero { flex-direction: column; text-align: center; padding-top: 120px; }
          .erp-hero-content { margin: 0 auto; }
          .erp-hero-actions { justify-content: center; }
          .erp-split-section { flex-direction: column; }
          .erp-modules-grid { grid-template-columns: repeat(2, 1fr); }
          .erp-pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin-left: auto; margin-right: auto; }
          .erp-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .erp-nav-links { display: none; }
          .erp-modules-grid { grid-template-columns: 1fr; }
          .erp-stats-container { flex-direction: column; gap: 40px; }
          .erp-footer-grid { grid-template-columns: 1fr; gap: 40px; }
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
      <section className="erp-stats-strip">
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
      <section className="erp-section" id="modules">
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
      <section className="erp-section" id="pricing">
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
