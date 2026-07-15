import React from 'react';
import { motion } from 'framer-motion';

export default function CarouselSection() {
  return (
    <section className="py-6 overflow-hidden position-relative" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container position-relative z-2">
        <div className="text-center mb-5">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="display-5 fw-bold text-mind-main"
          >
            A Unified Experience
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-mind-muted lead mx-auto"
            style={{ maxWidth: '700px' }}
          >
            Access all your modules from a single, beautifully designed dashboard.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="mx-auto position-relative"
          style={{ maxWidth: '1000px', perspective: '1200px' }}
        >
          {/* Macbook Frame (Light/Silver variant) */}
          <div className="rounded-top-4 position-relative mx-auto" style={{ width: '100%', paddingBottom: '62%', background: '#e5e5e5', border: '1px solid #ccc', borderBottom: 'none', boxShadow: '0 -10px 40px rgba(0,0,0,0.05)' }}>
            
            {/* Screen Bezel */}
            <div className="position-absolute bg-dark rounded-4" style={{ top: '3%', left: '2%', right: '2%', bottom: '4%', padding: '1%', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
              
              {/* Webcam */}
              <div className="position-absolute rounded-circle bg-black" style={{ width: '8px', height: '8px', top: '4px', left: '50%', transform: 'translateX(-50%)', border: '1px solid #333' }}></div>
              
              {/* Screen Content */}
              <div className="w-100 h-100 bg-white position-relative overflow-hidden" style={{ borderRadius: '4px' }}>
                <img 
                  src="/images/erp_dashboard_mockup.png" 
                  alt="MIND ERP Dashboard" 
                  className="w-100 h-100 object-fit-cover" 
                  style={{ objectPosition: 'top left' }}
                />
                
                {/* Overlay Highlights */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,0.8) 100%)' }}></div>
                <div className="position-absolute bottom-0 start-0 w-100 p-4">
                  <h3 className="text-dark fw-bold m-0 text-start" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>Complete Visibility</h3>
                  <p className="text-dark m-0 text-start fw-medium">Monitor your entire enterprise from one screen.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Macbook Base */}
          <div className="mx-auto position-relative z-3" style={{ width: '115%', height: '20px', background: 'linear-gradient(90deg, #d1d1d1, #f1f1f1, #d1d1d1)', left: '-7.5%', borderRadius: '0 0 20px 20px', borderTop: '2px solid #fff', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div className="mx-auto bg-secondary" style={{ width: '15%', height: '4px', borderRadius: '0 0 10px 10px' }}></div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
