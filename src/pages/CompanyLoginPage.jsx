import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { smartErpApi } from '../services/smartErpApi';

export default function CompanyLoginPage({ onLoginSuccess, initialError }) {
  const navigate = useNavigate();
  const [companyCode, setCompanyCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaMessage, setMfaMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState(initialError || '');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Load pre-filled company code if returning from successful registration
    const prefill = window.sessionStorage.getItem('erp_login_prefill_code');
    if (prefill) {
      setCompanyCode(prefill);
      window.sessionStorage.removeItem('erp_login_prefill_code');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await smartErpApi.companyLogin({ 
        companyCode: companyCode.trim(), 
        username: username.trim(), 
        password 
      });

      if (res.data.requiresMfa) {
        setRequiresMfa(true);
        setMfaMessage(res.data.message || 'MFA verification required.');
        setDevOtp(res.data.devOtp || '');
      } else {
        onLoginSuccess(res.data);
        // Automatically redirect to /dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await smartErpApi.verifyMfa({ username: username.trim(), otpCode });
      onLoginSuccess(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'MFA verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      <style>{`
        .login-split-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          background: #f8fafc;
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
        }

        .login-left-pane {
          position: relative;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          overflow: hidden;
          border-right: 1px solid #cbd5e1;
        }

        .login-left-bg-effect {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.1), transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.05), transparent 50%);
        }

        .login-brand-logo {
          position: relative;
          z-index: 1;
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0284c7, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
        }

        .login-left-content {
          position: relative;
          z-index: 1;
          margin: 60px 0;
        }

        .login-left-content h1 {
          font-size: 2.6rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
          color: #0f172a;
        }

        .login-left-content p {
          color: #475569;
          font-size: 1.05rem;
          line-height: 1.6;
          max-width: 480px;
        }

        .login-left-footer {
          position: relative;
          z-index: 1;
          color: #64748b;
          font-size: 0.85rem;
        }

        .login-right-pane {
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #0f172a;
        }

        .login-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        .login-form-header h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .login-form-header p {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 30px;
        }

        .form-label {
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          margin-bottom: 6px;
          display: block;
        }

        .form-control {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 0.95rem;
          color: #0f172a;
          width: 100%;
          transition: all 0.2s;
        }

        .form-control:focus {
          background: #ffffff;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
          outline: none;
        }

        .btn-submit {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 10px;
        }

        .btn-submit:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .forgot-link {
          color: #0ea5e9;
          font-size: 0.85rem;
          text-decoration: none;
          font-weight: 600;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .signup-prompt {
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 24px;
        }

        .signup-prompt a {
          color: #0ea5e9;
          font-weight: 700;
          text-decoration: none;
        }

        .signup-prompt a:hover {
          text-decoration: underline;
        }

        /* SVG Mockup Style */
        .svg-mockup {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-top: 40px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .back-home-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 0.85rem;
          text-decoration: none;
          margin-bottom: 24px;
          font-weight: 600;
        }

        .back-home-link:hover {
          color: #0f172a;
        }

        @media (max-width: 900px) {
          .login-split-page {
            grid-template-columns: 1fr;
          }
          .login-left-pane {
            display: none;
          }
          .login-right-pane {
            padding: 60px 40px;
          }
        }

        @media (max-width: 576px) {
          .login-right-pane {
            padding: 32px 16px;
          }
          .login-form-header h2 {
            font-size: 1.5rem;
          }
          .login-form-header p {
            margin-bottom: 20px;
            font-size: 0.85rem;
          }
          .form-control {
            padding: 10px 12px;
            font-size: 0.9rem;
          }
          .btn-submit {
            padding: 10px;
            font-size: 0.9rem;
          }
        }
      `}</style>

      {/* Left Pane: Visual Presentation */}
      <div className="login-left-pane">
        <div className="login-left-bg-effect"></div>
        <Link to="/" className="login-brand-logo">SmartERP Cloud</Link>

        <div className="login-left-content">
          <h1>Run Your Entire Global Operation Smarter.</h1>
          <p>Connect warehouses, scan assets in real-time, predict procurement orders, and control finances with our state-of-the-art enterprise solution.</p>

          <div className="svg-mockup">
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
            </div>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Active WMS Threads</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0ea5e9' }}>4,921 Scans / Min</div>
            </div>
            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', background: '#10b981' }}></div>
            </div>
          </div>
        </div>

        <div className="login-left-footer">
          © 2026 SmartERP Cloud. Secure multi-tenant architecture.
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="login-right-pane">
        <div className="login-form-wrap">
          <Link to="/" className="back-home-link">← Back to Homepage</Link>

          <div className="login-form-header">
            <h2>Enterprise Login</h2>
            <p>Enter your workspace credentials to enter the ERP dashboard.</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-4" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              ⚠️ {error}
            </div>
          )}

          {!requiresMfa ? (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Company Code *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={companyCode} 
                  onChange={e => setCompanyCode(e.target.value)} 
                  placeholder="e.g. ACMETECH" 
                  autoComplete="off" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Username or Email *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="e.g. admin_jane" 
                  autoComplete="username" 
                  required 
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label m-0">Password *</label>
                  <a href="#forgot" className="forgot-link">Forgot password?</a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  autoComplete="current-password" 
                  required 
                />
              </div>

              <div className="mb-4 d-flex align-items-center gap-2">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Remember my workspace</label>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Authenticating Workspace...' : 'Secure Login 🚀'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyMfa}>
              <div className="alert alert-info py-2 small mb-3 border-0 rounded-3" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                {mfaMessage} {devOtp && <strong>OTP Code: {devOtp}</strong>}
              </div>

              <div className="mb-4">
                <label className="form-label">OTP Code *</label>
                <input 
                  type="text" 
                  className="form-control text-center fw-bold" 
                  style={{ letterSpacing: '4px', fontSize: '1.2rem' }}
                  value={otpCode} 
                  onChange={e => setOtpCode(e.target.value)} 
                  placeholder="000000" 
                  required 
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Verifying Challenge...' : 'Verify MFA Code 🛡️'}
              </button>
            </form>
          )}

          <div className="signup-prompt">
            Don't have a branded workspace? <Link to="/signup">Start Free Trial</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
