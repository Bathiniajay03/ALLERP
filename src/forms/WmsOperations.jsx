import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Modal, Badge, Tabs, Tab, Alert } from 'react-bootstrap';
import { smartErpApi } from '../services/smartErpApi';

export default function WmsOperations() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const [pickLists, setPickLists] = useState([]);

  // Put-Away state
  const [putAwayItem, setPutAwayItem] = useState('');
  const [putAwayQty, setPutAwayQty] = useState('');
  const [putAwayBin, setPutAwayBin] = useState('');
  const [putAwayLot, setPutAwayLot] = useState('');

  // Dropdown data
  const [items, setItems] = useState([]);
  const [lots, setLots] = useState([]);
  const [bins, setBins] = useState([]);


  // Pick List Generate State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateSO, setGenerateSO] = useState('');
  const [generateStrategy, setGenerateStrategy] = useState('FIFO');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWarehouses();
    loadItems();
    loadLots();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      loadPickLists();
      loadBins();
    }
  }, [selectedWarehouseId]);

  const loadItems = async () => {
    try {
      const res = await smartErpApi.getItems(); // Assuming this exists or similar
      if (res.data) setItems(res.data);
    } catch (err) {
      // ignore
    }
  };

  const loadLots = async () => {
    try {
      const res = await smartErpApi.getLots(); // Assuming this exists
      if (res.data) setLots(res.data);
    } catch (err) {
      // ignore
    }
  };

  const loadBins = async () => {
    try {
      const res = await smartErpApi.getBins(selectedWarehouseId);
      if (res.data) setBins(res.data);
    } catch (err) {
      // ignore
    }
  };

  const loadWarehouses = async () => {
    try {
      const res = await smartErpApi.warehouses();
      setWarehouses(res.data);
      if (res.data.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPickLists = async () => {
    try {
      const res = await smartErpApi.getPickLists(selectedWarehouseId);
      setPickLists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePickList = async () => {
    if (!generateSO) return;
    setLoading(true);
    try {
      await smartErpApi.generatePickList({
        warehouseId: parseInt(selectedWarehouseId),
        salesOrderId: parseInt(generateSO),
        strategy: generateStrategy,
        pickingType: 'Single'
      });
      setShowGenerateModal(false);
      loadPickLists();
    } catch (err) {
      alert("Failed to generate pick list: " + err.response?.data || err.message);
    }
    setLoading(false);
  };

  const handleConfirmPick = async (itemId) => {
    try {
      await smartErpApi.confirmPick(itemId);
      loadPickLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePutAway = async () => {
    if (!putAwayItem || !putAwayQty || !putAwayBin) return;
    setLoading(true);
    try {
      await smartErpApi.putAway({
        warehouseId: parseInt(selectedWarehouseId),
        itemId: parseInt(putAwayItem),
        targetBinId: parseInt(putAwayBin),
        quantity: parseFloat(putAwayQty),
        lotId: putAwayLot ? parseInt(putAwayLot) : null
      });
      alert("Put away successful!");
      setPutAwayItem('');
      setPutAwayQty('');
      setPutAwayBin('');
      setPutAwayLot('');
    } catch (err) {
      alert("Failed to put away: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="bi bi-box-seam me-2 text-primary"></i>WMS Operations</h4>
        <Form.Select style={{ width: '300px' }} value={selectedWarehouseId} onChange={(e) => setSelectedWarehouseId(e.target.value)}>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
        </Form.Select>
      </div>

      <Tabs defaultActiveKey="picking" className="mb-4 shadow-sm border-0 bg-white p-2 rounded" fill>

        {/* PICKING TAB */}
        <Tab eventKey="picking" title={<span><i className="bi bi-cart-check me-2"></i>Picking</span>}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Active Pick Lists</h6>
              <Button variant="primary" size="sm" onClick={() => setShowGenerateModal(true)}>
                <i className="bi bi-plus-circle me-1"></i> Generate Pick List
              </Button>
            </Card.Header>
            <Card.Body>
              {pickLists.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                  <p>No active pick lists for this warehouse.</p>
                </div>
              ) : (
                <div className="accordion" id="pickListAccordion">
                  {pickLists.map((pl, idx) => (
                    <div className="accordion-item border-0 mb-3 shadow-sm rounded overflow-hidden" key={pl.id}>
                      <h2 className="accordion-header">
                        <button className={`accordion-button ${idx !== 0 ? 'collapsed' : ''}`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${pl.id}`}>
                          <div className="d-flex justify-content-between w-100 pe-3">
                            <span className="fw-bold text-primary">{pl.pickListNumber}</span>
                            <Badge bg={pl.status === 'Completed' ? 'success' : pl.status === 'InProgress' ? 'warning' : 'secondary'}>{pl.status}</Badge>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapse${pl.id}`} className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`} data-bs-parent="#pickListAccordion">
                        <div className="accordion-body bg-light">
                          <Table size="sm" bordered hover className="mb-0 bg-white">
                            <thead className="table-light">
                              <tr>
                                <th>Item ID</th>
                                <th>Source Bin</th>
                                <th>Qty Required</th>
                                <th>Qty Picked</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pl.items?.map(item => (
                                <tr key={item.id}>
                                  <td>Item #{item.itemId}</td>
                                  <td><strong className="text-dark">{item.sourceBin?.code}</strong></td>
                                  <td>{item.quantityToPick}</td>
                                  <td>{item.quantityPicked}</td>
                                  <td>
                                    {item.status === 'Picked' ? <Badge bg="success">Picked</Badge> : <Badge bg="warning text-dark">Pending</Badge>}
                                  </td>
                                  <td>
                                    {item.status !== 'Picked' && (
                                      <Button variant="outline-success" size="sm" onClick={() => handleConfirmPick(item.id)}>Confirm Pick</Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* PUT AWAY TAB */}
        <Tab eventKey="putaway" title={<span><i className="bi bi-box-arrow-in-down me-2"></i>Put Away</span>}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold">Manual Put Away</h6>
              <p className="text-muted small">Move incoming stock into WMS assigned Bins.</p>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Item</Form.Label>
                    <Form.Select value={putAwayItem} onChange={e => setPutAwayItem(e.target.value)}>
                      <option value="">Select Item...</option>
                      {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control type="number" value={putAwayQty} onChange={e => setPutAwayQty(e.target.value)} placeholder="0.00" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Bin</Form.Label>
                    <Form.Select value={putAwayBin} onChange={e => setPutAwayBin(e.target.value)}>
                      <option value="">Select Bin...</option>
                      {bins.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lot (Optional)</Form.Label>
                    <Form.Select value={putAwayLot} onChange={e => setPutAwayLot(e.target.value)}>
                      <option value="">No Lot</option>
                      {lots.map(l => <option key={l.id} value={l.id}>{l.lotNumber}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="primary" className="w-100 mb-3" onClick={handlePutAway} disabled={loading}>
                    <i className="bi bi-box-arrow-in-down me-2"></i>Put Away
                  </Button>
                </Col>
              </Row>
              <Alert variant="info" className="mt-3">
                <i className="bi bi-info-circle me-2"></i> In a full implementation, Put Away is usually driven by Purchase Order receipts and system-suggested Put Away Rules. This manual entry is for direct stocking and system verification.
              </Alert>
            </Card.Body>
          </Card>
        </Tab>

      </Tabs>

      {/* MODALS */}
      <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)}>
        <Modal.Header closeButton><Modal.Title>Generate Pick List</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Sales Order ID</Form.Label>
            <Form.Control value={generateSO} onChange={e => setGenerateSO(e.target.value)} placeholder="Enter Sales Order ID" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Strategy</Form.Label>
            <Form.Select value={generateStrategy} onChange={e => setGenerateStrategy(e.target.value)}>
              <option value="FIFO">FIFO (First In, First Out)</option>
              <option value="FEFO">FEFO (First Expired, First Out)</option>
            </Form.Select>
          </Form.Group>
          <Alert variant="light" className="small border">
            The system will scan Bins in this Warehouse and automatically allocate stock based on the strategy.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleGeneratePickList} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Algorithm'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
