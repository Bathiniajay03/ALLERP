import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VisitorChatWidget from '../components/VisitorChatWidget';

const INDUSTRIES = [
  { name: 'Retail', icon: '🛍️' },
  { name: 'Manufacturing', icon: '🏭' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Automobile', icon: '🚗' },
  { name: 'Pharma', icon: '💊' },
  { name: 'Electronics', icon: '⚡' },
  { name: 'Logistics', icon: '📦' },
  { name: 'Wholesale', icon: '🏢' }
];

const PLANS = [
  {
    id: 'Starter',
    name: 'Starter',
    price: '$99',
    period: '/month',
    color: '#0ea5e9',
    features: ['5 Users Included', '3 Warehouses', '1 GB SSD Storage', '10,000 API calls/mo', 'Standard Inventory', 'Multi-Company Support'],
    badge: 'Grow'
  },
  {
    id: 'Professional',
    name: 'Professional',
    price: '$199',
    period: '/month',
    color: '#10b981',
    features: ['30 Users Included', '15 Warehouses', '20 GB SSD Storage', '200,000 API calls/mo', 'AI Assistant & Automation', 'Mobile Barcode Scanner', 'Finance & Advanced Reports'],
    badge: 'Popular',
    popular: true
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    color: '#f59e0b',
    features: ['Unlimited Users', 'Unlimited Warehouses', '500 GB Storage', 'Unlimited API calls', 'Custom Integrations', '24/7 Dedicated Support', 'Dedicated Cloud Instance'],
    badge: 'Scale'
  }
];

const FEATURES = [
  { emoji: '📦', title: 'Inventory Management', desc: 'Real-time stock tracking with intelligent alerts, automatic reordering, and lot tracking.' },
  { emoji: '🏭', title: 'Warehouse Management', desc: 'Optimize storage layouts, bin locations, put-away routing, and multiple warehouse coordination.' },
  { emoji: '🛒', title: 'Purchase Management', desc: 'Streamline procurement workflows, automate vendor RFQs, and track order fulfillment.' },
  { emoji: '📈', title: 'Sales Management', desc: 'Accelerate order processing, manage customer relationships, and track sales pipelines.' },
  { emoji: '💰', title: 'Finance & Accounts', desc: 'Integrated billing, automated invoicing, real-time profit analysis, and localized tax filing.' },
  { emoji: '🤖', title: 'AI & Automation', desc: 'Leverage predictive AI to forecast inventory demand, automate stock movement, and suggest optimization plans.' },
  { emoji: '🤳', title: 'Barcode Scanner', desc: 'Turn any mobile phone into a rugged warehouse scanner with zero additional hardware requirements.' },
  { emoji: '📊', title: 'Reports & Analytics', desc: 'Instant access to beautiful dashboards, inventory age reports, sales charts, and financial statement exports.' }
];

const FAQ_DATA = [
  { q: 'How does the 14-day free trial work?', a: 'You get full access to the Professional plan features for 14 days without inputting a credit card. Upgrade or cancel anytime.' },
  { q: 'Can we migrate our existing data?', a: 'Yes! SmartERP provides built-in CSV and Excel data import wizards for quick onboarding of products, vendors, and historical data.' },
  { q: 'Is our company data secure?', a: 'Absolutely. We employ advanced multi-tenant isolation, database level encryption at rest, HTTPS in transit, and role-based access control.' },
  { q: 'Can we change plans later?', a: 'Yes. You can upgrade, downgrade, or change billing details directly from your organization settings page at any time.' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="lp-container">
      {/* Light theme styling inject */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        .lp-container {
          font-family: 'Outfit', sans-serif;
          background: #f8fafc;
          color: #1e293b;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Navbar Styling */
        .lp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 5000;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .lp-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 24px;
        }

        .lp-logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0284c7, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none !important;
        }

        .lp-links {
          display: flex;
          gap: 32px;
          align-items: center;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .lp-links a {
          color: #475569;
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;
          transition: color 0.2s;
        }

        .lp-links a:hover {
          color: #0f172a;
        }

        .lp-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Buttons */
        .btn-saas {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-saas-outline {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
        }

        .btn-saas-outline:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .btn-saas-primary {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15);
        }

        .btn-saas-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(14, 165, 233, 0.25);
        }

        /* Hero Section */
        .lp-hero {
          position: relative;
          padding: 160px 24px 80px;
          text-align: center;
          overflow: hidden;
        }

        .lp-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(circle at 50% -20%, rgba(14, 165, 233, 0.1), transparent 60%),
                      radial-gradient(circle at 10% 80%, rgba(99, 102, 241, 0.05), transparent 40%);
        }

        .lp-hero-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
        }

        .lp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(14, 165, 233, 0.08);
          border: 1px solid rgba(14, 165, 233, 0.18);
          color: #0284c7;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .lp-hero h1 {
          font-size: clamp(2rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .lp-hero h1 span.gradient-text {
          background: linear-gradient(135deg, #0ea5e9, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lp-hero p {
          font-size: clamp(0.95rem, 2vw, 1.25rem);
          color: #475569;
          max-width: 650px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }

        /* Stats Grid */
        .lp-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          margin-top: 60px;
          border-top: 1px solid #e2e8f0;
          padding-top: 40px;
          flex-wrap: wrap;
        }

        .lp-stat-item h3 {
          font-size: 2.2rem;
          font-weight: 800;
          margin: 0 0 5px;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lp-stat-item p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Section layout */
        .lp-section {
          padding: 80px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .lp-sec-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 50px;
        }

        .lp-sec-header h2 {
          font-size: clamp(1.6rem, 3vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
          color: #0f172a;
        }

        .lp-sec-header p {
          color: #475569;
          font-size: 1rem;
          line-height: 1.6;
        }

        /* Features Section */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .lp-feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px 24px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02);
        }

        .lp-feature-card:hover {
          background: #ffffff;
          border-color: rgba(14, 165, 233, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05);
        }

        .lp-feat-icon {
          font-size: 2rem;
          margin-bottom: 20px;
        }

        .lp-feature-card h4 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #0f172a;
        }

        .lp-feature-card p {
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }

        /* Preview Tabs / Screenshots */
        .lp-preview-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .lp-tab-btn {
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lp-tab-btn.active {
          background: #0ea5e9;
          color: #fff;
          border-color: #0ea5e9;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
        }

        .lp-screenshot-wrapper {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04);
          position: relative;
        }

        .lp-mockup-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 12px;
        }

        .lp-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .lp-dot-red { background: #ef4444; }
        .lp-dot-yellow { background: #f59e0b; }
        .lp-dot-green { background: #10b981; }

        .lp-mockup-content {
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
          min-height: 380px;
          display: flex;
          flex-direction: column;
          color: #334155;
          border: 1px solid #e2e8f0;
        }

        /* Industries */
        .lp-industries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }

        .lp-ind-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px 16px;
          text-align: center;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
        }

        .lp-ind-card:hover {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.4);
          transform: scale(1.03);
          box-shadow: 0 4px 6px rgba(0,0,0,0.03);
        }

        .lp-ind-icon {
          font-size: 2.2rem;
          margin-bottom: 12px;
          display: block;
        }

        .lp-ind-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #0f172a;
        }

        /* Pricing Section */
        .lp-pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .lp-price-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 48px 32px;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          overflow: hidden;
        }

        .lp-price-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: transparent;
          transition: all 0.4s ease;
        }

        .lp-price-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.15);
          border-color: #bae6fd;
        }

        .lp-price-card.featured {
          background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(240, 249, 255, 0.6) 100%);
          border: 2px solid rgba(14, 165, 233, 0.5);
          box-shadow: 0 16px 32px -8px rgba(14, 165, 233, 0.15);
        }

        .lp-price-card.featured::before {
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
        }

        .lp-price-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 100px;
          text-transform: uppercase;
        }

        .lp-price-header {
          margin-bottom: 24px;
        }

        .lp-price-header h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #0f172a;
        }

        .lp-price-amount {
          font-size: 2.8rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: baseline;
        }

        .lp-price-amount span {
          font-size: 1rem;
          color: #64748b;
          font-weight: 500;
        }

        .lp-price-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          flex-grow: 1;
        }

        .lp-price-features li {
          font-size: 0.9rem;
          color: #475569;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lp-price-features li::before {
          content: '✓';
          color: #10b981;
          font-weight: 800;
        }

        /* Testimonials */
        .lp-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .lp-testimonial-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
        }

        .lp-stars {
          color: #fbbf24;
          font-size: 1.1rem;
          margin-bottom: 16px;
        }

        .lp-quote {
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.6;
          margin-bottom: 20px;
          font-style: italic;
        }

        .lp-client-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lp-client-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: #0284c7;
          border: 1px solid #cbd5e1;
        }

        .lp-client-details h5 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        .lp-client-details p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        /* FAQ */
        .lp-faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .lp-faq-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .lp-faq-q {
          padding: 20px 24px;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          color: #0f172a;
        }

        .lp-faq-a {
          padding: 0 24px 20px;
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.6;
          border-top: 1px solid #f1f5f9;
          margin-top: 0;
        }

        /* Footer */
        .lp-footer {
          border-top: 1px solid #e2e8f0;
          padding: 60px 24px 40px;
          background: #f1f5f9;
        }

        .lp-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr);
          gap: 40px;
          margin-bottom: 40px;
        }

        .lp-foot-brand h3 {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0284c7, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 16px;
        }

        .lp-foot-brand p {
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.6;
          max-width: 280px;
        }

        .lp-foot-col h5 {
          font-size: 0.85rem;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }

        .lp-foot-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .lp-foot-col ul li {
          margin-bottom: 12px;
        }

        .lp-foot-col ul li a {
          color: #475569;
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.2s;
        }

        .lp-foot-col ul li a:hover {
          color: #0f172a;
        }

        .lp-footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid #e2e8f0;
          padding-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 0.85rem;
          flex-wrap: wrap;
          gap: 16px;
        }

        .lp-socials {
          display: flex;
          gap: 16px;
        }

        .lp-socials a {
          color: #64748b;
          font-size: 1.1rem;
          transition: color 0.2s;
        }

        .lp-socials a:hover {
          color: #0284c7;
        }

        /* Mockup screens inside content wrapper */
        .dash-widget {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          color: #1e293b;
        }

        .progress-bar-small {
          background: #e2e8f0;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        /* Responsive Modifications */
        @media (max-width: 992px) {
          .lp-footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .lp-links {
            display: none;
          }
          .lp-stats {
            gap: 20px;
          }
          .lp-footer-inner {
            grid-template-columns: 1fr;
          }
          .lp-hero {
            padding: 120px 20px 60px;
          }
          .lp-pricing-grid {
            grid-template-columns: 1fr;
          }
          .lp-features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .lp-nav-inner {
            padding: 12px 16px;
          }
          .lp-logo {
            font-size: 1.25rem;
          }
          .btn-saas {
            padding: 8px 14px;
            font-size: 0.8rem;
          }
          .lp-actions {
            gap: 8px;
          }
          .lp-hero h1 {
            font-size: clamp(1.8rem, 8vw, 2.5rem);
            margin-bottom: 12px;
          }
          .lp-hero p {
            font-size: 0.95rem;
            margin-bottom: 24px;
          }
          .lp-stats {
            gap: 16px;
            margin-top: 40px;
            padding-top: 30px;
          }
          .lp-stat-item h3 {
            font-size: 1.6rem;
          }
          .lp-preview-tabs {
            gap: 6px;
          }
          .lp-tab-btn {
            padding: 6px 12px;
            font-size: 0.78rem;
          }
          .lp-section {
            padding: 60px 16px;
          }
          .lp-ind-card {
            padding: 16px 8px;
          }
          .lp-ind-icon {
            font-size: 1.8rem;
          }
          .lp-ind-name {
            font-size: 0.85rem;
          }
        }
      `}</style>

      {/* Sticky Header Navbar */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo">SmartERP Cloud</Link>
          <ul className="lp-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#industries">Industries</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="lp-actions">
            <Link to="/login" className="btn-saas btn-saas-outline">Login</Link>
            <Link to="/signup" className="btn-saas btn-saas-primary">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="lp-hero">
        <div className="lp-hero-bg"></div>
        <div className="lp-hero-content">
          <div className="lp-badge">
            <span className="lp-badge-dot" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#0284c7' }}></span>
            New: SmartERP AI Assistant v3.5 is online
          </div>
          <h1>
            Next Generation <span className="gradient-text">ERP & Warehouse</span> Management Platform
          </h1>
          <p>
            An enterprise-grade platform to manage inventory, warehouses, manufacturing, sales, purchase orders, finances, and local AI automations on a single cloud platform.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-saas btn-saas-primary btn-saas-lg" style={{ padding: '14px 28px', fontSize: '1rem' }}>Start Free Trial</Link>
            <a href="#pricing" className="btn-saas btn-saas-outline btn-saas-lg" style={{ padding: '14px 28px', fontSize: '1rem' }}>Book Demo</a>
          </div>

          <div className="lp-stats">
            <div className="lp-stat-item">
              <h3>99.99%</h3>
              <p>System Uptime</p>
            </div>
            <div className="lp-stat-item">
              <h3>2.4x</h3>
              <p>Throughput Speed</p>
            </div>
            <div className="lp-stat-item">
              <h3>1M+</h3>
              <p>Items Scanned Daily</p>
            </div>
            <div className="lp-stat-item">
              <h3>100%</h3>
              <p>Data Isolation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Screenshots Section */}
      <section className="lp-section" id="solutions" style={{ paddingTop: 0 }}>
        <div className="lp-sec-header">
          <h2>Experience the Enterprise UI</h2>
          <p>Explore our visual dashboard, multi-warehouse stock controllers, live barcode scanner hubs, and automation pipelines.</p>
        </div>

        <div className="lp-preview-tabs">
          <button className={`lp-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
          <button className={`lp-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>📦 Inventory</button>
          <button className={`lp-tab-btn ${activeTab === 'warehouse' ? 'active' : ''}`} onClick={() => setActiveTab('warehouse')}>🏭 Warehouse Layout</button>
          <button className={`lp-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>🤳 Mobile Scanner</button>
        </div>

        <div className="lp-screenshot-wrapper">
          <div className="lp-mockup-bar">
            <span className="lp-dot lp-dot-red"></span>
            <span className="lp-dot lp-dot-yellow"></span>
            <span className="lp-dot lp-dot-green"></span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 10 }}>smarterp.cloud/enterprise/workspace</span>
          </div>

          <div className="lp-mockup-content p-4">
            {activeTab === 'dashboard' && (
              <div className="w-100 h-100 d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-3">
                  <h4 className="m-0 text-dark fw-bold" style={{ fontSize: '1.1rem' }}>Live Business Analytics</h4>
                  <span className="badge bg-primary text-white" style={{ fontSize: '0.75rem' }}>Active Plan: Enterprise</span>
                </div>
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="dash-widget shadow-sm">
                      <div className="text-muted small">Total Sales Month-to-Date</div>
                      <h2 className="text-dark fw-bold my-2" style={{ fontSize: '1.5rem' }}>$148,930</h2>
                      <div className="text-success small">▲ 14.2% from last month</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="dash-widget shadow-sm">
                      <div className="text-muted small">Active Warehouses</div>
                      <h2 className="text-dark fw-bold my-2" style={{ fontSize: '1.5rem' }}>8 Zones</h2>
                      <div className="text-info small">36 Aisle sections configured</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="dash-widget shadow-sm">
                      <div className="text-muted small">AI Fulfillment Suggested</div>
                      <h2 className="text-warning fw-bold my-2" style={{ fontSize: '1.5rem' }}>12 Items</h2>
                      <div className="text-muted small">Draft POs waiting</div>
                    </div>
                  </div>
                </div>

                <div className="dash-widget mt-2 shadow-sm">
                  <h5 className="text-dark fw-bold mb-3" style={{ fontSize: '0.95rem' }}>Warehouse Traffic Flow</h5>
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>Main Hub Chicago</span>
                        <span>84% capacity</span>
                      </div>
                      <div className="progress-bar-small">
                        <div style={{ width: '84%', height: '100%', background: '#f59e0b' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>West Coast Logistics</span>
                        <span>42% capacity</span>
                      </div>
                      <div className="progress-bar-small">
                        <div style={{ width: '42%', height: '100%', background: '#10b981' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="w-100 h-100 d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-3">
                  <h4 className="m-0 text-dark fw-bold" style={{ fontSize: '1.1rem' }}>Stock Control Index</h4>
                  <button className="btn btn-sm btn-primary">+ Receive Goods</button>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover border-light">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Description</th>
                        <th>Lot Number</th>
                        <th>Qty On Hand</th>
                        <th>Safety Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-primary fw-bold">CPU-INT-09</td>
                        <td>Intel Core i9 14900K Processor</td>
                        <td className="text-warning">LOT-2026-A9</td>
                        <td>420 units</td>
                        <td>100</td>
                        <td><span className="badge bg-success">Optimal</span></td>
                      </tr>
                      <tr>
                        <td className="text-primary fw-bold">RAM-COR-32</td>
                        <td>Corsair Vengeance 32GB DDR5</td>
                        <td className="text-warning">LOT-2026-B2</td>
                        <td>24 units</td>
                        <td>50</td>
                        <td><span className="badge bg-danger text-white">Low Stock</span></td>
                      </tr>
                      <tr>
                        <td className="text-primary fw-bold">SSD-SAM-02</td>
                        <td>Samsung 990 Pro NVMe 2TB</td>
                        <td className="text-warning">LOT-2026-C1</td>
                        <td>1,050 units</td>
                        <td>200</td>
                        <td><span className="badge bg-success">Optimal</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'warehouse' && (
              <div className="w-100 h-100 d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-3">
                  <h4 className="m-0 text-dark fw-bold" style={{ fontSize: '1.1rem' }}>WMS Layout Matrix</h4>
                  <span className="text-muted small">Warehouse: MAIN</span>
                </div>
                <div className="row g-2 text-center font-monospace">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border border-light shadow-sm">
                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Aisle A</div>
                      <div className="fw-bold my-1 text-dark" style={{ fontSize: '0.8rem' }}>Fast Moving</div>
                      <div className="badge bg-success" style={{ fontSize: '0.7rem' }}>85% Fill</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border border-light shadow-sm">
                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Aisle B</div>
                      <div className="fw-bold my-1 text-dark" style={{ fontSize: '0.8rem' }}>Bulk Storage</div>
                      <div className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>92% Fill</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border border-light shadow-sm">
                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Aisle C</div>
                      <div className="fw-bold my-1 text-dark" style={{ fontSize: '0.8rem' }}>Cold Chain Lot</div>
                      <div className="badge bg-success" style={{ fontSize: '0.7rem' }}>54% Fill</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border border-light shadow-sm">
                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Aisle D</div>
                      <div className="fw-bold my-1 text-dark" style={{ fontSize: '0.8rem' }}>Returns / Hold</div>
                      <div className="badge bg-info text-white" style={{ fontSize: '0.7rem' }}>12% Fill</div>
                    </div>
                  </div>
                </div>
                <div className="dash-widget mt-2 shadow-sm">
                  <div className="small text-muted mb-2">Automated Bin Assignment Recommendation:</div>
                  <div className="p-2 text-success font-monospace rounded border border-light" style={{ background: '#f0fdf4', fontSize: '0.8rem' }}>
                    🚀 SUGGESTED BIN: [WH-MAIN-A2-S4-B08] for CPU-INT-09 (Fast Picking Zone)
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scanner' && (
              <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                <div className="bg-white p-4 rounded-3 border border-light text-center shadow-sm" style={{ maxWidth: '280px', width: '100%' }}>
                  <div className="text-dark small mb-3">🤳 SMART SCANNER CORE</div>
                  <div className="bg-light p-3 mb-3 rounded border border-light d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '120px' }}>
                    <div style={{ width: '80%', height: '2px', background: '#ef4444' }}></div>
                    <span className="text-muted small mt-2">Position barcode in scan area</span>
                  </div>
                  <input type="text" className="form-control form-control-sm text-center mb-2 bg-light text-dark border-light" placeholder="Manual Barcode Input" value="88092892911" readOnly />
                  <button className="btn btn-sm btn-primary w-100">Verify Goods Receive</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="lp-section" id="features">
        <div className="lp-sec-header">
          <h2>Fully Loaded SaaS Capabilities</h2>
          <p>Everything you need to orchestrate global resource planning, storage, and customer delivery pipelines in a single platform.</p>
        </div>

        <div className="lp-features-grid">
          {FEATURES.map((feat, idx) => (
            <div className="lp-feature-card" key={idx}>
              <div className="lp-feat-icon">{feat.emoji}</div>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industries Section */}
      <section className="lp-section" id="industries">
        <div className="lp-sec-header">
          <h2>Engineered for Global Industries</h2>
          <p>Whether you operate complex manufacturing assembly lines or high-volume wholesale warehouses, we have you covered.</p>
        </div>

        <div className="lp-images-placeholder mb-4">
          <div className="lp-industries-grid">
            {INDUSTRIES.map((ind, idx) => (
              <div className="lp-ind-card" key={idx}>
                <span className="lp-ind-icon">{ind.icon}</span>
                <span className="lp-ind-name">{ind.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="lp-section" style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="lp-sec-header">
          <h2>Built for the Modern Enterprise</h2>
          <p>Why scaling firms choose SmartERP Cloud over legacy desktop software.</p>
        </div>

        <div className="row g-4 text-center">
          <div className="col-12 col-md-4">
            <div className="p-3">
              <div className="fs-1 mb-3">⚡</div>
              <h4 className="text-dark fw-bold mb-2">Ultra Fast Operations</h4>
              <p className="text-muted small">Built with optimized SQL queries and lightweight front-end components for sub-millisecond updates.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="p-3">
              <div className="fs-1 mb-3">🛡️</div>
              <h4 className="text-dark fw-bold mb-2">Enterprise-Grade Security</h4>
              <p className="text-muted small">Standard MFA integration, secure JWT session cookies, and database schema security isolation.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="p-3">
              <div className="fs-1 mb-3">🤖</div>
              <h4 className="text-dark fw-bold mb-2">AI-Driven Predictions</h4>
              <p className="text-muted small">Automated rules calculate lead times, average daily sales, safety levels and propose optimal reorders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core ERP Modules Section */}
      <section className="lp-section" id="modules" style={{ background: '#ffffff', padding: '100px 0' }}>
        <div className="lp-sec-header">
          <h2>Unmatched Core Capabilities</h2>
          <p>Explore the powerful modules that drive your business forward.</p>
        </div>

        <div className="row g-5 align-items-center mb-5" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="col-12 col-md-6 order-2 order-md-1">
            <h3 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Advanced WMS Hierarchy</h3>
            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
              Say goodbye to lost inventory. Our sophisticated Warehouse Management System provides granular tracking down to the exact bin location. Navigate through <strong>Zone → Aisle → Rack → Shelf → Bin</strong> hierarchies.
            </p>
            <ul className="list-unstyled text-muted mb-0" style={{ lineHeight: '2' }}>
              <li><span className="text-success me-2">✔</span>Auto Bin Recommendation</li>
              <li><span className="text-success me-2">✔</span>Capacity Validation</li>
              <li><span className="text-success me-2">✔</span>Visual Warehouse Mapping</li>
              <li><span className="text-success me-2">✔</span>Serial & Lot level traceability</li>
            </ul>
          </div>
          <div className="col-12 col-md-6 order-1 order-md-2 text-center">
            <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #f1f5f9)', borderRadius: '24px', padding: '40px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
              <img src="/logo192.png" alt="WMS Dashboard" style={{ width: '80%', opacity: '0.8', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }} />
            </div>
          </div>
        </div>

        <div className="row g-5 align-items-center mt-5" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="col-12 col-md-6 text-center">
            <div style={{ background: 'linear-gradient(135deg, #fce7f3, #f1f5f9)', borderRadius: '24px', padding: '40px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
               <img src="/logo192.png" alt="Scanner Application" style={{ width: '80%', opacity: '0.8', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }} />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <h3 className="fw-bold mb-3" style={{ color: '#0f172a' }}>PWA Mobile Scanner</h3>
            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
              Equip your warehouse workers with our built-in Progressive Web App (PWA) scanner. No need to purchase expensive proprietary scanning hardware. 
              Simply use any smartphone camera to perform high-speed barcode operations.
            </p>
            <ul className="list-unstyled text-muted mb-0" style={{ lineHeight: '2' }}>
              <li><span className="text-primary me-2">📱</span>Instant Web-cam decoding</li>
              <li><span className="text-primary me-2">⚡</span>Real-time reconciliation</li>
              <li><span className="text-primary me-2">📦</span>Directed Put-away</li>
              <li><span className="text-primary me-2">🔔</span>Auditory feedback</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="lp-section" id="pricing">
        <div className="lp-sec-header">
          <h2>Transparent, Growth-Focused Plans</h2>
          <p>Pick the subscription plan that aligns with your operations. Scale up as you open new warehouses.</p>
        </div>

        <div className="lp-pricing-grid">
          {PLANS.map((plan, idx) => (
            <div className={`lp-price-card ${plan.popular ? 'featured' : ''}`} key={idx}>
              {plan.popular && <div className="lp-price-badge">{plan.badge}</div>}
              <div className="lp-price-header">
                <h3>{plan.name}</h3>
                <div className="lp-price-amount">
                  {plan.price}
                  <span>{plan.period}</span>
                </div>
              </div>
              <ul className="lp-price-features">
                {plan.features.map((feat, fidx) => (
                  <li key={fidx}>{feat}</li>
                ))}
              </ul>
              <Link to="/signup" className={`btn-saas ${plan.popular ? 'btn-saas-primary' : 'btn-saas-outline'} w-100 text-center justify-content-center mt-auto`}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="lp-section">
        <div className="lp-sec-header">
          <h2>Trusted by Logistics Leaders</h2>
          <p>See how logistics directors and operators are cutting down order dispatch times by over 40%.</p>
        </div>

        <div className="lp-testimonials-grid">
          <div className="lp-testimonial-card shadow-sm">
            <div className="lp-stars">★★★★★</div>
            <div className="lp-quote">
              "SmartERP Cloud changed our retail operations completely. We configured 4 warehouses and mapped all aisles in less than an hour. The mobile barcode scanner works perfectly on our workers' tablets."
            </div>
            <div className="lp-client-info">
              <div className="lp-client-avatar">DB</div>
              <div className="lp-client-details">
                <h5>David Beckham</h5>
                <p>Director of Logistics, Apex Retail</p>
              </div>
            </div>
          </div>

          <div className="lp-testimonial-card shadow-sm">
            <div className="lp-stars">★★★★★</div>
            <div className="lp-quote">
              "The AI procurement assistant auto-suggests purchase orders based on lead times and stock alert limits. We no longer run out of fast-moving processors. Highly recommended SaaS tool."
            </div>
            <div className="lp-client-info">
              <div className="lp-client-avatar">SR</div>
              <div className="lp-client-details">
                <h5>Sarah Jenkins</h5>
                <p>Purchasing Head, Silicon Hardware</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="lp-section" id="faq">
        <div className="lp-sec-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about workspace setup, data safety, and pricing details.</p>
        </div>

        <div className="lp-faq-container">
          {FAQ_DATA.map((faq, idx) => (
            <div className="lp-faq-item shadow-sm" key={idx} onClick={() => toggleFaq(idx)}>
              <div className="lp-faq-q">
                <span>{faq.q}</span>
                <span>{faqOpen === idx ? '−' : '+'}</span>
              </div>
              {faqOpen === idx && (
                <div className="lp-faq-a">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-foot-brand">
            <h3>SmartERP Cloud</h3>
            <p>Sleek, secure, and modern resource planning and warehouse mapping tools for global growth brands.</p>
          </div>
          <div className="lp-foot-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#solutions">Solutions</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>
          <div className="lp-foot-col">
            <h5>Support</h5>
            <ul>
              <li><a href="#faq">FAQ Help</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
          <div className="lp-foot-col">
            <h5>Social</h5>
            <ul>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>&copy; 2026 SmartERP Cloud. All rights reserved. Powered by ProductERP.</span>
          <div className="lp-socials">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">🔗</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">💻</a>
          </div>
        </div>
      </footer>

      <VisitorChatWidget />
    </div>
  );
}
