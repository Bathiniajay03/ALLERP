import React from 'react';
import { motion } from 'framer-motion';

const industries = [
  { name: 'Manufacturing', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80' },
  { name: 'Retail', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wholesale', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Distribution', img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=400&q=80' },
  { name: 'Healthcare', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pharma', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80' },
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Construction', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Food', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
  { name: 'Automobile', img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=400&q=80' }
];

export default function IndustriesSection() {
  return (
    <section id="industries" className="py-6 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="display-6 fw-bold text-dark"
          >
            Built for Every Industry
          </motion.h2>
          <p className="text-muted">Adaptable workflows that fit your specific vertical.</p>
        </div>

        <div className="row g-3">
          {industries.map((ind, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 5) * 0.1 }}
              className="col-6 col-md-4 col-lg-2 flex-grow-1"
            >
              <div className="position-relative overflow-hidden rounded-3 h-100" style={{ minHeight: '120px' }}>
                <div className="position-absolute w-100 h-100" style={{ 
                  background: `url(${ind.img}) center/cover`,
                  filter: 'grayscale(100%) brightness(40%)',
                  transition: 'all 0.3s ease'
                }} 
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(0%) brightness(70%)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(100%) brightness(40%)'; e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center pointer-events-none text-center p-2" style={{ zIndex: 1 }}>
                  <span className="text-white fw-bold fs-6 text-uppercase" style={{ letterSpacing: '1px' }}>{ind.name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
