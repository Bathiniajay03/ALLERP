import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ScanLine, Warehouse, ShieldCheck } from 'lucide-react';

export default function ProductHighlights() {
  const highlights = [
    {
      title: 'Advanced Analytics & Reports',
      desc: 'Gain real-time insights into your enterprise performance with fully customizable dashboards, predictive analytics, and automated financial reporting.',
      img: '/images/reports.png',
      icon: BarChart3,
      reversed: false
    },
    {
      title: 'Smart Barcode Scanning',
      desc: 'Empower your warehouse team with mobile-ready barcode and QR scanning. Execute putaways, picking, and stock counts with pinpoint accuracy.',
      img: '/images/scsnner.png',
      icon: ScanLine,
      reversed: true
    },
    {
      title: 'Next-Gen WMS',
      desc: 'Orchestrate complex warehouse operations with intelligent zone picking, wave planning, and automated replenishment workflows.',
      img: '/images/wms.png',
      icon: Warehouse,
      reversed: false
    },
    {
      title: 'Multi-Location Tracking',
      desc: 'Scale your operations across multiple facilities seamlessly. Track every SKU, lot, and serial number across your entire global supply chain.',
      img: '/images/wms2.png',
      icon: ShieldCheck,
      reversed: true
    }
  ];

  return (
    <section className="bg-white overflow-hidden" style={{ borderTop: '1px solid var(--mind-border)' }}>
      <div className="container py-5 py-lg-6">
        <div className="text-center mb-5 mb-lg-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="display-5 fw-bold text-mind-main mb-3"
          >
            Built for Scale
          </motion.h2>
          <p className="text-mind-muted lead mx-auto" style={{ maxWidth: '600px' }}>
            Discover how MIND ERP transforms complex operations into streamlined workflows.
          </p>
        </div>

        <div className="d-flex flex-column gap-5 gap-lg-6 mt-4 mt-lg-5">
          {highlights.map((item, i) => (
            <div key={i} className={`row align-items-center gy-5 ${item.reversed ? 'flex-md-row-reverse' : ''}`}>
              <div className="col-lg-5">
                <motion.div 
                  initial={{ opacity: 0, x: item.reversed ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="d-inline-flex p-3 rounded-4 mb-4 shadow-sm" style={{ background: 'var(--mind-primary-glow)', color: 'var(--mind-primary)' }}>
                    <item.icon size={28} />
                  </div>
                  <h3 className="fw-bold text-mind-main mb-3">{item.title}</h3>
                  <p className="text-mind-muted fs-5 mb-4" style={{ lineHeight: '1.7' }}>{item.desc}</p>
                  <button className="btn fw-semibold d-inline-flex align-items-center gap-2 p-0 bg-transparent border-0" style={{ color: 'var(--mind-primary)' }}>
                    Explore Feature <span style={{ transform: 'translateX(2px)' }}>→</span>
                  </button>
                </motion.div>
              </div>
              <div className="col-lg-6 offset-lg-1">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="position-relative"
                >
                  <div className="position-absolute w-100 h-100 rounded-4" style={{ top: '20px', left: item.reversed ? '-20px' : '20px', background: 'var(--mind-primary)', opacity: 0.05, transform: 'scale(0.95)', zIndex: 0, filter: 'blur(10px)' }}></div>
                  <img src={item.img} alt={item.title} className="img-fluid rounded-4 shadow-lg position-relative z-1" style={{ border: '1px solid var(--mind-border)' }} />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
