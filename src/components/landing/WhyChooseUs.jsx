import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    "Native cloud architecture",
    "Real-time data synchronization",
    "Bank-grade security protocols",
    "Seamless API integrations",
    "24/7 dedicated support",
    "Automated compliance reporting"
  ];

  return (
    <section className="py-6 position-relative">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="display-5 fw-bold text-mind-main mb-4"
            >
              Built for the modern <br/><span style={{ color: 'var(--mind-primary)' }}>enterprise.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-mind-muted lead mb-5"
            >
              We completely reimagined what an ERP should be. Say goodbye to legacy systems that take months to deploy and require extensive training.
            </motion.p>

            <div className="row g-4">
              {points.map((p, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
                  className="col-md-6 d-flex align-items-center gap-3"
                >
                  <CheckCircle2 size={20} style={{ color: 'var(--mind-info)' }} />
                  <span className="text-mind-main fw-medium">{p}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="position-relative">
              {/* Abstract decorative elements */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="position-absolute rounded-circle"
                style={{ top: '50%', left: '50%', width: '400px', height: '400px', border: '1px dashed var(--mind-border)', transform: 'translate(-50%, -50%)', zIndex: 0 }}
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="position-absolute rounded-circle"
                style={{ top: '50%', left: '50%', width: '300px', height: '300px', border: '1px dashed rgba(79, 70, 229, 0.2)', transform: 'translate(-50%, -50%)', zIndex: 0 }}
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="glass-card rounded-5 p-5 mx-auto position-relative z-1"
                style={{ maxWidth: '400px', background: 'rgba(255, 255, 255, 0.95)' }}
              >
                <div className="d-flex flex-column gap-4">
                  {[1, 2, 3].map((_, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05, x: 10 }}
                      className="d-flex align-items-center gap-3 p-3 rounded-4 cursor-pointer"
                      style={{ background: 'var(--mind-surface)', border: '1px solid var(--mind-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
                    >
                      <div className="rounded-circle" style={{ width: '40px', height: '40px', background: 'var(--mind-primary-glow)' }}></div>
                      <div className="flex-fill">
                        <div className="rounded w-75 mb-2" style={{ height: '8px', background: 'var(--mind-border)' }}></div>
                        <div className="rounded w-50" style={{ height: '8px', background: 'var(--mind-border)' }}></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
