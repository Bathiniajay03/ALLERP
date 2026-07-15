import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#industries' },
    { name: 'Pricing', href: '#pricing' }
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`navbar navbar-expand-lg fixed-top transition-all duration-300 ${scrolled ? 'glass-nav py-2' : 'py-4'}`}
      style={{ zIndex: 1000, transition: 'all 0.3s ease' }}
    >
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="rounded d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}>
            M
          </div>
          <span className="fw-bold fs-5 text-mind-main" style={{ letterSpacing: '1px' }}>MIND ERP</span>
        </Link>

        {/* Mobile Toggle */}
        <button 
          className="navbar-toggler border-0 shadow-none text-mind-main" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">
          <ul className="navbar-nav gap-4">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.name}>
                <a 
                  href={link.href} 
                  className={`nav-link fw-medium transition-colors ${scrolled ? 'text-mind-main' : 'text-mind-main'}`}
                  style={{ fontSize: '0.95rem' }}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Actions */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          <Link to="/login" className={`text-decoration-none fw-medium ${scrolled ? 'text-mind-main' : 'text-mind-main'}`}>
            Login
          </Link>
          <Link to="/signup" className="btn rounded-pill px-4 fw-semibold text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="position-absolute top-100 start-0 w-100 shadow-lg d-lg-none border-bottom border-light"
            style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="container py-4 d-flex flex-column gap-3">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-mind-main text-decoration-none fw-medium fs-5"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-secondary opacity-10 my-2" />
              <Link to="/login" className="text-mind-main text-decoration-none fw-medium fs-5" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn btn-primary rounded-pill py-3 fw-bold mt-2 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-link:hover { opacity: 0.7; }
      `}</style>
    </motion.nav>
  );
}
