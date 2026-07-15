import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { smartErpApi } from '../services/smartErpApi';
import { Building2, User, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

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
    <div className="min-vh-100 d-flex position-relative overflow-hidden bg-white text-dark">
      {/* Animated Background Particles / Blobs */}
      <div className="position-absolute w-100 h-100 pointer-events-none" style={{ zIndex: 0, overflow: 'hidden' }}>
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="position-absolute bg-primary rounded-circle" 
          style={{ width: '600px', height: '600px', filter: 'blur(150px)', opacity: 0.15, top: '-10%', left: '-10%' }}
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.5, 1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="position-absolute bg-info rounded-circle" 
          style={{ width: '500px', height: '500px', filter: 'blur(150px)', opacity: 0.15, bottom: '-10%', right: '-10%' }}
        />
      </div>

      <div className="container-fluid m-0 p-0 d-flex w-100 position-relative z-1">
        <div className="row g-0 w-100 flex-grow-1">
          
          {/* Left Side: Cinematic Video Background */}
          <div className="col-lg-6 d-none d-lg-flex position-relative overflow-hidden p-0" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* YouTube Background Video */}
            <div className="position-absolute w-100 h-100 pointer-events-none" style={{ top: 0, left: 0, zIndex: 0 }}>
              <video
                src="/images/my-video.mp4"
                className="w-100 h-100 object-fit-cover"
                autoPlay
                muted
                loop
                playsInline
                style={{ pointerEvents: 'none' }} 
              ></video>
            </div>

            {/* Gradient Overlay for Readability */}
            <div className="position-absolute w-100 h-100" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)', zIndex: 1 }}></div>

            {/* Text Content Overlay */}
            <div className="position-relative z-2 d-flex flex-column justify-content-center p-5 h-100 text-white">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="ms-4"
              >
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="rounded d-flex align-items-center justify-content-center fw-bold shadow" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: 'white' }}>
                    M
                  </div>
                  <span className="fw-bold fs-4 text-white" style={{ letterSpacing: '1px' }}>MIND ERP</span>
                </div>
                <h1 className="display-4 fw-bold mb-4 text-white" style={{ letterSpacing: '-1.5px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                  Welcome back to your workspace.
                </h1>
                <p className="text-white-50 fs-5" style={{ maxWidth: '400px' }}>
                  Sign in to manage your inventory, warehouses, and enterprise operations natively in the cloud.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-sm-5">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-100" style={{ maxWidth: '450px' }}
            >
              
              <div className="glass-card rounded-4 shadow-lg p-5" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.08)' }}>
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-dark mb-2">Sign In</h3>
                  <p className="text-muted fs-7">Enter your details to access your account</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger py-2 fs-7 text-center mb-4">
                    {error}
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {!requiresMfa ? (
                    <motion.form 
                      key="login-form"
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleLogin}
                    >
                      <div className="mb-3">
                        <label className="form-label text-muted fs-7">Company Code</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-light-subtle text-muted"><Building2 size={16} /></span>
                          <input 
                            type="text" 
                            className="form-control bg-white border-light-subtle text-dark focus-ring" 
                            placeholder="ACME"
                            value={companyCode}
                            onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted fs-7">Username or Email</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-light-subtle text-muted"><User size={16} /></span>
                          <input 
                            type="text" 
                            className="form-control bg-white border-light-subtle text-dark focus-ring" 
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label text-muted fs-7 mb-0">Password</label>
                          <a href="#" className="text-primary fs-8 text-decoration-none hover-text-dark">Forgot Password?</a>
                        </div>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-light-subtle text-muted"><Lock size={16} /></span>
                          <input 
                            type="password" 
                            className="form-control bg-white border-light-subtle text-dark focus-ring" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4 form-check">
                        <input type="checkbox" className="form-check-input bg-white border-light-subtle" id="rememberMe" />
                        <label className="form-check-label text-muted fs-7" htmlFor="rememberMe">Remember me for 30 days</label>
                      </div>

                      <button type="submit" className="btn btn-primary w-100 rounded-pill fw-semibold py-2 d-flex justify-content-center align-items-center" disabled={loading} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Sign In'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form 
                      key="mfa-form"
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleVerifyMfa}
                    >
                      <div className="text-center mb-4">
                        <div className="d-inline-flex bg-primary bg-opacity-10 text-primary p-3 rounded-circle mb-3">
                          <KeyRound size={24} />
                        </div>
                        <h5 className="fw-bold mb-2">Two-Factor Authentication</h5>
                        <p className="text-muted fs-7 mb-0">{mfaMessage}</p>
                        
                        {devOtp && (
                          <div className="mt-3 p-2 border border-info rounded bg-info bg-opacity-10 text-info fs-7">
                            <strong>[DEV MODE] OTP:</strong> {devOtp}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <input 
                          type="text" 
                          className="form-control form-control-lg text-center bg-white border-light-subtle text-dark focus-ring fw-bold" 
                          placeholder="000000"
                          maxLength="6"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          style={{ letterSpacing: '8px', fontSize: '1.5rem' }}
                          required
                          autoFocus
                        />
                      </div>

                      <button type="submit" className="btn btn-primary w-100 rounded-pill fw-semibold py-2 mb-3 d-flex justify-content-center align-items-center" disabled={loading || otpCode.length !== 6} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Verify Code'}
                      </button>

                      <button type="button" className="btn btn-link w-100 text-muted text-decoration-none fs-7 hover-text-dark" onClick={() => setRequiresMfa(false)} disabled={loading}>
                        <ArrowLeft size={14} className="me-1" /> Back to login
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-center mt-4">
                <Link to="/" className="text-muted fs-7 text-decoration-none hover-text-dark">
                  <ArrowLeft size={14} className="me-1" /> Back to Landing Page
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      
      <style>{`
        .focus-ring:focus {
          box-shadow: 0 0 0 0.25rem rgba(79, 70, 229, 0.25);
          border-color: #4f46e5;
        }
        .hover-text-dark:hover { color: #f8fafc !important; }
        .fs-7 { font-size: 0.9rem; }
        .fs-8 { font-size: 0.8rem; }
      `}</style>
    </div>
  );
}
