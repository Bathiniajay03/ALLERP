import React, { useState } from 'react';
import { Container, Card, Nav, Table } from 'react-bootstrap';

export default function WmsReports() {
  const [activeTab, setActiveTab] = useState('inventory');
  // Dummy data or fetch logic for actual reports can be added here
  // For the sake of the upgrade, we keep it simple as requested

  return (
    <Container fluid className="erp-panel p-4">
      <h3 className="mb-4">WMS Reports</h3>
      
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white p-0 border-bottom">
          <Nav variant="tabs" defaultActiveKey="inventory" className="px-3 pt-3">
            <Nav.Item>
              <Nav.Link eventKey="inventory" onClick={() => setActiveTab('inventory')}>Bin Inventory</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="movements" onClick={() => setActiveTab('movements')}>Transfer Logs</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="putaway" onClick={() => setActiveTab('putaway')}>PutAway Logs</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body className="p-4" style={{ minHeight: '400px' }}>
          {activeTab === 'inventory' && (
            <div>
              <h5 className="mb-3">Bin Inventory Report</h5>
              <p className="text-muted mb-4">Use the <strong>Barcode Hub</strong> for detailed Bin-Level lookup.</p>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Warehouse</th>
                    <th>Bin Code</th>
                    <th>Item ID</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan="4" className="text-center text-muted">Use filter to load data.</td></tr>
                </tbody>
              </Table>
            </div>
          )}
          {activeTab === 'movements' && (
            <div>
              <h5 className="mb-3">Internal Bin Transfers</h5>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Item ID</th>
                    <th>Source Bin</th>
                    <th>Destination Bin</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan="5" className="text-center text-muted">Use filter to load data.</td></tr>
                </tbody>
              </Table>
            </div>
          )}
          {activeTab === 'putaway' && (
            <div>
              <h5 className="mb-3">Completed Put Aways</h5>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Item ID</th>
                    <th>Destination Bin</th>
                    <th>Qty</th>
                    <th>Source Doc</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan="5" className="text-center text-muted">Use filter to load data.</td></tr>
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
