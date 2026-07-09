import React, { useState, useEffect, useCallback } from "react";
import { smartErpApi } from "../services/smartErpApi";

const PLAN_CONFIG = {
  Trial: {
    color: "#6366f1",
    badge: "bg-purple",
    features: ["5 Users", "3 Warehouses", "1 GB Storage", "10,000 API calls/month", "Basic Modules"],
    limits: { users: 5, warehouses: 3, storage: "1 GB" }
  },
  Basic: {
    color: "#0ea5e9",
    badge: "bg-info",
    features: ["10 Users", "5 Warehouses", "5 GB Storage", "50,000 API calls/month", "Finance + Reports"],
    limits: { users: 10, warehouses: 5, storage: "5 GB" }
  },
  Professional: {
    color: "#f59e0b",
    badge: "bg-warning",
    features: ["30 Users", "15 Warehouses", "20 GB Storage", "200,000 API calls/month", "AI + Automation"],
    limits: { users: 30, warehouses: 15, storage: "20 GB" }
  },
  Enterprise: {
    color: "#10b981",
    badge: "bg-success",
    features: ["Unlimited Users", "Unlimited Warehouses", "500 GB Storage", "Unlimited API calls", "All Modules + Priority Support"],
    limits: { users: "∞", warehouses: "∞", storage: "500 GB" }
  }
};

export default function SubscriptionPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await smartErpApi.getCompanyDashboard();
      setStats(res.data);
    } catch (err) {
      setError("Failed to load subscription info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (error) return (
    <div className="container py-4"><div className="alert alert-danger">{error}</div></div>
  );

  const currentPlan = stats?.subscriptionPlan || "Trial";
  const currentConfig = PLAN_CONFIG[currentPlan] || PLAN_CONFIG.Trial;
  const trialEndsAt = stats?.trialEndsAt ? new Date(stats.trialEndsAt) : null;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))) : null;

  const getVal = (key) => {
    if (!stats) return false;
    if (stats[key] !== undefined) return stats[key];
    const pascal = key.charAt(0).toUpperCase() + key.slice(1);
    if (stats[pascal] !== undefined) return stats[pascal];
    const lower = key.toLowerCase();
    const foundKey = Object.keys(stats).find(k => k.toLowerCase() === lower);
    if (foundKey && stats[foundKey] !== undefined) return stats[foundKey];
    if (lower === "enableai") {
      if (stats.enableAi !== undefined) return stats.enableAi;
      if (stats.EnableAi !== undefined) return stats.EnableAi;
    }
    return false;
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1200 }}>
      {/* Current Plan Banner */}
      <div className="p-4 rounded-3 shadow-sm text-white mb-4 d-flex flex-wrap justify-content-between align-items-center"
        style={{ background: `linear-gradient(135deg, ${currentConfig.color}, ${currentConfig.color}cc)` }}>
        <div>
          <p className="text-uppercase fw-bold small mb-1 opacity-75">Current Plan</p>
          <h1 className="fw-bold m-0">{currentPlan} Plan</h1>
          <p className="mb-0 opacity-90">
            Status: <strong>{stats?.subscriptionStatus || stats?.SubscriptionStatus}</strong>
            {trialEndsAt && daysLeft !== null && (
              <span className="ms-3">· Trial expires in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong> ({trialEndsAt.toLocaleDateString()})</span>
            )}
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <div className="rounded-3 p-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}>
            <div className="row g-4 text-center text-white">
              <div className="col">
                <div className="fw-bold fs-5">{currentConfig.limits.users}</div>
                <small className="opacity-75">Users</small>
              </div>
              <div className="col">
                <div className="fw-bold fs-5">{currentConfig.limits.warehouses}</div>
                <small className="opacity-75">Warehouses</small>
              </div>
              <div className="col">
                <div className="fw-bold fs-5">{currentConfig.limits.storage}</div>
                <small className="opacity-75">Storage</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <h4 className="fw-bold mb-3">Available Plans</h4>
      <div className="row g-3 mb-4">
        {Object.entries(PLAN_CONFIG).map(([planName, config]) => {
          const isCurrent = planName === currentPlan;
          return (
            <div className="col-md-3" key={planName}>
              <div className={`card border-0 shadow-sm h-100 ${isCurrent ? "border-3" : ""}`}
                style={{ borderRadius: 14, border: isCurrent ? `2px solid ${config.color}` : undefined }}>
                <div className="card-body p-4">
                  {isCurrent && (
                    <span className="badge mb-2 text-white fw-bold" style={{ background: config.color }}>
                      ✓ Current Plan
                    </span>
                  )}
                  <h5 className="fw-bold" style={{ color: config.color }}>{planName}</h5>
                  <ul className="list-unstyled mt-3">
                    {config.features.map((f, i) => (
                      <li key={i} className="mb-2 d-flex align-items-center gap-2">
                        <span style={{ color: config.color, fontWeight: "bold" }}>✓</span>
                        <span className="text-dark small">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    {isCurrent ? (
                      <button className="btn btn-light w-100 fw-bold disabled" style={{ color: config.color }}>Active</button>
                    ) : (
                      <button className="btn w-100 fw-bold text-white"
                        style={{ background: config.color }}
                        onClick={() => alert(`To upgrade to ${planName}, please contact support@yourerp.com`)}>
                        {Object.keys(PLAN_CONFIG).indexOf(planName) > Object.keys(PLAN_CONFIG).indexOf(currentPlan)
                          ? `Upgrade to ${planName}`
                          : `Downgrade to ${planName}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Features Enabled */}
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
        <h5 className="fw-bold mb-3">Enabled Platform Modules</h5>
        <div className="row g-2">
          {[
            { key: "enableFinance", label: "Finance & Payments", icon: "💳" },
            { key: "enableAI", label: "AI Procurement", icon: "🤖" },
            { key: "enableReports", label: "Reports & Analytics", icon: "📊" },
            { key: "enableWarehouse", label: "Warehouse Management", icon: "🏭" },
            { key: "enableAutomation", label: "Automation Engine", icon: "⚡" },
            { key: "enableScanner", label: "Barcode / Scanner", icon: "📷" },
            { key: "enablePurchaseOrders", label: "Purchase Orders", icon: "🛒" },
            { key: "enableSales", label: "Sales & CRM", icon: "📋" },
          ].map(({ key, label, icon }) => {
            const isEnabled = getVal(key);
            return (
              <div className="col-md-3 col-6" key={key}>
                <div className={`d-flex align-items-center gap-2 p-2 rounded-2 ${isEnabled ? "bg-success bg-opacity-10" : "bg-light"}`}>
                  <span>{icon}</span>
                  <span className={`small fw-bold ${isEnabled ? "text-success" : "text-muted"}`}>{label}</span>
                  <span className={`ms-auto badge ${isEnabled ? "bg-success" : "bg-secondary"}`}>
                    {isEnabled ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-muted small mt-3 mb-0">
          To change enabled modules, contact your Super Administrator or upgrade your plan.
        </p>
      </div>
    </div>
  );
}
