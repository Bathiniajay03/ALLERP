import React, { useState, useEffect } from "react";
import { smartErpApi } from "../services/smartErpApi";
import { Link } from "react-router-dom";

export default function BarcodeDashboard() {
  const [metrics, setMetrics] = useState({
    scansToday: 0,
    missingItemBarcodes: 0,
    missingBinBarcodes: 0,
    totalBarcodes: 0,
    recentScans: []
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await smartErpApi.getBarcodeDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkGenerate = async () => {
    setLoading(true);
    try {
      const res = await smartErpApi.bulkGenerateBarcodes();
      setToast({ type: "success", msg: res.data.message });
      loadDashboard();
    } catch (err) {
      setToast({ type: "error", msg: "Failed to bulk generate barcodes." });
    } finally {
      setLoading(false);
    }
  };

  // Mock heatmap grid data
  const heatmapData = [
    { zone: "Zone A", utilization: 80, color: "#ef4444" },
    { zone: "Zone B", utilization: 45, color: "#f59e0b" },
    { zone: "Zone C", utilization: 20, color: "#10b981" },
    { zone: "Zone D", utilization: 95, color: "#ef4444" },
    { zone: "Zone E", utilization: 60, color: "#f59e0b" },
    { zone: "Zone F", utilization: 10, color: "#10b981" },
  ];

  return (
    <div className="erp-app-wrapper min-vh-100 py-3 py-md-4 px-2 px-md-4" style={{ maxWidth: "1600px", margin: "0 auto", background: "#f8fafc" }}>
      {toast && (
        <div style={{ padding: "15px", marginBottom: "20px", background: toast.type === "error" ? "#fee2e2" : "#d1fae5", color: toast.type === "error" ? "#b91c1c" : "#047857", borderRadius: "8px", fontWeight: "600" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Barcode Dashboard</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Overview of scanner activities and barcode health.</p>
        </div>
        <button onClick={handleBulkGenerate} disabled={loading} style={{ background: "#4f46e5", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "15px" }}>
          {loading ? "Generating..." : "⚡ Auto-Generate All Missing Barcodes"}
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3"><MetricCard title="Scans Today" value={metrics.scansToday} color="#3b82f6" /></div>
        <div className="col-12 col-sm-6 col-lg-3"><MetricCard title="Barcodes Registered" value={metrics.totalBarcodes} color="#8b5cf6" /></div>
        <div className="col-12 col-sm-6 col-lg-3"><MetricCard title="Items Lacking Barcode" value={metrics.missingItemBarcodes} color={metrics.missingItemBarcodes > 0 ? "#ef4444" : "#10b981"} /></div>
        <div className="col-12 col-sm-6 col-lg-3"><MetricCard title="Bins Lacking Barcode" value={metrics.missingBinBarcodes} color={metrics.missingBinBarcodes > 0 ? "#ef4444" : "#10b981"} /></div>
      </div>

      {/* Quick Actions Panel */}
      <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "35px" }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px", fontWeight: "600" }}>Quick Actions</h3>
        <div className="d-flex flex-wrap gap-3">
          <QuickActionLink to="/scanner-app" title="📷 Camera Scanner" desc="Scan any object barcode" color="#eff6ff" textColor="#1e40af" />
          <QuickActionLink to="/wms/barcode-search" title="🔍 Unified Search" desc="Find items, lots, bins" color="#faf5ff" textColor="#5b21b6" />
          <QuickActionLink to="/wms/barcode-labels" title="🖨 Label Printer" desc="Single/Bulk tag prints" color="#ecfdf5" textColor="#065f46" />
          <QuickActionLink to="/wms/barcode-generator" title="⚡ Single Generator" desc="Register custom tags" color="#fff7ed" textColor="#854d0e" />
          <QuickActionLink to="/wms/barcode-settings" title="⚙ Prefix Settings" desc="Configure UI prefixes" color="#f1f5f9" textColor="#334155" />
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Scanner Activity */}
        <div className="col-12 col-lg-6">
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "100%" }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Recent Audit Scans</h3>
            {metrics.recentScans && metrics.recentScans.length > 0 ? (
              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                      <th style={{ padding: "10px", color: "#64748b", fontSize: "13px" }}>Barcode</th>
                      <th style={{ padding: "10px", color: "#64748b", fontSize: "13px" }}>Action</th>
                      <th style={{ padding: "10px", color: "#64748b", fontSize: "13px" }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentScans.map((scan, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px", fontSize: "14px" }}>
                          <Link to={`/wms/barcode/${scan.barcode}`} style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>
                            {scan.barcode}
                          </Link>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ padding: "3px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                            {scan.action}
                          </span>
                        </td>
                        <td style={{ padding: "10px", color: "#64748b", fontSize: "13px" }}>{new Date(scan.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "#94a3b8" }}>No scanner events recorded today.</p>
            )}
          </div>
        </div>

        {/* Heat Map / Bin Utilization */}
        <div className="col-12 col-lg-6">
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "100%" }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Warehouse Zone Occupancy</h3>
            <div className="row g-3">
              {heatmapData.map((h, idx) => (
                <div key={idx} className="col-6 col-md-4">
                  <div style={{ background: "#f8fafc", padding: "20px 10px", borderRadius: "10px", textAlign: "center", border: "1px solid #e2e8f0", height: "100%" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "8px" }}>{h.zone}</span>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: h.color }}>{h.utilization}%</span>
                    <div style={{ width: "100%", background: "#cbd5e1", height: "6px", borderRadius: "3px", marginTop: "10px", overflow: "hidden" }}>
                      <div style={{ width: `${h.utilization}%`, background: h.color, height: "100%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div style={{ background: "white", padding: "20px 24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)", borderLeft: `6px solid ${color}` }}>
      <h4 style={{ margin: "0 0 6px 0", color: "#64748b", fontSize: "12px", textTransform: "uppercase", fontWeight: "600" }}>{title}</h4>
      <p style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#0f172a" }}>{value}</p>
    </div>
  );
}

function QuickActionLink({ to, title, desc, color, textColor }) {
  return (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ background: color, padding: "15px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.03)", height: "100%", cursor: "pointer", transition: "0.2s" }}>
        <h4 style={{ margin: "0 0 4px 0", color: textColor, fontSize: "15px", fontWeight: "700" }}>{title}</h4>
        <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>{desc}</p>
      </div>
    </Link>
  );
}
