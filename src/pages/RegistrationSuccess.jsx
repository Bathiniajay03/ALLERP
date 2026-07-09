import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegistrationSuccess() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem('erp_registration_success');
    if (raw) {
      setData(JSON.parse(raw));
    }
  }, []);

  const handleLoginRedirect = () => {
    if (data?.companyCode) {
      window.sessionStorage.setItem('erp_login_prefill_code', data.companyCode);
    }
    navigate('/login');
  };

  if (!data) {
    return (
      <div className="ok-page text-center py-5">
        <div className="spinner-border text-info"></div>
        <p className="mt-3 text-muted">Retrieving registration parameters...</p>
      </div>
    );
  }

  return (
    <div className="ok-page">
      <style>{`
        .ok-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          font-family: 'Outfit', sans-serif;
        }

        .ok-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 48px 36px;
          max-width: 550px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          backdrop-filter: blur(16px);
        }

        .ok-icon-circle {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          margin: 0 auto 24px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        }

        .ok-card h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ok-desc {
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 30px;
        }

        .ok-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 36px;
          text-align: left;
        }

        .ok-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .ok-item label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 4px;
          font-weight: 700;
        }

        .ok-item span {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .ok-item span.highlight {
          color: #0ea5e9;
        }

        .btn-login-now {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          font-weight: 700;
          padding: 12px 28px;
          border-radius: 8px;
          border: none;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-login-now:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.25);
        }
      `}</style>

      <div className="ok-card">
        <div className="ok-icon-circle">🎉</div>
        <h2>Congratulations!</h2>
        <p className="ok-desc">Your company workspace has been created successfully. You can now login with your administrator credentials.</p>

        <div className="ok-details-grid">
          <div className="ok-item">
            <label>Company ID</label>
            <span className="highlight">#{data.companyId}</span>
          </div>
          <div className="ok-item">
            <label>Company Code</label>
            <span className="highlight" style={{ textTransform: 'uppercase' }}>{data.companyCode}</span>
          </div>
          <div className="ok-item">
            <label>Admin Username</label>
            <span>{data.adminUsername}</span>
          </div>
          <div className="ok-item">
            <label>Subscription Plan</label>
            <span className="badge bg-success" style={{ fontSize: '0.85rem' }}>{data.subscriptionPlan}</span>
          </div>
        </div>

        <button onClick={handleLoginRedirect} className="btn-login-now">
          Login Now 🚀
        </button>
      </div>
    </div>
  );
}
