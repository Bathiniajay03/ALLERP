import React, { useState } from "react";
import Barcode from "react-barcode";

export default function WmsPackageScreen() {
  const [packageId, setPackageId] = useState("");
  const [weight, setWeight] = useState(0);
  const [generatedLabel, setGeneratedLabel] = useState(null);

  const generatePackageLabel = () => {
    // In reality this would call the API to create the WmsPackage and return the Barcode
    setGeneratedLabel({
      packageBarcode: "PKG-" + Math.floor(Math.random() * 1000000),
      orderId: packageId || "SO-1234",
      customer: "Enterprise Solutions Inc",
      weight: weight || 1.5,
      destination: "New York, NY",
      status: "Packed"
    });
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 24px 0", fontSize: "28px", color: "#1e293b", fontWeight: 700 }}>Package Dispatch & Label Generation</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#334155" }}>Package Details</h3>
          
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#475569" }}>Sales Order ID</label>
          <input 
            type="text" 
            value={packageId} 
            onChange={(e) => setPackageId(e.target.value)} 
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "16px" }}
            placeholder="Scan or enter SO number"
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#475569" }}>Weight (Kg)</label>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "24px" }}
          />

          <button 
            onClick={generatePackageLabel}
            style={{ width: "100%", padding: "12px", background: "#38bdf8", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "16px" }}
          >
            Generate Shipping Label
          </button>
        </div>

        {generatedLabel && (
          <div style={{ background: "white", padding: "0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", overflow: "hidden", border: "2px solid #e2e8f0" }}>
            <div style={{ background: "#0f172a", color: "white", padding: "16px", textAlign: "center" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>SHIPPING LABEL</h3>
            </div>
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", textAlign: "left", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>Ship To</div>
                  <div style={{ fontWeight: 800, fontSize: "18px", color: "#0f172a", marginTop: "4px" }}>{generatedLabel.customer}</div>
                  <div style={{ color: "#475569", marginTop: "4px" }}>{generatedLabel.destination}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>Order</div>
                  <div style={{ fontWeight: 800, fontSize: "18px", color: "#0f172a", marginTop: "4px" }}>{generatedLabel.orderId}</div>
                  <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginTop: "10px" }}>Weight</div>
                  <div style={{ fontWeight: 800, fontSize: "18px", color: "#0f172a", marginTop: "4px" }}>{generatedLabel.weight} KG</div>
                </div>
              </div>

              <Barcode value={generatedLabel.packageBarcode} format="CODE128" width={2.5} height={80} fontSize={16} background="#ffffff" />
              <div style={{ marginTop: "20px" }}>
                <button style={{ padding: "8px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>
                  Print Label
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
