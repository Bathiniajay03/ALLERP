import React, { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { toast } from 'react-hot-toast';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Suppress Recharts warning about defaultProps in React 18+
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('defaultProps')) return;
  originalConsoleError(...args);
};

export default function WmsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wms-upgrade/dashboard');
      setMetrics(res.data);
    } catch (err) {
      toast.error('Failed to load WMS dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-5">Loading Dashboard...</div>;
  if (!metrics) return null;

  return (
    <Container fluid className="erp-panel p-4">
      <h3 className="mb-4">WMS Dashboard ⭐⭐⭐⭐⭐</h3>
      
      <Row className="mb-4">
        <Col md={3} xs={6} className="mb-3">
          <Card className="shadow-sm text-center border-0 h-100">
            <Card.Body>
              <h6 className="text-muted">Today's Receipts</h6>
              <h2 className="text-success">{metrics.receipts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} xs={6} className="mb-3">
          <Card className="shadow-sm text-center border-0 h-100">
            <Card.Body>
              <h6 className="text-muted">Today's Dispatches</h6>
              <h2 className="text-danger">{metrics.dispatches}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} xs={6} className="mb-3">
          <Card className="shadow-sm text-center border-0 h-100">
            <Card.Body>
              <h6 className="text-muted">Pending PutAways</h6>
              <h2 className="text-warning">{metrics.pendingTasks}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} xs={6} className="mb-3">
          <Card className="shadow-sm text-center border-0 h-100">
            <Card.Body>
              <h6 className="text-muted">Total Serials</h6>
              <h2 className="text-primary">{metrics.totalSerials}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-4">Top 10 Bin Occupancy %</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.binOccupancy} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="code" />
                    <YAxis tickFormatter={(val) => `${val}%`} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="percentage" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
