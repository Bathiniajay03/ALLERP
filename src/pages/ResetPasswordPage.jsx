import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { smartErpApi } from '../services/smartErpApi';
import { Lock, ArrowLeft, ShieldAlert, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract query params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const userIdRaw = searchParams.get('userId');
  const userId = userIdRaw ? parseInt(userIdRaw, 10) : 0;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || userId <= 0) {
      setError('Invalid or expired password reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await smartErpApi.resetPassword({
        userId,
        token,
        newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex position-relative overflow-hidden bg-white text-dark align-items-center justify-content-center p-4">
      {/* Animated Background Particles / Blobs */}
      <div className="position-absolute w-100 h-100 pointer-events-none" style={{ zIndex: 0, overflow: 'hidden' }}>
        <div className="position-absolute bg-primary rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(120px)', opacity: 0.1, top: '10%', left: '10%' }} />
        <div className="position-absolute bg-info rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(120px)', opacity: 0.1, bottom: '10%', right: '10%' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-100 position-relative z-1" 
        style={{ maxWidth: '450px' }}
      >
        <div className="glass-card rounded-4 shadow-lg p-5" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="text-center mb-4">
            <h3 className="fw-bold text-dark mb-2">New Password</h3>
            <p className="text-muted fs-7">Enter your new secure password below</p>
          </div>

          {error && (
            <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger py-2 fs-7 text-center mb-4 d-flex align-items-center justify-content-center gap-2">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="d-inline-flex bg-success bg-opacity-10 text-success p-3 rounded-circle mb-3">
                <CheckCircle size={32} />
              </div>
              <h5 className="fw-bold mb-3 text-success">Password Reset Successful</h5>
              <p className="text-muted fs-7 mb-4">Your password has been successfully updated. You can now log in with your new credentials.</p>
              
              <Link to="/login" className="btn btn-primary w-100 rounded-pill fw-semibold py-2 text-decoration-none d-block text-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted fs-7">New Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-light-subtle text-muted"><Lock size={16} /></span>
                  <input 
                    type="password" 
                    className="form-control bg-white border-light-subtle text-dark focus-ring" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted fs-7">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-light-subtle text-muted"><Lock size={16} /></span>
                  <input 
                    type="password" 
                    className="form-control bg-white border-light-subtle text-dark focus-ring" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 rounded-pill fw-semibold py-2 d-flex justify-content-center align-items-center" disabled={loading} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="text-muted fs-7 text-decoration-none hover-text-dark">
            <ArrowLeft size={14} className="me-1" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
      
      <style>{`
        .focus-ring:focus {
          box-shadow: 0 0 0 0.25rem rgba(79, 70, 229, 0.25);
          border-color: #4f46e5;
        }
        .fs-7 { font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
