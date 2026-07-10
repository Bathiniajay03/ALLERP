import React, { useState, useEffect } from "react";
import { smartErpApi } from "../services/smartErpApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BarcodeDashboard() {
  const [metrics, setMetrics] = useState({ scansToday: 0, missingItemBarcodes: 0, missingBinBarcodes: 0, recentScans: [] });
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
      setToast({ type: "error", msg: "Failed to bulk generate." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif", color: "#1e293b", background: "#f8fafc", minHeight: "100vh" }}>
      {toast && <div style={{ padding: "15px", marginBottom: "20px", background: toast.type === "error" ? "#fee2e2" : "#d1fae5", color: toast.type === "error" ? "#b91c1c" : "#047857", borderRadius: "8px" }}>{toast.msg}</div>}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ margin: 0, fontWeight: "600", color: "#0f172a" }}>Barcode Command Center</h2>
        <button 
          onClick={handleBulkGenerate}
          disabled={loading}
          style={{ background: "#4f46e5", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "0.2s" }}
        >
          {loading ? "Generating..." : "⚡ Auto-Generate Missing Barcodes"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <MetricCard title="Scans Today" value={metrics.scansToday} color="#3b82f6" />
        <MetricCard title="Items Missing Barcodes" value={metrics.missingItemBarcodes} color={metrics.missingItemBarcodes > 0 ? "#ef4444" : "#10b981"} />
        <MetricCard title="Bins Missing Barcodes" value={metrics.missingBinBarcodes} color={metrics.missingBinBarcodes > 0 ? "#ef4444" : "#10b981"} />
      </div>

      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Recent Scanner Activity</h3>
        {metrics.recentScans.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #e2e8f0" }}>Barcode</th>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #e2e8f0" }}>Action</th>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #e2e8f0" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentScans.map((scan, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", color: "#0f172a", fontWeight: 500 }}>{scan.barcode}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, background: "#e0f2fe", color: "#0369a1" }}>
                      {scan.action}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#64748b" }}>{new Date(scan.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#94a3b8" }}>No recent scans found.</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", borderLeft: `6px solid ${color}` }}>
      <h3 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: "36px", fontWeight: 700, color: color }}>{value}</p>
    </div>
  );
}
