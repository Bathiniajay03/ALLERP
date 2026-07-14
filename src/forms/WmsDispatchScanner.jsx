import React, { useState, useEffect, useRef } from "react";
import api from "../services/apiClient";
import { smartErpApi } from "../services/smartErpApi";
import toast from "react-hot-toast";

export default function WmsDispatchScanner() {
  const [step, setStep] = useState(1);
  const [scannedItem, setScannedItem] = useState(null);
  const [autoSelectedStock, setAutoSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const itemInputRef = useRef(null);
  const qtyInputRef = useRef(null);

  useEffect(() => {
    if (itemInputRef.current) itemInputRef.current.focus();
  }, []);

 const handleItemScan = async (e) => {
      e.preventDefault();
      const barcode = e.target.barcode.value;
      if (!barcode) return;

      setLoading(true);
      try {
        const resItem = await api.get(`/wms-scanner/item/${encodeURIComponent(barcode)}`);
        setScannedItem(resItem.data);
        e.target.barcode.value = "";

        // Auto-select FIFO stock immediately
        const resStock = await api.get(`/wms-scanner/auto-select-dispatch/${resItem.data.id}`);
        setAutoSelectedStock(resStock.data);

        setStep(2);
        setTimeout(() => qtyInputRef.current?.focus(), 100);
        toast.success("FIFO Stock Auto-Selected!");
      } catch (err) {
        toast.error(err.response?.data?.error || "Item not found or no stock available.");
      } finally {
        setLoading(false);
      }
    };
    

  const submitDispatch = async (e) => {
    e.preventDefault();
    const dispatchQty = Number(quantity);
    if (!dispatchQty || dispatchQty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    if (dispatchQty > autoSelectedStock.availableQuantity) {
      toast.error(`Only ${autoSelectedStock.availableQuantity} available in this bin.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        itemId: scannedItem.id,
        warehouseId: autoSelectedStock.warehouseId,
        lotId: autoSelectedStock.lotId,
        binId: autoSelectedStock.binId,
        quantity: dispatchQty,
        serialNumbers: scannedItem.isSerialTracked
          ? autoSelectedStock.availableSerials.slice(0, dispatchQty)
          : []
      };

        const res = await api.post(`/wms-scanner/dispatch`, payload);
        toast.success(res.data.message || "Dispatch Successful!");
      resetScanner();
    } catch (err) {
      toast.error(err.response?.data?.error || "Dispatch Failed!");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedItem(null);
    setAutoSelectedStock(null);
    setQuantity("");
    setStep(1);
    setTimeout(() => itemInputRef.current?.focus(), 100);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">Scanner Dispatch</h2>
          <p className="text-muted mb-0">FIFO auto-selection dispatch workflow</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Step 1: Scan Item */}
        <div className="col-12 col-md-6">
          <div className={`card h-100 ${step === 1 ? 'border-primary shadow-sm' : 'border-light'}`}>
            <div className={`card-header ${step === 1 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h5 className="mb-0">1. Scan Item to Dispatch</h5>
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
                    {loading ? "Locating Stock..." : "Simulate Scan"}
                  </button>
                </form>
              ) : (
                <div className="text-success">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1">{scannedItem?.itemCode}</h6>
                      <p className="mb-0 text-muted small">{scannedItem?.description}</p>
                    </div>
                    <i className="bi bi-check-circle-fill fs-3"></i>
                  </div>

                  <div className="alert alert-success py-2 px-3 mb-0">
                    <small className="d-block fw-bold mb-1">System Auto-Selected (FIFO):</small>
                    <span className="d-block"><strong>Warehouse:</strong> {autoSelectedStock?.warehouseName}</span>
                    <span className="d-block"><strong>Bin:</strong> {autoSelectedStock?.binCode}</span>
                    <span className="d-block"><strong>Lot:</strong> {autoSelectedStock?.lotNumber || 'General'}</span>
                    <span className="d-block mt-2 text-primary fw-bold">Available to Pick: {autoSelectedStock?.availableQuantity} {scannedItem?.defaultUnit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Confirm Dispatch */}
        <div className="col-12 col-md-6">
          <div className={`card h-100 ${step === 2 ? 'border-primary shadow-sm' : 'border-light'} ${step < 2 ? 'opacity-50' : ''}`}>
            <div className={`card-header ${step === 2 ? 'bg-primary text-white' : 'bg-light'}`}>
              <h5 className="mb-0">2. Confirm Dispatch</h5>
            </div>
            <div className="card-body">
              {step === 2 ? (
                <form onSubmit={submitDispatch}>
                  <div className="mb-3">
                    <label className="form-label">Quantity to Pick</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        placeholder="Qty"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        ref={qtyInputRef}
                        min="1"
                        max={autoSelectedStock?.availableQuantity}
                      />
                      <span className="input-group-text">{scannedItem?.defaultUnit || 'Units'}</span>
                    </div>
                  </div>

                  {scannedItem?.isSerialTracked && Number(quantity) > 0 && (
                    <div className="alert alert-warning py-2 mb-3">
                      <small><i className="bi bi-exclamation-triangle me-1"></i> System will automatically dispatch the oldest <strong>{quantity}</strong> serials from this bin.</small>
                    </div>
                  )}

                  <button type="submit" className="btn btn-success w-100 btn-lg mt-2" disabled={loading || !quantity}>
                    {loading ? "Dispatching..." : "Confirm & Dispatch"}
                  </button>
                </form>
              ) : (
                <p className="text-muted text-center my-4 py-3">Scan an item to view available FIFO stock...</p>
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