import React, { useState, useEffect, useRef } from "react";
import api from "../services/apiClient";
import { smartErpApi } from "../services/smartErpApi";
import toast from "react-hot-toast";
import { BrowserMultiFormatReader } from '@zxing/library';

export default function WmsPutAwayScanner() {
  const [step, setStep] = useState(1); // 1: Item, 2: Quantity & Serials, 3: WMS Scan
  const [warehouseId, setWarehouseId] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [scannedItem, setScannedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [inputMode, setInputMode] = useState("scanner"); // scanner, manual, camera
  
  // Camera scanner states
  const [showCamera, setShowCamera] = useState(false);
  const [activeCameraTarget, setActiveCameraTarget] = useState(""); // "item", "location", "serial"
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Serial number states
  const [serialMode, setSerialMode] = useState("auto"); // auto, manual, scanner
  const [manualSerials, setManualSerials] = useState("");
  const [scannedSerials, setScannedSerials] = useState([]);
  
  // Sequential WMS states
  const [wmsStep, setWmsStep] = useState("zone"); // zone, aisle, rack, shelf, bin
  const [scannedZone, setScannedZone] = useState(null);
  const [scannedAisle, setScannedAisle] = useState(null);
  const [scannedRack, setScannedRack] = useState(null);
  const [scannedShelf, setScannedShelf] = useState(null);
  const [scannedBin, setScannedBin] = useState(null);
  const [recommendedBin, setRecommendedBin] = useState(null);
  
  const [loading, setLoading] = useState(false);

  const itemInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const serialInputRef = useRef(null);
  const locationInputRef = useRef(null);

  useEffect(() => {
    smartErpApi.warehouses().then(res => {
      setWarehouses(res.data);
      if (res.data.length > 0) setWarehouseId(res.data[0].id);
    });
    if (itemInputRef.current) itemInputRef.current.focus();
    
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const openCamera = (target) => {
    setActiveCameraTarget(target);
    setShowCamera(true);
    setTimeout(() => startCamera(target), 100);
  };

  const closeCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setShowCamera(false);
    setActiveCameraTarget("");
  };

  const startCamera = async (target) => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      const backCamera = videoDevices.find((device) => /(back|rear|environment)/i.test(device.label || ''));
      const deviceId = backCamera?.deviceId ?? videoDevices[0]?.deviceId;

      codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          const barcode = result.getText();
          closeCamera();
          
          // Auto-submit based on target
          if (target === "item") {
             if (itemInputRef.current) {
                 itemInputRef.current.value = barcode;
                 handleItemScan({ preventDefault: () => {}, target: { barcode: { value: barcode } } });
             }
          } else if (target === "location") {
             if (locationInputRef.current) {
                 locationInputRef.current.value = barcode;
                 handleLocationScan({ preventDefault: () => {}, target: { locationBarcode: { value: barcode } } });
             }
          } else if (target === "serial") {
             if (serialInputRef.current) {
                 serialInputRef.current.value = barcode;
                 handleSerialScanSubmit({ preventDefault: () => {}, target: { serialInput: { value: barcode } } });
             }
          }
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to access camera.");
      closeCamera();
    }
  };

  const handleItemScan = async (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value;
    if (!barcode) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/wms-scanner/item/${encodeURIComponent(barcode)}`);
      setScannedItem(res.data);
      e.target.barcode.value = "";
      setStep(2);
      setTimeout(() => qtyInputRef.current?.focus(), 100);
      toast.success("Item Identified!");
    } catch (err) {
      toast.error("Item not found in inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleQtySubmit = async (e) => {
    e.preventDefault();
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get(`/WmsOperations/recommend-bin/${scannedItem.id}/${warehouseId}`);
      if (res.data) {
        setRecommendedBin(res.data);
      }
      setStep(3);
      setWmsStep("zone");
      setTimeout(() => locationInputRef.current?.focus(), 100);
    } catch (err) {
      toast.error("Failed to recommend bin");
    } finally {
      setLoading(false);
    }
  };

  const handleSerialScanSubmit = (e) => {
    e.preventDefault();
    const val = e.target.serialInput.value.trim();
    if (!val) return;
    if (scannedSerials.includes(val)) {
      toast.error("Serial already scanned!");
      return;
    }
    setScannedSerials([...scannedSerials, val]);
    e.target.serialInput.value = "";
    toast.success(`Serial ${val} Scanned!`);
  };

  const handleLocationScan = async (e) => {
    e.preventDefault();
    const barcode = e.target.locationBarcode.value.trim();
    if (!barcode) return;

    setLoading(true);
    try {
      const res = await api.get(`/barcode/scan/${encodeURIComponent(barcode)}`);
      const scanResult = res.data?.data;
      if (!scanResult) {
        toast.error("Barcode not recognized.");
        return;
      }

      const type = scanResult.type?.toLowerCase();

      // If a Bin barcode is scanned directly at any stage, auto-resolve the entire hierarchy!
      if (type === "bin") {
        const binData = scanResult.data;
        const shelfData = binData?.shelf;
        const rackData = shelfData?.rack;
        const aisleData = rackData?.aisle;
        const zoneData = aisleData?.zone;
        const resolvedWhId = zoneData?.warehouse?.id || binData?.warehouseId || warehouseId;

        setWarehouseId(resolvedWhId);
        setScannedZone(zoneData || { code: "Auto" });
        setScannedAisle(aisleData || { code: "Auto" });
        setScannedRack(rackData || { code: "Auto" });
        setScannedShelf(shelfData || { code: "Auto" });
        setScannedBin(binData);

        toast.success(`Bin ${binData?.code} resolved!`);
        submitPutAway(binData?.barcode || barcode, resolvedWhId);
        e.target.locationBarcode.value = "";
        return;
      }

      if (wmsStep === "zone") {
        if (type !== "zone") {
          toast.error("Please scan a Zone barcode or the target Bin barcode directly.");
          return;
        }
        setScannedZone(scanResult.data);
        setWmsStep("aisle");
        toast.success(`Zone ${scanResult.data?.code} Verified!`);
      } else if (wmsStep === "aisle") {
        if (type !== "aisle") {
          toast.error("Please scan an Aisle barcode.");
          return;
        }
        setScannedAisle(scanResult.data);
        setWmsStep("rack");
        toast.success(`Aisle ${scanResult.data?.code} Verified!`);
      } else if (wmsStep === "rack") {
        if (type !== "rack") {
          toast.error("Please scan a Rack barcode.");
          return;
        }
        setScannedRack(scanResult.data);
        setWmsStep("shelf");
        toast.success(`Rack ${scanResult.data?.code} Verified!`);
      } else if (wmsStep === "shelf") {
        if (type !== "shelf") {
          toast.error("Please scan a Shelf barcode.");
          return;
        }
        setScannedShelf(scanResult.data);
        setWmsStep("bin");
        toast.success(`Shelf ${scanResult.data?.code} Verified!`);
      } else if (wmsStep === "bin") {
        setScannedBin(scanResult.data);
        toast.success(`Bin ${scanResult.data?.code} Verified!`);
        const binData = scanResult.data;
        const resolvedWhId = binData?.shelf?.rack?.aisle?.zone?.warehouse?.id || warehouseId;
        submitPutAway(scanResult.data?.barcode || barcode, resolvedWhId);
      }
      
      e.target.locationBarcode.value = "";
      setTimeout(() => locationInputRef.current?.focus(), 100);
    } catch (err) {
      toast.error("Location lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitPutAway = async (binBarcode, resolvedWhId) => {
    setLoading(true);
    try {
      const payload = {
        itemId: scannedItem.id,
        warehouseId: resolvedWhId || warehouseId,
        quantity: Number(quantity),
        binBarcode: binBarcode
      };
      const res = await api.post(`/wms-scanner/putaway`, payload);
      toast.success(res.data.message || "Put Away Completed Successfully!");
      resetScanner();
    } catch (err) {
      toast.error(err.response?.data?.error || "Put Away Failed!");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedItem(null);
    setQuantity("");
    setScannedZone(null);
    setScannedAisle(null);
    setScannedRack(null);
    setScannedShelf(null);
    setScannedBin(null);
    setRecommendedBin(null);
    setScannedSerials([]);
    setStep(1);
    setTimeout(() => itemInputRef.current?.focus(), 100);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h2 className="h4 mb-1">📦 WMS Put Away</h2>
          <p className="text-muted mb-0 small">Barcode-Driven Intake & Put Away</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch mt-1">
            <input 
              className="form-check-input cursor-pointer" 
              type="checkbox" 
              id="inputModeToggle"
              checked={inputMode === 'camera'}
              onChange={() => setInputMode(inputMode === 'camera' ? 'scanner' : 'camera')}
            />
            <label className="form-check-label small fw-bold" htmlFor="inputModeToggle">
              {inputMode === 'camera' ? '📱 Mobile Camera' : '🔫 Device Scanner'}
            </label>
          </div>
          <select 
            className="form-select w-auto" 
            value={warehouseId} 
            disabled={step > 1}
            onChange={e => setWarehouseId(Number(e.target.value))}
          >
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* Step 1: Scan Item */}
        <div className="col-12 col-md-4">
          <div className={`card h-100 ${step === 1 ? 'border-primary shadow' : 'border-light'}`}>
            <div className={`card-header ${step === 1 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h6 className="mb-0">1. Scan Item Barcode</h6>
            </div>
            <div className="card-body">
              {step === 1 ? (
                <form onSubmit={handleItemScan}>
                  <div className="input-group">
                    {inputMode === 'camera' ? (
                      <button type="button" className="btn btn-outline-primary" onClick={() => openCamera("item")}>
                        <i className="bi bi-camera-fill"></i>
                      </button>
                    ) : (
                      <span className="input-group-text bg-white"><i className="bi bi-upc-scan text-primary"></i></span>
                    )}
                    <input 
                      type="text" 
                      name="barcode"
                      className="form-control" 
                      placeholder={inputMode === 'camera' ? "Tap camera icon to scan..." : "Scan Item Code..."} 
                      ref={itemInputRef}
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                    Simulate Scan
                  </button>
                </form>
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-center text-success mb-2">
                    <span className="fw-bold">{scannedItem?.itemCode}</span>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <p className="text-muted small mb-0">{scannedItem?.description}</p>
                  <small className="text-secondary d-block mt-2">Current Stock: {scannedItem?.currentStock} units</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Quantity & Serials */}
        <div className="col-12 col-md-4">
          <div className={`card h-100 ${step === 2 ? 'border-primary shadow' : 'border-light'} ${step < 2 ? 'opacity-50' : ''}`}>
            <div className={`card-header ${step === 2 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h6 className="mb-0">2. Enter Quantity & Serials</h6>
            </div>
            <div className="card-body">
              {step === 2 ? (
                <form onSubmit={handleQtySubmit}>
                  <div className="mb-3">
                    <label className="form-label small">Quantity</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Qty" 
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      ref={qtyInputRef}
                      min="1"
                    />
                  </div>

                  {scannedItem?.isSerialTracked && (
                    <div className="border-top pt-3 mt-3">
                      <label className="form-label small">Serial Entry Mode</label>
                      <div className="btn-group btn-group-sm w-100 mb-3">
                        <button type="button" className={`btn ${serialMode === 'auto' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSerialMode('auto')}>Auto</button>
                        <button type="button" className={`btn ${serialMode === 'scanner' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSerialMode('scanner')}>Scan</button>
                      </div>

                      {serialMode === 'scanner' && (
                        <div>
                          <div className="input-group input-group-sm mb-2" onSubmit={handleSerialScanSubmit}>
                            {inputMode === 'camera' ? (
                              <button type="button" className="btn btn-outline-primary" onClick={() => openCamera("serial")}>
                                <i className="bi bi-camera-fill"></i>
                              </button>
                            ) : null}
                            <input type="text" name="serialInput" className="form-control" ref={serialInputRef} placeholder={inputMode === 'camera' ? "Tap camera icon..." : "Scan Serial..."} />
                            <button type="submit" className="btn btn-secondary">Add</button>
                          </div>
                          <small className="text-muted">{scannedSerials.length} of {quantity || 0} serials scanned</small>
                        </div>
                      )}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                    Continue
                  </button>
                </form>
              ) : step > 2 ? (
                <div className="d-flex justify-content-between align-items-center text-success">
                  <h5 className="mb-0">{quantity} {scannedItem?.defaultUnit || 'Units'}</h5>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              ) : (
                <p className="text-muted text-center my-3 small">Scan Item First</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Location Scan (Sequential) */}
        <div className="col-12 col-md-4">
          <div className={`card h-100 ${step === 3 ? 'border-primary shadow' : 'border-light'} ${step < 3 ? 'opacity-50' : ''}`}>
            <div className={`card-header ${step === 3 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h6 className="mb-0">3. Sequential Scan Location</h6>
            </div>
            <div className="card-body">
              {step === 3 ? (
                <div>
                  {recommendedBin && (
                    <div className="alert alert-info py-2 px-3 mb-3 small">
                      <span className="d-block fw-bold mb-1">💡 Recommended Bin:</span>
                      <code className="d-block">{recommendedBin.code}</code>
                    </div>
                  )}

                  <div className="mb-3">
                    <span className="badge bg-secondary mb-2 uppercase">Current Scan: {wmsStep}</span>
                    <form onSubmit={handleLocationScan}>
                      <div className="input-group">
                        {inputMode === 'camera' ? (
                          <button type="button" className="btn btn-outline-primary" onClick={() => openCamera("location")}>
                            <i className="bi bi-camera-fill"></i>
                          </button>
                        ) : (
                          <span className="input-group-text bg-white"><i className="bi bi-upc-scan text-primary"></i></span>
                        )}
                        <input 
                          type="text" 
                          name="locationBarcode" 
                          className="form-control"
                          ref={locationInputRef}
                          placeholder={inputMode === 'camera' ? "Tap camera icon..." : `Scan ${wmsStep} Barcode...`}
                          autoComplete="off"
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                        Submit Location
                      </button>
                    </form>
                  </div>

                  <ul className="list-group list-group-flush small border-top pt-2">
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Zone:</span>
                      <strong className={scannedZone ? "text-success" : "text-muted"}>{scannedZone ? scannedZone.code : "Pending Scan"}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Aisle:</span>
                      <strong className={scannedAisle ? "text-success" : "text-muted"}>{scannedAisle ? scannedAisle.code : "Pending Scan"}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Rack:</span>
                      <strong className={scannedRack ? "text-success" : "text-muted"}>{scannedRack ? scannedRack.code : "Pending Scan"}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Shelf:</span>
                      <strong className={scannedShelf ? "text-success" : "text-muted"}>{scannedShelf ? scannedShelf.code : "Pending Scan"}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Bin:</span>
                      <strong className={scannedBin ? "text-success" : "text-muted"}>{scannedBin ? scannedBin.code : "Pending Scan"}</strong>
                    </li>
                  </ul>
                </div>
              ) : (
                <p className="text-muted text-center my-3 small">Complete Steps 1 & 2</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {step > 1 && (
        <div className="text-center mt-4">
          <button className="btn btn-sm btn-outline-danger" onClick={resetScanner}>Reset Workflow</button>
        </div>
      )}

      {showCamera && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 overflow-hidden">
              <div className="modal-header bg-dark text-white border-0 py-2">
                <h6 className="modal-title m-0"><i className="bi bi-camera-video me-2"></i> Camera Scanner</h6>
                <button type="button" className="btn-close btn-close-white" onClick={closeCamera}></button>
              </div>
              <div className="modal-body p-0 bg-black text-center position-relative">
                <video 
                  ref={videoRef} 
                  style={{ width: '100%', maxHeight: '60vh', objectFit: 'cover' }} 
                  playsInline 
                  muted 
                />
                <div className="position-absolute top-50 start-50 translate-middle border border-2 border-danger rounded" style={{ width: '70%', height: '30%', opacity: 0.5, pointerEvents: 'none' }}></div>
              </div>
              <div className="modal-footer bg-dark border-0 p-2 justify-content-center">
                <small className="text-light">Point camera at barcode...</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}