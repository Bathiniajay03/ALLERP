import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { smartErpApi } from '../services/smartErpApi';

const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const TIMEZONES = ['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Asia/Tokyo'];

const PLANS = [
  { id: 'Trial', name: '14-Day Free Trial', price: 'Free', limit: '5 Users, 3 Warehouses, 1GB Storage' },
  { id: 'Starter', name: 'Starter Plan', price: '$99/mo', limit: '10 Users, 5 Warehouses, 5GB Storage' },
  { id: 'Professional', name: 'Professional Plan', price: '$199/mo', limit: '30 Users, 15 Warehouses, 20GB Storage' },
  { id: 'Enterprise', name: 'Enterprise Plan', price: 'Custom', limit: 'Unlimited Users & Warehouses, 500GB Storage' }
];

export default function SignupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Cleaned Wizard States matching Backend Domain Entity
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: '',
    companyCode: '',
    country: 'United States',
    currency: 'USD',
    timezone: 'America/New_York',
    gstNumber: '',
    phone: '',
    website: '',
    logoUrl: '',

    // Step 2: Administrator
    adminName: '',
    adminEmail: '',
    adminUsername: '',
    adminPassword: '',
    adminConfirmPassword: '',

    // Step 3: Initial Warehouse Setup
    warehouseCode: 'MAIN',
    warehouseName: 'Main Warehouse',

    // Step 4: Subscription
    subscriptionPlan: 'Trial',

    // Step 5: Payment Details
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }));
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleExpiryChange = (e) => {
    setFormData((prev) => ({ ...prev, cardExpiry: formatExpiry(e.target.value) }));
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
        setError('Please fill in Administrator Name, Email, Username, and Password.');
        return;
      }
      if (formData.adminPassword !== formData.adminConfirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (formData.adminPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    } else if (step === 3) {
      if (!formData.warehouseCode || !formData.warehouseName) {
        setError('Please specify the Warehouse Code and Name.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    
    // Step 5 Validation
    if (!formData.cardName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
      setError('Please complete all payment details to continue.');
      return;
    }

    setLoading(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const payload = {
        company: {
          companyCode: formData.companyCode.trim().toUpperCase(),
          companyName: formData.companyName.trim(),
          legalName: formData.companyName.trim(), // Defaulting legal to company name
          gstNumber: formData.gstNumber.trim(),
          country: formData.country.trim(),
          timezone: formData.timezone,
          currency: formData.currency,
          phone: formData.phone.trim(),
          website: formData.website.trim(),
          logo: formData.logoUrl.trim() || null,
          primaryColor: '#0052cc', // Default ERP primary blue
          sidebarBgColor: '#172b4d', // Default ERP secondary dark
          sidebarTextColor: '#ffffff',
          subscriptionPlan: formData.subscriptionPlan,
          subscriptionStatus: 'Active',
          maxUsers: formData.subscriptionPlan === 'Trial' ? 5 : formData.subscriptionPlan === 'Starter' ? 10 : formData.subscriptionPlan === 'Professional' ? 30 : 9999,
          maxWarehouses: formData.subscriptionPlan === 'Trial' ? 3 : formData.subscriptionPlan === 'Starter' ? 5 : formData.subscriptionPlan === 'Professional' ? 15 : 9999
        },
        adminUser: {
          username: formData.adminUsername.trim(),
          email: formData.adminEmail.trim(),
          password: formData.adminPassword,
          name: formData.adminName.trim()
        },
        warehouseCode: formData.warehouseCode.trim().toUpperCase(),
        warehouseName: formData.warehouseName.trim()
      };

      const res = await smartErpApi.publicOnboard(payload);
      
      const successData = {
        companyId: res.data.companyId || 'N/A',
        companyCode: formData.companyCode.toUpperCase(),
        companyName: formData.companyName,
        adminUsername: formData.adminUsername,
        subscriptionPlan: formData.subscriptionPlan
      };
      window.sessionStorage.setItem('erp_registration_success', JSON.stringify(successData));

      navigate('/signup/success');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to complete company registration.');
    } finally {
      setLoading(false);
    }
  };

  const percentComplete = Math.round(((step - 1) / 4) * 100);

  return (
    <div className="erp-wizard-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .erp-wizard-container {
          min-height: 100vh;
          background: #f4f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          font-family: 'Inter', sans-serif;
          color: #172b4d;
        }

        .erp-wiz-card {
          background: #ffffff;
          border: 1px solid #dfe1e6;
          border-radius: 8px;
          width: 100%;
          max-width: 600px;
          padding: 48px;
          box-shadow: 0 4px 12px rgba(9, 30, 66, 0.05);
        }

        .erp-wiz-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .erp-wiz-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0052cc;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .erp-wiz-logo-icon {
          width: 28px;
          height: 28px;
          background-color: #0052cc;
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .erp-wiz-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 8px;
          color: #172b4d;
        }
        
        .erp-wiz-header p {
          color: #5e6c84;
          font-size: 0.95rem;
          margin: 0;
        }

        .erp-progress-container {
          margin-bottom: 32px;
        }

        .erp-progress-bar {
          background: #ebecf0;
          border-radius: 4px;
          height: 6px;
          overflow: hidden;
        }

        .erp-progress-fill {
          height: 100%;
          background: #0052cc;
          transition: width 0.3s ease;
        }

        .erp-step-indicator {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 0.8rem;
          color: #5e6c84;
          font-weight: 500;
        }

        .erp-form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #172b4d;
          margin-bottom: 6px;
          display: block;
        }

        .erp-form-control {
          background: #fafbfc;
          border: 1px solid #dfe1e6;
          border-radius: 4px;
          color: #172b4d;
          padding: 10px 12px;
          font-size: 0.95rem;
          width: 100%;
          transition: background 0.2s, border-color 0.2s;
        }

        .erp-form-control:focus {
          background: #ffffff;
          border-color: #0052cc;
          box-shadow: 0 0 0 2px rgba(0, 82, 204, 0.1);
          outline: none;
        }

        .erp-plan-option {
          background: #ffffff;
          border: 1px solid #dfe1e6;
          border-radius: 4px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .erp-plan-option:hover {
          border-color: #b3d4ff;
        }

        .erp-plan-option.selected {
          border-color: #0052cc;
          background: #e6f0ff;
          box-shadow: 0 0 0 1px #0052cc;
        }

        .erp-radio-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #dfe1e6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .erp-plan-option.selected .erp-radio-circle {
          border-color: #0052cc;
        }

        .erp-plan-option.selected .erp-radio-circle::after {
          content: '';
          width: 10px;
          height: 10px;
          background: #0052cc;
          border-radius: 50%;
        }

        .erp-btn-primary {
          background: #0052cc;
          color: #ffffff;
          border: none;
          padding: 10px 24px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .erp-btn-primary:hover {
          background: #0047b3;
        }

        .erp-btn-primary:disabled {
          background: #b3d4ff;
          cursor: not-allowed;
        }

        .erp-btn-secondary {
          background: #ffffff;
          color: #172b4d;
          border: 1px solid #dfe1e6;
          padding: 10px 24px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .erp-btn-secondary:hover {
          background: #f4f5f7;
        }

        .erp-alert {
          background: #ffebe6;
          border-left: 4px solid #ff5630;
          color: #bf2600;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          margin-bottom: 24px;
        }

        .erp-payment-card {
          border: 1px solid #dfe1e6;
          border-radius: 8px;
          padding: 24px;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(9, 30, 66, 0.02);
          margin-bottom: 24px;
        }

        .erp-secure-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #00875a;
          font-size: 0.85rem;
          font-weight: 600;
          justify-content: center;
          margin-bottom: 24px;
        }

        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

      `}</style>

      <div className="erp-wiz-card">
        <div className="erp-wiz-header">
          <Link to="/" className="erp-wiz-logo">
            <div className="erp-wiz-logo-icon">E</div>
            SmartERP
          </Link>
          <h2>Create Your Enterprise Workspace</h2>
          <p>Deploy your multi-tenant environment in minutes.</p>
        </div>

        <div className="erp-progress-container">
          <div className="erp-progress-bar">
            <div className="erp-progress-fill" style={{ width: `${percentComplete}%` }}></div>
          </div>
          <div className="erp-step-indicator">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && 'Company Details'}
              {step === 2 && 'Admin Account'}
              {step === 3 && 'Initial Location'}
              {step === 4 && 'Subscription'}
              {step === 5 && 'Payment Details'}
            </span>
          </div>
        </div>

        {error && <div className="erp-alert">{error}</div>}

        {/* Step 1: Company Details */}
        {step === 1 && (
          <div className="animate__animated animate__fadeIn">
            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="erp-form-label">Company Name *</label>
                <input type="text" className="erp-form-control" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Acme Logistics" />
              </div>
              <div className="col-md-6">
                <label className="erp-form-label">Company Code (Tenant ID) *</label>
                <input type="text" className="erp-form-control text-uppercase" name="companyCode" value={formData.companyCode} onChange={handleChange} placeholder="e.g. ACME" />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="erp-form-label">Country *</label>
                <input type="text" className="erp-form-control" name="country" value={formData.country} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="erp-form-label">Tax ID / GST / PAN</label>
                <input type="text" className="erp-form-control" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="erp-form-label">Currency *</label>
                <select className="erp-form-control" name="currency" value={formData.currency} onChange={handleChange}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="erp-form-label">Timezone *</label>
                <select className="erp-form-control" name="timezone" value={formData.timezone} onChange={handleChange}>
                  {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button className="erp-btn-primary" onClick={handleNext}>Continue to Account</button>
            </div>
          </div>
        )}

        {/* Step 2: Administrator */}
        {step === 2 && (
          <div className="animate__animated animate__fadeIn">
            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="erp-form-label">Admin Full Name *</label>
                <input type="text" className="erp-form-control" name="adminName" value={formData.adminName} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="erp-form-label">Admin Email *</label>
                <input type="email" className="erp-form-control" name="adminEmail" value={formData.adminEmail} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-3">
              <label className="erp-form-label">Admin Username *</label>
              <input type="text" className="erp-form-control" name="adminUsername" value={formData.adminUsername} onChange={handleChange} placeholder="Username to login" />
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="erp-form-label">Password *</label>
                <input type="password" className="erp-form-control" name="adminPassword" value={formData.adminPassword} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="erp-form-label">Confirm Password *</label>
                <input type="password" className="erp-form-control" name="adminConfirmPassword" value={formData.adminConfirmPassword} onChange={handleChange} />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="erp-btn-secondary" onClick={handleBack}>Back</button>
              <button className="erp-btn-primary" onClick={handleNext}>Continue to Location</button>
            </div>
          </div>
        )}

        {/* Step 3: Warehouse Setup */}
        {step === 3 && (
          <div className="animate__animated animate__fadeIn">
            <p style={{color: '#5e6c84', fontSize: '0.95rem', marginBottom: 24}}>
              Set up your primary warehouse or store location. You can add more locations later from the dashboard.
            </p>
            <div className="mb-3">
              <label className="erp-form-label">Primary Location Code *</label>
              <input type="text" className="erp-form-control text-uppercase" name="warehouseCode" value={formData.warehouseCode} onChange={handleChange} placeholder="e.g. MAIN, WH-01" />
            </div>
            <div className="mb-3">
              <label className="erp-form-label">Primary Location Name *</label>
              <input type="text" className="erp-form-control" name="warehouseName" value={formData.warehouseName} onChange={handleChange} placeholder="e.g. Central Warehouse" />
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="erp-btn-secondary" onClick={handleBack}>Back</button>
              <button className="erp-btn-primary" onClick={handleNext}>Continue to Plan</button>
            </div>
          </div>
        )}

        {/* Step 4: Subscription */}
        {step === 4 && (
          <div className="animate__animated animate__fadeIn">
            <p style={{color: '#5e6c84', fontSize: '0.95rem', marginBottom: 24}}>
              Select your initial subscription tier. You can upgrade or downgrade at any time from your billing settings.
            </p>
            
            <div className="mb-4">
              {PLANS.map(plan => (
                <div 
                  key={plan.id}
                  className={`erp-plan-option ${formData.subscriptionPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, subscriptionPlan: plan.id })}
                >
                  <div className="erp-radio-circle"></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ fontSize: '1.05rem', color: '#172b4d' }}>{plan.name}</strong>
                      <span style={{ fontWeight: 700, color: '#0052cc' }}>{plan.price}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#5e6c84' }}>{plan.limit}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="erp-btn-secondary" onClick={handleBack} disabled={loading}>Back</button>
              <button className="erp-btn-primary" onClick={handleNext}>
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Payment Details */}
        {step === 5 && (
          <div className="animate__animated animate__fadeIn">
            <p style={{color: '#5e6c84', fontSize: '0.95rem', marginBottom: 24, textAlign: 'center'}}>
              Please enter your payment details. You won't be charged if you selected the 14-Day Free Trial until your trial period ends.
            </p>
            
            <div className="erp-payment-card">
              <div className="erp-secure-badge">
                <i className="bi bi-shield-lock-fill"></i> Secure SSL Encrypted Payment
              </div>
              
              <div className="mb-3">
                <label className="erp-form-label">Name on Card *</label>
                <input 
                  type="text" 
                  className="erp-form-control" 
                  name="cardName" 
                  value={formData.cardName} 
                  onChange={handleChange} 
                  placeholder="e.g. John Doe"
                  maxLength="50"
                />
              </div>

              <div className="mb-3">
                <label className="erp-form-label">Card Number *</label>
                <input 
                  type="text" 
                  className="erp-form-control" 
                  name="cardNumber" 
                  value={formData.cardNumber} 
                  onChange={handleCardNumberChange} 
                  placeholder="0000 0000 0000 0000"
                  maxLength="19"
                />
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="erp-form-label">Expiry (MM/YY) *</label>
                  <input 
                    type="text" 
                    className="erp-form-control" 
                    name="cardExpiry" 
                    value={formData.cardExpiry} 
                    onChange={handleExpiryChange} 
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div className="col-6">
                  <label className="erp-form-label">CVC *</label>
                  <input 
                    type="text" 
                    className="erp-form-control" 
                    name="cardCvc" 
                    value={formData.cardCvc} 
                    onChange={(e) => setFormData(prev => ({...prev, cardCvc: e.target.value.replace(/[^0-9]/g, '')}))} 
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="erp-btn-secondary" onClick={handleBack} disabled={loading}>Back</button>
              <button className="erp-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span><i className="bi bi-arrow-repeat spin"></i> Processing Payment...</span>
                ) : (
                  'Deploy SmartERP Workspace'
                )}
              </button>
            </div>
          </div>
        )}
        
        <div style={{textAlign: 'center', marginTop: 32, fontSize: '0.9rem', color: '#5e6c84'}}>
          Already have an account? <Link to="/login" style={{color: '#0052cc', fontWeight: 600, textDecoration: 'none'}}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
