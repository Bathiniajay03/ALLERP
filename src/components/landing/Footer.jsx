import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="pt-6 pb-4 position-relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#f8fafc', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Decorative Glow */}
      <div className="position-absolute top-0 start-50 translate-middle rounded-circle" style={{ width: '600px', height: '200px', background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      
      <div className="container position-relative z-1">
        <div className="row gy-5 mb-5">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="rounded d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: 'white' }}>
                M
              </div>
              <span className="fw-bold fs-5 text-white" style={{ letterSpacing: '1px' }}>MIND ERP</span>
            </div>
            <p className="text-white-50 pe-lg-5">
              The next generation enterprise resource planning platform built for modern businesses that demand speed, security, and scale.
            </p>
          </div>
          
          <div className="col-6 col-md-4 col-lg-2">
            <h6 className="text-white fw-bold mb-4">Product</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">Solutions</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">Security</a></li>
            </ul>
          </div>
          
          <div className="col-6 col-md-4 col-lg-2">
            <h6 className="text-white fw-bold mb-4">Resources</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">API</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-colors">Guides</a></li>
            </ul>
          </div>

          <div className="col-md-4 col-lg-4">
            <h6 className="text-white fw-bold mb-4">Subscribe to our newsletter</h6>
            <p className="text-white-50 mb-3">Get the latest updates on new features and product improvements.</p>
            <div className="d-flex gap-2">
              <input type="email" className="form-control bg-dark border-secondary text-white" placeholder="Email address" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <button className="btn text-white fw-semibold" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>Subscribe</button>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white-50 mb-0 small">&copy; {new Date().getFullYear()} MIND ERP Inc. All rights reserved.</p>
          <div className="d-flex gap-4 mt-3 mt-md-0">
            <a href="#" className="text-white-50 text-decoration-none small hover-text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-white-50 text-decoration-none small hover-text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-white-50 text-decoration-none small hover-text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-white-50 text-decoration-none small hover-text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
      <style>{`
        .hover-text-white:hover { color: white !important; }
        .transition-colors { transition: color 0.3s ease; }
      `}</style>
    </footer>
  );
}
