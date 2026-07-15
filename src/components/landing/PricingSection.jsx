import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      desc: 'Perfect for small growing businesses.',
      price: annual ? '$99' : '$119',
      features: ['Up to 10 Users', '5 Warehouses', 'Basic Reporting', 'Email Support'],
      missing: ['API Access', 'Custom Workflows'],
      popular: false
    },
    {
      name: 'Professional',
      desc: 'Advanced tools for scaling enterprises.',
      price: annual ? '$299' : '$349',
      features: ['Unlimited Users', '15 Warehouses', 'Advanced Analytics', 'API Access', 'Priority 24/7 Support'],
      missing: [],
      popular: true
    },
    {
      name: 'Enterprise',
      desc: 'Custom solutions for global corporations.',
      price: 'Custom',
      features: ['Unlimited Everything', 'Custom Workflows', 'Dedicated Success Manager', 'On-Premise Option'],
      missing: [],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-6 position-relative">
      <div className="container">
        <div className="text-center mb-5">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="display-5 fw-bold text-mind-main mb-4"
          >
            Transparent Pricing
          </motion.h2>
          
          <div className="d-inline-flex bg-white rounded-pill p-1 shadow-sm border border-light-subtle">
            <button 
              className={`btn rounded-pill px-4 fw-medium ${!annual ? 'btn-primary' : 'btn-light text-muted'}`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`btn rounded-pill px-4 fw-medium ${annual ? 'btn-primary' : 'btn-light text-muted'}`}
              onClick={() => setAnnual(true)}
            >
              Annually <span className="badge bg-success ms-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="row g-4 align-items-center justify-content-center">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="col-md-6 col-lg-4"
            >
              <div 
                className={`card h-100 p-4 rounded-4 ${plan.popular ? 'border-primary shadow-lg position-relative' : ''}`}
                style={{ 
                  background: 'var(--mind-surface)', 
                  border: plan.popular ? '2px solid var(--mind-primary)' : '1px solid var(--mind-border)',
                  boxShadow: plan.popular ? '0 20px 40px rgba(79, 70, 229, 0.1)' : 'var(--mind-shadow)',
                  zIndex: plan.popular ? 2 : 1
                }}
              >
                {plan.popular && (
                  <div className="position-absolute top-0 start-50 translate-middle badge bg-primary rounded-pill py-2 px-3 fw-bold">
                    MOST POPULAR
                  </div>
                )}
                
                <h4 className="fw-bold text-mind-main">{plan.name}</h4>
                <p className="text-mind-muted fs-7 mb-4">{plan.desc}</p>
                <div className="mb-4">
                  <span className="display-4 fw-bold text-mind-main">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-mind-muted">/mo</span>}
                </div>
                
                <Link to="/signup" className={`btn w-100 rounded-pill fw-semibold py-2 mb-4 ${plan.popular ? 'btn-primary' : 'btn-outline-dark'}`}>
                  Get Started
                </Link>

                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  {plan.features.map((f, j) => (
                    <li key={j} className="d-flex align-items-center gap-2 text-mind-main fw-medium">
                      <Check size={18} style={{ color: '#10b981' }} /> {f}
                    </li>
                  ))}
                  {plan.missing.map((m, j) => (
                    <li key={j} className="d-flex align-items-center gap-2 text-mind-muted text-decoration-line-through opacity-75">
                      <X size={18} /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
