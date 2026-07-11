import React, { useState } from 'react';
import api from '../services/apiClient';
import { toast } from 'react-hot-toast';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

export default function WmsBinTransfer() {
  const [itemId, setItemId] = useState('');
  const [sourceBinId, setSourceBinId] = useState('');
  const [destBinId, setDestBinId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!itemId || !sourceBinId || !destBinId || !quantity) {
      toast.error('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const parsedItemId = parseInt(itemId);
      const isNum = !isNaN(parsedItemId) && /^\d+$/.test(itemId.trim());
      
      const res = await api.post('/wms-upgrade/transfer', {
        itemId: isNum ? parsedItemId : 0,
        itemBarcode: isNum ? null : itemId,
        sourceBinId: parseInt(sourceBinId),
        destinationBinId: parseInt(destBinId),
        quantity: parseFloat(quantity)
      });

      toast.success(res.data.message);
      // Reset form
      setItemId('');
      setSourceBinId('');
      setDestBinId('');
      setQuantity('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="erp-panel p-4">
      <h3 className="mb-4">Bin Transfer (Scanner Mode)</h3>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0 border-top border-primary border-3">
            <Card.Body className="p-4">
              <Form onSubmit={handleTransfer}>
                <Form.Group className="mb-3">
                  <Form.Label>Item ID (or Scan Item)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Scan Item Barcode..." 
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Source Bin ID (or Scan Bin)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Scan Source Bin..." 
                    value={sourceBinId}
                    onChange={(e) => setSourceBinId(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Destination Bin ID (or Scan Bin)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Scan Destination Bin..." 
                    value={destBinId}
                    onChange={(e) => setDestBinId(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Enter Quantity" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2" disabled={loading}>
                  {loading ? 'Transferring...' : 'Execute Transfer'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
