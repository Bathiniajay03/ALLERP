import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { smartErpApi } from '../services/smartErpApi';
import { Building2, UserCircle, Warehouse, CreditCard, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const TIMEZONES = ['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Asia/Tokyo'];

const PLANS = [
  { id: 'Trial', name: '14-Day Free Trial', price: 'Free', limit: '5 Users, 3 Warehouses, 1GB Storage', popular: false },
  { id: 'Starter', name: 'Starter Plan', price: '$99/mo', limit: '10 Users, 5 Warehouses, 5GB Storage', popular: false },
  { id: 'Professional', name: 'Professional Plan', price: '$299/mo', limit: 'Unlimited Users, 15 Warehouses, 20GB Storage', popular: true },
  { id: 'Enterprise', name: 'Enterprise Plan', price: 'Custom', limit: 'Unlimited Users & Warehouses, 500GB Storage', popular: false }
];

const STEPS = [
  { id: 1, title: 'Company Details', icon: Building2 },
  { id: 2, title: 'Administrator', icon: UserCircle },
  { id: 3, title: 'Warehouse Setup', icon: Warehouse },
  { id: 4, title: 'Subscription', icon: CreditCard },
  { id: 5, title: 'Review', icon: CheckCircle2 }
];

export default function SignupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    country: 'United States',
    currency: 'USD',
    timezone: 'America/New_York',
    gstNumber: '',
    phone: '',
    website: '',
    logoUrl: '',
    adminName: '',
    adminEmail: '',
    adminUsername: '',
    adminPassword: '',
    adminConfirmPassword: '',
    warehouseCode: 'MAIN',
    warehouseName: 'Main Warehouse',
    subscriptionPlan: 'Trial',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError('');
    // Validation
    if (step === 1) {
      if (!formData.companyName || !formData.companyCode || !formData.country) {
        setError('Please fill in Company Name, Code, and Country.');
        return;
      }
      if (!/^[a-zA-Z0-9]+$/.test(formData.companyCode)) {
        setError('Company Code must be alphanumeric only (no spaces or special characters).');
        return;
      }
    } else if (step === 2) {
      if (!formData.adminName || !formData.adminEmail || !formData.adminUsername || !formData.adminPassword) {
        setError('Please fill in all administrator details.');
        return;
      }
      if (formData.adminPassword !== formData.adminConfirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else if (step === 3) {
      if (!formData.warehouseCode || !formData.warehouseName) {
        setError('Please provide initial warehouse details.');
        return;
      }
    } else if (step === 4) {
      if (formData.subscriptionPlan !== 'Trial') {
        if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
          setError('Please provide payment details for paid plans.');
          return;
        }
      }
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        companyDetails: {
          companyName: formData.companyName,
          companyCode: formData.companyCode.toUpperCase(),
          country: formData.country,
          currency: formData.currency,
          timezone: formData.timezone,
          gstNumber: formData.gstNumber,
          phone: formData.phone,
          website: formData.website,
          logoUrl: formData.logoUrl
        },
        adminUser: {
          fullName: formData.adminName,
          email: formData.adminEmail,
          username: formData.adminUsername,
          password: formData.adminPassword
        },
        initialWarehouse: {
          code: formData.warehouseCode.toUpperCase(),
          name: formData.warehouseName
        },
        subscriptionPlan: formData.subscriptionPlan
      };

      const res = await smartErpApi.registerCompany(payload);
      
      // Navigate to success page
      navigate('/registration-success', { 
        state: { 
          companyCode: payload.companyDetails.companyCode,
          username: payload.adminUser.username 
        } 
      });

    } catch (err) {
      console.error("Registration Error:", err);
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 position-relative" style={{ background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("/images/cinematic_poster.png") center/cover no-repeat', color: '#fff' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="text-center mb-5 position-relative z-1">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-4">
            <div className="rounded d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: '#fff' }}>
              M
            </div>
            <span className="fw-bold fs-5 text-white" style={{ letterSpacing: '1px' }}>MIND ERP</span>
          </Link>
          <h2 className="fw-bold display-6 mb-2 text-white text-shadow">Create your workspace</h2>
          <p className="text-white-50">Set up your enterprise in less than 2 minutes.</p>
        </div>

        {/* Wizard Container */}
        <div className="glass-card rounded-4 shadow-lg p-0 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(20px)' }}>
          
          {/* Progress Bar */}
          <div className="bg-light" style={{ height: '4px', opacity: 0.3 }}>
            <motion.div 
              className="h-100 bg-primary" 
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          <div className="row g-0">
            {/* Left Sidebar */}
            <div className="col-md-4 d-none d-md-block p-4 border-end border-light-subtle" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-4 mt-3">
                {STEPS.map((s) => {
                  const isActive = step === s.id;
                  const isPast = step > s.id;
                  return (
                    <li key={s.id} className={`d-flex align-items-center gap-3 ${isActive ? 'text-primary' : isPast ? 'text-dark' : 'text-muted'}`} style={{ transition: 'all 0.3s' }}>
                      <div className={`rounded-circle d-flex align-items-center justify-content-center border ${isActive ? 'border-primary bg-primary bg-opacity-10' : isPast ? 'border-light bg-light text-dark' : 'border-light-subtle'}`} style={{ width: '36px', height: '36px' }}>
                        <s.icon size={18} />
                      </div>
                      <span className="fw-medium fs-7">{s.title}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Right Content */}
            <div className="col-md-8 p-4 p-md-5 position-relative overflow-hidden" style={{ minHeight: '500px' }}>
              
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger py-2 fs-7 mb-4">
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-100 d-flex flex-column"
                >
                  
                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="flex-grow-1">
                      <h4 className="fw-bold mb-4">Company Details</h4>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label text-muted fs-7">Company Name</label>
                          <input type="text" className="form-control bg-white border-light-subtle text-dark focus-ring" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Corp" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fs-7">Company Code</label>
                          <input type="text" className="form-control bg-white border-light-subtle text-dark text-uppercase" name="companyCode" value={formData.companyCode} onChange={handleChange} placeholder="ACME" />
                          <small className="text-muted" style={{fontSize:'0.7rem'}}>Used for login</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fs-7">Country</label>
                          <select className="form-select bg-white border-light-subtle text-dark" name="country" value={formData.country} onChange={handleChange}>
                            <option>United States</option>
                            <option>United Kingdom</option>
                            <option>India</option>
                            <option>Canada</option>
                            <option>Australia</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fs-7">Currency</label>
                          <select className="form-select bg-white border-light-subtle text-dark" name="currency" value={formData.currency} onChange={handleChange}>
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fs-7">Timezone</label>
                          <select className="form-select bg-white border-light-subtle text-dark" name="timezone" value={formData.timezone} onChange={handleChange}>
                            {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="flex-grow-1">
                      <h4 className="fw-bold mb-4">Administrator Profile</h4>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label text-muted fs-7">Full Name</label>
                          <input type="text" className="form-control bg-white border-light-subtle text-dark" name="adminName" value={formData.adminName} onChange={handleChange} placeholder="John Doe" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label text-muted fs-7">Email Address</label>
                          <input type="email" className="form-control bg-white border-light-subtle text-dark" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="john@acme.com" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label text-muted fs-7">Username</label>
                          <input type="text" className="form-control bg-white border-light-subtle text-dark" name="adminUsername" value={formData.adminUsername} onChange={handleChange} placeholder="admin" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fs-7">Password</label>
                          <input type="password" className="form-control bg-white border-light-subtle text-dark" name="adminPassword" value={formData.adminPassword} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fs-7">Confirm Password</label>
                          <input type="password" className="form-control bg-white border-light-subtle text-dark" name="adminConfirmPassword" value={formData.adminConfirmPassword} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="flex-grow-1">
                      <h4 className="fw-bold mb-4">Primary Warehouse</h4>
                      <p className="text-muted fs-7 mb-4">We'll create your first warehouse to get you started. You can add more later based on your subscription.</p>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label text-muted fs-7">Warehouse Code</label>
                          <input type="text" className="form-control bg-white border-light-subtle text-dark text-uppercase" name="warehouseCode" value={formData.warehouseCode} onChange={handleChange} placeholder="MAIN" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label text-muted fs-7">Warehouse Name</label>
                          <input type="text" className="form-control bg-white border-light-subtle text-dark" name="warehouseName" value={formData.warehouseName} onChange={handleChange} placeholder="Central Warehouse" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <div className="flex-grow-1">
                      <h4 className="fw-bold mb-4">Select Subscription</h4>
                      <div className="d-flex flex-column gap-3">
                        {PLANS.map((plan) => (
                          <div 
                            key={plan.id}
                            onClick={() => setFormData({...formData, subscriptionPlan: plan.id})}
                            className={`p-3 rounded-3 cursor-pointer border transition-all ${formData.subscriptionPlan === plan.id ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle bg-white bg-opacity-50 hover-bg-light'}`}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold text-dark d-flex align-items-center gap-2">
                                {plan.name}
                                {plan.popular && <span className="badge bg-primary text-dark rounded-pill fs-8">POPULAR</span>}
                              </span>
                              <span className="fw-bold text-primary">{plan.price}</span>
                            </div>
                            <span className="text-muted" style={{fontSize: '0.8rem'}}>{plan.limit}</span>
                          </div>
                        ))}
                      </div>

                      {formData.subscriptionPlan !== 'Trial' && formData.subscriptionPlan !== 'Enterprise' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                          <h6 className="fw-bold mb-3 fs-7">Payment Details</h6>
                          <div className="row g-2">
                            <div className="col-12">
                              <input type="text" className="form-control form-control-sm bg-white border-light-subtle text-dark" placeholder="Cardholder Name" />
                            </div>
                            <div className="col-12">
                              <input type="text" className="form-control form-control-sm bg-white border-light-subtle text-dark" placeholder="Card Number" />
                            </div>
                            <div className="col-6">
                              <input type="text" className="form-control form-control-sm bg-white border-light-subtle text-dark" placeholder="MM/YY" />
                            </div>
                            <div className="col-6">
                              <input type="text" className="form-control form-control-sm bg-white border-light-subtle text-dark" placeholder="CVC" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Step 5 */}
                  {step === 5 && (
                    <div className="flex-grow-1">
                      <h4 className="fw-bold mb-4">Review & Finish</h4>
                      <div className="p-4 rounded-3 border border-light-subtle mb-4" style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <div className="row gy-3 fs-7">
                          <div className="col-6 text-muted">Company</div>
                          <div className="col-6 text-dark fw-medium">{formData.companyName} ({formData.companyCode})</div>
                          <div className="col-6 text-muted">Administrator</div>
                          <div className="col-6 text-dark fw-medium">{formData.adminName} ({formData.adminUsername})</div>
                          <div className="col-6 text-muted">Region</div>
                          <div className="col-6 text-dark fw-medium">{formData.country} • {formData.currency}</div>
                          <div className="col-6 text-muted">Primary Warehouse</div>
                          <div className="col-6 text-dark fw-medium">{formData.warehouseName}</div>
                          <div className="col-6 text-muted">Plan</div>
                          <div className="col-6 text-primary fw-bold">{formData.subscriptionPlan}</div>
                        </div>
                      </div>
                      <p className="text-muted fs-7 text-center">
                        By clicking "Create Workspace", you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between mt-5 pt-3 border-top border-light-subtle">
                <button 
                  className={`btn btn-outline-secondary rounded-pill px-4 ${step === 1 ? 'invisible' : ''}`} 
                  onClick={handleBack}
                  disabled={loading}
                >
                  <ArrowLeft size={16} className="me-2" /> Back
                </button>
                
                {step < 5 ? (
                  <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center fw-semibold" onClick={handleNext} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                    Continue <ArrowRight size={16} className="ms-2" />
                  </button>
                ) : (
                  <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center fw-semibold" onClick={handleSubmit} disabled={loading} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <CheckCircle2 size={16} className="me-2" />}
                    Create Workspace
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-muted fs-7">Already have an account? <Link to="/login" className="text-primary text-decoration-none hover-text-dark">Log in instead</Link></p>
        </div>

      </div>
    </div>
  );
}
