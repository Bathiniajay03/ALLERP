import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { smartErpApi } from '../services/smartErpApi';

export default function WmsDashboard() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [heatmapData, setHeatmapData] = useState([]);
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      loadHeatmap();
      loadStock();
    }
  }, [selectedWarehouseId]);

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

  const loadHeatmap = async () => {
    try {
      const res = await smartErpApi.getHeatmap(selectedWarehouseId);
      setHeatmapData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStock = async () => {
    try {
      const res = await smartErpApi.getWmsStock(selectedWarehouseId);
      setStockData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Group by Z-level (floor)
  const zLevels = [...new Set(heatmapData.map(d => d.gridZ))].sort((a, b) => a - b);

  const getCellColor = (bin) => {
    if (!bin.capacityMaxWeight || bin.capacityMaxWeight === 0) return '#10b981'; // Green if no limit
    const ratio = bin.totalQuantity / bin.capacityMaxWeight;
    if (ratio >= 0.9) return '#ef4444'; // Red
    if (ratio >= 0.6) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4><i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>Warehouse Heat Map</h4>
          <p className="text-muted mb-0">Visual capacity and stock density representation.</p>
        </div>
        <Form.Select style={{ width: '300px' }} value={selectedWarehouseId} onChange={(e) => setSelectedWarehouseId(e.target.value)}>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
        </Form.Select>
      </div>

      <div className="d-flex gap-3 mb-4">
        <div className="d-flex align-items-center"><div style={{ width: 16, height: 16, background: '#10b981', marginRight: 8, borderRadius: 3 }}></div> Under 60% Capacity</div>
        <div className="d-flex align-items-center"><div style={{ width: 16, height: 16, background: '#f59e0b', marginRight: 8, borderRadius: 3 }}></div> 60% - 90% Capacity</div>
        <div className="d-flex align-items-center"><div style={{ width: 16, height: 16, background: '#ef4444', marginRight: 8, borderRadius: 3 }}></div> Over 90% Capacity</div>
      </div>

      {zLevels.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm"><Card.Body className="text-muted">No coordinate mapped bins found in this warehouse.</Card.Body></Card>
      ) : (
        zLevels.map(z => {
          const binsInLevel = heatmapData.filter(d => d.gridZ === z);
          const maxX = Math.max(...binsInLevel.map(d => d.gridX)) || 10;
          const maxY = Math.max(...binsInLevel.map(d => d.gridY)) || 10;
          const isLargeGrid = (maxX * maxY) > 600;

          // Pre-index bins by coordinate for O(1) lookups
          const binMap = {};
          binsInLevel.forEach(b => {
            binMap[`${b.gridX}-${b.gridY}`] = b;
          });

          return (
            <Card key={z} className="shadow-sm border-0 mb-4 overflow-hidden">
              <Card.Header className="bg-white border-0 pt-3 pb-0">
                <h6 className="fw-bold">Level {z}</h6>
              </Card.Header>
              <Card.Body>
                {isLargeGrid ? (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px'
                  }}>
                    {binsInLevel.map(bin => (
                      <div key={bin.binId}
                        style={{
                          padding: '8px 16px',
                          background: getCellColor(bin),
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          color: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: 0.9
                        }}
                        title={`Bin: ${bin.code}\nZone: ${bin.zoneCode}\nQty: ${bin.totalQuantity}\nMax: ${bin.capacityMaxWeight}`}
                        onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = 0.9; }}>
                        {bin.code}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${maxX + 1}, minmax(40px, 1fr))`,
                    gap: '4px',
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    overflowX: 'auto'
                  }}>
                    {Array.from({ length: maxY + 1 }).map((_, y) => (
                      Array.from({ length: maxX + 1 }).map((_, x) => {
                        const bin = binMap[`${x}-${y}`];
                        return (
                          <div key={`${x}-${y}`}
                            style={{
                              aspectRatio: '1',
                              background: bin ? getCellColor(bin) : 'transparent',
                              border: bin ? '1px solid rgba(0,0,0,0.1)' : '1px dashed #e2e8f0',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                              color: bin ? '#fff' : 'transparent',
                              cursor: bin ? 'pointer' : 'default',
                              transition: 'all 0.2s',
                              opacity: bin ? 0.9 : 0.5
                            }}
                            title={bin ? `Bin: ${bin.code}\nZone: ${bin.zoneCode}\nQty: ${bin.totalQuantity}\nMax: ${bin.capacityMaxWeight}` : ''}
                            onMouseEnter={e => { if (bin) e.currentTarget.style.opacity = 1; }}
                            onMouseLeave={e => { if (bin) e.currentTarget.style.opacity = 0.9; }}>
                            {bin ? bin.code : ''}
                          </div>
                        )
                      })
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          )
        })
      )}

      {/* STOCK VIEW */}
      <Card className="shadow-sm border-0 mt-5 mb-4">
        <Card.Header className="bg-white border-0 pt-4 pb-0">
          <h6 className="fw-bold"><i className="bi bi-box-seam me-2 text-primary"></i>Current WMS Stock Inventory</h6>
          <p className="text-muted small">Detailed view of stock levels across all zones and bins.</p>
        </Card.Header>
        <Card.Body>
          <Table responsive hover size="sm" className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Lot / Serial</th>
                <th>Location</th>
                <th className="text-end">Quantity</th>
                <th className="text-end">Reserved</th>
                <th className="text-end">Available</th>
              </tr>
            </thead>
            <tbody>
              {stockData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No stock found in this warehouse.</td>
                </tr>
              ) : (
                stockData.map(s => (
                  <tr key={s.id}>
                    <td className="fw-bold">{s.itemCode}</td>
                    <td>{s.itemName}</td>
                    <td>
                      <div>{s.lotNumber ? <Badge bg="info" text="dark" className="me-1 mb-1">{s.lotNumber}</Badge> : null}</div>
                      <div>
                        {s.serials && s.serials.length > 0 ? (
                          s.serials.slice(0, 3).map((sn, i) => (
                            <Badge key={i} bg="secondary" className="me-1 mb-1 font-monospace">{sn}</Badge>
                          ))
                        ) : (
                          !s.lotNumber && <span className="text-muted small">N/A</span>
                        )}
                        {s.serials && s.serials.length > 3 && (
                          <Badge bg="secondary" className="me-1 mb-1 font-monospace">+{s.serials.length - 3} more</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <span className="text-muted">Zone:</span> <strong>{s.zoneCode || '-'}</strong>{' '}
                        <span className="text-muted">Bin:</span> <strong>{s.binCode || '-'}</strong>
                      </div>
                    </td>
                    <td className="text-end">{s.quantity}</td>
                    <td className="text-end">{s.reserved}</td>
                    <td className="text-end fw-bold text-success">
                      {s.quantity - s.reserved}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
