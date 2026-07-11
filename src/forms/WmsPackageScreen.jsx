import React, { useState } from "react";
import Barcode from "react-barcode";

export default function WmsPackageScreen() {
  const [packageId, setPackageId] = useState("");
  const [weight, setWeight] = useState("");
  const [generatedLabel, setGeneratedLabel] = useState(null);

  const generatePackageLabel = () => {
    if (!packageId) return alert("Enter a Sales Order ID");
    setGeneratedLabel({
      packageBarcode: "PKG-" + Math.floor(Math.random() * 1000000),
      orderId: packageId,
      customer: "Enterprise Solutions Inc",
      weight: weight || 1.5,
      destination: "New York, NY",
      status: "Packed"
    });
  };

  return (
    <div className="erp-app-wrapper min-vh-100 py-4">
      <style>{`
        .pkg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) {
          .pkg-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      
      <div className="container-fluid px-3" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div className="erp-panel p-4 shadow-sm mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="m-0 fs-4 text-dark fw-bold">📦 Package Dispatch</h2>
            <p className="m-0 mt-1 small text-muted">Generate shipping labels for out-bound stock</p>
          </div>
          <span className="badge bg-light border text-primary px-3 py-2">
            Dispatch Hub
          </span>
        </div>

        <div className="pkg-grid">
          {/* Form */}
          <div className="erp-panel p-4 shadow-sm align-self-start">
            <h3 className="m-0 mb-4 fs-5 text-dark fw-bold">Package Details</h3>
            
            <label className="form-label small fw-bold text-muted">Sales Order ID</label>
            <input 
              type="text" 
              value={packageId} 
              onChange={(e) => setPackageId(e.target.value)} 
              className="form-control erp-input mb-3"
              placeholder="Scan or enter SO number"
            />

            <label className="form-label small fw-bold text-muted">Weight (Kg)</label>
            <input 
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              className="form-control erp-input mb-4"
              placeholder="e.g. 2.5"
            />

            <button 
              onClick={generatePackageLabel}
              className="btn btn-primary fw-bold w-100 py-2"
            >
              Generate Shipping Label
            </button>
          </div>

          {/* Generated Label Preview */}
          {generatedLabel && (
            <div className="erp-panel shadow-sm align-self-start overflow-hidden p-0 border">
              <div className="bg-light p-3 text-center border-bottom">
                <h3 className="m-0 fs-6 fw-bold text-dark" style={{ letterSpacing: "0.1em" }}>SHIPPING LABEL</h3>
              </div>
              <div className="p-4 text-center">
                <div className="d-flex justify-content-between text-start mb-4 pb-4 border-bottom border-dashed">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em" }}>Ship To</div>
                    <div className="fs-5 fw-bold text-dark mt-1">{generatedLabel.customer}</div>
                    <div className="text-secondary small mt-1">{generatedLabel.destination}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em" }}>Order</div>
                    <div className="fs-5 fw-bold text-dark mt-1">{generatedLabel.orderId}</div>
                    <div className="text-muted small fw-bold text-uppercase mt-3" style={{ letterSpacing: "0.05em" }}>Weight</div>
                    <div className="fs-5 fw-bold text-dark mt-1">{generatedLabel.weight} KG</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border d-inline-block">
                  <Barcode value={generatedLabel.packageBarcode} format="CODE128" width={2} height={60} fontSize={14} background="#ffffff" />
                </div>
                
                <div className="mt-4">
                  <button className="btn btn-outline-success fw-bold w-100 py-2">
                    🖨️ Print Label
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
