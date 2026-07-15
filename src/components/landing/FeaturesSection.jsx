import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Package, Warehouse, QrCode, Layers, Hash, ShoppingCart, TrendingUp, DollarSign, Factory, FileText, PieChart, Bot } from 'lucide-react';

const GlowCard = ({ title, icon: Icon, delay }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="col-md-6 col-lg-3"
    >
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="erp-glow-card h-100 p-4 rounded-4 position-relative overflow-hidden cursor-pointer"
        style={{
          background: 'var(--mind-surface)',
          border: '1px solid var(--mind-border)',
          boxShadow: 'var(--mind-shadow)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="erp-glow-card-bg position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none', zIndex: 1, opacity: 0, transition: 'opacity 0.3s' }}></div>
        <div className="position-relative z-2">
          <motion.div 
            className="icon-wrapper mb-3 text-mind-main d-inline-flex p-3 rounded-3"
            style={{ background: 'var(--mind-primary-glow)', color: 'var(--mind-primary)' }}
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <Icon size={24} style={{ color: 'var(--mind-primary)' }} />
          </motion.div>
          <h5 className="text-mind-main fw-semibold mb-0 fs-6">{title}</h5>
        </div>
      </div>
    </motion.div>
  );
};

export default function FeaturesSection() {
  const features = [
    { title: 'Inventory Management', icon: Package },
    { title: 'Warehouse Management', icon: Warehouse },
    { title: 'Barcode & QR', icon: QrCode },
    { title: 'Lot Tracking', icon: Layers },
    { title: 'Serial Tracking', icon: Hash },
    { title: 'Purchase Orders', icon: ShoppingCart },
    { title: 'Sales Orders', icon: TrendingUp },
    { title: 'Finance', icon: DollarSign },
    { title: 'Manufacturing', icon: Factory },
    { title: 'Reports', icon: FileText },
    { title: 'Analytics', icon: PieChart },
    { title: 'AI Assistant', icon: Bot },
  ];

  return (
    <section id="features" className="py-6 position-relative" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="text-center mb-5">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="display-5 fw-bold text-mind-main mb-3"
          >
            Everything you need. <br/><span className="text-mind-muted">Nothing you don't.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-mind-muted lead mx-auto"
            style={{ maxWidth: '600px' }}
          >
            A completely unified suite of applications designed to manage every aspect of your enterprise without the bloat.
          </motion.p>
        </div>

        <div className="row g-4">
          {features.map((f, i) => (
            <GlowCard key={i} title={f.title} icon={f.icon} delay={i * 0.05} />
          ))}
        </div>
      </div>

      <style>{`
        .erp-glow-card:hover .erp-glow-card-bg {
          opacity: 1 !important;
          background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(79, 70, 229, 0.08), transparent 40%);
        }
        .erp-glow-card:hover {
          border-color: rgba(79, 70, 229, 0.3) !important;
          box-shadow: 0 15px 40px rgba(79, 70, 229, 0.1) !important;
        }
      `}</style>
    </section>
  );
}
