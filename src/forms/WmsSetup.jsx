// import React, { useState, useEffect } from 'react';
// import { Card, Form, Button, Row, Col, Table, Modal, Badge } from 'react-bootstrap';
// import { smartErpApi } from '../services/smartErpApi';

// export default function WmsSetup() {
//   const [warehouses, setWarehouses] = useState([]);
//   const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
//   const [topology, setTopology] = useState([]);
  
//   const [showZoneModal, setShowZoneModal] = useState(false);
//   const [showAisleModal, setShowAisleModal] = useState(false);
//   const [showRackModal, setShowRackModal] = useState(false);
//   const [showShelfModal, setShowShelfModal] = useState(false);
//   const [showBinModal, setShowBinModal] = useState(false);
  
//   const [currentEntity, setCurrentEntity] = useState({});

//   useEffect(() => {
//     loadWarehouses();
//   }, []);

//   useEffect(() => {
//     if (selectedWarehouseId) {
//       loadTopology();
//     }
//   }, [selectedWarehouseId]);

//   const loadWarehouses = async () => {
//     try {
//       const res = await smartErpApi.warehouses();
//       setWarehouses(res.data);
//       if (res.data.length > 0 && !selectedWarehouseId) {
//         setSelectedWarehouseId(res.data[0].id.toString());
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadTopology = async () => {
//     try {
//       const res = await smartErpApi.getTopology(selectedWarehouseId);
//       setTopology(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const saveZone = async () => {
//     await smartErpApi.createZone({ ...currentEntity, warehouseId: parseInt(selectedWarehouseId) });
//     setShowZoneModal(false);
//     loadTopology();
//   };

//   const saveAisle = async () => {
//     await smartErpApi.createAisle(currentEntity);
//     setShowAisleModal(false);
//     loadTopology();
//   };

//   const saveRack = async () => {
//     await smartErpApi.createRack(currentEntity);
//     setShowRackModal(false);
//     loadTopology();
//   };

//   const saveShelf = async () => {
//     await smartErpApi.createShelf(currentEntity);
//     setShowShelfModal(false);
//     loadTopology();
//   };

//   const saveBin = async () => {
//     await smartErpApi.createBin(currentEntity);
//     setShowBinModal(false);
//     loadTopology();
//   };

//   return (
//     <div className="container-fluid py-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h4><i className="bi bi-diagram-3 me-2"></i>Enterprise WMS Topology</h4>
//         <Form.Select style={{ width: '300px' }} value={selectedWarehouseId} onChange={(e) => setSelectedWarehouseId(e.target.value)}>
//           {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
//         </Form.Select>
//       </div>

//       <Row>
//         <Col md={3}>
//           <Card className="shadow-sm border-0 mb-4">
//             <Card.Header className="bg-white border-0 pt-4 pb-0">
//               <h6 className="mb-0 fw-bold">WMS Structure</h6>
//             </Card.Header>
//             <Card.Body>
//               <Button variant="primary" className="w-100 mb-3 fw-bold" onClick={() => { setCurrentEntity({}); setShowZoneModal(true); }}>
//                 + Add Zone
//               </Button>
//               <div className="wms-tree" style={{ maxHeight: '600px', overflowY: 'auto' }}>
//                 {topology.map(zone => (
//                   <div key={zone.id} className="mb-3">
//                     <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
//                       <strong className="text-primary"><i className="bi bi-geo-alt"></i> Zone: {zone.code}</strong>
//                       <Button variant="link" size="sm" className="p-0 text-secondary" onClick={() => { setCurrentEntity({ zoneId: zone.id }); setShowAisleModal(true); }}>+ Aisle</Button>
//                     </div>
                    
//                     <div className="ps-3 mt-2 border-start ms-2">
//                       {zone.aisles?.map(aisle => (
//                         <div key={aisle.id} className="mb-2">
//                           <div className="d-flex justify-content-between align-items-center">
//                             <span className="fw-semibold"><i className="bi bi-arrow-down-up"></i> Aisle: {aisle.code}</span>
//                             <Button variant="link" size="sm" className="p-0 text-secondary" onClick={() => { setCurrentEntity({ aisleId: aisle.id }); setShowRackModal(true); }}>+ Rack</Button>
//                           </div>
                          
//                           <div className="ps-3 mt-1 border-start ms-2">
//                             {aisle.racks?.map(rack => (
//                               <div key={rack.id} className="mb-1">
//                                 <div className="d-flex justify-content-between align-items-center">
//                                   <span><i className="bi bi-hdd-rack"></i> Rack: {rack.code}</span>
//                                   <Button variant="link" size="sm" className="p-0 text-secondary" onClick={() => { setCurrentEntity({ rackId: rack.id }); setShowShelfModal(true); }}>+ Shelf</Button>
//                                 </div>
                                
//                                 <div className="ps-3 mt-1 border-start ms-2">
//                                   {rack.shelves?.map(shelf => (
//                                     <div key={shelf.id}>
//                                       <div className="d-flex justify-content-between align-items-center">
//                                         <span className="text-muted" style={{fontSize: '0.9rem'}}>Shelf: {shelf.code}</span>
//                                         <Button variant="link" size="sm" className="p-0 text-secondary" onClick={() => { setCurrentEntity({ shelfId: shelf.id }); setShowBinModal(true); }}>+ Bin</Button>
//                                       </div>
//                                       <div className="ps-3 mt-1 d-flex flex-wrap gap-1">
//                                         {shelf.bins?.map(bin => (
//                                           <Badge bg="info" key={bin.id} style={{cursor: 'pointer'}} title={`Max Wt: ${bin.maxWeightKg}kg`}>{bin.code}</Badge>
//                                         ))}
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//                 {topology.length === 0 && <div className="text-muted text-center py-4">No zones configured yet.</div>}
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={9}>
//           <Card className="shadow-sm border-0 h-100">
//             <Card.Header className="bg-white border-0 pt-4">
//               <h6 className="mb-0 fw-bold">Bin Details</h6>
//             </Card.Header>
//             <Card.Body>
//               <Table hover responsive>
//                 <thead>
//                   <tr>
//                     <th>Bin Code</th>
//                     <th>Zone/Aisle/Rack/Shelf</th>
//                     <th>Max Weight</th>
//                     <th>Max Volume</th>
//                     <th>Grid (X,Y,Z)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {topology.flatMap(z => z.aisles?.flatMap(a => a.racks?.flatMap(r => r.shelves?.flatMap(s => s.bins?.map(b => (
//                     <tr key={b.id}>
//                       <td className="fw-bold text-primary">{b.code}</td>
//                       <td>{z.code} / {a.code} / {r.code} / {s.code}</td>
//                       <td>{b.maxWeightKg} kg</td>
//                       <td>{b.maxVolumeM3} m³</td>
//                       <td>{b.gridX}, {b.gridY}, {b.gridZ}</td>
//                     </tr>
//                   ))))))}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Modals for creating entities */}
//       <Modal show={showZoneModal} onHide={() => setShowZoneModal(false)}>
//         <Modal.Header closeButton><Modal.Title>Add Zone</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3"><Form.Label>Zone Code</Form.Label><Form.Control value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} /></Form.Group>
//           <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control value={currentEntity.name || ''} onChange={e => setCurrentEntity({...currentEntity, name: e.target.value})} /></Form.Group>
//         </Modal.Body>
//         <Modal.Footer><Button variant="secondary" onClick={() => setShowZoneModal(false)}>Cancel</Button><Button variant="primary" onClick={saveZone}>Save Zone</Button></Modal.Footer>
//       </Modal>

//       <Modal show={showAisleModal} onHide={() => setShowAisleModal(false)}>
//         <Modal.Header closeButton><Modal.Title>Add Aisle</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3"><Form.Label>Aisle Code</Form.Label><Form.Control value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} /></Form.Group>
//         </Modal.Body>
//         <Modal.Footer><Button variant="secondary" onClick={() => setShowAisleModal(false)}>Cancel</Button><Button variant="primary" onClick={saveAisle}>Save Aisle</Button></Modal.Footer>
//       </Modal>
      
//       <Modal show={showRackModal} onHide={() => setShowRackModal(false)}>
//         <Modal.Header closeButton><Modal.Title>Add Rack</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3"><Form.Label>Rack Code</Form.Label><Form.Control value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} /></Form.Group>
//         </Modal.Body>
//         <Modal.Footer><Button variant="secondary" onClick={() => setShowRackModal(false)}>Cancel</Button><Button variant="primary" onClick={saveRack}>Save Rack</Button></Modal.Footer>
//       </Modal>
      
//       <Modal show={showShelfModal} onHide={() => setShowShelfModal(false)}>
//         <Modal.Header closeButton><Modal.Title>Add Shelf</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3"><Form.Label>Shelf Code</Form.Label><Form.Control value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} /></Form.Group>
//         </Modal.Body>
//         <Modal.Footer><Button variant="secondary" onClick={() => setShowShelfModal(false)}>Cancel</Button><Button variant="primary" onClick={saveShelf}>Save Shelf</Button></Modal.Footer>
//       </Modal>
      
//       <Modal show={showBinModal} onHide={() => setShowBinModal(false)}>
//         <Modal.Header closeButton><Modal.Title>Add Bin</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3"><Form.Label>Bin Code</Form.Label><Form.Control value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} /></Form.Group>
//           <Form.Group className="mb-3"><Form.Label>Barcode</Form.Label><Form.Control value={currentEntity.barcode || ''} onChange={e => setCurrentEntity({...currentEntity, barcode: e.target.value})} /></Form.Group>
//           <Row>
//             <Col><Form.Group className="mb-3"><Form.Label>Max Wt (kg)</Form.Label><Form.Control type="number" value={currentEntity.maxWeightKg || 0} onChange={e => setCurrentEntity({...currentEntity, maxWeightKg: e.target.value})} /></Form.Group></Col>
//             <Col><Form.Group className="mb-3"><Form.Label>Max Vol (m³)</Form.Label><Form.Control type="number" value={currentEntity.maxVolumeM3 || 0} onChange={e => setCurrentEntity({...currentEntity, maxVolumeM3: e.target.value})} /></Form.Group></Col>
//           </Row>
//           <Row>
//             <Col><Form.Group className="mb-3"><Form.Label>Grid X</Form.Label><Form.Control type="number" value={currentEntity.gridX || 0} onChange={e => setCurrentEntity({...currentEntity, gridX: e.target.value})} /></Form.Group></Col>
//             <Col><Form.Group className="mb-3"><Form.Label>Grid Y</Form.Label><Form.Control type="number" value={currentEntity.gridY || 0} onChange={e => setCurrentEntity({...currentEntity, gridY: e.target.value})} /></Form.Group></Col>
//             <Col><Form.Group className="mb-3"><Form.Label>Grid Z</Form.Label><Form.Control type="number" value={currentEntity.gridZ || 0} onChange={e => setCurrentEntity({...currentEntity, gridZ: e.target.value})} /></Form.Group></Col>
//           </Row>
//         </Modal.Body>
//         <Modal.Footer><Button variant="secondary" onClick={() => setShowBinModal(false)}>Cancel</Button><Button variant="primary" onClick={saveBin}>Save Bin</Button></Modal.Footer>
//       </Modal>

//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Modal, Badge } from 'react-bootstrap';
import { smartErpApi } from '../services/smartErpApi';

export default function WmsSetup() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [topology, setTopology] = useState([]);
  
  // Creation Modal States
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showAisleModal, setShowAisleModal] = useState(false);
  const [showRackModal, setShowRackModal] = useState(false);
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [showBinModal, setShowBinModal] = useState(false);
  
  // NEW: Details Modal State
  const [showBinDetailsModal, setShowBinDetailsModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);

  const [currentEntity, setCurrentEntity] = useState({});

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      loadTopology();
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

  const loadTopology = async () => {
    try {
      const res = await smartErpApi.getTopology(selectedWarehouseId);
      setTopology(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveZone = async () => {
    await smartErpApi.createZone({ ...currentEntity, warehouseId: parseInt(selectedWarehouseId) });
    setShowZoneModal(false);
    loadTopology();
  };

  const saveAisle = async () => {
    await smartErpApi.createAisle(currentEntity);
    setShowAisleModal(false);
    loadTopology();
  };

  const saveRack = async () => {
    await smartErpApi.createRack(currentEntity);
    setShowRackModal(false);
    loadTopology();
  };

  const saveShelf = async () => {
    await smartErpApi.createShelf(currentEntity);
    setShowShelfModal(false);
    loadTopology();
  };

  const saveBin = async () => {
    await smartErpApi.createBin(currentEntity);
    setShowBinModal(false);
    loadTopology();
  };

  // NEW: Handler for clicking a bin to view details
  const handleBinClick = (bin, path) => {
    setSelectedBin({ ...bin, path });
    setShowBinDetailsModal(true);
  };

  // Safely extract all nested bins for the table without crashing
  const flattenBins = () => {
    const allBins = [];
    topology.forEach(z => {
      (z.aisles || []).forEach(a => {
        (a.racks || []).forEach(r => {
          (r.shelves || []).forEach(s => {
            (s.bins || []).forEach(b => {
              allBins.push({
                ...b,
                path: `${z.code} / ${a.code} / ${r.code} / ${s.code}`
              });
            });
          });
        });
      });
    });
    return allBins;
  };

  const flatBinsData = flattenBins();

  return (
    <div className="container-fluid py-4 align-items-start">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4><i className="bi bi-diagram-3 me-2 text-primary"></i>Enterprise WMS Topology</h4>
          <p className="text-muted mb-0">Configure warehouse physical storage locations.</p>
        </div>
        <Form.Select style={{ width: '300px', maxWidth: '100%' }} value={selectedWarehouseId} onChange={(e) => setSelectedWarehouseId(e.target.value)}>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
        </Form.Select>
      </div>

      <Row className="g-4">
        {/* LEFT COLUMN: WMS STRUCTURE TREE */}
        <Col md={4} lg={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-bold">WMS Structure</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column">
              <Button variant="primary" className="w-100 mb-3 fw-bold shadow-sm" onClick={() => { setCurrentEntity({}); setShowZoneModal(true); }}>
                + Add Zone
              </Button>
              <div className="wms-tree pe-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {topology.map(zone => (
                  <div key={zone.id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded border border-light">
                      <strong className="text-primary"><i className="bi bi-geo-alt me-1"></i> Zone: {zone.code}</strong>
                      <Button variant="link" size="sm" className="p-0 text-secondary text-decoration-none fw-bold" onClick={() => { setCurrentEntity({ zoneId: zone.id }); setShowAisleModal(true); }}>+ Aisle</Button>
                    </div>
                    
                    <div className="ps-3 mt-2 border-start ms-2 border-2">
                      {zone.aisles?.map(aisle => (
                        <div key={aisle.id} className="mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold text-dark"><i className="bi bi-arrow-down-up me-1 text-muted"></i> Aisle: {aisle.code}</span>
                            <Button variant="link" size="sm" className="p-0 text-secondary text-decoration-none" onClick={() => { setCurrentEntity({ aisleId: aisle.id }); setShowRackModal(true); }}>+ Rack</Button>
                          </div>
                          
                          <div className="ps-3 mt-1 border-start ms-2 border-1">
                            {aisle.racks?.map(rack => (
                              <div key={rack.id} className="mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="text-dark"><i className="bi bi-hdd-rack me-1 text-muted"></i> Rack: {rack.code}</span>
                                  <Button variant="link" size="sm" className="p-0 text-secondary text-decoration-none" onClick={() => { setCurrentEntity({ rackId: rack.id }); setShowShelfModal(true); }}>+ Shelf</Button>
                                </div>
                                
                                <div className="ps-3 mt-1 border-start ms-2 border-1 pb-1">
                                  {rack.shelves?.map(shelf => (
                                    <div key={shelf.id} className="mb-2">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-muted small fw-semibold">Shelf: {shelf.code}</span>
                                        <Button variant="link" size="sm" className="p-0 text-secondary text-decoration-none small" onClick={() => { setCurrentEntity({ shelfId: shelf.id }); setShowBinModal(true); }}>+ Bin</Button>
                                      </div>
                                      <div className="ps-2 d-flex flex-wrap gap-1">
                                        {shelf.bins?.map(bin => (
                                          <Badge 
                                            bg="info" 
                                            text="dark" 
                                            key={bin.id} 
                                            // NEW: Added click handler here
                                            onClick={() => handleBinClick(bin, `${zone.code} / ${aisle.code} / ${rack.code} / ${shelf.code}`)}
                                            style={{cursor: 'pointer', transition: 'opacity 0.2s'}}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                            title="Click to view details"
                                          >
                                            {bin.code}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {topology.length === 0 && (
                  <div className="text-muted text-center py-5">
                    <i className="bi bi-diagram-2 fs-2 d-block mb-2 text-black-50"></i>
                    No zones configured yet.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN: BIN DETAILS TABLE */}
        <Col md={8} lg={9}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-bold">Bin Inventory (Click row for details)</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '650px', overflowY: 'auto', padding: '0 1rem 1rem 1rem' }}>
                <Table hover responsive className="align-middle border-top mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Bin Code</th>
                      <th>Zone / Aisle / Rack / Shelf</th>
                      <th className="text-end">Max Weight</th>
                      <th className="text-end">Max Volume</th>
                      <th className="text-center">Grid (X,Y,Z)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatBinsData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          No bins have been mapped yet. Add a Zone to begin.
                        </td>
                      </tr>
                    ) : (
                      flatBinsData.map(b => (
                        <tr 
                          key={b.id} 
                          // NEW: Added click handler and hover cursor here
                          onClick={() => handleBinClick(b, b.path)}
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                        >
                          <td className="fw-bold text-primary">{b.code}</td>
                          <td className="text-muted small fw-semibold">{b.path}</td>
                          <td className="text-end">{b.maxWeightKg} kg</td>
                          <td className="text-end">{b.maxVolumeM3} m³</td>
                          <td className="text-center">
                            <Badge bg="light" text="dark" className="border">
                              {b.gridX}, {b.gridY}, {b.gridZ}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- CREATION MODALS --- */}
      {/* (Zone, Aisle, Rack, Shelf, Bin creation modals remain unchanged) */}
      <Modal show={showZoneModal} onHide={() => setShowZoneModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Add New Zone</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small fw-bold">Zone Code</Form.Label>
            <Form.Control className="bg-light border-0" value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} placeholder="e.g. Z-A" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="text-muted small fw-bold">Name</Form.Label>
            <Form.Control className="bg-light border-0" value={currentEntity.name || ''} onChange={e => setCurrentEntity({...currentEntity, name: e.target.value})} placeholder="e.g. Ambient Storage" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowZoneModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveZone} className="px-4">Save Zone</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAisleModal} onHide={() => setShowAisleModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Add New Aisle</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label className="text-muted small fw-bold">Aisle Code</Form.Label>
            <Form.Control className="bg-light border-0" value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} placeholder="e.g. A1" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowAisleModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveAisle} className="px-4">Save Aisle</Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showRackModal} onHide={() => setShowRackModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Add New Rack</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label className="text-muted small fw-bold">Rack Code</Form.Label>
            <Form.Control className="bg-light border-0" value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} placeholder="e.g. R01" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowRackModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveRack} className="px-4">Save Rack</Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showShelfModal} onHide={() => setShowShelfModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Add New Shelf</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label className="text-muted small fw-bold">Shelf Code</Form.Label>
            <Form.Control className="bg-light border-0" value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} placeholder="e.g. S1" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowShelfModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveShelf} className="px-4">Save Shelf</Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showBinModal} onHide={() => setShowBinModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Add New Bin</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">Bin Code</Form.Label>
                <Form.Control className="bg-light border-0" value={currentEntity.code || ''} onChange={e => setCurrentEntity({...currentEntity, code: e.target.value})} placeholder="e.g. B-01" />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">Barcode</Form.Label>
                <Form.Control className="bg-light border-0" value={currentEntity.barcode || ''} onChange={e => setCurrentEntity({...currentEntity, barcode: e.target.value})} placeholder="Scan or enter" />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="g-3 mb-4">
            <Col sm={6}>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">Max Wt (kg)</Form.Label>
                <Form.Control className="bg-light border-0" type="number" value={currentEntity.maxWeightKg || ''} onChange={e => setCurrentEntity({...currentEntity, maxWeightKg: e.target.value})} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">Max Vol (m³)</Form.Label>
                <Form.Control className="bg-light border-0" type="number" value={currentEntity.maxVolumeM3 || ''} onChange={e => setCurrentEntity({...currentEntity, maxVolumeM3: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="fw-bold mb-3 border-bottom pb-2">Coordinates (For Heatmap)</h6>
          <Row className="g-3">
            <Col>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">Grid X</Form.Label>
                <Form.Control className="bg-light border-0 text-center" type="number" value={currentEntity.gridX || ''} onChange={e => setCurrentEntity({...currentEntity, gridX: e.target.value})} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">Grid Y</Form.Label>
                <Form.Control className="bg-light border-0 text-center" type="number" value={currentEntity.gridY || ''} onChange={e => setCurrentEntity({...currentEntity, gridY: e.target.value})} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">Grid Z (Level)</Form.Label>
                <Form.Control className="bg-light border-0 text-center" type="number" value={currentEntity.gridZ || ''} onChange={e => setCurrentEntity({...currentEntity, gridZ: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowBinModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveBin} className="px-4">Save Bin</Button>
        </Modal.Footer>
      </Modal>

      {/* --- NEW: BIN DETAILS VIEW MODAL --- */}
      <Modal show={showBinDetailsModal} onHide={() => setShowBinDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <i className="bi bi-box me-2 text-primary"></i> 
            Bin Details: <span className="text-primary">{selectedBin?.code}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          {selectedBin && (
            <Row className="g-4">
              <Col md={12}>
                <Card className="border-0 bg-light shadow-sm">
                  <Card.Body>
                    <h6 className="text-muted mb-3 fw-bold">Location Hierarchy</h6>
                    <div className="mb-2"><strong>Path:</strong> <span className="text-dark">{selectedBin.path}</span></div>
                    <div className="mb-0"><strong>Barcode:</strong> <span className="text-dark">{selectedBin.barcode || 'Not Assigned'}</span></div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light shadow-sm h-100">
                  <Card.Body>
                    <h6 className="text-muted mb-3 fw-bold">Capacity Constraints</h6>
                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                      <span>Max Weight:</span> <strong>{selectedBin.maxWeightKg || 0} kg</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Max Volume:</span> <strong>{selectedBin.maxVolumeM3 || 0} m³</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light shadow-sm h-100">
                  <Card.Body>
                    <h6 className="text-muted mb-3 fw-bold">Heatmap Coordinates</h6>
                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                      <span>X-Axis (Row):</span> <strong>{selectedBin.gridX || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                      <span>Y-Axis (Column):</span> <strong>{selectedBin.gridY || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Z-Axis (Floor Level):</span> <strong>{selectedBin.gridZ || 0}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-2">
          <Button variant="secondary" onClick={() => setShowBinDetailsModal(false)}>Close</Button>
          <Button variant="outline-primary" onClick={() => {
            // Optional: You could link this button to an edit mode in the future
            alert("Edit functionality coming soon!");
          }}>Edit Bin</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}