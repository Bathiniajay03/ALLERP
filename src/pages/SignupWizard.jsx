import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { smartErpApi } from '../services/smartErpApi';

const INDUSTRIES = ['Retail', 'Manufacturing', 'Healthcare', 'Automobile', 'Pharma', 'Electronics', 'Logistics', 'Wholesale', 'Other'];
const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const TIMEZONES = ['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Asia/Tokyo'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Arabic', 'German', 'Japanese'];

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
  
  // Wizard States
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: '',
    companyCode: '',
    industry: 'Retail',
    country: 'United States',
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'English',
    gstNumber: '',
    phone: '',
    website: '',
    logoUrl: '',

    // Step 2: Administrator
    adminName: '',
    adminEmail: '',
    adminMobile: '',
    adminUsername: '',
    adminPassword: '',
    adminConfirmPassword: '',

    // Step 3: Warehouse
    warehouseCode: 'MAIN',
    warehouseName: 'Main Warehouse',

    // Step 4: Subscription
    subscriptionPlan: 'Trial',
    couponCode: ''
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
    setLoading(true);
    try {
      const payload = {
        company: {
          companyCode: formData.companyCode.trim().toUpperCase(),
          companyName: formData.companyName.trim(),
          legalName: formData.companyName.trim(),
          gstNumber: formData.gstNumber.trim(),
          country: formData.country.trim(),
          timezone: formData.timezone,
          currency: formData.currency,
          phone: formData.phone.trim(),
          website: formData.website.trim(),
          logo: formData.logoUrl.trim() || null,
          primaryColor: '#0ea5e9', // Default primary color
          sidebarBgColor: '#0f172a',
          sidebarTextColor: '#f8fafc',
          subscriptionPlan: formData.subscriptionPlan,
          subscriptionStatus: 'Active',
          maxUsers: formData.subscriptionPlan === 'Trial' ? 5 : formData.subscriptionPlan === 'Starter' ? 10 : 30,
          maxWarehouses: formData.subscriptionPlan === 'Trial' ? 3 : formData.subscriptionPlan === 'Starter' ? 5 : 15
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
    <div className="wizard-page">
      <style>{`
        .wizard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          font-family: 'Outfit', sans-serif;
        }

        .wiz-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          width: 100%;
          max-width: 650px;
          padding: 40px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .wiz-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .wiz-header h2 {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .wiz-progress-container {
          margin-bottom: 30px;
        }

        .wiz-progress-bar {
          background: #f1f5f9;
          border-radius: 10px;
          height: 6px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .wiz-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          transition: width 0.3s ease;
        }

        .wiz-step-indicator {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 0.8rem;
          color: #64748b;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
          display: block;
        }

        .form-control {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          color: #1e293b;
          padding: 10px 14px;
          font-size: 0.95rem;
          width: 100%;
        }

        .form-control:focus {
          background: #ffffff;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
          outline: none;
        }

        .plan-option {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .plan-option:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .plan-option.selected {
          border-color: #0ea5e9;
          background: rgba(14, 165, 233, 0.05);
        }

        .btn-action {
          padding: 10px 24px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-next {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
        }

        .btn-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
        }

        .btn-back {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .btn-back:hover {
          background: #e2e8f0;
        }

        .review-table th, .review-table td {
          padding: 8px 12px;
          font-size: 0.9rem;
        }

        .review-table th {
          color: #64748b;
          font-weight: 500;
          width: 40%;
        }

        .review-table td {
          color: #1e293b;
          font-weight: 600;
        }
      `}</style>

      <div className="wiz-card">
        <div className="wiz-header">
          <Link to="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: '0.85rem' }}>← Back to Homepage</Link>
          <h2 className="mt-3">Register Your Company</h2>
          <p className="text-muted small m-0">Setup your branded enterprise workspace in minutes</p>
        </div>

        <div className="wiz-progress-container">
          <div className="wiz-progress-bar">
            <div className="wiz-progress-fill" style={{ width: `${percentComplete}%` }}></div>
          </div>
          <div className="wiz-step-indicator">
            <span style={{ color: step >= 1 ? '#0284c7' : '' }}>1. Info</span>
            <span style={{ color: step >= 2 ? '#0284c7' : '' }}>2. Admin</span>
            <span style={{ color: step >= 3 ? '#0284c7' : '' }}>3. Warehouse</span>
            <span style={{ color: step >= 4 ? '#0284c7' : '' }}>4. Plan</span>
            <span style={{ color: step >= 5 ? '#0284c7' : '' }}>5. Review</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-4" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Company Info */}
        {step === 1 && (
          <div>
            <h4 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Step 1: Company Profile</h4>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Company Name *</label>
                <input type="text" name="companyName" className="form-control" value={formData.companyName} onChange={handleChange} placeholder="e.g. Acme Tech Labs" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Company Code (Alphanumeric unique) *</label>
                <input type="text" name="companyCode" className="form-control" value={formData.companyCode} onChange={handleChange} placeholder="e.g. ACMETECH" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Industry</label>
                <select name="industry" className="form-control" value={formData.industry} onChange={handleChange}>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Country *</label>
                <input type="text" name="country" className="form-control" value={formData.country} onChange={handleChange} placeholder="e.g. United States" />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Currency</label>
                <select name="currency" className="form-control" value={formData.currency} onChange={handleChange}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Timezone</label>
                <select name="timezone" className="form-control" value={formData.timezone} onChange={handleChange}>
                  {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Language</label>
                <select name="language" className="form-control" value={formData.language} onChange={handleChange}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">GST / Tax Number</label>
                <input type="text" name="gstNumber" className="form-control" value={formData.gstNumber} onChange={handleChange} placeholder="e.g. GSTIN12345" />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Phone</label>
                <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} placeholder="e.g. +1 555-0199" />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Website</label>
                <input type="text" name="website" className="form-control" value={formData.website} onChange={handleChange} placeholder="e.g. www.acme.com" />
              </div>
              <div className="col-12">
                <label className="form-label">Logo Image URL</label>
                <input type="text" name="logoUrl" className="form-control" value={formData.logoUrl} onChange={handleChange} placeholder="e.g. https://acme.com/logo.png" />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <button onClick={handleNext} className="btn-action btn-next">Next step →</button>
            </div>
          </div>
        )}

        {/* Step 2: Administrator Info */}
        {step === 2 && (
          <div>
            <h4 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Step 2: Owner/Admin Account</h4>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Full Name *</label>
                <input type="text" name="adminName" className="form-control" value={formData.adminName} onChange={handleChange} placeholder="e.g. Jane Doe" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Email Address *</label>
                <input type="email" name="adminEmail" className="form-control" value={formData.adminEmail} onChange={handleChange} placeholder="e.g. jane@acme.com" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Mobile Number</label>
                <input type="text" name="adminMobile" className="form-control" value={formData.adminMobile} onChange={handleChange} placeholder="e.g. +1 555-0198" />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Username *</label>
                <input type="text" name="adminUsername" className="form-control" value={formData.adminUsername} onChange={handleChange} placeholder="e.g. admin_jane" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Password *</label>
                <input type="password" name="adminPassword" className="form-control" value={formData.adminPassword} onChange={handleChange} placeholder="••••••" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Confirm Password *</label>
                <input type="password" name="adminConfirmPassword" className="form-control" value={formData.adminConfirmPassword} onChange={handleChange} placeholder="••••••" required />
              </div>
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button onClick={handleBack} className="btn-action btn-back">← Back</button>
              <button onClick={handleNext} className="btn-action btn-next">Next step →</button>
            </div>
          </div>
        )}

        {/* Step 3: Warehouse details */}
        {step === 3 && (
          <div>
            <h4 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Step 3: Initial Warehouse Layout</h4>
            <p className="text-muted small">Every company requires at least one default warehouse to store product items and scan codes.</p>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Warehouse Code *</label>
                <input type="text" name="warehouseCode" className="form-control" value={formData.warehouseCode} onChange={handleChange} placeholder="e.g. MAIN" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Warehouse Name *</label>
                <input type="text" name="warehouseName" className="form-control" value={formData.warehouseName} onChange={handleChange} placeholder="e.g. Main Distribution Center" required />
              </div>
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button onClick={handleBack} className="btn-action btn-back">← Back</button>
              <button onClick={handleNext} className="btn-action btn-next">Next step →</button>
            </div>
          </div>
        )}

        {/* Step 4: Subscription */}
        {step === 4 && (
          <div>
            <h4 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Step 4: Subscription Tier</h4>
            <div>
              {PLANS.map(plan => (
                <div key={plan.id} className={`plan-option ${formData.subscriptionPlan === plan.id ? 'selected' : ''}`} onClick={() => setFormData(prev => ({ ...prev, subscriptionPlan: plan.id }))}>
                  <div>
                    <div className="fw-bold" style={{ color: '#0f172a' }}>{plan.name}</div>
                    <div className="small text-muted">{plan.limit}</div>
                  </div>
                  <div className="text-info fw-bold">{plan.price}</div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <label className="form-label">Promo / Coupon Code</label>
              <input type="text" name="couponCode" className="form-control" value={formData.couponCode} onChange={handleChange} placeholder="e.g. WELCOME2026" />
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button onClick={handleBack} className="btn-action btn-back">← Back</button>
              <button onClick={handleNext} className="btn-action btn-next">Review details →</button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div>
            <h4 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Step 5: Review Registration</h4>
            <div className="table-responsive bg-light p-3 rounded-3 border border-light mb-4">
              <table className="table table-hover m-0 review-table">
                <tbody>
                  <tr>
                    <th>Company Name</th>
                    <td>{formData.companyName}</td>
                  </tr>
                  <tr>
                    <th>Company Code</th>
                    <td className="text-info">{formData.companyCode.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <th>Admin Name</th>
                    <td>{formData.adminName}</td>
                  </tr>
                  <tr>
                    <th>Admin Username</th>
                    <td className="text-warning">{formData.adminUsername}</td>
                  </tr>
                  <tr>
                    <th>Admin Email</th>
                    <td>{formData.adminEmail}</td>
                  </tr>
                  <tr>
                    <th>Initial Warehouse</th>
                    <td>{formData.warehouseName} ({formData.warehouseCode.toUpperCase()})</td>
                  </tr>
                  <tr>
                    <th>Selected Plan</th>
                    <td><span className="badge bg-success">{formData.subscriptionPlan}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button onClick={handleBack} className="btn-action btn-back" disabled={loading}>← Back</button>
              <button onClick={handleSubmit} className="btn-action btn-next bg-success" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} disabled={loading}>
                {loading ? 'Creating Workspace...' : 'Complete Registration 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
