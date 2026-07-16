import React, { useState, useEffect } from 'react';
import { Container, Card, Nav, Table, Form, Row, Col, Spinner } from 'react-bootstrap';
import apiClient from '../services/apiClient';

export default function WmsReports() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReportData = async (tab) => {
    setLoading(true);
    try {
      let endpoint = '';
      if (tab === 'inventory') endpoint = '/wms-upgrade/reports/bin-inventory';
      else if (tab === 'movements') endpoint = '/wms-upgrade/reports/movements';
      else if (tab === 'putaway') endpoint = '/wms-upgrade/reports/putaway';

      const response = await apiClient.get(endpoint);
      setData(response.data || []);
    } catch (error) {
      console.error('Failed to load report data', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(activeTab);
    setSearchQuery('');
  }, [activeTab]);

  const filteredData = data.filter(item => {
    const query = searchQuery.toLowerCase();
    const itemCodeMatch = item.itemCode?.toLowerCase().includes(query);
    const binMatch = (item.binCode || item.sourceBinCode || item.destinationBinCode)?.toLowerCase().includes(query);
    const whMatch = item.warehouseName?.toLowerCase().includes(query);
    return itemCodeMatch || binMatch || whMatch;
  });

  return (
    <Container fluid className="erp-panel p-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1 text-dark fw-bold">WMS Live Reports</h3>
          <p className="text-muted small mb-0">Monitor live bin-level stock balances, item location maps, movements, and put-away records.</p>
        </div>
        <span className="badge bg-primary px-3 py-2 fs-7 shadow-sm">Real-time WMS Sync</span>
      </div>

      <Card className="shadow-sm border-0 mb-4 rounded-3 overflow-hidden">
        <Card.Header className="bg-white border-bottom p-0">
          <Nav variant="tabs" activeKey={activeTab} className="px-3 pt-3">
            <Nav.Item>
              <Nav.Link 
                eventKey="inventory" 
                onClick={() => setActiveTab('inventory')}
                className={`fw-semibold px-4 pb-3 ${activeTab === 'inventory' ? 'border-primary border-bottom-3 text-primary' : 'text-muted'}`}
              >
                Bin Inventory
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="movements" 
                onClick={() => setActiveTab('movements')}
                className={`fw-semibold px-4 pb-3 ${activeTab === 'movements' ? 'border-primary border-bottom-3 text-primary' : 'text-muted'}`}
              >
                Transfer Logs
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="putaway" 
                onClick={() => setActiveTab('putaway')}
                className={`fw-semibold px-4 pb-3 ${activeTab === 'putaway' ? 'border-primary border-bottom-3 text-primary' : 'text-muted'}`}
              >
                PutAway Logs
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-4" style={{ minHeight: '400px' }}>
          <Row className="mb-4 align-items-center">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search by Item Code, Bin or Warehouse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-sm rounded-pill px-4 py-2 border-light-subtle"
                style={{ fontSize: '0.9rem' }}
              />
            </Col>
            <Col className="text-end">
              <button 
                className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 shadow-sm"
                onClick={() => fetchReportData(activeTab)}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" className="me-1" /> : null}
                Refresh Report
              </button>
            </Col>
          </Row>

          {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '300px' }}>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <div className="text-muted small">Generating live WMS report...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-muted" style={{ height: '250px' }}>
              <i className="bi bi-inbox fs-1 mb-2"></i>
              <div>No records found matching search or filter criteria.</div>
            </div>
          ) : (
            <>
              {activeTab === 'inventory' && (
                <div>
                  <h5 className="mb-3 fw-bold text-secondary">Bin Inventory Status</h5>
                  <Table hover responsive className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Warehouse</th>
                        <th>Bin Code</th>
                        <th>Item Details</th>
                        <th>Location Coordinates</th>
                        <th className="text-end">Stock Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold text-dark">{row.warehouseName}</td>
                          <td><span className="badge bg-info text-dark font-monospace">{row.binCode}</span></td>
                          <td>
                            <div className="fw-bold font-monospace">{row.itemCode}</div>
                            <div className="text-muted small">{row.itemDescription}</div>
                          </td>
                          <td>
                            <div className="small text-muted">
                              <strong>Zone:</strong> {row.zoneName} | <strong>Aisle:</strong> {row.aisleCode} | <strong>Rack:</strong> {row.rackCode} | <strong>Shelf:</strong> {row.shelfCode}
                            </div>
                          </td>
                          <td className="text-end fw-bold text-success font-monospace">{row.quantity} Units</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'movements' && (
                <div>
                  <h5 className="mb-3 fw-bold text-secondary">Bin-to-Bin Movements Log</h5>
                  <Table hover responsive className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Date & Time</th>
                        <th>Item Details</th>
                        <th>Source Bin</th>
                        <th>Destination Bin</th>
                        <th>Transferred Qty</th>
                        <th>Executed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="text-muted font-monospace">{row.date}</td>
                          <td className="fw-bold font-monospace text-dark">{row.itemCode}</td>
                          <td><span className="badge bg-secondary font-monospace">{row.sourceBinCode}</span></td>
                          <td><span className="badge bg-success font-monospace">{row.destinationBinCode}</span></td>
                          <td className="fw-bold text-primary font-monospace">{row.quantity}</td>
                          <td className="text-dark fw-semibold">{row.operatorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'putaway' && (
                <div>
                  <h5 className="mb-3 fw-bold text-secondary">Completed Put-Aways Report</h5>
                  <Table hover responsive className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Completion Date</th>
                        <th>Item Details</th>
                        <th>Destination Bin</th>
                        <th>Put Away Qty</th>
                        <th>Source Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="text-muted font-monospace">{row.date}</td>
                          <td className="fw-bold font-monospace text-dark">{row.itemCode}</td>
                          <td><span className="badge bg-success font-monospace">{row.destinationBinCode}</span></td>
                          <td className="fw-bold text-success font-monospace">{row.quantity}</td>
                          <td className="text-dark font-monospace">{row.sourceDoc || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
