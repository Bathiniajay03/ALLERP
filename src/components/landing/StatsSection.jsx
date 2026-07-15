import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe2, Building2, Zap } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    { label: 'Active Users', value: '100K+', icon: Users },
    { label: 'Countries', value: '150+', icon: Globe2 },
    { label: 'Enterprises', value: '5,000+', icon: Building2 },
    { label: 'Uptime', value: '99.99%', icon: Zap },
  ];

  return (
    <section className="py-5 position-relative z-2" style={{ marginTop: '-80px' }}>
      <div className="container">
        <div className="glass-card rounded-5 p-4 p-md-5" style={{ background: 'var(--mind-surface)', border: '1px solid var(--mind-border)', boxShadow: 'var(--mind-shadow)' }}>
          <div className="row g-4 text-center">
            {stats.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`col-12 col-md-3 border-bottom border-md-bottom-0 py-4 py-md-0 ${i < stats.length - 1 ? 'border-md-end' : ''}`}
                style={{ borderColor: 'var(--mind-border)' }}
              >
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <div className="mb-3 p-3 rounded-circle text-mind-main" style={{ background: 'var(--mind-primary-glow)' }}>
                    <s.icon size={28} style={{ color: 'var(--mind-primary)' }} />
                  </div>
                  <h2 className="display-6 fw-bold text-mind-main mb-1">{s.value}</h2>
                  <p className="text-mind-muted fw-medium mb-0">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
