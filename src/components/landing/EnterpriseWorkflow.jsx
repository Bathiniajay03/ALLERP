import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Server, Store, Truck, ShoppingCart } from 'lucide-react';

export default function EnterpriseWorkflow() {
  const steps = [
    { icon: Building2, label: 'HQ', desc: 'Central Control' },
    { icon: Server, label: 'WMS', desc: 'Warehousing' },
    { icon: Truck, label: 'Logistics', desc: 'Distribution' },
    { icon: Store, label: 'Retail', desc: 'Point of Sale' },
    { icon: ShoppingCart, label: 'B2B', desc: 'E-commerce' }
  ];

  return (
    <section className="py-6 bg-white position-relative" style={{ borderTop: '1px solid var(--mind-border)', borderBottom: '1px solid var(--mind-border)' }}>
      <div className="container">
        <div className="text-center mb-5">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="display-6 fw-bold text-mind-main mb-3"
          >
            Connected Enterprise
          </motion.h2>
        </div>

        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center position-relative py-5">
          {/* Connecting Line */}
          <div className="d-none d-lg-block position-absolute top-50 start-0 w-100" style={{ height: '2px', background: 'var(--mind-border)', zIndex: 0 }}>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-100"
              style={{ background: 'linear-gradient(90deg, var(--mind-primary), var(--mind-info))' }}
            />
          </div>

          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="position-relative z-1 text-center my-4 my-lg-0"
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                  style={{ width: '80px', height: '80px', background: 'var(--mind-surface)', border: '2px solid var(--mind-primary)' }}
                >
                  <step.icon size={32} style={{ color: 'var(--mind-primary)' }} />
                </div>
                <h5 className="text-mind-main fw-bold mb-1">{step.label}</h5>
                <p className="text-mind-muted small mb-0">{step.desc}</p>
              </motion.div>
              
              {/* Mobile Arrow */}
              {i < steps.length - 1 && (
                <div className="d-lg-none my-3 text-mind-muted">
                  <ArrowRight size={24} style={{ transform: 'rotate(90deg)' }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
