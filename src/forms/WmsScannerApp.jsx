import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { smartErpApi } from "../services/smartErpApi";
import { offlineQueue } from "../utils/OfflineQueue";

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
      // Ignore if typing in an input field
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      
      if (e.key === "Enter") {
        if (barcodeBuffer.length > 3) {
          handleScan(barcodeBuffer);
        }
        barcodeBuffer = "";
        return;
      }
      
      if (e.key.length === 1) {
        barcodeBuffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { barcodeBuffer = ""; }, 500); // 500ms timeout for scanner speed
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      // Global Search Mode
      if (mode === "Search") {
        const res = await smartErpApi.globalScan(barcode);
        setScannedData(res.data);
        setStatusMsg({ type: "success", msg: `Found ${res.data.type}: ${barcode}` });
        playSound("success");
      } else {
        // Implement specific mode logic here (Transfer, CycleCount)
        setStatusMsg({ type: "success", msg: `Scanned ${barcode} in ${mode} mode.` });
        playSound("success");
      }
    } catch (err) {
      setStatusMsg({ type: "error", msg: err.response?.data?.error || "Invalid Barcode" });
      playSound("error");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", color: "#1e293b", fontWeight: 800 }}>WMS Scanner</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {!navigator.onLine && <span style={{ padding: "4px 8px", background: "#f59e0b", color: "white", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>OFFLINE</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "10px" }}>
        {["Search", "Receive", "Transfer", "Pick", "CycleCount"].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "10px 16px",
              background: mode === m ? "#38bdf8" : "#e2e8f0",
              color: mode === m ? "white" : "#475569",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 15px -3px rgb(0 0 0 / 0.1)", marginBottom: "20px", textAlign: "center" }}>
        <p style={{ color: "#64748b", marginBottom: "16px" }}>Use Bluetooth/USB Scanner or Camera</p>
        
        {isCameraActive && <div id="reader" style={{ width: "100%", marginBottom: "16px" }}></div>}
        
        <button
          onClick={toggleCamera}
          style={{ width: "100%", padding: "14px", background: isCameraActive ? "#ef4444" : "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}
        >
          {isCameraActive ? "Stop Camera" : "Start Camera Scanner"}
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: "16px", borderRadius: "8px", background: statusMsg.type === "success" ? "#dcfce7" : statusMsg.type === "warning" ? "#fef3c7" : "#fee2e2", color: statusMsg.type === "success" ? "#166534" : statusMsg.type === "warning" ? "#92400e" : "#991b1b", fontWeight: 600, marginBottom: "20px", textAlign: "center" }}>
          {statusMsg.msg}
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: "20px", color: "#38bdf8", fontWeight: "bold" }}>Processing Scan...</div>}

      {scannedData && mode === "Search" && (
        <div style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 15px -3px rgb(0 0 0 / 0.1)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#334155", display: "flex", justifyContent: "space-between" }}>
            <span>{scannedData.type} Result</span>
            <span style={{ fontSize: "12px", background: "#e2e8f0", padding: "4px 8px", borderRadius: "4px" }}>{scannedData.data.itemCode || scannedData.data.barcode || scannedData.data.packageBarcode}</span>
          </h3>
          <pre style={{ background: "#f1f5f9", padding: "16px", borderRadius: "8px", overflowX: "auto", fontSize: "13px", color: "#0f172a", margin: 0 }}>
            {JSON.stringify(scannedData.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
