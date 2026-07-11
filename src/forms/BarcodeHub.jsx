import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import Barcode from "react-barcode";
import { useParams, useNavigate } from "react-router-dom";
import { smartErpApi } from "../services/smartErpApi";
import api from "../services/apiClient";

/* ─── tiny helpers ─────────────────────────────────────────────────── */
const Badge = ({ label, color = "#e2e8f0", text = "#475569" }) => (
  <span style={{ display:"inline-block", padding:"4px 12px", borderRadius:"999px",
    background:color, color:text, fontSize:"12px", fontWeight:700, letterSpacing:"0.04em" }}>
    {label}
  </span>
);
const MetricCard = ({ icon, label, value, accent="#6366f1" }) => (
  <div style={{ background:"white", borderRadius:"14px", padding:"16px 18px",
    boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderTop:`3px solid ${accent}`, flex:"1 1 110px", minWidth:0 }}>
    <div style={{fontSize:"22px",marginBottom:"4px"}}>{icon}</div>
    <div style={{fontSize:"20px",fontWeight:800,color:"#0f172a",lineHeight:1}}>{value ?? "—"}</div>
    <div style={{fontSize:"11px",color:"#64748b",marginTop:"2px",fontWeight:500}}>{label}</div>
  </div>
);
const InfoRow = ({ label, value }) =>
  (value != null && String(value) !== "") ? (
    <div style={{display:"flex",gap:"12px",padding:"9px 0",borderBottom:"1px solid #f1f5f9"}}>
      <span style={{minWidth:"140px",color:"#64748b",fontSize:"13px",fontWeight:600,flexShrink:0}}>{label}</span>
      <span style={{color:"#1e293b",fontSize:"13px",fontWeight:500,flex:1,wordBreak:"break-all"}}>{value}</span>
    </div>
  ) : null;

const SectionTitle = ({ children }) => (
  <h4 style={{ margin:"22px 0 10px 0", fontSize:"13px", fontWeight:700, color:"#6366f1",
    textTransform:"uppercase", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:"8px" }}>
    <span style={{height:"2px",width:"16px",background:"#6366f1",display:"inline-block",borderRadius:"2px"}}/>
    {children}
  </h4>
);

const Crumb = ({ parts }) => (
  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", alignItems:"center",
    background:"#f8fafc", padding:"10px 14px", borderRadius:"10px",
    border:"1px solid #e2e8f0", fontSize:"12px", marginBottom:"12px" }}>
    {parts.filter(Boolean).map((p,i)=>(
      <React.Fragment key={i}>
        {i>0 && <span style={{color:"#cbd5e1"}}>›</span>}
        <span style={{fontWeight:i===parts.filter(Boolean).length-1?700:500,
          color:i===parts.filter(Boolean).length-1?"#6366f1":"#475569"}}>{p}</span>
      </React.Fragment>
    ))}
  </div>
);

const InventoryTable = ({ invs }) => {
  if (!invs || invs.length === 0)
    return <p style={{color:"#94a3b8",fontStyle:"italic",fontSize:"13px"}}>No stock recorded here.</p>;
  return (
    <div style={{overflowX:"auto",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
        <thead>
          <tr style={{background:"#f8fafc"}}>
            {["Item","Lot","Bin","Quantity"].map((h,i)=>(
              <th key={i} style={{padding:"10px 14px",textAlign:i===3?"right":"left",
                color:"#475569",fontWeight:700,borderBottom:"1px solid #e2e8f0"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invs.map((inv,idx)=>(
            <tr key={idx} style={{background:idx%2===0?"white":"#f8fafc"}}>
              <td style={{padding:"9px 14px",color:"#1e293b"}}>{inv.item?.description||"Unknown"}</td>
              <td style={{padding:"9px 14px",color:"#475569"}}>{inv.lot?.lotNumber||"N/A"}</td>
              <td style={{padding:"9px 14px",color:"#475569"}}>{inv.wmsBin?.code||inv.locationCode||"—"}</td>
              <td style={{padding:"9px 14px",textAlign:"right",fontWeight:700,color:"#1e293b"}}>{inv.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── per-entity detail renderers (kept from existing BarcodeDetailsPage) ─── */
const renderDetails = (details) => {
  if (!details) return null;
  const { type, data, metrics, inventories, serials, hierarchy, item, lots } = details;
  const T = (type||"").toUpperCase();

  switch(T) {
    case "COMPANY": return (
      <>
        <SectionTitle>Company Info</SectionTitle>
        <InfoRow label="Code" value={data.companyCode}/><InfoRow label="Name" value={data.companyName}/>
        <InfoRow label="GST" value={data.gSTNumber}/><InfoRow label="Website" value={data.website}/>
        <InfoRow label="Status" value={data.status}/>
      </>);

    case "WAREHOUSE": return (
      <>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="🏗️" label="Zones" value={metrics?.totalZones} accent="#6366f1"/>
          <MetricCard icon="🚶" label="Aisles" value={metrics?.totalAisles} accent="#8b5cf6"/>
          <MetricCard icon="📦" label="Racks" value={metrics?.totalRacks} accent="#ec4899"/>
          <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
          <MetricCard icon="📊" label="Stock" value={metrics?.totalStock} accent="#10b981"/>
        </div>
        <SectionTitle>Warehouse Info</SectionTitle>
        <InfoRow label="Code" value={data.code}/><InfoRow label="Name" value={data.name}/>
        <SectionTitle>Stock List</SectionTitle><InventoryTable invs={inventories}/>
      </>);

    case "ZONE": return (
      <>
        <Crumb parts={[data.warehouse?.name, data.name]}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="🚶" label="Aisles" value={metrics?.totalAisles} accent="#6366f1"/>
          <MetricCard icon="📦" label="Racks" value={metrics?.totalRacks} accent="#8b5cf6"/>
          <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
          <MetricCard icon="📊" label="Stock" value={metrics?.totalStock} accent="#10b981"/>
        </div>
        <SectionTitle>Zone Info</SectionTitle>
        <InfoRow label="Zone Code" value={data.code}/><InfoRow label="Zone Name" value={data.name}/>
        <InfoRow label="Warehouse" value={data.warehouse?.name}/>
        <SectionTitle>Stock in Zone</SectionTitle><InventoryTable invs={inventories}/>
      </>);

    case "AISLE": return (
      <>
        <Crumb parts={[data.zone?.warehouse?.name, data.zone?.name, "Aisle "+data.code]}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="📦" label="Racks" value={metrics?.totalRacks} accent="#6366f1"/>
          <MetricCard icon="🗂️" label="Shelves" value={metrics?.totalShelves} accent="#8b5cf6"/>
          <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
          <MetricCard icon="📊" label="Stock" value={metrics?.totalStock} accent="#10b981"/>
        </div>
        <SectionTitle>Aisle Info</SectionTitle>
        <InfoRow label="Aisle Code" value={data.code}/><InfoRow label="Zone" value={data.zone?.name}/>
        <InfoRow label="Warehouse" value={data.zone?.warehouse?.name}/>
        <SectionTitle>Stock in Aisle</SectionTitle><InventoryTable invs={inventories}/>
      </>);

    case "RACK": return (
      <>
        <Crumb parts={[data.aisle?.zone?.warehouse?.name, data.aisle?.zone?.name, "Aisle "+data.aisle?.code, "Rack "+data.code]}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="🗂️" label="Shelves" value={metrics?.totalShelves} accent="#8b5cf6"/>
          <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
          <MetricCard icon="📊" label="Stock" value={metrics?.totalStock} accent="#10b981"/>
        </div>
        <SectionTitle>Rack Info</SectionTitle>
        <InfoRow label="Rack Code" value={data.code}/><InfoRow label="Aisle" value={data.aisle?.code}/>
        <InfoRow label="Zone" value={data.aisle?.zone?.name}/><InfoRow label="Warehouse" value={data.aisle?.zone?.warehouse?.name}/>
        <SectionTitle>Stock in Rack</SectionTitle><InventoryTable invs={inventories}/>
      </>);

    case "SHELF": return (
      <>
        <Crumb parts={[data.rack?.aisle?.zone?.warehouse?.name, data.rack?.aisle?.zone?.name, "Aisle "+data.rack?.aisle?.code, "Rack "+data.rack?.code, "Shelf "+data.code]}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
          <MetricCard icon="📊" label="Stock" value={metrics?.totalStock} accent="#10b981"/>
        </div>
        <SectionTitle>Shelf Info</SectionTitle>
        <InfoRow label="Shelf Code" value={data.code}/><InfoRow label="Rack" value={data.rack?.code}/>
        <InfoRow label="Aisle" value={data.rack?.aisle?.code}/><InfoRow label="Zone" value={data.rack?.aisle?.zone?.name}/>
        <InfoRow label="Warehouse" value={data.rack?.aisle?.zone?.warehouse?.name}/>
        <SectionTitle>Stock on Shelf</SectionTitle><InventoryTable invs={inventories}/>
      </>);

    case "BIN": return (
      <>
        <Crumb parts={[data.shelf?.rack?.aisle?.zone?.warehouse?.name, data.shelf?.rack?.aisle?.zone?.name, "Aisle "+data.shelf?.rack?.aisle?.code, "Rack "+data.shelf?.rack?.code, "Shelf "+data.shelf?.code, "Bin "+data.code]}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="📦" label="Max Volume" value={metrics?.maxVolume!=null?metrics.maxVolume+" m³":"—"} accent="#6366f1"/>
          <MetricCard icon="⚖️" label="Max Weight" value={metrics?.maxWeight!=null?metrics.maxWeight+" kg":"—"} accent="#8b5cf6"/>
          <MetricCard icon="📊" label="Stock" value={inventories?.reduce((s,i)=>s+i.quantity,0)??0} accent="#10b981"/>
        </div>
        <SectionTitle>Bin Info</SectionTitle>
        <InfoRow label="Bin Code" value={data.code}/><InfoRow label="Shelf" value={data.shelf?.code}/>
        <InfoRow label="Rack" value={data.shelf?.rack?.code}/><InfoRow label="Aisle" value={data.shelf?.rack?.aisle?.code}/>
        <InfoRow label="Zone" value={data.shelf?.rack?.aisle?.zone?.name}/><InfoRow label="Warehouse" value={data.shelf?.rack?.aisle?.zone?.warehouse?.name}/>
        <SectionTitle>Current Stock</SectionTitle><InventoryTable invs={inventories}/>
        {serials&&serials.length>0&&(
          <>
            <SectionTitle>Serial Numbers in Bin</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"8px"}}>
              {serials.map((s,i)=>(
                <div key={i} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"8px",padding:"8px 12px"}}>
                  <div style={{fontWeight:700,fontSize:"13px",color:"#15803d"}}>{s.serialNumber}</div>
                  <div style={{fontSize:"12px",color:"#64748b"}}>{s.item?.description}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </>);

    case "ITEM": return (
      <>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="🏷️" label="Unit Price" value={data.unitPrice!=null?"₹"+data.unitPrice:"—"} accent="#6366f1"/>
          <MetricCard icon="🔢" label="Serial Count" value={metrics?.serialCount} accent="#8b5cf6"/>
          <MetricCard icon="📍" label="Lot Tracked" value={data.isLotTracked?"Yes":"No"} accent="#f59e0b"/>
        </div>
        <SectionTitle>Item Master</SectionTitle>
        <InfoRow label="Item Code" value={data.itemCode}/><InfoRow label="Description" value={data.description}/>
        <InfoRow label="Category" value={data.category}/><InfoRow label="UOM" value={data.uOM||data.uom}/>
        <InfoRow label="Barcode" value={data.barcode}/>
        <SectionTitle>Stock by Location</SectionTitle>
        {inventories&&inventories.length>0?(
          <div style={{overflowX:"auto",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
              <thead><tr style={{background:"#f8fafc"}}>
                {["Warehouse","Location Path","Qty"].map((h,i)=>(
                  <th key={i} style={{padding:"10px 14px",textAlign:i===2?"right":"left",borderBottom:"1px solid #e2e8f0",color:"#475569",fontWeight:700}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{inventories.map((inv,i)=>(
                <tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
                  <td style={{padding:"9px 14px"}}>{inv.warehouse?.name||"—"}</td>
                  <td style={{padding:"9px 14px",color:"#64748b"}}>{inv.wmsBin?.fullPath||inv.wmsBin?.code||inv.locationCode||"—"}</td>
                  <td style={{padding:"9px 14px",textAlign:"right",fontWeight:700}}>{inv.quantity}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ):<p style={{color:"#94a3b8",fontStyle:"italic",fontSize:"13px"}}>No stock available.</p>}
        {lots&&lots.length>0&&(
          <>
            <SectionTitle>Lots</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"8px"}}>
              {lots.map((l,i)=>(
                <div key={i} style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"8px 12px"}}>
                  <div style={{fontWeight:700,color:"#1d4ed8",fontSize:"13px"}}>{l.lotNumber}</div>
                  <div style={{fontSize:"12px",color:"#64748b"}}>Expires: {l.expiresAt?new Date(l.expiresAt).toLocaleDateString():"Never"}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </>);

    case "LOT": return (
      <>
        <SectionTitle>Lot Info</SectionTitle>
        <InfoRow label="Lot Number" value={data.lotNumber}/><InfoRow label="Item" value={item?.description}/>
        <InfoRow label="Item Code" value={item?.itemCode}/><InfoRow label="Expires At" value={data.expiresAt?new Date(data.expiresAt).toLocaleDateString():"Never"}/>
        <SectionTitle>Lot Stock Bins</SectionTitle>
        {inventories&&inventories.length>0?(
          <div style={{overflowX:"auto",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
              <thead><tr style={{background:"#f8fafc"}}>
                {["Warehouse","Bin","Qty"].map((h,i)=>(
                  <th key={i} style={{padding:"10px 14px",textAlign:i===2?"right":"left",borderBottom:"1px solid #e2e8f0",color:"#475569",fontWeight:700}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{inventories.map((inv,i)=>(
                <tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
                  <td style={{padding:"9px 14px"}}>{inv.warehouse?.name||"—"}</td>
                  <td style={{padding:"9px 14px",color:"#64748b"}}>{inv.wmsBin?.code||"—"}</td>
                  <td style={{padding:"9px 14px",textAlign:"right",fontWeight:700}}>{inv.quantity}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ):<p style={{color:"#94a3b8",fontStyle:"italic",fontSize:"13px"}}>No stock remaining.</p>}
      </>);

    case "SERIALNUMBER": return (
      <>
        <SectionTitle>Serial Info</SectionTitle>
        <InfoRow label="Serial Number" value={data.serialNumber}/><InfoRow label="Status" value={data.status}/>
        <SectionTitle>Hierarchy Location</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"10px"}}>
          {[["🏭","Item",hierarchy?.item],["🏢","Warehouse",hierarchy?.warehouse],["📍","Zone",hierarchy?.zone],
            ["🚶","Aisle",hierarchy?.aisle],["📦","Rack",hierarchy?.rack],["🗂️","Shelf",hierarchy?.shelf],
            ["🗃️","Bin",hierarchy?.bin],["🔢","Lot",hierarchy?.lot]].map(([icon,lbl,val],i)=>(
            <div key={i} style={{background:"white",border:"1px solid #e2e8f0",borderRadius:"10px",padding:"12px 14px"}}>
              <div style={{fontSize:"18px"}}>{icon}</div>
              <div style={{fontSize:"11px",color:"#94a3b8",fontWeight:600,marginTop:"4px"}}>{lbl}</div>
              <div style={{fontWeight:700,color:"#1e293b",fontSize:"13px",marginTop:"2px"}}>{val||"—"}</div>
            </div>
          ))}
        </div>
      </>);

    case "PURCHASEORDER": return (
      <>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="📋" label="Status" value={data.status} accent="#6366f1"/>
          <MetricCard icon="📦" label="Ordered" value={data.quantity} accent="#f59e0b"/>
          <MetricCard icon="✅" label="Received" value={data.receivedQuantity} accent="#10b981"/>
        </div>
        <SectionTitle>PO Info</SectionTitle>
        <InfoRow label="PO Number" value={data.poNumber}/><InfoRow label="Status" value={data.status}/>
        <InfoRow label="Date" value={data.orderDate?new Date(data.orderDate).toLocaleDateString():"—"}/>
        <InfoRow label="Item" value={data.item?.description}/><InfoRow label="Warehouse" value={data.warehouse?.name}/>
        <InfoRow label="Vendor" value={data.vendor?.name}/><InfoRow label="Vendor Code" value={data.vendor?.vendorCode}/>
      </>);

    case "SALESORDER": return (
      <>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="🛒" label="Status" value={data.status} accent="#6366f1"/>
          <MetricCard icon="📦" label="Items" value={data.items?.length} accent="#8b5cf6"/>
        </div>
        <SectionTitle>Sales Order Info</SectionTitle>
        <InfoRow label="Order Number" value={data.orderNumber}/><InfoRow label="Status" value={data.status}/>
        <InfoRow label="Date" value={data.orderDate?new Date(data.orderDate).toLocaleDateString():"—"}/>
        <InfoRow label="Customer" value={data.customer?.name||data.customerName}/>
        {data.items&&data.items.length>0&&(
          <>
            <SectionTitle>Ordered Items</SectionTitle>
            <div style={{overflowX:"auto",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                <thead><tr style={{background:"#f8fafc"}}>
                  <th style={{padding:"10px 14px",textAlign:"left",borderBottom:"1px solid #e2e8f0",color:"#475569",fontWeight:700}}>Item</th>
                  <th style={{padding:"10px 14px",textAlign:"right",borderBottom:"1px solid #e2e8f0",color:"#475569",fontWeight:700}}>Qty</th>
                </tr></thead>
                <tbody>{data.items.map((it,i)=>(
                  <tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
                    <td style={{padding:"9px 14px"}}>{it.item?.description||"—"}</td>
                    <td style={{padding:"9px 14px",textAlign:"right",fontWeight:700}}>{it.quantity}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </>);

    case "SHIPMENT": return (
      <>
        <SectionTitle>Shipment Info</SectionTitle>
        <InfoRow label="Shipment #" value={data.shipmentNumber}/><InfoRow label="Status" value={data.status}/>
        <InfoRow label="Tracking #" value={data.trackingNumber}/><InfoRow label="Label #" value={data.labelNumber}/>
        <InfoRow label="Sales Order" value={data.salesOrder?.orderNumber}/>
      </>);

    case "PICKLIST": return (
      <>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
          <MetricCard icon="📋" label="Status" value={data.status} accent="#6366f1"/>
          <MetricCard icon="📦" label="Items" value={data.items?.length} accent="#8b5cf6"/>
        </div>
        <SectionTitle>Pick List Info</SectionTitle>
        <InfoRow label="Pick List #" value={data.pickListNumber}/><InfoRow label="Status" value={data.status}/>
        <InfoRow label="Type" value={data.pickingType}/><InfoRow label="Warehouse" value={data.warehouse?.name}/>
        <InfoRow label="Created" value={data.createdDate?new Date(data.createdDate).toLocaleDateString():"—"}/>
        {data.items&&data.items.length>0&&(
          <>
            <SectionTitle>Pick Items</SectionTitle>
            <div style={{overflowX:"auto",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                <thead><tr style={{background:"#f8fafc"}}>
                  <th style={{padding:"10px 14px",textAlign:"left",borderBottom:"1px solid #e2e8f0",color:"#475569",fontWeight:700}}>Item</th>
                  <th style={{padding:"10px 14px",textAlign:"right",borderBottom:"1px solid #e2e8f0",color:"#475569",fontWeight:700}}>To Pick</th>
                  <th style={{padding:"10px 14px",textAlign:"right",borderBottom:"1px solid #e2e8f0",color:"#475569",fontWeight:700}}>Picked</th>
                </tr></thead>
                <tbody>{data.items.map((pi,i)=>(
                  <tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
                    <td style={{padding:"9px 14px"}}>{pi.item?.description||"—"}</td>
                    <td style={{padding:"9px 14px",textAlign:"right"}}>{pi.quantity}</td>
                    <td style={{padding:"9px 14px",textAlign:"right",fontWeight:700,
                      color:pi.pickedQuantity>=pi.quantity?"#16a34a":"#dc2626"}}>{pi.pickedQuantity}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </>);

    default:
      return <p style={{color:"#64748b"}}>Entity type: <strong>{type}</strong></p>;
  }
};

/* ─── type meta map ───────────────────────────────────────────────── */
const TYPE_META = {
  WAREHOUSE:     { icon:"🏢", label:"Warehouse",      color:"#dbeafe", text:"#1d4ed8" },
  ZONE:          { icon:"📍", label:"Zone",           color:"#fef9c3", text:"#854d0e" },
  AISLE:         { icon:"🚶", label:"Aisle",          color:"#f0fdf4", text:"#166534" },
  RACK:          { icon:"📦", label:"Rack",           color:"#fdf4ff", text:"#7e22ce" },
  SHELF:         { icon:"🗂️", label:"Shelf",         color:"#fff7ed", text:"#9a3412" },
  BIN:           { icon:"🗃️", label:"Bin",           color:"#ecfdf5", text:"#065f46" },
  ITEM:          { icon:"🏷️", label:"Item",          color:"#eff6ff", text:"#1e40af" },
  LOT:           { icon:"🔢", label:"Lot",            color:"#fdf4ff", text:"#6d28d9" },
  SERIALNUMBER:  { icon:"🔑", label:"Serial Number",  color:"#fef2f2", text:"#991b1b" },
  PURCHASEORDER: { icon:"🧾", label:"Purchase Order", color:"#f0fdf4", text:"#15803d" },
  SALESORDER:    { icon:"🛒", label:"Sales Order",    color:"#eff6ff", text:"#1d4ed8" },
  SHIPMENT:      { icon:"🚚", label:"Shipment",       color:"#fff7ed", text:"#c2410c" },
  PICKLIST:      { icon:"📋", label:"Pick List",      color:"#f0fdf4", text:"#166534" },
  COMPANY:       { icon:"🏗️", label:"Company",       color:"#f8fafc", text:"#0f172a" },
};

/* ──────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                       */
/* ──────────────────────────────────────────────────────────────────── */
export default function BarcodeHub() {
  const { barcode: urlBarcode } = useParams();
  const navigate = useNavigate();

  // --- state ---
  const [manualInput, setManualInput]   = useState(urlBarcode || "");
  const [suggestions, setSuggestions]   = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeBarcode, setActiveBarcode] = useState(urlBarcode || "");
  const [details, setDetails]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // unknown barcode popup
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState("");
  const [productForm, setProductForm] = useState({
    itemCode: "", description: "", barcode: "", category: "General", uom: "NOS",
    price: 0, unitPrice: 0, warehouseLocation: "", isLotTracked: false, serialPrefix: "",
    maxStockLevel: 1000, safetyStock: 10, leadTimeDays: 3, averageDailySales: 0
  });

  // camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError]   = useState("");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const inputRef    = useRef(null);

  // recent scans
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("barcodeHistory") || "[]"); }
    catch { return []; }
  });

  /* ── fetch details ── */
  const fetchDetails = useCallback(async (code) => {
    const trimmed = code?.trim();
    if (!trimmed) return;
    setLoading(true); setError(null); setDetails(null);
    try {
      const res = await smartErpApi.globalScan(trimmed);
      setDetails(res.data.data);
      // save to history
      setHistory(prev => {
        const next = [{ barcode: trimmed, type: res.data.data?.type||"Unknown", ts: Date.now() },
          ...prev.filter(h => h.barcode !== trimmed)].slice(0, 8);
        localStorage.setItem("barcodeHistory", JSON.stringify(next));
        return next;
      });
    } catch(err) {
      if (err.response?.status === 404) {
        // Unknown Barcode Intercept
        setUnknownBarcode(trimmed);
        setProductForm(prev => ({ ...prev, barcode: trimmed, itemCode: trimmed }));
        setShowRegisterPopup(true);
      } else {
        setError(err.response?.data?.error || "Barcode not found or not recognized.");
      }
    } finally { setLoading(false); }
  }, []);

  /* ── auto-load if URL param ── */
  useEffect(() => {
    if (urlBarcode) fetchDetails(urlBarcode);
  }, [urlBarcode]); // eslint-disable-line

  /* ── typeahead search ── */
  useEffect(() => {
    if (manualInput.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const t = setTimeout(async () => {
      try {
        const res = await smartErpApi.unifiedSearchBarcode(manualInput);
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 280);
    return () => clearTimeout(t);
  }, [manualInput]);

  /* ── submit ── */
  const handleSubmit = (e) => {
    e?.preventDefault();
    const val = manualInput.trim();
    if (!val) return;
    setShowSuggestions(false);
    setActiveBarcode(val);
    fetchDetails(val);
  };

  const handleSuggestionClick = (s) => {
    setManualInput(s.barcode);
    setActiveBarcode(s.barcode);
    setShowSuggestions(false);
    fetchDetails(s.barcode);
  };

  /* ── camera ── */
  const startCamera = async () => {
    setCameraError(""); setCameraActive(true);
    try {
      readerRef.current = new BrowserMultiFormatReader();
      const devices = await readerRef.current.listVideoInputDevices();
      if (!devices || devices.length === 0) {
        setCameraError("No camera found on this device.");
        setCameraActive(false); return;
      }
      setCameraDevices(devices);
      const back = devices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
      const devId = selectedDevice || back?.deviceId || devices[0].deviceId;
      setSelectedDevice(devId);

      // wait one tick for video element to mount
      setTimeout(() => {
        readerRef.current?.decodeFromVideoDevice(devId, videoRef.current, async (result, err) => {
          if (result) {
            const code = result.getText();
            stopCamera();
            setManualInput(code);
            setActiveBarcode(code);
            fetchDetails(code);
          }
        });
      }, 100);
    } catch(err) {
      console.error(err);
      setCameraError("Could not access camera. Check browser permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    readerRef.current?.reset();
    readerRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []); // eslint-disable-line

  /* ── register unknown product ── */
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/smart-erp/products", {
        ...productForm,
        price: Number(productForm.price), unitPrice: Number(productForm.unitPrice),
        maxStockLevel: Number(productForm.maxStockLevel), safetyStock: Number(productForm.safetyStock),
        leadTimeDays: Number(productForm.leadTimeDays), averageDailySales: Number(productForm.averageDailySales)
      });
      await smartErpApi.generateSingleBarcode({ entityType: "Item", entityId: 0, customPart: unknownBarcode });
      setShowRegisterPopup(false);
      alert("Product registered successfully!");
      fetchDetails(unknownBarcode); // Fetch it now that it exists
    } catch (err) {
      console.error(err);
      alert("Failed to register item: " + (err.response?.data?.message || "Check fields."));
    }
  };

  /* ── helpers ── */
  const typeMeta = details ? (TYPE_META[(details.type||"").toUpperCase()] || { icon:"📌", label:details.type, color:"#f8fafc", text:"#0f172a" }) : null;
  const barcodeVal = activeBarcode?.trim().length >= 2 ? activeBarcode : null;

  const entityLabel = details?.data?.name || details?.data?.code || details?.data?.itemCode ||
    details?.data?.poNumber || details?.data?.orderNumber || details?.data?.serialNumber ||
    details?.data?.pickListNumber || details?.data?.lotNumber || details?.data?.shipmentNumber ||
    details?.data?.companyName || activeBarcode;

  return (
    <div className="erp-app-wrapper min-vh-100 font-sans">
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scanLine { 0%,100% { top:10% } 50% { top:88% } }
        .barcode-hub-input:focus { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.2); }
        .sugg-item:hover { background:#f1f5f9; }
        .hist-chip:hover { background:#334155; }
        .btn-cam:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .scan-again:hover { background:#4f46e5!important; }
      `}</style>

      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom shadow-sm" style={{
        padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <button onClick={() => navigate("/wms/barcode-dashboard")}
            style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"8px",
              padding:"8px 14px", cursor:"pointer", fontSize:"13px", fontWeight:600, color:"#94a3b8", transition:"all .15s" }}>
            ← Back
          </button>
          <div>
            <h1 style={{margin:0,fontSize:"22px",fontWeight:800,color:"#1e293b"}}>📱 Barcode Hub</h1>
            <p className="text-muted" style={{margin:0,fontSize:"12px"}}>Scan via camera · Manual entry · Live details</p>
          </div>
        </div>
        {activeBarcode && details && (
          <Badge label={(typeMeta?.icon||"")+" "+typeMeta?.label} color={typeMeta?.color} text={typeMeta?.text}/>
        )}
      </div>

      <div className="barcode-hub-grid" style={{padding:"28px 32px",display:"grid",gridTemplateColumns:"340px 1fr",gap:"24px",alignItems:"start",maxWidth:"1400px",margin:"0 auto"}}>

        {/* ─── LEFT PANEL ─────────────────────────────────────────── */}
        <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>

          {/* Search box */}
          <div className="erp-panel p-4 shadow-sm">
            <p className="text-muted" style={{margin:"0 0 14px 0",fontSize:"13px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>
              🔍 Enter Barcode
            </p>
            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"10px",position:"relative"}}>
              <div style={{position:"relative"}}>
                <input
                  id="barcode-hub-input"
                  ref={inputRef}
                  className="barcode-hub-input form-control erp-input"
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                  placeholder="e.g. AJ-260711-1-0001, ZN-..."
                  autoComplete="off"
                  style={{ width:"100%", padding:"13px 44px 13px 16px", borderRadius:"8px" }}
                />
                {manualInput && (
                  <button type="button" onClick={() => { setManualInput(""); setDetails(null); setError(null); setActiveBarcode(""); setSuggestions([]); }}
                    style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:"18px", lineHeight:1 }}>×</button>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0,
                    background:"white", borderRadius:"12px", boxShadow:"0 20px 40px rgba(0,0,0,0.3)",
                    border:"1px solid #e2e8f0", zIndex:200, overflow:"hidden" }}>
                    {suggestions.map((s,idx) => (
                      <div key={idx} className="sugg-item" onMouseDown={() => handleSuggestionClick(s)}
                        style={{ padding:"11px 16px", cursor:"pointer", borderBottom:"1px solid #f1f5f9",
                          display:"flex", justifyContent:"space-between", alignItems:"center", transition:"background .12s" }}>
                        <span style={{fontWeight:600,color:"#0f172a",fontSize:"13px"}}>{s.barcode}</span>
                        <span style={{fontSize:"11px",background:"#f1f5f9",padding:"3px 8px",borderRadius:"12px",color:"#475569",fontWeight:600}}>
                          {TYPE_META[(s.entityType||"").toUpperCase()]?.icon} {s.entityType}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit"
                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"white", border:"none",
                  borderRadius:"12px", padding:"13px", fontWeight:700, fontSize:"14px", cursor:"pointer",
                  boxShadow:"0 4px 16px rgba(99,102,241,0.35)", transition:"all .2s" }}>
                🔎 Search Barcode
              </button>
            </form>
          </div>

          {/* Camera scanner */}
          <div className="erp-panel p-4 shadow-sm">
            <p className="text-muted" style={{margin:"0 0 14px 0",fontSize:"13px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>
              📷 Camera Scanner
            </p>

            {cameraActive ? (
              <div style={{position:"relative",borderRadius:"12px",overflow:"hidden",background:"black",aspectRatio:"4/3"}}>
                <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",left:0,right:0,height:"2px",background:"rgba(99,102,241,0.8)",
                  animation:"scanLine 2s ease-in-out infinite",pointerEvents:"none"}}/>
                {[["0","0","borderTop","borderLeft"],["0","auto","borderTop","borderRight"],
                  ["auto","0","borderBottom","borderLeft"],["auto","auto","borderBottom","borderRight"]].map(([t,r,bv,bh],i) => (
                  <div key={i} style={{ position:"absolute", top:t!=="auto"?"14px":"auto", bottom:t==="auto"?"14px":"auto",
                    left:r==="auto"?"auto":"14px", right:r!=="auto"?"auto":"14px",
                    width:"22px", height:"22px", borderColor:"#6366f1", borderStyle:"solid", borderWidth:0,
                    [bv+"Width"]:"3px", [bh+"Width"]:"3px", borderRadius:"3px" }}/>
                ))}
                <div style={{position:"absolute",top:0,left:0,right:0,padding:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{background:"rgba(0,0,0,0.6)",color:"#a5b4fc",fontSize:"12px",fontWeight:600,padding:"4px 10px",borderRadius:"6px"}}>
                    Point camera at barcode
                  </span>
                  <button onClick={stopCamera}
                    style={{background:"rgba(0,0,0,0.7)",color:"white",border:"none",padding:"6px 12px",borderRadius:"6px",cursor:"pointer",fontWeight:600,fontSize:"12px"}}>
                    ✕ Close
                  </button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {cameraError && (
                  <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"10px",padding:"10px 14px",color:"#dc2626",fontSize:"13px"}}>
                    ⚠️ {cameraError}
                  </div>
                )}
                <button className="btn-cam" onClick={startCamera}
                  style={{ background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"white", border:"none",
                    borderRadius:"12px", padding:"14px", fontWeight:700, fontSize:"14px", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    boxShadow:"0 4px 16px rgba(14,165,233,0.35)", transition:"all .2s" }}>
                  📷 Open Camera Scanner
                </button>
                {cameraDevices.length > 1 && (
                  <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}
                    style={{ padding:"10px 12px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.15)",
                      background:"rgba(255,255,255,0.08)", color:"white", fontSize:"13px" }}>
                    {cameraDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label||"Camera "+d.deviceId.slice(0,8)}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Recent scans */}
          {history.length > 0 && (
            <div className="erp-panel p-4 shadow-sm">
              <p className="text-muted" style={{margin:"0 0 12px 0",fontSize:"13px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                🕑 Recent Scans
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                {history.map((h,i) => (
                  <div key={i} className="hist-chip border"
                    onClick={() => { setManualInput(h.barcode); setActiveBarcode(h.barcode); fetchDetails(h.barcode); }}
                    style={{ padding:"10px 14px", borderRadius:"10px", background:"#f8fafc",
                      cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center",
                      transition:"background .15s" }}>
                    <span className="text-dark" style={{fontSize:"13px",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"180px"}}>
                      {h.barcode}
                    </span>
                    <span className="text-muted" style={{fontSize:"11px",flexShrink:0}}>
                      {TYPE_META[(h.type||"").toUpperCase()]?.icon} {h.type}
                    </span>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline-secondary w-100 mt-2 btn-sm" onClick={() => { setHistory([]); localStorage.removeItem("barcodeHistory"); }}>
                Clear History
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT PANEL (results) ───────────────────────────────── */}
        <div style={{animation:"slideUp .35s ease"}}>

          {/* Loading */}
          {loading && (
            <div className="erp-panel p-5 text-center shadow-sm">
              <div style={{width:"48px",height:"48px",border:"4px solid rgba(255,255,255,0.1)",
                borderTop:"4px solid #6366f1",borderRadius:"50%",animation:"spin 0.8s linear infinite",
                margin:"0 auto 20px"}}/>
              <p style={{color:"#64748b",margin:0,fontWeight:500}}>Fetching barcode details…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="erp-panel p-5 text-center shadow-sm" style={{ border:"1px solid #fecaca", color:"#ef4444" }}>
              <div style={{fontSize:"48px",marginBottom:"12px"}}>❌</div>
              <h3 style={{margin:"0 0 8px",color:"#f87171"}}>Barcode Not Found</h3>
              <p style={{margin:0,fontSize:"14px",opacity:0.8}}>{error}</p>
              <button className="btn btn-outline-danger mt-3 fw-bold" onClick={() => { inputRef.current?.focus(); setError(null); }}>
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && !details && (
            <div className="erp-panel p-5 text-center shadow-sm" style={{ border:"2px dashed #e2e8f0", color:"#475569" }}>
              <div style={{fontSize:"64px",marginBottom:"16px",opacity:0.6}}>📱</div>
              <h3 style={{color:"#94a3b8",margin:"0 0 10px",fontSize:"20px"}}>Ready to Scan</h3>
              <p style={{fontSize:"14px",lineHeight:1.7,maxWidth:"380px",margin:"0 auto"}}>
                Use the <strong style={{color:"#6366f1"}}>camera scanner</strong> to scan a barcode,<br/>
                or <strong style={{color:"#6366f1"}}>type a barcode</strong> in the search box on the left.<br/>
                All entity types are supported — items, bins, orders, lots, serials, and more.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && details && (
            <div style={{display:"flex",flexDirection:"column",gap:"20px",animation:"slideUp .3s ease"}}>

              {/* barcode card */}
              <div className="erp-panel p-4 shadow-sm" style={{ display:"flex", gap:"24px",
                alignItems:"center", flexWrap:"wrap" }}>
                <div style={{textAlign:"center",flexShrink:0}}>
                  {barcodeVal
                    ? <Barcode value={barcodeVal} width={1.4} height={50} fontSize={10} margin={0}/>
                    : <span style={{color:"#94a3b8",fontSize:"13px"}}>No barcode visual</span>}
                  <div style={{marginTop:"8px",fontFamily:"monospace",fontSize:"12px",
                    color:"#475569",background:"#f8fafc",padding:"5px 10px",borderRadius:"6px",maxWidth:"260px",wordBreak:"break-all"}}>
                    {activeBarcode}
                  </div>
                </div>
                <div style={{flex:1,minWidth:"180px"}}>
                  <Badge label={(typeMeta?.icon||"")+" "+(typeMeta?.label||"")} color={typeMeta?.color} text={typeMeta?.text}/>
                  <h2 style={{margin:"10px 0 4px",fontSize:"20px",fontWeight:800,color:"#0f172a",wordBreak:"break-word"}}>
                    {entityLabel}
                  </h2>
                  <span style={{fontSize:"12px",color:"#94a3b8",fontWeight:500}}>{typeMeta?.label} Entity</span>
                </div>
                <button className="btn btn-primary scan-again shadow-sm fw-bold px-4"
                  onClick={() => { setDetails(null); setError(null); setActiveBarcode(""); setManualInput(""); setTimeout(() => inputRef.current?.focus(), 50); }}
                  style={{ whiteSpace:"nowrap" }}>
                  🔄 Scan Another
                </button>
              </div>

              {/* entity details card */}
              <div className="erp-panel p-4 shadow-sm">
                {renderDetails(details)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Unknown Barcode Item Registration Popup ── */}
      {showRegisterPopup && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(15,23,42,0.7)", backdropFilter:"blur(4px)",
          zIndex:1000, display:"flex", justifyContent:"center", alignItems:"center", padding:"20px" }}>
          <div style={{ background:"white", padding:"30px", borderRadius:"16px", width:"100%", maxWidth:"600px",
            maxHeight:"90vh", overflowY:"auto", boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin:"0 0 10px 0", color:"#b91c1c", fontSize:"20px" }}>❌ Unknown Barcode Scanned</h3>
            <p style={{ color:"#64748b", marginBottom:"24px", fontSize:"14px" }}>
              The barcode <strong style={{color:"#0f172a",background:"#f1f5f9",padding:"2px 6px",borderRadius:"4px"}}>{unknownBarcode}</strong> is not registered. 
              Fill out the details below to save it as a new Item and continue.
            </p>
            
            <form onSubmit={handleCreateProduct}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"24px" }}>
                <div>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#475569", marginBottom:"6px" }}>Description *</label>
                  <input type="text" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}
                    style={{ width:"100%", padding:"10px", border:"1px solid #cbd5e1", borderRadius:"8px", boxSizing:"border-box" }} required />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#475569", marginBottom:"6px" }}>Category *</label>
                  <input type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}
                    style={{ width:"100%", padding:"10px", border:"1px solid #cbd5e1", borderRadius:"8px", boxSizing:"border-box" }} required />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#475569", marginBottom:"6px" }}>UOM *</label>
                  <input type="text" value={productForm.uom} onChange={e => setProductForm({...productForm, uom: e.target.value})}
                    style={{ width:"100%", padding:"10px", border:"1px solid #cbd5e1", borderRadius:"8px", boxSizing:"border-box" }} required />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#475569", marginBottom:"6px" }}>Unit Price (₹) *</label>
                  <input type="number" value={productForm.unitPrice} onChange={e => setProductForm({...productForm, unitPrice: e.target.value})}
                    style={{ width:"100%", padding:"10px", border:"1px solid #cbd5e1", borderRadius:"8px", boxSizing:"border-box" }} required />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#475569", marginBottom:"6px" }}>Safety Stock</label>
                  <input type="number" value={productForm.safetyStock} onChange={e => setProductForm({...productForm, safetyStock: e.target.value})}
                    style={{ width:"100%", padding:"10px", border:"1px solid #cbd5e1", borderRadius:"8px", boxSizing:"border-box" }} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#475569", marginBottom:"6px" }}>Serial Prefix (Optional)</label>
                  <input type="text" value={productForm.serialPrefix} onChange={e => setProductForm({...productForm, serialPrefix: e.target.value})}
                    style={{ width:"100%", padding:"10px", border:"1px solid #cbd5e1", borderRadius:"8px", boxSizing:"border-box" }} />
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end", gap:"12px", borderTop:"1px solid #e2e8f0", paddingTop:"20px" }}>
                <button type="button" onClick={() => setShowRegisterPopup(false)}
                  style={{ background:"#f1f5f9", color:"#475569", padding:"10px 18px", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:600 }}>
                  Cancel
                </button>
                <button type="submit" 
                  style={{ background:"#10b981", color:"white", padding:"10px 20px", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, boxShadow:"0 4px 12px rgba(16,185,129,0.2)" }}>
                  Save & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Responsive stacking on small screens ── */}
      <style>{`
        @media (max-width: 900px) {
          .barcode-hub-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
