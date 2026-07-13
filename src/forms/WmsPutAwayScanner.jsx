import React, { useState, useEffect, useRef } from "react";
import { smartErpApi } from "../services/smartErpApi";
import toast from "react-hot-toast";


export default function WmsPutAwayScanner() {
  const [step, setStep] = useState(1);
  const [warehouseId, setWarehouseId] = useState(1); // Default to WH 1 for demo
  const [warehouses, setWarehouses] = useState([]);
  const [scannedItem, setScannedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [recommendedBin, setRecommendedBin] = useState(null);
  const [scannedBin, setScannedBin] = useState(null);
  const [loading, setLoading] = useState(false);

  const itemInputRef = useRef(null);
  const binInputRef = useRef(null);
  const qtyInputRef = useRef(null);

  useEffect(() => {
    smartErpApi.warehouses().then(res => {
      setWarehouses(res.data);
      if (res.data.length > 0) setWarehouseId(res.data[0].id);
    });
    if (itemInputRef.current) itemInputRef.current.focus();
  }, []);

  const handleItemScan = async (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value;
    if (!barcode) return;

    setLoading(true);
    try {
     const res = await smartErpApi.get(`/wms-scanner/item/${encodeURIComponent(barcode)}`);
      setScannedItem(res.data);
      e.target.barcode.value = "";
      setStep(2);
      setTimeout(() => qtyInputRef.current?.focus(), 100);
      toast.success("Item Identified!");
    } catch (err) {
      toast.error("Item not found. Create it in Inventory first.");
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
     const res = await smartErpApi.get(`/wms-upgrade/recommend-bin`, {
        params: { itemId: scannedItem.id, warehouseId: warehouseId }
      });
      if (res.data) {
        setRecommendedBin(res.data);
      }
      setStep(3);
      setTimeout(() => binInputRef.current?.focus(), 100);
    } catch (err) {
      toast.error("Failed to recommend bin");
    } finally {
      setLoading(false);
    }
  };

  const handleBinScan = async (e) => {
    e.preventDefault();
    const barcode = e.target.binBarcode.value;
    if (!barcode) return;

    setLoading(true);
    try {
      // Use existing barcode service to resolve bin
           const res = await smartErpApi.get(`/barcode/scan/${encodeURIComponent(barcode)}`);
      if (res.data?.type?.toLowerCase() === "bin") {
        setScannedBin(res.data);
        e.target.binBarcode.value = "";

        // Auto submit if bin is valid
        submitPutAway(barcode);
      } else {
        toast.error("Invalid Bin Barcode.");
      }
    } catch (err) {
      toast.error("Bin not found.");
    } finally {
      setLoading(false);
    }
  };

  const submitPutAway = async (binBarcode) => {
    setLoading(true);
    try {
      const payload = {
        itemId: scannedItem.id,
        warehouseId: warehouseId,
        quantity: Number(quantity),
        binBarcode: binBarcode
      };
      const res = await smartErpApi.post(`/wms-scanner/putaway`, payload);
      toast.success(res.data.message || "Put Away Successful!");
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
    setRecommendedBin(null);
    setScannedBin(null);
    setStep(1);
    setTimeout(() => itemInputRef.current?.focus(), 100);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">Scanner Put Away</h2>
          <p className="text-muted mb-0">Fast barcode-driven put away workflow</p>
        </div>
        <select 
          className="form-select w-auto" 
          value={warehouseId} 
          onChange={e => setWarehouseId(Number(e.target.value))}
        >
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div className="row g-4">
        {/* Step 1: Scan Item */}
        <div className="col-12 col-md-4">
          <div className={`card h-100 ${step === 1 ? 'border-primary shadow-sm' : 'border-light'}`}>
            <div className={`card-header ${step === 1 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h5 className="mb-0">1. Scan Item Barcode</h5>
            </div>
            <div className="card-body">
              {step === 1 ? (
                <form onSubmit={handleItemScan}>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-upc-scan"></i></span>
                    <input 
                      type="text" 
                      name="barcode"
                      className="form-control form-control-lg" 
                      placeholder="Scan Item..." 
                      ref={itemInputRef}
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                    {loading ? "Searching..." : "Simulate Scan"}
                  </button>
                </form>
              ) : (
                <div className="d-flex justify-content-between align-items-center text-success">
                  <div>
                    <h6 className="mb-1">{scannedItem?.itemCode}</h6>
                    <p className="mb-0 text-muted small">{scannedItem?.description}</p>
                  </div>
                  <i className="bi bi-check-circle-fill fs-3"></i>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Quantity */}
        <div className="col-12 col-md-4">
          <div className={`card h-100 ${step === 2 ? 'border-primary shadow-sm' : 'border-light'} ${step < 2 ? 'opacity-50' : ''}`}>
            <div className={`card-header ${step === 2 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h5 className="mb-0">2. Enter Quantity</h5>
            </div>
            <div className="card-body">
              {step === 2 ? (
                <form onSubmit={handleQtySubmit}>
                  <div className="input-group">
                    <input 
                      type="number" 
                      className="form-control form-control-lg" 
                      placeholder="Qty" 
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      ref={qtyInputRef}
                      min="1"
                    />
                    <span className="input-group-text">{scannedItem?.defaultUnit || 'Units'}</span>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading || !quantity}>
                    Continue
                  </button>
                </form>
              ) : step > 2 ? (
                <div className="d-flex justify-content-between align-items-center text-success">
                  <h4 className="mb-0">{quantity} {scannedItem?.defaultUnit}</h4>
                  <i className="bi bi-check-circle-fill fs-3"></i>
                </div>
              ) : (
                <p className="text-muted text-center my-3">Waiting for Item...</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Scan Bin */}
        <div className="col-12 col-md-4">
          <div className={`card h-100 ${step === 3 ? 'border-primary shadow-sm' : 'border-light'} ${step < 3 ? 'opacity-50' : ''}`}>
            <div className={`card-header ${step === 3 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h5 className="mb-0">3. Scan Bin</h5>
            </div>
            <div className="card-body">
              {step === 3 ? (
                <div>
                  {recommendedBin && (
                    <div className="alert alert-info py-2 px-3 mb-3">
                      <small className="d-block fw-bold mb-1">Recommended Bin:</small>
                      <span className="d-block fs-5 font-monospace">{recommendedBin.code}</span>
                      {recommendedBin.maxWeightKg > 0 && (
                        <small className="d-block mt-1">Capacity: {recommendedBin.maxWeightKg} KG</small>
                      )}
                    </div>
                  )}
                  <form onSubmit={handleBinScan}>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-upc-scan"></i></span>
                      <input 
                        type="text" 
                        name="binBarcode"
                        className="form-control form-control-lg" 
                        placeholder="Scan Bin Barcode..." 
                        ref={binInputRef}
                        autoComplete="off"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                      {loading ? "Processing..." : "Confirm Put Away"}
                    </button>
                  </form>
                </div>
              ) : (
                 <p className="text-muted text-center my-3">Waiting for Quantity...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {step > 1 && (
        <div className="text-center mt-5">
           <button className="btn btn-outline-danger" onClick={resetScanner}>Cancel & Restart</button>
        </div>
      )}
    </div>
  );
}