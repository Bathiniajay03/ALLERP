import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Form, Row, Col, Tabs, Tab, Button, Badge, Alert, Table, Modal } from 'react-bootstrap';
import api from '../services/apiClient';
import MobileScanner from '../components/MobileScanner';

const MODE_TABS = ['stock', 'scanner'];

const formatStatusMessage = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(formatStatusMessage).join('; ');
  if (typeof value === 'object') {
    if (value.message) return value.message;
    if (value.title) return value.title;
    if (value.errors) {
      if (Array.isArray(value.errors)) return value.errors.map(formatStatusMessage).join('; ');
      return typeof value.errors === 'string' ? value.errors : JSON.stringify(value.errors);
    }
    return JSON.stringify(value);
  }
  return String(value);
};

export default function Operations() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('stock');
  const [txMode, setTxMode] = useState('in'); // 'in', 'out', 'transfer', 'bulk'
  
  const [txForm, setTxForm] = useState({
    itemId: '',
    warehouseId: '',
    destWarehouseId: '',
    quantity: '',
    lotNumber: '',
    lotId: '',
    prefix: ''
  });

  const [showSerialModal, setShowSerialModal] = useState(false);
  const [serialGenerationForm, setSerialGenerationForm] = useState({
    quantity: 0,
    prefix: '',
    generatedSerials: []
  });
  
  const [availableSerials, setAvailableSerials] = useState([]);
  const [serialLoading, setSerialLoading] = useState(false);
  const [serialError, setSerialError] = useState('');
  const [selectedSerialIds, setSelectedSerialIds] = useState(new Set());

  const [lotOptions, setLotOptions] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(false);

  const parseNumber = (value) => {
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const toggleSerialSelection = useCallback((serialId) => {
    setSelectedSerialIds((prev) => {
      const next = new Set(prev);
      if (next.has(serialId)) {
        next.delete(serialId);
      } else {
        next.add(serialId);
      }
      return next;
    });
  }, []);

  const showStatus = useCallback((type, text) => {
    const normalized = formatStatusMessage(text);
    setStatus({ type, text: normalized });
    if (normalized) {
      setTimeout(() => setStatus({ type: '', text: '' }), 4500);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, warehousesRes, inventoryRes] = await Promise.all([
        api.get('/stock/items'),
        api.get('/warehouses'),
        api.get('/stock/inventory')
      ]);
      setItems(itemsRes.data || []);
      setWarehouses(warehousesRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (err) {
      showStatus('error', 'Failed to load master data');
    } finally {
      setLoading(false);
    }
  }, [showStatus]);

  const handleScannerPopulate = useCallback((payload) => {
    if (!payload) return;
    setTxForm((prev) => ({
      ...prev,
      ...(payload.itemId ? { itemId: String(payload.itemId) } : {}),
      ...(payload.warehouseId ? { warehouseId: String(payload.warehouseId) } : {}),
      ...(payload.lotNumber ? { lotNumber: payload.lotNumber } : {}),
      ...(payload.lotId ? { lotId: String(payload.lotId) } : {})
    }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedItemId = parseNumber(txForm.itemId);
  const selectedWarehouseId = parseNumber(txForm.warehouseId);
  const selectedItem = useMemo(
    () => items.find((item) => String(item.id) === txForm.itemId),
    [items, txForm.itemId]
  );
  const isSerialTracked = Boolean(selectedItem?.serialPrefix);
  const requiresSerialSelection = isSerialTracked && (txMode === 'out' || txMode === 'transfer');
  const requiresLotNumberForIn = Boolean(selectedItem?.isLotTracked && txMode === 'in');
  const lotNumberValue = txForm.lotNumber?.trim() ?? '';
  const desiredSerialQty = parseNumber(txForm.quantity) ?? 0;
  const availableSerialsForAuto = useMemo(
    () => availableSerials.filter((serial) => serial.status === 'AVAILABLE'),
    [availableSerials]
  );

  // Load available lots dynamically when item/warehouse changes
  const loadLotOptions = useCallback(async () => {
    if (!selectedItemId || !selectedWarehouseId) {
      setLotOptions([]);
      return;
    }
    setLotsLoading(true);
    try {
      const res = await api.get('/stock/lots', {
        params: { itemId: selectedItemId, warehouseId: selectedWarehouseId }
      });
      const normalized = (res.data || []).map((lot) => ({
        lotId: lot.lotId ?? lot.LotId ?? null,
        lotNumber: lot.lotNumber ?? lot.LotNumber ?? 'General',
        quantity: Number(lot.quantity ?? lot.Quantity ?? 0)
      }));
      setLotOptions(normalized);
    } catch (err) {
      setLotOptions([]);
    } finally {
      setLotsLoading(false);
    }
  }, [selectedItemId, selectedWarehouseId]);

  const fetchSerialsForLot = useCallback(async () => {
      if (
      !requiresSerialSelection ||
      !selectedItemId ||
      !selectedWarehouseId ||
      !txForm.lotId
    ) {
      setAvailableSerials([]);
      return;
    }

    const lotIdNumber = Number(txForm.lotId);
    if (!Number.isFinite(lotIdNumber)) {
      setAvailableSerials([]);
      setSerialError('Select a lot before loading serial numbers.');
      return;
    }

    setSerialLoading(true);
    try {
      const params = {
        itemId: selectedItemId,
        warehouseId: selectedWarehouseId,
        lotId: lotIdNumber,
        status: 'AVAILABLE'
      };
      if (lotNumberValue) {
        params.lotNumber = lotNumberValue;
      }
      const response = await api.get('/stock/serials', { params });
      setAvailableSerials(Array.isArray(response.data) ? response.data : []);
      setSerialError('');
      setSelectedSerialIds(new Set());
    } catch (error) {
      console.error('Serial fetch failed', error);
      setAvailableSerials([]);
      setSerialError('Unable to load serial numbers for this lot.');
    } finally {
      setSerialLoading(false);
    }
  }, [requiresSerialSelection, selectedItemId, selectedWarehouseId, txForm.lotId]);

  useEffect(() => {
    loadLotOptions();
    // Reset lot selection when switching items
    setTxForm((prev) => ({ ...prev, lotId: '' }));
  }, [loadLotOptions]);

  useEffect(() => {
    fetchSerialsForLot();
  }, [fetchSerialsForLot]);

  useEffect(() => {
    setSelectedSerialIds(new Set());
  }, [selectedItemId, selectedWarehouseId, txForm.lotId, txMode, isSerialTracked]);

  // Auto-Select Lot for OUT / TRANSFER
  useEffect(() => {
    if (lotOptions.length > 0 && (txMode === 'out' || txMode === 'transfer')) {
      const validLot = lotOptions.find(l => l.quantity > 0);
      if (validLot && !txForm.lotId) {
        setTxForm(prev => ({
          ...prev,
          lotId: String(validLot.lotId),
          lotNumber: validLot.lotNumber || prev.lotNumber
        }));
      }
    }
  }, [lotOptions, txMode, txForm.lotId]);

  const getAvailableLots = () => lotOptions.filter((lot) => lot.lotId !== null && lot.quantity > 0);

  // --- SERIAL GENERATION ---
  const openSerialGenerationModal = () => {
    if (!txForm.itemId || !txForm.warehouseId || !txForm.quantity || parseFloat(txForm.quantity) <= 0) {
      return showStatus('error', 'Valid Item, Warehouse, and Quantity required.');
    }
    
    const item = items.find((i) => i.id === parseInt(txForm.itemId, 10));
    const prefix = txForm.prefix || (item ? item.itemCode.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) : 'SN');

    setSerialGenerationForm({
      quantity: parseFloat(txForm.quantity),
      prefix,
      generatedSerials: []
    });
    setShowSerialModal(true);
  };

  const generateSerialNumbers = async () => {
    const qty = serialGenerationForm.quantity;
    if (qty <= 0 || qty > 1000) return showStatus('warning', 'Limit: 1-1,000 units per batch');

    try {
      const response = await api.get('/stock/next-serials', {
        params: {
          itemId: txForm.itemId,
          warehouseId: txForm.warehouseId,
          quantity: qty
        }
      });
      const serials = (response.data || []).map(sn => ({
        serialNumber: sn,
        status: 'Available'
      }));
      setSerialGenerationForm((prev) => ({ ...prev, generatedSerials: serials }));
    } catch (err) {
      showStatus('error', err?.response?.data || 'Failed to fetch next sequential serials');
    }
  };

  const autoSelectSerials = useCallback(() => {
    if (!requiresSerialSelection) return;
    if (!desiredSerialQty || desiredSerialQty <= 0) {
      return showStatus('warning', 'Enter a valid quantity before auto-selecting serial numbers.');
    }
    if (availableSerialsForAuto.length < desiredSerialQty) {
      return showStatus(
        'warning',
        `Only ${availableSerialsForAuto.length} available serials found for ${desiredSerialQty} units.`
      );
    }
    setSelectedSerialIds(
      new Set(availableSerialsForAuto.slice(0, desiredSerialQty).map((serial) => serial.id))
    );
  }, [availableSerialsForAuto, desiredSerialQty, requiresSerialSelection, showStatus]);

  // --- UNIFIED TRANSACTION PROTOCOL ---
  const handleStockTransaction = async (e) => {
    e?.preventDefault();

    // 1. HANDLE BULK TRANSFER
    if (txMode === 'bulk') {
      if (!txForm.warehouseId || !txForm.destWarehouseId) {
        return showStatus('error', 'Please select Source and Destination Warehouses');
      }
      if (txForm.warehouseId === txForm.destWarehouseId) {
        return showStatus('error', 'Source and Destination cannot be the same');
      }

      setLoading(true);
      try {
        const response = await api.post('/stock/bulk-transfer', null, {
          params: { sourceWhId: txForm.warehouseId, destWhId: txForm.destWarehouseId }
        });
        showStatus('success', response.data || 'Bulk Transfer Successful');
        
        setTxForm({ itemId: '', warehouseId: '', destWarehouseId: '', quantity: '', lotNumber: '', lotId: '', prefix: '' });
        setTxMode('in');
        fetchData();
      } catch (err) {
        showStatus('error', err.response?.data?.message || err.response?.data || 'Bulk Transfer failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. HANDLE STANDARD TRANSACTIONS (IN / OUT / XFER)
    const itemId = parseNumber(txForm.itemId);
    const warehouseId = parseNumber(txForm.warehouseId);
    const quantity = parseNumber(txForm.quantity);
    const lotIdNumber = parseNumber(txForm.lotId);
    const destWhId = parseNumber(txForm.destWarehouseId);

    if (!itemId || !warehouseId || !quantity) {
      return showStatus('error', 'Please select item, warehouse, and quantity');
    }

    if (txMode === 'in' && selectedItem?.isLotTracked && !lotNumberValue) {
      return showStatus('error', 'Lot-tracked receipts require a lot number.');
    }

    setLoading(true);
    try {
      const numericQuantity = Number(quantity ?? 0);
      const selectedSerialArray = Array.from(selectedSerialIds);
      if (requiresSerialSelection) {
        if (!Number.isFinite(numericQuantity) || numericQuantity <= 0 || !Number.isInteger(numericQuantity)) {
          setLoading(false);
          return showStatus('error', 'Serial tracked transactions require a whole number quantity.');
        }
        if (selectedSerialArray.length !== numericQuantity) {
          setLoading(false);
          return showStatus('error', 'Select one serial number per unit before continuing.');
        }
      }

      if (isSerialTracked && txMode === 'in') {
        if (!Number.isFinite(numericQuantity) || numericQuantity <= 0 || !Number.isInteger(numericQuantity)) {
          setLoading(false);
          return showStatus('error', 'Serial tracked transactions require a whole number quantity.');
        }
        if (serialGenerationForm.generatedSerials.length !== numericQuantity) {
          setLoading(false);
          setShowSerialModal(true);
          return showStatus('warning', `Please assign/verify ${numericQuantity} serial numbers before executing the receipt.`);
        }
      }

      let endpoint = `/stock/${txMode}`;
      let payload = {
        itemId,
        warehouseId,
        quantity
      };

      // Add mode-specific payload data
      if (txMode === 'in') {
        payload.lotNumber = lotNumberValue || null;
        if (isSerialTracked) {
          payload.serialNumbers = serialGenerationForm.generatedSerials.map(s => s.serialNumber || s);
          payload.generateSerials = true;
        }
      } 
      else if (txMode === 'out') {
        if (!lotIdNumber) {
            setLoading(false);
            return showStatus('error', 'Source lot required for dispatch');
        }
        payload.lotId = lotIdNumber;
      } 
      else if (txMode === 'transfer') {
        if (!lotIdNumber || !destWhId) {
            setLoading(false);
            return showStatus('error', 'Lot and Destination Warehouse required');
        }
        payload.lotId = lotIdNumber;
        payload.toWarehouseId = destWhId;
      }

      if (requiresSerialSelection) {
        payload.serialIds = selectedSerialArray;
      }

      const response = await api.post(endpoint, payload);
      showStatus('success', response.data?.message || `Stock ${txMode.toUpperCase()} successful`);
      
      setTxForm({ itemId: '', warehouseId: '', destWarehouseId: '', quantity: '', lotNumber: '', lotId: '', prefix: '' });
      setSerialGenerationForm({ quantity: 0, prefix: '', generatedSerials: [] });
      setShowSerialModal(false);
      fetchData();
      setSelectedSerialIds(new Set());
      setAvailableSerials([]);
      setSerialError('');
      
    } catch (err) {
      showStatus('error', err.response?.data?.message || err.response?.data || `Transaction failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4><i className="bi bi-arrow-left-right me-2 text-primary"></i>Stock Operations</h4>
            <p className="text-muted mb-0">Execute inventory receipts, dispatches, transfers, and barcode scanning.</p>
          </div>
          <Button 
            onClick={fetchData} 
            disabled={loading} 
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-2 shadow-sm"
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-arrow-clockwise"></i>}
            Refresh API
          </Button>
        </div>

        {status.text && (
          <Alert variant={status.type === 'error' ? 'danger' : 'success'} dismissible onClose={() => setStatus({ type: '', text: '' })} className="shadow-sm">
            <span className="fw-semibold">{status.text}</span>
          </Alert>
        )}

        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => {
            setActiveTab(k);
            setTxForm({ itemId: '', warehouseId: '', destWarehouseId: '', quantity: '', lotNumber: '', lotId: '', prefix: '' });
          }} 
          className="mb-4"
        >
          {/* STOCK OPS TAB */}
          <Tab eventKey="stock" title={<span><i className="bi bi-box-seam me-2"></i>Stock Protocol</span>}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-0 pt-4 pb-0">
                <h6 className="fw-bold">Inventory Movement Protocol</h6>
              </Card.Header>
              <Card.Body className="p-4">
                
                {/* MODE SELECTOR */}
              <div className="d-flex gap-2 w-100 mb-4 flex-wrap" role="group">
                <button type="button" className={`btn erp-btn flex-grow-1 ${txMode === 'in' ? 'btn-success fw-bold' : 'btn-light border'}`} onClick={() => { setTxMode('in'); setTxForm(p => ({...p, lotId: '', destWarehouseId: ''})); }}>📥 IN</button>
                <button type="button" className={`btn erp-btn flex-grow-1 ${txMode === 'out' ? 'btn-danger fw-bold' : 'btn-light border'}`} onClick={() => { setTxMode('out'); setTxForm(p => ({...p, lotNumber: '', destWarehouseId: ''})); }}>📤 OUT</button>
                <button type="button" className={`btn erp-btn flex-grow-1 ${txMode === 'transfer' ? 'btn-warning fw-bold text-dark' : 'btn-light border'}`} onClick={() => { setTxMode('transfer'); setTxForm(p => ({...p, lotNumber: ''})); }}>🔁 XFER</button>
                <button type="button" className={`btn erp-btn flex-grow-1 ${txMode === 'bulk' ? 'btn-info fw-bold text-dark' : 'btn-light border'}`} onClick={() => { setTxMode('bulk'); setTxForm(p => ({...p, itemId: '', quantity: '', lotNumber: '', lotId: ''})); }}>🔄 BULK</button>
              </div>

              <div className="erp-instruction-box mb-4" style={{
                backgroundColor: txMode === 'in' ? '#f0fdf4' : txMode === 'out' ? '#fef2f2' : txMode === 'bulk' ? '#ecfeff' : '#fffbeb',
                borderLeft: `4px solid ${txMode === 'in' ? '#22c55e' : txMode === 'out' ? '#ef4444' : txMode === 'bulk' ? '#0ea5e9' : '#f59e0b'}`
              }}>
                <span className="fw-semibold small text-uppercase" style={{color: '#475569'}}>
                  {txMode === 'in' ? 'Add stock & generate serials' : txMode === 'out' ? 'Dispatch stock & select serials' : txMode === 'bulk' ? 'Move all stock from one location to another' : 'Transfer specific stock & serials between warehouses'}
                </span>
              </div>

              {/* FORM GRID */}
              <form onSubmit={(e) => e.preventDefault()}>
                
                {/* ALWAYS ENABLED: Master Item ID & Source Warehouse */}
                {txMode !== 'bulk' && (
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="erp-label">Master Item ID <span className="text-danger">*</span></label>
                      <select className="form-select erp-input fw-bold text-primary font-monospace" value={txForm.itemId} onChange={(e) => setTxForm({ ...txForm, itemId: e.target.value })}>
                        <option value="">-- Select Product --</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>{item.itemCode}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="erp-label">Active Warehouse <span className="text-danger">*</span></label>
                      <select className="form-select erp-input fw-bold text-dark" value={txForm.warehouseId} onChange={(e) => setTxForm({ ...txForm, warehouseId: e.target.value })}>
                        <option value="">-- Select Location --</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* BULK MODE: Dual Warehouse Selection */}
                {txMode === 'bulk' && (
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="erp-label">Move FROM <span className="text-danger">*</span></label>
                      <select className="form-select erp-input fw-bold text-dark" value={txForm.warehouseId} onChange={(e) => setTxForm({ ...txForm, warehouseId: e.target.value })}>
                        <option value="">-- Source --</option>
                        {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="erp-label text-warning">Move TO <span className="text-danger">*</span></label>
                      <select className="form-select erp-input fw-bold text-primary" value={txForm.destWarehouseId} onChange={(e) => setTxForm({ ...txForm, destWarehouseId: e.target.value })}>
                        <option value="">-- Target --</option>
                        {warehouses.filter(w => w.id !== parseInt(txForm.warehouseId)).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* DISABLED FIELDSET: Locks Quantity and Lot details until an item is selected */}
                <fieldset disabled={!txForm.itemId && txMode !== 'bulk'}>
                  
                  {/* REGULAR MODES: Quantity and Lots */}
                  {txMode !== 'bulk' && (
                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <label className="erp-label">Quantity <span className="text-danger">*</span></label>
                        <input type="number" className="form-control erp-input font-monospace text-end fw-bold" value={txForm.quantity} onChange={(e) => setTxForm({ ...txForm, quantity: e.target.value })} min="0" max="1000" placeholder="0" />
                      </div>

                      {txMode === 'in' ? (
                        <div className="col-md-8">
                          <label className="erp-label">
                            Assign Lot / Batch String
                            {requiresLotNumberForIn && (
                              <span className="text-danger small ms-2">Required</span>
                            )}
                          </label>
                          <input
                            type="text"
                            className="form-control erp-input font-monospace"
                            value={txForm.lotNumber}
                            onChange={(e) => setTxForm({ ...txForm, lotNumber: e.target.value })}
                            placeholder="Type custom lot (Optional)"
                            required={requiresLotNumberForIn}
                          />
                          {requiresLotNumberForIn && !lotNumberValue && (
                            <div className="text-danger small mt-1">
                              Custom lot batch is required for lot-tracked products.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="col-md-8">
                          <label className="erp-label">Select Source Lot <span className="text-danger">*</span></label>
                          <select
                            className="form-select erp-input font-monospace"
                            value={txForm.lotId}
                            onChange={(e) => {
                              const value = e.target.value;
                              const matchedLot = lotOptions.find((lot) => String(lot.lotId) === value);
                              setTxForm({
                                ...txForm,
                                lotId: value,
                                lotNumber: matchedLot?.lotNumber ?? ""
                              });
                            }}
                            disabled={lotsLoading}
                          >
                            <option value="">{lotsLoading ? 'Loading...' : '-- Choose Active Lot --'}</option>
                            {getAvailableLots().map((lot) => (
                              <option key={`${lot.lotId}-${lot.lotNumber}`} value={lot.lotId}>
                                {lot.lotNumber || 'UNASSIGNED'} (Avail: {lot.quantity})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transfer Specific Field */}
                  {txMode === 'transfer' && (
                    <div className="row g-3 mb-4 p-3 bg-light border rounded m-0">
                      <div className="col-md-12 p-0">
                        <label className="erp-label text-warning">Destination Warehouse <span className="text-danger">*</span></label>
                        <select className="form-select erp-input fw-bold text-primary" value={txForm.destWarehouseId} onChange={(e) => setTxForm({ ...txForm, destWarehouseId: e.target.value })}>
                          <option value="">-- Select Destination Bin --</option>
                          {warehouses.filter((w) => w.id !== parseInt(txForm.warehouseId, 10)).map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="d-flex flex-column gap-2 pt-3 border-top mt-2">
                    {txMode !== 'bulk' && (
                      <button type="button" onClick={openSerialGenerationModal} disabled={loading || !txForm.itemId || !txForm.warehouseId || !txForm.quantity} className="btn btn-outline-primary erp-btn w-100 fw-bold py-2 shadow-sm">
                        + ASSIGN SERIAL NUMBERS
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStockTransaction}
                      disabled={
                        loading ||
                        (txMode === 'bulk'
                          ? (!txForm.warehouseId || !txForm.destWarehouseId)
                          : (!txForm.itemId || !txForm.warehouseId || !txForm.quantity || (requiresLotNumberForIn && !lotNumberValue))
                        )
                      }
                      className={`btn erp-btn w-100 py-3 fw-bold fs-6 shadow-sm ${txMode === 'in' ? 'btn-success' : txMode === 'out' ? 'btn-danger' : txMode === 'bulk' ? 'btn-info text-dark' : 'btn-warning text-dark'}`}
                    >
                      {loading ? 'PROCESSING...' : txMode === 'in' ? 'EXECUTE RECEIPT' : txMode === 'out' ? 'EXECUTE DISPATCH' : txMode === 'bulk' ? 'EXECUTE BULK TRANSFER' : 'EXECUTE TRANSFER'}
                    </button>
                  </div>
                </fieldset>
              </form>

              {/* Dynamic Lot Summary specific to selected item/warehouse */}
              {selectedItemId && selectedWarehouseId && txMode !== 'bulk' && (
                <div className="mt-5 p-4 border rounded bg-light shadow-sm">
                  <h6 className="erp-section-title mb-3">Bin Location Lot Summary</h6>
                  {lotsLoading ? (
                    <div className="text-muted small">Synchronizing lot data...</div>
                  ) : lotOptions.length === 0 ? (
                    <div className="text-muted small">No active stock units registered for this product/warehouse sequence.</div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {lotOptions.map((lot) => {
                        const quantity = Number(lot.quantity) || 0;
                        const isAvailable = quantity > 0;
                        return (
                          <div key={`${lot.lotId ?? 'lot'}-${lot.lotNumber || 'unknown'}`} className="erp-lot-row">
                            <div>
                              <div className="fw-bold font-monospace text-dark">{lot.lotNumber || 'UNASSIGNED'}</div>
                              <div className="erp-text-muted small" style={{ color: isAvailable ? '#15803d' : '#b91c1c' }}>
                                {isAvailable ? 'Ready for distribution' : 'Depleted Lot'}
                              </div>
                            </div>
                            <div className={`fw-bold fs-5 font-monospace ${isAvailable ? 'text-dark' : 'text-danger'}`}>
                              {quantity}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {requiresSerialSelection && (
                <div className="mt-4 p-4 border rounded bg-white shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                    <div className="me-3">
                      <div className="fw-bold">Serial Selection</div>
                      <div className="text-muted small">
                        Scan or choose serials before executing the {txMode.toUpperCase()} transaction.
                      </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={fetchSerialsForLot}
                        disabled={serialLoading}
                      >
                        {serialLoading ? <span className="spinner-border spinner-border-sm" /> : 'Refresh'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={autoSelectSerials}
                        disabled={
                          serialLoading ||
                          desiredSerialQty <= 0 ||
                          availableSerialsForAuto.length < desiredSerialQty
                        }
                        title="Auto-select the first available serial numbers for the requested quantity"
                      >
                        Auto-select {desiredSerialQty > 0 ? desiredSerialQty : 'serials'}
                      </button>
                      <span className="badge bg-info text-dark">
                        {selectedSerialIds.size}/{desiredSerialQty || 0}
                      </span>
                    </div>
                  </div>
                  {serialError && <div className="text-danger small mb-2">{serialError}</div>}
                  {serialLoading ? (
                    <div className="text-center text-muted py-3">Loading serial numbers...</div>
                  ) : availableSerials.length === 0 ? (
                    <div className="text-muted small py-3">No serial numbers found for the selected lot.</div>
                  ) : (
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                      {availableSerials.map((serial) => (
                        <label key={serial.id} className="d-flex align-items-start gap-2 serial-entry">
                          <input
                            type="checkbox"
                            disabled={serial.status !== 'AVAILABLE'}
                            checked={selectedSerialIds.has(serial.id)}
                            onChange={() => toggleSerialSelection(serial.id)}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-bold text-dark">{serial.serialNumber}</div>
                            <div className="text-muted small">
                              {serial.status}
                              {serial.purchaseOrderNumber && (
                                <span className="d-block">PO: {serial.purchaseOrderNumber}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-muted small">{serial.createdDate}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              )}
              </Card.Body>
            </Card>
          </Tab>

          {/* SCANNER TAB */}
          <Tab eventKey="scanner" title={<span><i className="bi bi-upc-scan me-2"></i>Barcode Scanner</span>}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-dark text-white border-0 pt-3 pb-3">
                <span className="fw-bold">Barcode Scanner Interface</span>
              </Card.Header>
              <Card.Body className="p-0 bg-black">
                <MobileScanner
                  items={items}
                  warehouses={warehouses}
                  inventory={inventory}
                  fetchData={fetchData}
                  onScanDetected={handleScannerPopulate}
                />
              </Card.Body>
              <Card.Footer className="bg-light border-top text-muted small">
                <i className="bi bi-info-square-fill text-primary me-2"></i>
                The scanner feed stays live here. Once a product is detected, switch to the <strong>STOCK</strong> tab to apply quantities and execute movements.
              </Card.Footer>
            </Card>
          </Tab>
        </Tabs>

      {/* SERIAL GENERATION MODAL */}
      <Modal show={showSerialModal} onHide={() => setShowSerialModal(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fs-6 fw-bold">Serial Number Allocation / Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white border rounded shadow-sm">
            <div>
              <div className="text-muted small fw-bold text-uppercase mb-1">Target Qty</div>
              <span className="fs-5 fw-bold font-monospace text-primary">{serialGenerationForm.quantity}</span>
            </div>
            <Button variant="outline-primary" size="sm" className="fw-bold shadow-sm" onClick={generateSerialNumbers}>
              <i className="bi bi-plus-circle me-1"></i> Generate Sequence
            </Button>
          </div>

          {serialGenerationForm.generatedSerials.length > 0 ? (
            <div className="border rounded shadow-sm bg-white" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <Table size="sm" striped hover className="m-0 font-monospace" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light sticky-top">
                  <tr>
                    <th className="ps-3 text-uppercase text-muted">S/N</th>
                    <th className="text-uppercase text-muted">Generated Identifier</th>
                  </tr>
                </thead>
                <tbody>
                  {serialGenerationForm.generatedSerials.map((s, i) => (
                    <tr key={i}>
                      <td className="ps-3 text-muted">{i + 1}</td>
                      <td className="fw-bold">{s.serialNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted small border rounded bg-white shadow-sm">
              <i className="bi bi-list-ol fs-3 d-block mb-2 text-secondary"></i>
              Click generate to assign unique serials for this transaction.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-white border-top">
          <Button variant="light" className="border shadow-sm" onClick={() => setShowSerialModal(false)}>Cancel</Button>
          <Button 
            variant="primary" 
            className="px-4 shadow-sm fw-bold" 
            onClick={() => {
              setShowSerialModal(false);
              handleStockTransaction(); 
            }}
            disabled={serialGenerationForm.generatedSerials.length === 0 || loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-circle me-2"></i>}
            {loading ? 'Saving...' : 'Commit & Execute TX'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Removed custom ERP styles to match WMS aesthetics */}
    </div>
  );
}
