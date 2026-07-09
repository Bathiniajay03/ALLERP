import React, { useState, useEffect, useCallback } from "react";
import { smartErpApi } from "../services/smartErpApi";

const GaugeBar = ({ label, used, max, color = "#3b82f6", unit = "" }) => {
  const pct = max > 0 ? Math.min(100, ((used / max) * 100)).toFixed(1) : 0;
  const barColor = pct > 85 ? "#ef4444" : pct > 65 ? "#f59e0b" : color;
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-bold small text-dark">{label}</span>
        <span className="small text-muted">{used}{unit} / {max}{unit} ({pct}%)</span>
      </div>
      <div className="progress" style={{ height: 10, borderRadius: 8 }}>
        <div className="progress-bar" role="progressbar"
          style={{ width: `${pct}%`, background: barColor, borderRadius: 8, transition: "width 0.8s ease" }}>
        </div>
      </div>
    </div>
  );
};

export default function UsageAnalytics() {
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
      setError("Failed to load usage analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading usage metrics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container py-4"><div className="alert alert-danger">{error}</div></div>
  );

  const storageUsedMB = stats?.storageUsedBytes ? Math.round(stats.storageUsedBytes / (1024 * 1024)) : 0;
  const storageMaxMB = stats?.storageMaxBytes ? Math.round(stats.storageMaxBytes / (1024 * 1024)) : 1024;

  const topMetrics = [
    { label: "Purchase Orders", value: stats?.purchaseOrderCount ?? 0, color: "#06b6d4", icon: "🛒" },
    { label: "Sales Orders", value: stats?.salesOrderCount ?? 0, color: "#8b5cf6", icon: "📋" },
    { label: "Inventory Lines", value: stats?.inventoryRecords ?? 0, color: "#f59e0b", icon: "📦" },
    { label: "Notifications Sent", value: stats?.notificationCount ?? 0, color: "#ec4899", icon: "🔔" },
    { label: "Audit Log Entries", value: stats?.auditLogCount ?? 0, color: "#10b981", icon: "📝" },
    { label: "Open Transactions", value: stats?.openTransactions ?? 0, color: "#f97316", icon: "⚡" },
  ];

  const inventoryValue = stats?.inventoryValue || 0;
  const currency = stats?.currency || "$";

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="bg-white p-4 rounded-3 shadow-sm mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fw-bold m-0 fs-4">Usage Analytics</h1>
          <p className="text-muted small m-0">Monitor resource consumption and platform utilization for your organization.</p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchStats}>
          Refresh
        </button>
      </div>

      {/* Activity Counters */}
      <div className="row g-3 mb-4">
        {topMetrics.map((m) => (
          <div className="col-md-4 col-6" key={m.label}>
            <div className="card border-0 shadow-sm p-3" style={{ borderRadius: 12 }}>
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: 28 }}>{m.icon}</span>
                <div>
                  <div className="fw-bold" style={{ color: m.color, fontSize: "1.4rem" }}>
                    {m.value.toLocaleString()}
                  </div>
                  <div className="text-muted small">{m.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Utilization */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
            <h5 className="fw-bold mb-4">Quota Usage</h5>
            <GaugeBar label="Users" used={stats?.totalUsers ?? 0} max={stats?.maxUsers ?? 5} color="#3b82f6" />
            <GaugeBar label="Warehouses" used={stats?.warehouseCount ?? 0} max={stats?.maxWarehouses ?? 3} color="#10b981" />
            <GaugeBar label="Inventory Records" used={stats?.inventoryRecords ?? 0} max={stats?.maxInventoryRecords ?? 1000} color="#f59e0b" />
            <GaugeBar label="Storage" used={storageUsedMB} max={storageMaxMB} color="#8b5cf6" unit=" MB" />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
            <h5 className="fw-bold mb-4">Financial Summary</h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-2">
                <span className="text-muted fw-bold">Estimated Inventory Value</span>
                <span className="fw-bold fs-5 text-success">{currency}{inventoryValue.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-2">
                <span className="text-muted fw-bold">Active Purchase Orders</span>
                <span className="fw-bold fs-5">{stats?.purchaseOrderCount ?? 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-2">
                <span className="text-muted fw-bold">Active Sales Orders</span>
                <span className="fw-bold fs-5">{stats?.salesOrderCount ?? 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-2">
                <span className="text-muted fw-bold">Pending Transactions</span>
                <span className={`fw-bold fs-5 ${(stats?.openTransactions ?? 0) > 0 ? "text-warning" : "text-success"}`}>
                  {stats?.openTransactions ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info Footer */}
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0">Platform Details</h6>
            <p className="text-muted small mb-0">
              Timezone: <strong>{stats?.timezone || "UTC"}</strong> &nbsp;|&nbsp;
              Currency: <strong>{currency}</strong> &nbsp;|&nbsp;
              Subscription: <strong>{stats?.subscriptionPlan}</strong> ({stats?.subscriptionStatus})
            </p>
          </div>
          {stats?.trialEndsAt && (
            <div className="badge bg-warning text-dark px-3 py-2">
              Trial ends: {new Date(stats.trialEndsAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
