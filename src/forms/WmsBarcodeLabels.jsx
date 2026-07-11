import React, { useState, useEffect, useRef } from "react";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { smartErpApi } from "../services/smartErpApi";

export default function WmsBarcodeLabels() {
  const [items, setItems] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedType, setSelectedType] = useState("Item");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [copies, setCopies] = useState(1);
  const [labelList, setLabelList] = useState([]);
  
  const printRef = useRef();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const itemRes = await smartErpApi.getItems();
      setItems(itemRes.data || []);

      const lotRes = await smartErpApi.getLots();
      setLots(lotRes.data || []);
    } catch (err) {
      console.error("Failed to load items/lots", err);
    }
  };

  const handleAddLabels = () => {
    if (!selectedEntityId) return;

    let targetCode = "";
    let targetName = "";

    if (selectedType === "Item") {
      const item = items.find(i => i.id === parseInt(selectedEntityId));
      targetCode = item?.itemCode || `ITM-${item?.id}`;
      targetName = item?.itemName || "";
    } else if (selectedType === "Lot") {
      const lot = lots.find(l => l.id === parseInt(selectedEntityId));
      targetCode = lot?.lotNumber || `LOT-${lot?.id}`;
      targetName = `Item ID: ${lot?.itemId}`;
    } else if (selectedType === "Serial") {
      // Mock Serial code generation
      targetCode = `SER-${selectedEntityId}-${Date.now().toString().slice(-4)}`;
      targetName = `Serial Tag`;
    }

    const newLabels = Array.from({ length: copies }, (_, i) => ({
      id: `${targetCode}-${Date.now()}-${i}`,
      barcode: targetCode,
      name: targetName,
      type: selectedType,
      entityId: parseInt(selectedEntityId)
    }));

    setLabelList(prev => [...prev, ...newLabels]);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Barcode_Labels",
    onAfterPrint: async () => {
      // Log print histories
      for (const lbl of labelList) {
        try {
          await smartErpApi.logBarcodePrint({
            entityType: lbl.type,
            entityId: lbl.entityId,
            copies: 1
          });
        } catch (err) {
          console.error(err);
        }
      }
      alert("Labels printed successfully!");
      setLabelList([]);
    }
  });

  return (
    <div className="erp-app-wrapper min-vh-100 py-3 py-md-4 px-2 px-md-4" style={{ maxWidth: "1600px", margin: "0 auto", background: "#f8fafc" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Enterprise Label Printer</h2>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Select product tags, lots, or serial tags and queue them for thermal printing.</p>

        <div className="row g-4">
          {/* Controls Panel */}
          <div className="col-12 col-lg-5">
            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "fit-content" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "8px" }}>Print Category</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["Item", "Lot", "Serial"].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => { setSelectedType(type); setSelectedEntityId(""); }}
                      style={{ flex: 1, padding: "8px", background: selectedType === type ? "#4f46e5" : "#f1f5f9", color: selectedType === type ? "white" : "#475569", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "8px" }}>Select Entity</label>
                {selectedType === "Item" && (
                  <select 
                    value={selectedEntityId} 
                    onChange={e => setSelectedEntityId(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "white" }}
                  >
                    <option value="">-- Choose Item --</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.itemName} ({i.itemCode})</option>)}
                  </select>
                )}

                {selectedType === "Lot" && (
                  <select 
                    value={selectedEntityId} 
                    onChange={e => setSelectedEntityId(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "white" }}
                  >
                    <option value="">-- Choose Lot --</option>
                    {lots.map(l => <option key={l.id} value={l.id}>{l.lotNumber}</option>)}
                  </select>
                )}

                {selectedType === "Serial" && (
                  <input 
                    type="text" 
                    value={selectedEntityId} 
                    onChange={e => setSelectedEntityId(e.target.value)}
                    placeholder="Enter Serial Code base..."
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                  />
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "8px" }}>Copies</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    type="number" 
                    value={copies} 
                    onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setCopies(100)}
                    style={{ background: "#3b82f6", color: "white", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    100 Copies
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddLabels}
                style={{ width: "100%", background: "#4f46e5", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "15px" }}
              >
                ➕ Queue Labels
              </button>
            </div>
          </div>

          {/* Queue & Printing Preview Panel */}
          <div className="col-12 col-lg-7">
            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Print Queue ({labelList.length} items)</h3>
                <button 
                  onClick={handlePrint}
                  disabled={labelList.length === 0}
                  style={{ background: labelList.length > 0 ? "#10b981" : "#cbd5e1", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600", cursor: labelList.length > 0 ? "pointer" : "not-allowed" }}
                >
                  🖨 Print Queue
                </button>
              </div>

              {labelList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                  Your print queue is empty.
                </div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <div ref={printRef} className="row g-3 p-2">
                    {labelList.map(lbl => (
                      <div key={lbl.id} className="col-12 col-sm-6">
                        <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", pageBreakInside: "avoid" }}>
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>{lbl.name}</span>
                          <Barcode value={lbl.barcode} width={1.2} height={45} fontSize={10} />
                          <span style={{ fontSize: "10px", color: "#64748b", marginTop: "5px" }}>Type: {lbl.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
