import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { smartErpApi } from "../services/smartErpApi";
import { BarcodeDetailsPage } from "./BarcodeDetailsPage";
import api from "../services/apiClient";

export default function BarcodeScanner() {
  const [manualInput, setManualInput] = useState("");
  const [scannedCode, setScannedCode] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState("");
  
  // Product registration form
  const [productForm, setProductForm] = useState({
    itemCode: "",
    description: "",
    barcode: "",
    category: "General",
    uom: "NOS",
    price: 0,
    unitPrice: 0,
    warehouseLocation: "",
    isLotTracked: false,
    serialPrefix: "",
    maxStockLevel: 1000,
    safetyStock: 10,
    leadTimeDays: 3,
    averageDailySales: 0
  });

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    setCameraActive(true);
    try {
      codeReaderRef.current = new BrowserMultiFormatReader();
      const videoDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (!videoDevices || videoDevices.length === 0) {
        setCameraError("No camera devices found.");
        setCameraActive(false);
        return;
      }

      // Default to back camera if available
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("environment")
      );
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;

      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, err) => {
          if (result) {
            const barcodeText = result.getText();
            stopCamera(); // Auto close camera on success
            await handleProcessBarcode(barcodeText);
          }
        }
      );
    } catch (err) {
      console.error("Camera start failed", err);
      setCameraError("Could not access camera permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setCameraActive(false);
  };

  const handleProcessBarcode = async (barcode) => {
    try {
      // Dynamic verification on backend
      const res = await smartErpApi.globalScan(barcode);
      setScannedCode(barcode);
    } catch (err) {
      if (err.response?.status === 404) {
        // Unknown Barcode Intercept
        setUnknownBarcode(barcode);
        setProductForm(prev => ({ ...prev, barcode: barcode, itemCode: barcode }));
        setShowRegisterPopup(true);
      } else {
        alert("Error scanning barcode: " + (err.response?.data?.error || "Unknown error"));
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessBarcode(manualInput.trim());
      setManualInput("");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      // Call existing products controller endpoint directly
      await api.post("/smart-erp/products", {
        ...productForm,
        price: Number(productForm.price),
        unitPrice: Number(productForm.unitPrice),
        maxStockLevel: Number(productForm.maxStockLevel),
        safetyStock: Number(productForm.safetyStock),
        leadTimeDays: Number(productForm.leadTimeDays),
        averageDailySales: Number(productForm.averageDailySales)
      });

      // Also register in Barcode Registry
      await smartErpApi.generateSingleBarcode({
        entityType: "Item",
        entityId: 0, // Backend will query the newly created item ID or handle it, but to be safe let's bulk generate to sync, or register
        customPart: unknownBarcode
      });

      setShowRegisterPopup(false);
      alert("Product registered successfully!");
      // Proceed to details
      setScannedCode(unknownBarcode);
    } catch (err) {
      console.error(err);
      alert("Failed to register item: " + (err.response?.data?.message || "Check fields."));
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif", color: "#1e293b", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>Universal Barcode Scanner</h2>
        <p style={{ color: "#64748b", marginBottom: "30px", textAlign: "center" }}>Scan any company barcode using your camera or enter it manually.</p>

        {/* Camera Scanner Panel */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "25px" }}>
          {cameraActive ? (
            <div style={{ width: "100%", maxWidth: "450px", overflow: "hidden", borderRadius: "8px", position: "relative", background: "black", aspectRatio: "4/3" }}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button 
                onClick={stopCamera} 
                style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                ✕ Close Camera
              </button>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: "450px", height: "250px", background: "#f1f5f9", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #cbd5e1" }}>
              {cameraError && <p style={{ color: "#ef4444", marginBottom: "15px" }}>{cameraError}</p>}
              <button 
                onClick={startCamera}
                style={{ background: "#4f46e5", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                📷 Open Camera Scanner
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Panel */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "25px" }}>
          <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              value={manualInput} 
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or enter barcode number manually..."
              style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none", fontSize: "15px" }}
            />
            <button 
              type="submit"
              style={{ background: "#475569", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              Submit
            </button>
          </form>
        </div>

        {/* Scan Details / Reopen camera */}
        {scannedCode && (
          <div>
            <BarcodeDetailsPage barcode={scannedCode} onClose={() => setScannedCode(null)} />
            <button 
              onClick={() => { setScannedCode(null); startCamera(); }}
              style={{ width: "100%", background: "#10b981", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", marginTop: "15px" }}
            >
              🔄 Scan Another Barcode
            </button>
          </div>
        )}

        {/* Unknown Barcode Item Registration Popup */}
        {showRegisterPopup && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "550px", maxStatusHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#b91c1c" }}>❌ Unknown Barcode Scanned</h3>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>Barcode <strong>{unknownBarcode}</strong> is not registered. Fill out details to save and continue transaction.</p>
              
              <form onSubmit={handleCreateProduct}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Description</label>
                    <input 
                      type="text" 
                      value={productForm.description} 
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Category</label>
                    <input 
                      type="text" 
                      value={productForm.category} 
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>UOM</label>
                    <input 
                      type="text" 
                      value={productForm.uom} 
                      onChange={(e) => setProductForm({...productForm, uom: e.target.value})}
                      style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Price</label>
                    <input 
                      type="number" 
                      value={productForm.price} 
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Safety Stock</label>
                    <input 
                      type="number" 
                      value={productForm.safetyStock} 
                      onChange={(e) => setProductForm({...productForm, safetyStock: e.target.value})}
                      style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Serial Prefix (Optional)</label>
                    <input 
                      type="text" 
                      value={productForm.serialPrefix} 
                      onChange={(e) => setProductForm({...productForm, serialPrefix: e.target.value})}
                      style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterPopup(false)}
                    style={{ background: "#e2e8f0", color: "#475569", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ background: "#b91c1c", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
