import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { smartErpApi } from "../services/smartErpApi";

export default function BarcodeGenerator() {
  const [entityType, setEntityType] = useState("Item");
  const [entityId, setEntityId] = useState("");
  const [customPart, setCustomPart] = useState("");
  const [prefixes, setPrefixes] = useState({});
  const [previewCode, setPreviewCode] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const types = ["Company", "Warehouse", "Zone", "Aisle", "Rack", "Shelf", "Bin", "Item", "Lot", "Serial", "PurchaseOrder", "SalesOrder", "Shipment", "PickList"];

  useEffect(() => {
    loadPrefixes();
  }, []);

  useEffect(() => {
    updatePreview();
  }, [entityType, entityId, customPart, prefixes]);

  const loadPrefixes = async () => {
    try {
      const res = await smartErpApi.getBarcodeSettings();
      setPrefixes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updatePreview = () => {
    const prefix = prefixes[entityType] || "";
    if (customPart) {
      setPreviewCode(`${prefix}-${customPart.toUpperCase().trim()}`);
    } else {
      const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      setPreviewCode(`${prefix}-${datePart}-${entityId || "ID"}-XXXX`);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!entityId) {
      showToast("error", "Please provide a valid Entity ID.");
      return;
    }
    setLoading(true);
    try {
      const res = await smartErpApi.generateSingleBarcode({
        entityType,
        entityId: parseInt(entityId),
        customPart: customPart || null
      });
      setGeneratedBarcode(res.data.barcode);
      showToast("success", `Successfully generated barcode: ${res.data.barcode}`);
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to generate barcode. Check for duplicate values.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif", color: "#1e293b", background: "#f8fafc", minHeight: "100vh" }}>
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
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Barcode Label Generator</h2>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Create and register individual barcodes with real-time preview before saving.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "30px" }}>
          <form onSubmit={handleGenerate} style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "fit-content" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "8px" }}>Entity Type</label>
              <select 
                value={entityType} 
                onChange={(e) => setEntityType(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none", background: "white" }}
              >
                {types.map(t => <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "8px" }}>Entity ID</label>
              <input 
                type="number" 
                value={entityId} 
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="e.g. 42"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }}
                required
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "8px" }}>Custom Part (Optional)</label>
              <input 
                type="text" 
                value={customPart} 
                onChange={(e) => setCustomPart(e.target.value)}
                placeholder="e.g. AJ01"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: "100%", background: "#4f46e5", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "16px" }}
            >
              {loading ? "Generating..." : "⚡ Generate & Register"}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "220px", border: "2px dashed #cbd5e1" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#64748b" }}>Live Barcode Preview</h4>
              {previewCode ? (
                <Barcode value={previewCode} width={1.5} height={60} fontSize={14} />
              ) : (
                <span style={{ color: "#64748b" }}>No preview code</span>
              )}
            </div>

            {generatedBarcode && (
              <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#059669" }}>✓ Saved & Active</h4>
                <Barcode value={generatedBarcode} width={1.5} height={60} fontSize={14} />
                <button 
                  onClick={() => {
                    // Quick print logic
                    const printWindow = window.open("", "_blank");
                    printWindow.document.write(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;"><div style="text-align:center;"><h2>Label</h2><img src="https://barcode.tec-it.com/barcode.ashx?data=${generatedBarcode}&code=Code128"/></div><script>window.print();</script></body></html>`);
                    printWindow.document.close();
                  }}
                  style={{ marginTop: "15px", background: "#10b981", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  🖨 Print Label
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
