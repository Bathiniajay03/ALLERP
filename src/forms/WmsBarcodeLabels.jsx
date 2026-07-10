import React, { useState, useEffect, useRef } from "react";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { smartErpApi } from "../services/smartErpApi";

export default function WmsBarcodeLabels() {
  const [entities, setEntities] = useState([]);
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const itemsRes = await smartErpApi.getItems();
      // In a real app we'd fetch WmsLocations and Packages here too
      // Merging mock bin data for demo purposes since getBins requires warehouseId
      const mappedItems = (itemsRes.data || []).filter(i => i.itemCode).map(i => ({
        type: "Item",
        id: i.id,
        name: i.itemName,
        barcode: i.itemCode
      }));
      setEntities(mappedItems);
    } catch (err) {
      console.error("Failed to load entities for barcodes", err);
    }
  };

  const toggleSelect = (barcode) => {
    setSelectedBarcodes(prev => 
      prev.includes(barcode) ? prev.filter(b => b !== barcode) : [...prev, barcode]
    );
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "WMS_Barcodes",
    onAfterPrint: () => {
      // Here we would call BarcodeController /history endpoint to log the print
    }
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "28px", color: "#1e293b", fontWeight: 700 }}>Barcode Label Printing</h2>
        <button
          onClick={handlePrint}
          disabled={selectedBarcodes.length === 0}
          style={{ padding: "10px 20px", background: selectedBarcodes.length > 0 ? "#10b981" : "#cbd5e1", color: "white", border: "none", borderRadius: "6px", cursor: selectedBarcodes.length > 0 ? "pointer" : "not-allowed", fontWeight: 600, transition: "0.2s" }}
        >
          Print Selected ({selectedBarcodes.length})
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#334155" }}>Select Labels</h3>
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {entities.map(ent => (
              <div key={`${ent.type}-${ent.id}`} style={{ display: "flex", alignItems: "center", padding: "12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => toggleSelect(ent.barcode)}>
                <input type="checkbox" checked={selectedBarcodes.includes(ent.barcode)} readOnly style={{ marginRight: "12px", width: "18px", height: "18px" }} />
                <div>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{ent.name}</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>{ent.type} • {ent.barcode}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px dashed #cbd5e1" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#334155" }}>Print Preview</h3>
          <div ref={printRef} style={{ display: "flex", flexWrap: "wrap", gap: "20px", background: "white", padding: "20px", minHeight: "400px" }}>
            {selectedBarcodes.map(code => (
              <div key={code} style={{ border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", background: "white", textAlign: "center" }}>
                <Barcode value={code} format="CODE128" width={2} height={60} fontSize={14} background="#ffffff" />
              </div>
            ))}
            {selectedBarcodes.length === 0 && (
              <div style={{ width: "100%", textAlign: "center", color: "#94a3b8", paddingTop: "100px" }}>
                Select barcodes to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
