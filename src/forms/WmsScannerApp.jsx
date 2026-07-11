import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { smartErpApi } from "../services/smartErpApi";
import { offlineQueue } from "../utils/OfflineQueue";

/* ─── tiny helpers ─────────────────────────────────────────────────── */
const Badge = ({ label, color = "#e2e8f0", text = "#475569" }) => (
  <span className="badge border" style={{ display:"inline-block", padding:"4px 12px", borderRadius:"999px",
    background:color, color:text, fontSize:"12px", fontWeight:700, letterSpacing:"0.04em" }}>
    {label}
  </span>
);
const MetricCard = ({ icon, label, value, accent="#0f4c81" }) => (
  <div className="erp-kpi-box" style={{ borderLeftColor: accent, flex:"1 1 110px", minWidth:0, padding:"12px" }}>
    <div className="d-flex justify-content-between align-items-start">
      <span className="erp-kpi-label">{label}</span>
      <span style={{fontSize:"18px"}}>{icon}</span>
    </div>
    <span className="erp-kpi-value text-dark mt-1">{value ?? "—"}</span>
  </div>
);
const InfoRow = ({ label, value }) =>
  (value != null && String(value) !== "") ? (
    <div style={{display:"flex",gap:"12px",padding:"9px 0",borderBottom:"1px solid #e2e8f0"}}>
      <span className="text-muted fw-bold" style={{minWidth:"140px",fontSize:"13px",flexShrink:0}}>{label}</span>
      <span className="text-dark" style={{fontSize:"13px",fontWeight:500,flex:1,wordBreak:"break-all"}}>{value}</span>
    </div>
  ) : null;

const SectionTitle = ({ children }) => (
  <h4 className="fw-bold mt-4 mb-2 text-primary" style={{ fontSize:"13px", textTransform:"uppercase", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:"8px" }}>
    <span style={{height:"2px",width:"16px",background:"var(--erp-primary)",display:"inline-block",borderRadius:"2px"}}/>
    {children}
  </h4>
);

const InventoryTable = ({ invs }) => {
  if (!invs || invs.length === 0)
    return <p className="text-muted fst-italic" style={{fontSize:"13px"}}>No stock recorded here.</p>;
  return (
    <div className="table-responsive border rounded">
      <table className="table table-sm table-hover mb-0" style={{fontSize:"13px"}}>
        <thead className="table-light">
          <tr>
            {["Item","Lot","Bin","Quantity"].map((h,i)=>(
              <th key={i} className="text-muted fw-bold" style={{textAlign:i===3?"right":"left",padding:"10px 14px"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invs.map((inv,idx)=>(
            <tr key={idx}>
              <td className="text-dark" style={{padding:"9px 14px"}}>{inv.item?.description||"Unknown"}</td>
              <td className="text-muted" style={{padding:"9px 14px"}}>{inv.lot?.lotNumber||"N/A"}</td>
              <td className="text-muted" style={{padding:"9px 14px"}}>{inv.wmsBin?.code||inv.locationCode||"—"}</td>
              <td className="text-dark fw-bold" style={{padding:"9px 14px",textAlign:"right"}}>{inv.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── type meta map ───────────────────────────────────────────────── */
const TYPE_META = {
  WAREHOUSE:     { icon:"🏢", label:"Warehouse",      color:"#eef2ff", text:"#3730a3" },
  ZONE:          { icon:"📍", label:"Zone",           color:"#fef3c7", text:"#92400e" },
  AISLE:         { icon:"🚶", label:"Aisle",          color:"#ecfdf5", text:"#065f46" },
  RACK:          { icon:"📦", label:"Rack",           color:"#faf5ff", text:"#6b21a8" },
  SHELF:         { icon:"🗂️", label:"Shelf",         color:"#fff7ed", text:"#9a3412" },
  BIN:           { icon:"🗃️", label:"Bin",           color:"#ecfdf5", text:"#065f46" },
  ITEM:          { icon:"🏷️", label:"Item",          color:"#eff6ff", text:"#1e40af" },
  LOT:           { icon:"🔢", label:"Lot",            color:"#faf5ff", text:"#6b21a8" },
  SERIALNUMBER:  { icon:"🔑", label:"Serial Number",  color:"#fef2f2", text:"#991b1b" },
  PURCHASEORDER: { icon:"🧾", label:"Purchase Order", color:"#ecfdf5", text:"#065f46" },
  SALESORDER:    { icon:"🛒", label:"Sales Order",    color:"#eff6ff", text:"#1e40af" },
  SHIPMENT:      { icon:"🚚", label:"Shipment",       color:"#fff7ed", text:"#9a3412" },
  PICKLIST:      { icon:"📋", label:"Pick List",      color:"#ecfdf5", text:"#065f46" },
  COMPANY:       { icon:"🏗️", label:"Company",       color:"#f8fafc", text:"#1e293b" },
};

export default function WmsScannerApp() {
  const [mode, setMode] = useState("Search"); // Search, Receive, Pick, Transfer, CycleCount
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef(null);

  // USB/Bluetooth Scanner wedge input listener
  useEffect(() => {
    let barcodeBuffer = "";
    let timeout;
    
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "Enter") {
        if (barcodeBuffer.length > 3) handleScan(barcodeBuffer);
        barcodeBuffer = "";
        return;
      }
      if (e.key.length === 1) {
        barcodeBuffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { barcodeBuffer = ""; }, 500);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const toggleCamera = () => {
    if (isCameraActive) {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
      setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 150 } }, false);
        scannerRef.current.render(
          (decodedText) => {
            scannerRef.current.pause(true);
            handleScan(decodedText);
            setTimeout(() => scannerRef.current.resume(), 2000); // resume after 2s
          },
          (err) => {} // ignore constant read errors
        );
      }, 100);
    }
  };

  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        osc.type = "square";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error("Audio not supported");
    }
  };

  const handleScan = async (barcode) => {
    if (!navigator.onLine) {
      await offlineQueue.enqueue(mode, '/offline-scan', { barcode, timestamp: Date.now() });
      setStatusMsg({ type: "warning", msg: "Device offline. Scan queued." });
      playSound("warning");
      return;
    }

    setLoading(true);
    try {
      if (mode === "Search") {
        const res = await smartErpApi.globalScan(barcode);
        setScannedData(res.data);
        setStatusMsg({ type: "success", msg: `Found ${res.data.data?.type || "Item"}: ${barcode}` });
        playSound("success");
      } else {
        setStatusMsg({ type: "success", msg: `Scanned ${barcode} in ${mode} mode.` });
        playSound("success");
      }
    } catch (err) {
      setStatusMsg({ type: "error", msg: err.response?.data?.error || "Invalid Barcode" });
      playSound("error");
    }
    setLoading(false);
  };

  const renderScannedDetails = () => {
    if (!scannedData || !scannedData.data) return null;
    const { type, data, metrics, inventories } = scannedData.data;
    const T = (type||"").toUpperCase();
    const meta = TYPE_META[T] || { icon:"📌", label:T, color:"#f8fafc", text:"#0f172a" };

    return (
      <div className="erp-panel p-4 shadow-sm mt-3">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h4 className="m-0 text-dark fw-bold d-flex align-items-center gap-2">
            <span>{meta.icon}</span> {meta.label} Result
          </h4>
          <Badge label={data.itemCode || data.code || data.poNumber || data.barcode || data.serialNumber} color={meta.color} text={meta.text}/>
        </div>

        {T === "ITEM" && (
          <>
            <div className="d-flex gap-3 flex-wrap mb-4">
              <MetricCard icon="🏷️" label="Unit Price" value={data.unitPrice!=null?"₹"+data.unitPrice:"—"} accent="#0f4c81"/>
              <MetricCard icon="🔢" label="Serial Count" value={metrics?.serialCount} accent="#8b5cf6"/>
              <MetricCard icon="📍" label="Lot Tracked" value={data.isLotTracked?"Yes":"No"} accent="#059669"/>
            </div>
            <SectionTitle>Item Master</SectionTitle>
            <InfoRow label="Item Code" value={data.itemCode}/><InfoRow label="Description" value={data.description}/>
            <InfoRow label="Category" value={data.category}/><InfoRow label="UOM" value={data.uOM||data.uom}/>
            <SectionTitle>Stock by Location</SectionTitle>
            <InventoryTable invs={inventories}/>
          </>
        )}

        {T === "SERIALNUMBER" && (
          <>
            <SectionTitle>Serial Info</SectionTitle>
            <InfoRow label="Serial Number" value={data.serialNumber}/><InfoRow label="Status" value={data.status}/>
          </>
        )}

        {T === "WAREHOUSE" && (
          <>
            <SectionTitle>Warehouse Info</SectionTitle>
            <InfoRow label="Code" value={data.code}/><InfoRow label="Name" value={data.name}/>
            <SectionTitle>Stock List</SectionTitle><InventoryTable invs={inventories}/>
          </>
        )}

        {T === "BIN" && (
          <>
            <SectionTitle>Bin Info</SectionTitle>
            <InfoRow label="Bin Code" value={data.code}/>
            <SectionTitle>Current Stock</SectionTitle><InventoryTable invs={inventories}/>
          </>
        )}

        {T !== "ITEM" && T !== "SERIALNUMBER" && T !== "WAREHOUSE" && T !== "BIN" && (
          <>
            <SectionTitle>Entity Data</SectionTitle>
            <InfoRow label="Name/Code" value={data.name || data.code || data.orderNumber || data.poNumber}/>
            <InfoRow label="Status" value={data.status}/>
            <div className="table-responsive mt-3">
              <pre className="bg-light p-3 rounded border text-muted" style={{ fontSize:"12px", margin:0 }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="erp-app-wrapper min-vh-100 py-4">
      <div className="container-fluid px-3" style={{ maxWidth:"600px", margin:"0 auto" }}>
        
        {/* Header */}
        <div className="erp-panel p-4 shadow-sm mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="m-0 fs-4 text-dark fw-bold">⚡ Action Scanner</h2>
            <p className="m-0 mt-1 small text-muted">Enterprise operations wedge</p>
          </div>
          {!navigator.onLine && <Badge label="OFFLINE MODE" color="#fef3c7" text="#92400e"/>}
        </div>

        {/* Modes */}
        <div className="d-flex gap-2 mb-4 overflow-auto pb-2" style={{scrollbarWidth:"none"}}>
          {["Search", "Receive", "Transfer", "Pick", "CycleCount"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`btn ${mode === m ? "btn-primary shadow-sm" : "btn-light border text-muted"} px-4 fw-bold`}
              style={{ whiteSpace:"nowrap", borderRadius:"8px" }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Camera Section */}
        <div className="erp-panel p-4 shadow-sm mb-4 text-center">
          <div className="text-muted mb-3 small fw-bold text-uppercase">Point camera or use wedge scanner</div>
          
          {isCameraActive && (
            <div className="overflow-hidden rounded border mb-3">
              <div id="reader" style={{ width:"100%" }}></div>
            </div>
          )}
          
          <button
            onClick={toggleCamera}
            className={`btn w-100 fw-bold py-3 ${isCameraActive ? "btn-outline-danger" : "btn-outline-primary"}`}
            style={{ borderRadius:"8px" }}
          >
            {isCameraActive ? "⏹ Stop Camera Scanner" : "▶ Start Camera Scanner"}
          </button>
        </div>

        {/* Status Messages */}
        {statusMsg && (
          <div className={`alert py-3 fw-bold shadow-sm ${statusMsg.type === "success" ? "alert-success" : statusMsg.type === "warning" ? "alert-warning" : "alert-danger"}`}
            style={{ borderRadius:"8px" }}>
            {statusMsg.msg}
          </div>
        )}

        {loading && <div className="text-center p-4 text-primary fw-bold">Processing Scan...</div>}

        {/* Details UI */}
        {mode === "Search" && renderScannedDetails()}
      </div>
    </div>
  );
}
