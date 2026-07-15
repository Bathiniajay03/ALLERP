import React, { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { toast } from 'react-hot-toast';
import { Container, Row, Col, Card, Table, Button, Form, Badge } from 'react-bootstrap';

export default function WmsPutAwayWorkflow() {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPutAway, setSelectedPutAway] = useState(null);
  const [binBarcode, setBinBarcode] = useState('');
  const [recommendedBin, setRecommendedBin] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      // warehouseId=1 as default for now
      const res = await api.get('/wms-upgrade/putaway/pending?warehouseId=1');
      setPendingItems(res.data);
    } catch (err) {
      toast.error('Failed to fetch pending put-aways');
    } finally {
      setLoading(false);
    }
  };

  const selectItem = async (item) => {
    setSelectedPutAway(item);
    setBinBarcode('');
    try {
      // Fetch recommendation
      const res = await api.get(`/wms-upgrade/putaway/recommend?itemId=${item.itemId}&warehouseId=1`);
      setRecommendedBin(res.data);
    } catch (err) {
      setRecommendedBin(null);
    }
  };

  const handleConfirm = async () => {
    if (!binBarcode && !recommendedBin) {
      toast.error('Please scan a bin or use the recommended bin');
      return;
    }

    try {
      // In a real scenario, scanning binBarcode would resolve to binId.
      // For simplicity, if binBarcode matches recommended bin's barcode, we use it.
      let finalBinId = recommendedBin?.id;

      // If user scanned a manual barcode, we must resolve it to an actual Bin ID!
      if (binBarcode) {
        try {
          const res = await api.get(`/barcode/scan/${encodeURIComponent(binBarcode)}`);
          const scanResult = res.data?.data;
          if (scanResult?.type?.toLowerCase() === 'bin') {
             finalBinId = scanResult.data.id;
          } else {
             toast.error('Scanned barcode is not a valid Bin.');
             return;
          }
        } catch (err) {
          toast.error('Failed to resolve scanned bin barcode.');
          return;
        }
      }

      if (!finalBinId) {
         toast.error('No bin recommended and no valid bin scanned.');
         return;
      }

      const res = await api.post('/wms-upgrade/putaway/confirm', {
        putAwayId: selectedPutAway.id,
        destinationBinId: finalBinId
      });

      toast.success(res.data.message);
      setSelectedPutAway(null);
      setRecommendedBin(null);
      setBinBarcode('');
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Confirmation failed');
    }
  };

  return (
    <Container fluid className="erp-panel p-4">
      <h3 className="mb-4">Put Away Workflow</h3>
      <Row>
        <Col md={7}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Pending Tasks</h5>
            </Card.Header>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Source</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="5" className="text-center">Loading...</td></tr>}
                {!loading && pendingItems.length === 0 && <tr><td colSpan="5" className="text-center">No pending items.</td></tr>}
                {pendingItems.map(item => (
                  <tr key={item.id} className={selectedPutAway?.id === item.id ? 'table-primary' : ''}>
                    <td>{item.itemCode}</td>
                    <td>{item.itemDescription}</td>
                    <td><Badge bg="info">{item.quantity}</Badge></td>
                    <td>{item.sourceDocument}</td>
                    <td>
                      <Button size="sm" variant="outline-primary" onClick={() => selectItem(item)}>
                        Process
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={5}>
          {selectedPutAway ? (
            <Card className="shadow-sm border-0 border-top border-primary border-3">
              <Card.Body>
                <h5>Process: {selectedPutAway.itemCode}</h5>
                <p className="text-muted mb-4">{selectedPutAway.itemDescription} - Qty: {selectedPutAway.quantity}</p>

                {recommendedBin ? (
                  <div className="alert alert-success mb-4">
                    <strong>⭐ Recommended Bin:</strong> <br />
                    Code: {recommendedBin.code} <br />
                    Barcode: {recommendedBin.barcode} <br />
                    <small>Reason: Available Space / FIFO Compatible</small>
                  </div>
                ) : (
                  <div className="alert alert-warning">No active/empty bins found.</div>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Scan Bin Barcode</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Scan bin..."
                    autoFocus
                    value={binBarcode}
                    onChange={(e) => setBinBarcode(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Scanner support enabled. Scanning will auto-select.
                  </Form.Text>
                </Form.Group>

                <Button variant="primary" className="w-100" onClick={handleConfirm}>
                  Confirm Put Away
                </Button>
                <Button variant="light" className="w-100 mt-2" onClick={() => setSelectedPutAway(null)}>
                  Cancel
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm border-0 bg-light text-center p-5">
              <p className="text-muted mb-0">Select an item from the pending list to process.</p>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
