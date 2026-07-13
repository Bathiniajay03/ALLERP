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
    <div className="erp-login-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .erp-login-page {
          min-height: 100vh;
          background: #f4f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          font-family: 'Inter', sans-serif;
          color: #172b4d;
        }

        .erp-login-card {
          background: #ffffff;
          border: 1px solid #dfe1e6;
          border-radius: 8px;
          width: 100%;
          max-width: 450px;
          padding: 48px;
          box-shadow: 0 4px 12px rgba(9, 30, 66, 0.05);
        }

        .erp-login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .erp-login-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0052cc;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .erp-login-logo-icon {
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

        .erp-login-header h1 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #172b4d;
          margin: 0 0 8px;
        }

        .erp-login-header p {
          color: #5e6c84;
          font-size: 0.95rem;
          margin: 0;
        }

        .erp-form-group {
          margin-bottom: 20px;
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

        .erp-btn-primary {
          background: #0052cc;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
          margin-top: 8px;
        }

        .erp-btn-primary:hover {
          background: #0047b3;
        }

        .erp-btn-primary:disabled {
          background: #b3d4ff;
          cursor: not-allowed;
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

        .erp-alert-info {
          background: #e6f0ff;
          border-left: 4px solid #0052cc;
          color: #0047b3;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          margin-bottom: 24px;
        }

        .erp-login-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 0.9rem;
          color: #5e6c84;
        }

        .erp-login-footer a {
          color: #0052cc;
          font-weight: 600;
          text-decoration: none;
        }

        .erp-login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="erp-login-card">
        <div className="erp-login-header">
          <Link to="/" className="erp-login-logo">
            <div className="erp-login-logo-icon">E</div>
            SmartERP
          </Link>
          <h1>Welcome to SmartERP</h1>
          <p>Log in to your workspace to continue.</p>
        </div>

        {error && <div className="erp-alert">{error}</div>}

        {!requiresMfa ? (
          <form onSubmit={handleLogin}>
            <div className="erp-form-group">
              <label className="erp-form-label">Workspace Code</label>
              <input
                type="text"
                className="erp-form-control text-uppercase"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                placeholder="e.g. ACME"
                required
                disabled={loading}
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Username</label>
              <input
                type="text"
                className="erp-form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="erp-form-group">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="erp-form-label mb-0">Password</label>
                <Link to="/forgot-password" style={{fontSize: '0.8rem', color: '#0052cc', textDecoration: 'none'}}>Forgot password?</Link>
              </div>
              <input
                type="password"
                className="erp-form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="erp-btn-primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Log in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyMfa} className="animate__animated animate__fadeIn">
            <div className="erp-alert-info">
              {mfaMessage}
              {devOtp && (
                <div className="mt-2 fw-bold text-dark">
                  [DEV MODE] OTP: {devOtp}
                </div>
              )}
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label text-center">Enter 6-Digit OTP</label>
              <input
                type="text"
                className="erp-form-control text-center"
                style={{letterSpacing: '8px', fontSize: '1.25rem', padding: '12px'}}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength="6"
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="erp-btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Secure Code'}
            </button>
            <div className="text-center mt-3">
              <button 
                type="button" 
                className="btn btn-link text-muted" 
                style={{fontSize: '0.85rem', textDecoration: 'none'}}
                onClick={() => setRequiresMfa(false)}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="erp-login-footer">
          Don't have an account? <Link to="/signup">Start Free Trial</Link>
        </div>
      </div>
    </div>
  );
}
