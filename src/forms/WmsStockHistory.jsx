import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Container, Card, Form, Button } from 'react-bootstrap';

export default function WmsStockHistory() {
  const [itemId, setItemId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (e) => {
    if (e) e.preventDefault();
    if (!itemId) return;

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5157/api/wms-upgrade/stock-history?itemId=${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('erp_token')}` }
      });
      setHistory(res.data);
    } catch (err) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="erp-panel p-4">
      <h3 className="mb-4">Stock Movement History</h3>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form onSubmit={fetchHistory} className="d-flex gap-2">
            <Form.Control
              type="number"
              placeholder="Enter Item ID..."
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search Timeline'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {history.length > 0 && (
        <Card className="shadow-sm border-0 bg-light p-4">
          <h5 className="mb-4">Complete Journey Timeline</h5>
          <div className="timeline-container" style={{ position: 'relative', borderLeft: '3px solid #4F46E5', marginLeft: '20px' }}>
            {history.map((tx, index) => (
              <div key={tx.id} style={{ position: 'relative', marginBottom: '20px', paddingLeft: '20px' }}>
                <div style={{
                  position: 'absolute',
                  left: '-11px',
                  top: '0',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: tx.transactionType === 'IN' || tx.transactionType === 'PUTAWAY' ? '#10B981' :
                    tx.transactionType === 'TRANSFER' ? '#F59E0B' : '#EF4444',
                  border: '3px solid white',
                  boxShadow: '0 0 0 2px #4F46E5'
                }}></div>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="py-2 px-3">
                    <div className="d-flex justify-content-between">
                      <strong className="text-primary">{tx.transactionType}</strong>
                      <small className="text-muted">{tx.date}</small>
                    </div>
                    <div className="mt-2 text-muted">
                      Qty: <strong>{tx.quantity}</strong> |
                      Warehouse: {tx.warehouseId || 'N/A'} |
                      Lot: {tx.lotId || 'N/A'}
                    </div>
                    {(tx.sourceBinId || tx.destinationBinId) && (
                      <div className="mt-1 small">
                        {tx.sourceBinId && <span className="text-danger me-2">From Bin: {tx.sourceBinId}</span>}
                        {tx.destinationBinId && <span className="text-success">To Bin: {tx.destinationBinId}</span>}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </Card>
      )}
      {!loading && history.length === 0 && itemId && (
        <div className="text-muted text-center mt-5">No history found for this item.</div>
      )}
    </Container>
  );
}
