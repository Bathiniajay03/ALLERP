import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Cloud, Server, Smartphone, Cpu, X, Play } from 'lucide-react';

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } }
};

export default function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="position-relative overflow-hidden pt-6 pb-5 pt-lg-7 pb-lg-6" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="mind-hero-bg"></div>

      <div className="container">
        <div className="row align-items-center gy-5">
          {/* Left Side: Content */}
          <div className="col-lg-6 z-1">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="display-4 display-lg-3 fw-bold mb-4 mt-5 mt-lg-0"
              style={{ letterSpacing: '-1.5px', color: '#0f172a' }}
            >
              Next Generation ERP Platform <br />
              <span style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Built for Smart Businesses</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lead mb-5 fs-5 text-mind-muted"
              style={{ maxWidth: '90%' }}
            >
              Manage Inventory, Warehouses, Finance, Manufacturing, Purchasing, Sales, Barcode, WMS, AI Automation and Analytics from one intelligent platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="d-flex flex-wrap gap-3 mb-5"
            >
              <Link to="/signup" className="btn btn-lg rounded-pill fw-semibold px-4 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                Start Free Trial
              </Link>
              <button className="btn btn-outline-dark btn-lg rounded-pill fw-semibold px-4">
                Book Demo
              </button>
              <button onClick={() => setVideoOpen(true)} className="btn btn-link text-decoration-none fw-semibold d-flex align-items-center gap-2" style={{ color: '#4f46e5' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', background: '#4f46e5', color: '#fff' }}>
                  <Play size={16} fill="currentColor" />
                </div>
                Watch Product Tour
              </button>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } } }}
              className="d-flex flex-wrap gap-3"
            >
              {[
                { icon: Cloud, text: 'Cloud Ready' },
                { icon: Shield, text: 'Secure' },
                { icon: Server, text: 'Multi Tenant' },
                { icon: Smartphone, text: 'Mobile Ready' },
                { icon: Cpu, text: 'AI Powered' },
              ].map((badge, idx) => (
                <motion.div key={idx} variants={badgeVariants} className="badge bg-white p-2 d-flex align-items-center gap-2 rounded-pill" style={{ border: '1px solid var(--mind-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <badge.icon size={14} style={{ color: '#4f46e5' }} />
                  <span className="text-mind-main fw-medium">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Side: Animated Dashboard Elements */}
          <div className="col-lg-6 z-1 position-relative d-none d-md-block" style={{ height: '500px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              style={{ perspective: '1000px' }}
              className="h-100 w-100 position-relative"
            >
              {/* Floating Widgets */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="position-absolute glass-card p-3 rounded-4"
                style={{ top: '10%', left: '5%', width: '220px', zIndex: 3 }}
              >
                <h6 className="text-mind-muted mb-2 fs-7 fw-semibold">Revenue Graph</h6>
                <div className="d-flex align-items-end gap-1 mt-3" style={{ height: '40px' }}>
                  {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                    <motion.div key={i} className="rounded-top flex-fill" style={{ height: `${h}%`, background: '#4f46e5' }} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1 + (i * 0.1) }} />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="position-absolute glass-card p-4 rounded-4 text-center"
                style={{ top: '40%', right: '0%', width: '200px', zIndex: 4 }}
              >
                <Cpu size={32} style={{ color: '#06b6d4' }} className="mb-2" />
                <h6 className="text-mind-main fw-bold">AI Insights</h6>
                <p className="text-mind-muted small mb-0">Stock anomaly detected in WH-02</p>
              </motion.div>

              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="position-absolute glass-card p-3 rounded-4 w-100"
                style={{ bottom: '10%', left: '10%', zIndex: 2 }}
              >
                <h6 className="text-mind-muted mb-3 fs-7 fw-semibold">Order Timeline</h6>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle" style={{ width: '10px', height: '10px', background: '#10b981' }}></div>
                  <div className="flex-fill" style={{ height: '2px', background: 'var(--mind-border)' }}></div>
                  <div className="rounded-circle" style={{ width: '10px', height: '10px', background: '#4f46e5' }}></div>
                  <div className="flex-fill" style={{ height: '2px', background: 'var(--mind-border)' }}></div>
                  <div className="rounded-circle" style={{ width: '10px', height: '10px', background: '#f59e0b' }}></div>
                </div>
              </motion.div>

              {/* Main Background Panel */}
              <div className="position-absolute glass-card rounded-4" style={{ top: '15%', left: '15%', right: '10%', bottom: '15%', zIndex: 1, background: 'rgba(255,255,255,0.95)' }}>
                <div className="p-3 d-flex gap-2" style={{ borderBottom: '1px solid var(--mind-border)' }}>
                  <div className="rounded-circle" style={{ width: '10px', height: '10px', background: '#ef4444' }}></div>
                  <div className="rounded-circle" style={{ width: '10px', height: '10px', background: '#f59e0b' }}></div>
                  <div className="rounded-circle" style={{ width: '10px', height: '10px', background: '#10b981' }}></div>
                </div>
                <div className="p-4 d-flex flex-column gap-3">
                  <div className="rounded w-75" style={{ height: '12px', background: 'var(--mind-border)' }}></div>
                  <div className="rounded w-50" style={{ height: '12px', background: 'var(--mind-border)' }}></div>
                  <div className="rounded w-100 mt-4" style={{ height: '60px', background: 'var(--mind-border)' }}></div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)' }}
          >
            <div className="container position-relative">
              <button
                onClick={() => setVideoOpen(false)}
                className="btn btn-light rounded-circle position-absolute d-flex align-items-center justify-content-center p-0 shadow"
                style={{ width: '40px', height: '40px', top: '-50px', right: '15px', zIndex: 10000 }}
              >
                <X size={24} className="text-dark" />
              </button>
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="w-100 rounded-4 overflow-hidden shadow-lg position-relative bg-dark"
                style={{ aspectRatio: '16/9', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {/* 
                  Note: A real video URL can be placed here. We use a placeholder image based on the user's detailed cinematic prompt. 
                  The user can swap this out with an actual rendered video once they run the prompt through an AI video tool.
                */}
                <video
                  className="w-100 h-100 object-fit-cover"
                  controls
                  poster="/images/cinematic_3d_avatar_poster.png"
                  src="/images/my-video.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              <div className="position-absolute top-0 start-0 w-100 p-3 pointer-events-none" style={{ zIndex: 1, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
                <h5 className="text-white mb-0">MIND ERP - Placeholder Video</h5>
                <small className="text-white-50">Replace 'src' with your actual 30-second 3D animation file.</small>
              </div>
          </motion.div>
            </div>
    </motion.div>
  )
}
      </AnimatePresence >
    </section >
  );
}
