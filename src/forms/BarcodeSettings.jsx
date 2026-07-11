import React, { useState, useEffect } from "react";
import { smartErpApi } from "../services/smartErpApi";

export default function BarcodeSettings() {
  const [prefixes, setPrefixes] = useState({
    Company: "CMP",
    Warehouse: "WH",
    Zone: "ZN",
    Aisle: "AS",
    Rack: "RK",
    Shelf: "SH",
    Bin: "BIN",
    Item: "ITM",
    Lot: "LOT",
    Serial: "SER",
    PurchaseOrder: "PO",
    SalesOrder: "SO",
    Shipment: "SHIP",
    PickList: "PICK"
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await smartErpApi.getBarcodeSettings();
      setPrefixes(res.data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load prefix settings.");
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (key, val) => {
    setPrefixes(prev => ({ ...prev, [key]: val.toUpperCase().trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await smartErpApi.saveBarcodeSettings(prefixes);
      showToast("success", "Barcode prefix settings updated successfully!");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-app-wrapper min-vh-100 py-3 py-md-4 px-2 px-md-4" style={{ maxWidth: "1600px", margin: "0 auto", background: "#f8fafc" }}>
      {toast && (
        <div style={{ 
          position: "fixed", top: "20px", right: "20px", padding: "15px 25px", borderRadius: "8px", zIndex: 1000,
          background: toast.type === "success" ? "#d1fae5" : "#fee2e2", 
          color: toast.type === "success" ? "#065f46" : "#991b1b",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontWeight: "500"
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Barcode Prefix Settings</h2>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Configure prefix rules for automatic barcode generation across all warehouse entities.</p>

        <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div className="row g-4 mb-4">
            {Object.keys(prefixes).map((key) => (
              <div key={key} className="col-12 col-md-6" style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()} Prefix
                </label>
                <input 
                  type="text" 
                  value={prefixes[key] || ""} 
                  onChange={(e) => handleChange(key, e.target.value)}
                  maxLength={10}
                  style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }}
                  required
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: "#4f46e5", color: "white", padding: "12px 30px", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "16px" }}
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
