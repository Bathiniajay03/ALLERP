import React, { useState, useEffect, useCallback } from "react";
import { smartErpApi } from "../services/smartErpApi";

const StatCard = ({ label, value, sub, color = "#3b82f6", icon }) => (
  <div className="card border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${color}`, borderRadius: 12 }}>
    <div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted small fw-bold text-uppercase mb-1">{label}</p>
          <h2 className="fw-bold mb-0" style={{ color }}>{value ?? "—"}</h2>
          {sub && <span className="text-muted small">{sub}</span>}
        </div>
        {icon && <span style={{ fontSize: 32, opacity: 0.2 }}>{icon}</span>}
      </div>
    </div>
  </div>
);

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await smartErpApi.getCompanyDashboard();
      setStats(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load company dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading company analytics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container py-4">
      <div className="alert alert-danger">{error}</div>
    </div>
  );

  const plan = stats?.subscriptionPlan || "Trial";
  const planColors = { Trial: "#6366f1", Basic: "#0ea5e9", Professional: "#f59e0b", Enterprise: "#10b981" };
  const planColor = planColors[plan] || "#6366f1";

  const storageUsedMB = stats?.storageUsedBytes ? (stats.storageUsedBytes / (1024 * 1024)).toFixed(1) : "0";
  const storageLimitGB = stats?.storageMaxBytes ? (stats.storageMaxBytes / (1024 * 1024 * 1024)).toFixed(0) : "—";
  const storagePercent = stats?.storageMaxBytes && stats?.storageUsedBytes
    ? Math.min(100, ((stats.storageUsedBytes / stats.storageMaxBytes) * 100)).toFixed(1)
    : 0;

  const userPercent = stats?.maxUsers && stats?.totalUsers
    ? Math.min(100, ((stats.totalUsers / stats.maxUsers) * 100)).toFixed(0)
    : 0;

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1300 }}>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-white p-4 rounded-3 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          {stats?.logo ? (
            <img src={stats.logo} alt="Logo" className="rounded-circle" style={{ width: 52, height: 52, objectFit: "cover" }} />
          ) : (
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4"
              style={{ width: 52, height: 52, background: stats?.primaryColor || "#3b82f6" }}>
              {(stats?.companyName || "C")[0]}
            </div>
          )}
          <div>
            <h1 className="fw-bold m-0 fs-4">{stats?.companyName || "My Company"}</h1>
            <span className="text-muted small">{stats?.companyCode} · {stats?.country}</span>
          </div>
        </div>
        <div>
          <span className="badge fs-6 px-3 py-2 fw-bold text-white" style={{ background: planColor, borderRadius: 8 }}>
            {plan} Plan
          </span>
          {stats?.subscriptionStatus === "Active" ? (
            <span className="badge bg-success ms-2 py-2 px-3">Active</span>
          ) : (
            <span className="badge bg-danger ms-2 py-2 px-3">{stats?.subscriptionStatus}</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <StatCard label="Total Users" value={stats?.totalUsers} sub={`of ${stats?.maxUsers} max`} color="#3b82f6" icon="👥" />
        </div>
        <div className="col-md-3 col-6">
          <StatCard label="Warehouses" value={stats?.warehouseCount} sub={`of ${stats?.maxWarehouses} max`} color="#10b981" icon="🏭" />
        </div>
        <div className="col-md-3 col-6">
          <StatCard label="Inventory Items" value={stats?.inventoryRecords?.toLocaleString()} sub="Total item lines" color="#f59e0b" icon="📦" />
        </div>
        <div className="col-md-3 col-6">
          <StatCard label="Inventory Value" value={`${stats?.currency || "$"}${(stats?.inventoryValue || 0).toLocaleString()}`} sub="Estimated stock value" color="#8b5cf6" icon="💰" />
        </div>
        <div className="col-md-3 col-6">
          <StatCard label="Purchase Orders" value={stats?.purchaseOrderCount} sub="Total POs" color="#06b6d4" icon="🛒" />
        </div>
        <div className="col-md-3 col-6">
          <StatCard label="Sales Orders" value={stats?.salesOrderCount} sub="Total SOs" color="#ec4899" icon="📋" />
        </div>
        <div className="col-md-3 col-6">
          <StatCard label="Open Transactions" value={stats?.openTransactions} sub="Pending processing" color="#f97316" icon="⚡" />
        </div>
        <div className="col-md-3 col-6">
          <StatCard label="Notifications" value={stats?.notificationCount} sub="Unread alerts" color="#14b8a6" icon="🔔" />
        </div>
      </div>

      {/* Resource Usage */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
            <h5 className="fw-bold mb-3">Storage Utilization</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">{storageUsedMB} MB used</span>
              <span className="text-muted small">{storageLimitGB} GB limit</span>
            </div>
            <div className="progress" style={{ height: 12, borderRadius: 8 }}>
              <div
                className={`progress-bar ${Number(storagePercent) > 80 ? "bg-danger" : Number(storagePercent) > 60 ? "bg-warning" : "bg-success"}`}
                style={{ width: `${storagePercent}%`, borderRadius: 8 }}
              ></div>
            </div>
            <p className="text-muted small mt-2 mb-0">{storagePercent}% of allocated storage used</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
            <h5 className="fw-bold mb-3">User Seat Utilization</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">{stats?.totalUsers} active users</span>
              <span className="text-muted small">{stats?.maxUsers} seat limit</span>
            </div>
            <div className="progress" style={{ height: 12, borderRadius: 8 }}>
              <div
                className={`progress-bar ${Number(userPercent) > 80 ? "bg-danger" : "bg-primary"}`}
                style={{ width: `${userPercent}%`, borderRadius: 8 }}
              ></div>
            </div>
            <p className="text-muted small mt-2 mb-0">{userPercent}% of available user seats occupied</p>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold">Current Subscription</h5>
            <p className="text-muted mb-0">
              Plan: <strong>{plan}</strong> &nbsp;|&nbsp;
              Status: <strong>{stats?.subscriptionStatus}</strong> &nbsp;|&nbsp;
              {stats?.trialEndsAt && (
                <>Trial ends: <strong>{new Date(stats.trialEndsAt).toLocaleDateString()}</strong></>
              )}
            </p>
          </div>
          <div className="mt-2 mt-md-0">
            <span className="text-muted small">
              Enabled Modules: &nbsp;
              {stats?.enableFinance && <span className="badge bg-secondary me-1">Finance</span>}
              {stats?.enableAI && <span className="badge bg-secondary me-1">AI</span>}
              {stats?.enableReports && <span className="badge bg-secondary me-1">Reports</span>}
              {stats?.enableScanner && <span className="badge bg-secondary me-1">Scanner</span>}
              {stats?.enableAutomation && <span className="badge bg-secondary me-1">Automation</span>}
              {stats?.enablePurchaseOrders && <span className="badge bg-secondary me-1">PO</span>}
              {stats?.enableSales && <span className="badge bg-secondary me-1">Sales</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
