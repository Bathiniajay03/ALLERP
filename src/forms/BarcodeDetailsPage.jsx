import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { useParams, useNavigate } from "react-router-dom";
import { smartErpApi } from "../services/smartErpApi";

const renderInventoryTable = (invs) => {
  if (!invs || invs.length === 0) return <p style={{ color: "#64748b" }}>No stock in this location.</p>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginTop: "10px" }}>
      <thead>
        <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
          <th style={{ padding: "8px" }}>Item</th>
          <th style={{ padding: "8px" }}>Lot Number</th>
          <th style={{ padding: "8px" }}>Bin</th>
          <th style={{ padding: "8px", textAlign: "right" }}>Quantity</th>
        </tr>
      </thead>
      <tbody>
        {invs.map((inv, idx) => (
          <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px" }}>{inv.item?.description || "Unknown Item"}</td>
            <td style={{ padding: "8px" }}>{inv.lot?.lotNumber || "N/A"}</td>
            <td style={{ padding: "8px" }}>{inv.wmsBin?.code || inv.locationCode || "N/A"}</td>
            <td style={{ padding: "8px", textAlign: "right", fontWeight: "600" }}>{inv.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function BarcodeDetailsPage({ barcode: propBarcode, onClose }) {
  const { barcode: paramBarcode } = useParams();
  const navigate = useNavigate();

  const [barcode, setBarcode] = useState(propBarcode || paramBarcode || "");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (paramBarcode) {
      setBarcode(paramBarcode);
    }
  }, [paramBarcode]);

  useEffect(() => {
    if (propBarcode) {
      setBarcode(propBarcode);
    }
  }, [propBarcode]);

  useEffect(() => {
    if (barcode) {
      loadDetails();
    }
  }, [barcode]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await smartErpApi.globalScan(barcode);
      setDetails(res.data.data);
      setStatus(res.data.data.status || "Active");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Barcode not recognized in the system.");
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await smartErpApi.updateBarcodeStatus({ barcode, status: newStatus });
      setStatus(newStatus);
      loadDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const renderContent = () => {
    if (!details) return null;
    const { type, data, metrics, inventories, serials, hierarchy, item } = details;

    switch (type.toUpperCase()) {
      case "COMPANY":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Company Profile</h3>
            <p><strong>Code:</strong> {data.companyCode}</p>
            <p><strong>Name:</strong> {data.companyName}</p>
            <p><strong>GST:</strong> {data.gstNumber}</p>
            <p><strong>Website:</strong> {data.website}</p>
          </div>
        );

      case "WAREHOUSE":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Warehouse Information</h3>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Code:</strong> {data.code}</p>
            <h4 style={{ margin: "15px 0 5px 0" }}>Topology Metrics</h4>
            <p><strong>Total Zones:</strong> {metrics.totalZones}</p>
            <p><strong>Total Aisles:</strong> {metrics.totalAisles}</p>
            <p><strong>Total Racks:</strong> {metrics.totalRacks}</p>
            <p><strong>Total Bins:</strong> {metrics.totalBins}</p>
            <p><strong>Total Stock Quantity:</strong> {metrics.totalStock}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Stock List</h4>
            {renderInventoryTable(inventories)}
          </div>
        );

      case "ZONE":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Zone Details</h3>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Code:</strong> {data.code}</p>
            <p><strong>Warehouse:</strong> {data.warehouse?.name}</p>
            <h4 style={{ margin: "15px 0 5px 0" }}>Topology Metrics</h4>
            <p><strong>Total Aisles:</strong> {metrics.totalAisles}</p>
            <p><strong>Total Racks:</strong> {metrics.totalRacks}</p>
            <p><strong>Total Bins:</strong> {metrics.totalBins}</p>
            <p><strong>Total Stock Quantity:</strong> {metrics.totalStock}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Stock List</h4>
            {renderInventoryTable(inventories)}
          </div>
        );

      case "AISLE":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Aisle Details</h3>
            <p><strong>Aisle Code:</strong> {data.code}</p>
            <p><strong>Zone:</strong> {data.zone?.name}</p>
            <p><strong>Warehouse:</strong> {data.zone?.warehouse?.name}</p>
            <h4 style={{ margin: "15px 0 5px 0" }}>Topology Metrics</h4>
            <p><strong>Total Racks:</strong> {metrics.totalRacks}</p>
            <p><strong>Total Shelves:</strong> {metrics.totalShelves}</p>
            <p><strong>Total Bins:</strong> {metrics.totalBins}</p>
            <p><strong>Total Stock Quantity:</strong> {metrics.totalStock}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Stock List</h4>
            {renderInventoryTable(inventories)}
          </div>
        );

      case "RACK":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Rack Details</h3>
            <p><strong>Rack Code:</strong> {data.code}</p>
            <p><strong>Aisle:</strong> {data.aisle?.code}</p>
            <p><strong>Zone:</strong> {data.aisle?.zone?.name}</p>
            <p><strong>Warehouse:</strong> {data.aisle?.zone?.warehouse?.name}</p>
            <h4 style={{ margin: "15px 0 5px 0" }}>Topology Metrics</h4>
            <p><strong>Total Shelves:</strong> {metrics.totalShelves}</p>
            <p><strong>Total Bins:</strong> {metrics.totalBins}</p>
            <p><strong>Total Stock Quantity:</strong> {metrics.totalStock}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Stock List</h4>
            {renderInventoryTable(inventories)}
          </div>
        );

      case "SHELF":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Shelf Details</h3>
            <p><strong>Shelf Code:</strong> {data.code}</p>
            <p><strong>Rack:</strong> {data.rack?.code}</p>
            <p><strong>Aisle:</strong> {data.rack?.aisle?.code}</p>
            <p><strong>Zone:</strong> {data.rack?.aisle?.zone?.name}</p>
            <p><strong>Warehouse:</strong> {data.rack?.aisle?.zone?.warehouse?.name}</p>
            <h4 style={{ margin: "15px 0 5px 0" }}>Topology Metrics</h4>
            <p><strong>Total Bins:</strong> {metrics.totalBins}</p>
            <p><strong>Total Stock Quantity:</strong> {metrics.totalStock}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Stock List</h4>
            {renderInventoryTable(inventories)}
          </div>
        );

      case "BIN":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Bin Details</h3>
            <p><strong>Bin Code:</strong> {data.code}</p>
            <p><strong>Location:</strong> Zone: {data.shelf?.rack?.aisle?.zone?.name} / Rack: {data.shelf?.rack?.code} / Shelf: {data.shelf?.code}</p>
            <p><strong>Warehouse:</strong> {data.shelf?.rack?.aisle?.zone?.warehouse?.name}</p>
            <p><strong>Max Volume:</strong> {metrics.maxVolume} m³</p>
            <p><strong>Max Weight:</strong> {metrics.maxWeight} kg</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Current Stock</h4>
            {renderInventoryTable(inventories)}

            {serials && serials.length > 0 && (
              <>
                <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Serial Numbers</h4>
                <ul style={{ paddingLeft: "20px", color: "#334155" }}>
                  {serials.map((s, idx) => <li key={idx}><strong>{s.serialNumber}</strong> ({s.item?.description})</li>)}
                </ul>
              </>
            )}
          </div>
        );

      case "ITEM":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Item Master Details</h3>
            <p><strong>SKU/Barcode:</strong> {data.barcode}</p>
            <p><strong>Description:</strong> {data.description}</p>
            <p><strong>Category:</strong> {data.category}</p>
            <p><strong>UOM:</strong> {data.uom}</p>
            <p><strong>Serial PREFIX:</strong> {data.serialPrefix || "None"}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Availability by Warehouse</h4>
            {inventories && inventories.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Warehouse</th>
                    <th style={{ padding: "8px" }}>Bin</th>
                    <th style={{ padding: "8px" }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.map((inv, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px" }}>{inv.warehouse?.name}</td>
                      <td style={{ padding: "8px" }}>{inv.locationCode || "N/A"}</td>
                      <td style={{ padding: "8px" }}>{inv.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#64748b" }}>No stock available.</p>
            )}
          </div>
        );

      case "LOT":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Lot Information</h3>
            <p><strong>Lot Number:</strong> {data.lotNumber}</p>
            <p><strong>Item:</strong> {item?.description}</p>
            <p><strong>Expires At:</strong> {data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "Never"}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Stock Bins</h4>
            {inventories && inventories.length > 0 ? (
              <ul>
                {inventories.map((inv, idx) => (
                  <li key={idx}>{inv.warehouse?.name} - Bin: {inv.wmsBin?.code || "N/A"} ({inv.quantity} units)</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#64748b" }}>No stock remaining for this lot.</p>
            )}
          </div>
        );

      case "SERIALNUMBER":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Serial Number Master</h3>
            <p><strong>Serial Number:</strong> {data.serialNumber}</p>
            <p><strong>Status:</strong> <span style={{ padding: "3px 8px", background: data.status === "InStock" ? "#d1fae5" : "#fee2e2", color: data.status === "InStock" ? "#065f46" : "#991b1b", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>{data.status}</span></p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Current Hierarchy Linkage</h4>
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 8px 0" }}><strong>Item:</strong> {hierarchy.Item}</p>
              <p style={{ margin: "0 0 8px 0" }}><strong>Warehouse:</strong> {hierarchy.Warehouse || "N/A"}</p>
              <p style={{ margin: "0 0 8px 0" }}><strong>Zone:</strong> {hierarchy.Zone || "N/A"}</p>
              <p style={{ margin: "0 0 8px 0" }}><strong>Rack:</strong> {hierarchy.Rack || "N/A"}</p>
              <p style={{ margin: "0 0 8px 0" }}><strong>Shelf:</strong> {hierarchy.Shelf || "N/A"}</p>
              <p style={{ margin: "0 0 8px 0" }}><strong>Bin:</strong> {hierarchy.Bin || "N/A"}</p>
              <p style={{ margin: "0" }}><strong>Lot:</strong> {hierarchy.Lot || "N/A"}</p>
            </div>
          </div>
        );

      case "PURCHASEORDER":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Purchase Order</h3>
            <p><strong>PO Number:</strong> {data.poNumber}</p>
            <p><strong>Vendor:</strong> {data.vendor?.name}</p>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Item:</strong> {data.item?.description}</p>
            <p><strong>Ordered Quantity:</strong> {data.quantity}</p>
            <p><strong>Received Quantity:</strong> {data.receivedQuantity}</p>
          </div>
        );

      case "SALESORDER":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Sales Order</h3>
            <p><strong>Order Number:</strong> {data.orderNumber}</p>
            <p><strong>Customer:</strong> {data.customerName}</p>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Total Amount:</strong> ${data.totalAmount}</p>

            <h4 style={{ margin: "20px 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Ordered Items</h4>
            <ul>
              {data.items && data.items.map((item, idx) => (
                <li key={idx}>{item.item?.description} - Qty: {item.quantity}</li>
              ))}
            </ul>
          </div>
        );

      case "SHIPMENT":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Shipment Record</h3>
            <p><strong>Shipment Number:</strong> {data.shipmentNumber}</p>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Tracking:</strong> {data.trackingNumber || "N/A"}</p>
          </div>
        );

      case "PICKLIST":
        return (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>WMS Pick List</h3>
            <p><strong>Pick List Code:</strong> {data.pickListNumber}</p>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Picking Type:</strong> {data.pickingType}</p>
            <p><strong>Warehouse:</strong> {data.warehouse?.name}</p>
          </div>
        );

      default:
        return <p>Resolved generic data type: {type}</p>;
    }
  };

  return (
    <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxWidth: "600px", margin: "20px auto" }}>
      {(onClose || paramBarcode) && (
        <button onClick={onClose || (() => navigate("/wms/barcode-dashboard"))} style={{ float: "right", border: "none", background: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
      )}

      <div style={{ textAlign: "center", marginBottom: "25px", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px" }}>
        <h2 style={{ margin: "0 0 15px 0", color: "#0f172a" }}>Unified Barcode Details</h2>
        {barcode ? (
          <Barcode value={barcode} width={1.8} height={50} fontSize={14} />
        ) : (
          <span style={{ color: "#64748b" }}>No barcode code</span>
        )}
      </div>

      {loading && <p style={{ textAlign: "center", color: "#64748b" }}>Fetching details...</p>}
      {error && <p style={{ color: "#ef4444", background: "#fee2e2", padding: "12px", borderRadius: "6px" }}>{error}</p>}

      {!loading && !error && details && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", background: "#f8fafc", padding: "10px 15px", borderRadius: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Barcode Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontWeight: "600", background: "white" }}
            >
              <option value="Active">🟢 Active</option>
              <option value="Inactive">⚪ Inactive</option>
              <option value="Blocked">🔴 Blocked</option>
              <option value="Deleted">✕ Deleted</option>
            </select>
          </div>

          <div style={{ color: "#334155" }}>
            {renderContent()}
          </div>
        </>
      )}
    </div>
  );
} export { BarcodeDetailsPage };
