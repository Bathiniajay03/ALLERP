import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { useParams, useNavigate } from "react-router-dom";
import { smartErpApi } from "../services/smartErpApi";

const Badge = ({ label, color = "#e2e8f0", text = "#475569" }) => (
  <span style={{
    display:"inline-block",padding:"3px 10px",borderRadius:"999px",
    background:color,color:text,fontSize:"12px",fontWeight:700,letterSpacing:"0.04em"
  }}>{label}</span>
);

const MetricCard = ({ icon, label, value, accent="#6366f1" }) => (
  <div style={{
    background:"white",borderRadius:"14px",padding:"18px 20px",
    boxShadow:"0 2px 8px rgba(0,0,0,0.06)",borderTop:`3px solid ${accent}`,flex:"1 1 130px"
  }}>
    <div style={{fontSize:"22px",marginBottom:"6px"}}>{icon}</div>
    <div style={{fontSize:"22px",fontWeight:800,color:"#0f172a"}}>{value ?? "—"}</div>
    <div style={{fontSize:"12px",color:"#64748b",marginTop:"2px",fontWeight:500}}>{label}</div>
  </div>
);

const InfoRow = ({ label, value }) =>
  (value != null && value !== "") ? (
    <div style={{display:"flex",gap:"12px",padding:"9px 0",borderBottom:"1px solid #f1f5f9"}}>
      <span style={{minWidth:"145px",color:"#64748b",fontSize:"13px",fontWeight:600}}>{label}</span>
      <span style={{color:"#1e293b",fontSize:"13px",fontWeight:500,flex:1,wordBreak:"break-all"}}>{value}</span>
    </div>
  ) : null;

const SectionTitle = ({ children }) => (
  <h4 style={{
    margin:"24px 0 12px 0",fontSize:"14px",fontWeight:700,color:"#6366f1",
    textTransform:"uppercase",letterSpacing:"0.08em",display:"flex",alignItems:"center",gap:"8px"
  }}>
    <span style={{height:"2px",width:"18px",background:"#6366f1",display:"inline-block",borderRadius:"2px"}}/>
    {children}
  </h4>
);

const InventoryTable = ({ invs }) => {
  if (!invs || invs.length === 0)
    return <p style={{color:"#94a3b8",fontStyle:"italic",fontSize:"13px"}}>No stock recorded in this location.</p>;
  return (
    <div style={{overflowX:"auto",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
        <thead>
          <tr style={{background:"#f8fafc"}}>
            {["Item","Lot","Bin","Quantity"].map((h,i)=>(
              <th key={i} style={{padding:"10px 14px",textAlign:i===3?"right":"left",color:"#475569",fontWeight:700,borderBottom:"1px solid #e2e8f0"}}>{h}</th>
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

const Crumb = ({ parts }) => (
  <div style={{
    display:"flex",flexWrap:"wrap",gap:"6px",alignItems:"center",
    background:"#f8fafc",padding:"10px 14px",borderRadius:"10px",
    border:"1px solid #e2e8f0",fontSize:"13px",marginBottom:"10px"
  }}>
    {parts.filter(Boolean).map((p,i)=>(
      <React.Fragment key={i}>
        {i>0 && <span style={{color:"#cbd5e1"}}>›</span>}
        <span style={{fontWeight:i===parts.filter(Boolean).length-1?700:500,color:i===parts.filter(Boolean).length-1?"#6366f1":"#475569"}}>{p}</span>
      </React.Fragment>
    ))}
  </div>
);

const renderDetails = (details) => {
  if (!details) return null;
  const { type, data, metrics, inventories, serials, hierarchy, item, lots } = details;
  const T = (type||"").toUpperCase();

  switch(T) {
    case "COMPANY":
      return (
        <>
          <SectionTitle>Company Info</SectionTitle>
          <InfoRow label="Company Code" value={data.companyCode}/>
          <InfoRow label="Company Name" value={data.companyName}/>
          <InfoRow label="GST Number" value={data.gSTNumber}/>
          <InfoRow label="Website" value={data.website}/>
          <InfoRow label="Status" value={data.status}/>
        </>
      );

    case "WAREHOUSE":
      return (
        <>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="🏗️" label="Zones" value={metrics?.totalZones} accent="#6366f1"/>
            <MetricCard icon="🚶" label="Aisles" value={metrics?.totalAisles} accent="#8b5cf6"/>
            <MetricCard icon="📦" label="Racks" value={metrics?.totalRacks} accent="#ec4899"/>
            <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
            <MetricCard icon="📊" label="Total Stock" value={metrics?.totalStock} accent="#10b981"/>
          </div>
          <SectionTitle>Warehouse Info</SectionTitle>
          <InfoRow label="Code" value={data.code}/>
          <InfoRow label="Name" value={data.name}/>
          <SectionTitle>Stock List</SectionTitle>
          <InventoryTable invs={inventories}/>
        </>
      );

    case "ZONE":
      return (
        <>
          <Crumb parts={[data.warehouse?.name, data.name]}/>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="🚶" label="Aisles" value={metrics?.totalAisles} accent="#6366f1"/>
            <MetricCard icon="📦" label="Racks" value={metrics?.totalRacks} accent="#8b5cf6"/>
            <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
            <MetricCard icon="📊" label="Total Stock" value={metrics?.totalStock} accent="#10b981"/>
          </div>
          <SectionTitle>Zone Info</SectionTitle>
          <InfoRow label="Zone Code" value={data.code}/>
          <InfoRow label="Zone Name" value={data.name}/>
          <InfoRow label="Warehouse" value={data.warehouse?.name}/>
          <SectionTitle>Stock in Zone</SectionTitle>
          <InventoryTable invs={inventories}/>
        </>
      );

    case "AISLE":
      return (
        <>
          <Crumb parts={[data.zone?.warehouse?.name, data.zone?.name, "Aisle "+data.code]}/>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="📦" label="Racks" value={metrics?.totalRacks} accent="#6366f1"/>
            <MetricCard icon="🗂️" label="Shelves" value={metrics?.totalShelves} accent="#8b5cf6"/>
            <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
            <MetricCard icon="📊" label="Total Stock" value={metrics?.totalStock} accent="#10b981"/>
          </div>
          <SectionTitle>Aisle Info</SectionTitle>
          <InfoRow label="Aisle Code" value={data.code}/>
          <InfoRow label="Zone" value={data.zone?.name}/>
          <InfoRow label="Warehouse" value={data.zone?.warehouse?.name}/>
          <SectionTitle>Stock in Aisle</SectionTitle>
          <InventoryTable invs={inventories}/>
        </>
      );

    case "RACK":
      return (
        <>
          <Crumb parts={[data.aisle?.zone?.warehouse?.name, data.aisle?.zone?.name, "Aisle "+data.aisle?.code, "Rack "+data.code]}/>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="🗂️" label="Shelves" value={metrics?.totalShelves} accent="#8b5cf6"/>
            <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
            <MetricCard icon="📊" label="Total Stock" value={metrics?.totalStock} accent="#10b981"/>
          </div>
          <SectionTitle>Rack Info</SectionTitle>
          <InfoRow label="Rack Code" value={data.code}/>
          <InfoRow label="Aisle" value={data.aisle?.code}/>
          <InfoRow label="Zone" value={data.aisle?.zone?.name}/>
          <InfoRow label="Warehouse" value={data.aisle?.zone?.warehouse?.name}/>
          <SectionTitle>Stock in Rack</SectionTitle>
          <InventoryTable invs={inventories}/>
        </>
      );

    case "SHELF":
      return (
        <>
          <Crumb parts={[data.rack?.aisle?.zone?.warehouse?.name, data.rack?.aisle?.zone?.name, "Aisle "+data.rack?.aisle?.code, "Rack "+data.rack?.code, "Shelf "+data.code]}/>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="🗃️" label="Bins" value={metrics?.totalBins} accent="#f59e0b"/>
            <MetricCard icon="📊" label="Total Stock" value={metrics?.totalStock} accent="#10b981"/>
          </div>
          <SectionTitle>Shelf Info</SectionTitle>
          <InfoRow label="Shelf Code" value={data.code}/>
          <InfoRow label="Rack" value={data.rack?.code}/>
          <InfoRow label="Aisle" value={data.rack?.aisle?.code}/>
          <InfoRow label="Zone" value={data.rack?.aisle?.zone?.name}/>
          <InfoRow label="Warehouse" value={data.rack?.aisle?.zone?.warehouse?.name}/>
          <SectionTitle>Stock on Shelf</SectionTitle>
          <InventoryTable invs={inventories}/>
        </>
      );

    case "BIN":
      return (
        <>
          <Crumb parts={[data.shelf?.rack?.aisle?.zone?.warehouse?.name, data.shelf?.rack?.aisle?.zone?.name, "Aisle "+data.shelf?.rack?.aisle?.code, "Rack "+data.shelf?.rack?.code, "Shelf "+data.shelf?.code, "Bin "+data.code]}/>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="📦" label="Max Volume" value={metrics?.maxVolume!=null?metrics.maxVolume+" m³":"—"} accent="#6366f1"/>
            <MetricCard icon="⚖️" label="Max Weight" value={metrics?.maxWeight!=null?metrics.maxWeight+" kg":"—"} accent="#8b5cf6"/>
            <MetricCard icon="📊" label="Total Stock" value={inventories?.reduce((s,i)=>s+i.quantity,0)??0} accent="#10b981"/>
          </div>
          <SectionTitle>Bin Info</SectionTitle>
          <InfoRow label="Bin Code" value={data.code}/>
          <InfoRow label="Shelf" value={data.shelf?.code}/>
          <InfoRow label="Rack" value={data.shelf?.rack?.code}/>
          <InfoRow label="Aisle" value={data.shelf?.rack?.aisle?.code}/>
          <InfoRow label="Zone" value={data.shelf?.rack?.aisle?.zone?.name}/>
          <InfoRow label="Warehouse" value={data.shelf?.rack?.aisle?.zone?.warehouse?.name}/>
          <SectionTitle>Current Stock</SectionTitle>
          <InventoryTable invs={inventories}/>
          {serials && serials.length>0 && (
            <>
              <SectionTitle>Serial Numbers in Bin</SectionTitle>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"8px"}}>
                {serials.map((s,i)=>(
                  <div key={i} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"8px",padding:"8px 12px"}}>
                    <div style={{fontWeight:700,fontSize:"13px",color:"#15803d"}}>{s.serialNumber}</div>
                    <div style={{fontSize:"12px",color:"#64748b"}}>{s.item?.description}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      );

    case "ITEM":
      return (
        <>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="🏷️" label="Unit Price" value={data.unitPrice!=null?"₹"+data.unitPrice:"—"} accent="#6366f1"/>
            <MetricCard icon="🔢" label="Serial Count" value={metrics?.serialCount} accent="#8b5cf6"/>
            <MetricCard icon="📍" label="Lot Tracked" value={data.isLotTracked?"Yes":"No"} accent="#f59e0b"/>
          </div>
          <SectionTitle>Item Master</SectionTitle>
          <InfoRow label="Item Code" value={data.itemCode}/>
          <InfoRow label="Description" value={data.description}/>
          <InfoRow label="Category" value={data.category}/>
          <InfoRow label="UOM" value={data.uOM||data.uom}/>
          <InfoRow label="Barcode" value={data.barcode}/>
          <SectionTitle>Stock by Warehouse</SectionTitle>
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
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"8px"}}>
                {lots.map((l,i)=>(
                  <div key={i} style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"8px 12px"}}>
                    <div style={{fontWeight:700,color:"#1d4ed8",fontSize:"13px"}}>{l.lotNumber}</div>
                    <div style={{fontSize:"12px",color:"#64748b"}}>Expires: {l.expiresAt?new Date(l.expiresAt).toLocaleDateString():"Never"}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      );

    case "LOT":
      return (
        <>
          <SectionTitle>Lot Info</SectionTitle>
          <InfoRow label="Lot Number" value={data.lotNumber}/>
          <InfoRow label="Item" value={item?.description}/>
          <InfoRow label="Item Code" value={item?.itemCode}/>
          <InfoRow label="Expires At" value={data.expiresAt?new Date(data.expiresAt).toLocaleDateString():"Never"}/>
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
        </>
      );

    case "SERIALNUMBER":
      return (
        <>
          <SectionTitle>Serial Info</SectionTitle>
          <InfoRow label="Serial Number" value={data.serialNumber}/>
          <InfoRow label="Status" value={data.status}/>
          <SectionTitle>Hierarchy Location</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:"10px"}}>
            {[["🏭","Item",hierarchy?.item],["🏢","Warehouse",hierarchy?.warehouse],["📍","Zone",hierarchy?.zone],["📦","Rack",hierarchy?.rack],["🗂️","Shelf",hierarchy?.shelf],["🗃️","Bin",hierarchy?.bin],["🔢","Lot",hierarchy?.lot]].map(([icon,lbl,val],i)=>(
              <div key={i} style={{background:"white",border:"1px solid #e2e8f0",borderRadius:"10px",padding:"12px 14px"}}>
                <div style={{fontSize:"18px"}}>{icon}</div>
                <div style={{fontSize:"11px",color:"#94a3b8",fontWeight:600,marginTop:"4px"}}>{lbl}</div>
                <div style={{fontWeight:700,color:"#1e293b",fontSize:"13px",marginTop:"2px"}}>{val||"—"}</div>
              </div>
            ))}
          </div>
        </>
      );

    case "PURCHASEORDER":
      return (
        <>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="📋" label="Status" value={data.status} accent="#6366f1"/>
            <MetricCard icon="📦" label="Ordered Qty" value={data.quantity} accent="#f59e0b"/>
            <MetricCard icon="✅" label="Received Qty" value={data.receivedQuantity} accent="#10b981"/>
          </div>
          <SectionTitle>Purchase Order Info</SectionTitle>
          <InfoRow label="PO Number" value={data.poNumber}/>
          <InfoRow label="Status" value={data.status}/>
          <InfoRow label="Date" value={data.orderDate?new Date(data.orderDate).toLocaleDateString():"—"}/>
          <InfoRow label="Item" value={data.item?.description}/>
          <InfoRow label="Item Code" value={data.item?.itemCode}/>
          <InfoRow label="Warehouse" value={data.warehouse?.name}/>
          <InfoRow label="Vendor" value={data.vendor?.name}/>
          <InfoRow label="Vendor Code" value={data.vendor?.vendorCode}/>
        </>
      );

    case "SALESORDER":
      return (
        <>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="🛒" label="Status" value={data.status} accent="#6366f1"/>
            <MetricCard icon="📦" label="Items" value={data.items?.length} accent="#8b5cf6"/>
          </div>
          <SectionTitle>Sales Order Info</SectionTitle>
          <InfoRow label="Order Number" value={data.orderNumber}/>
          <InfoRow label="Status" value={data.status}/>
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
        </>
      );

    case "SHIPMENT":
      return (
        <>
          <SectionTitle>Shipment Info</SectionTitle>
          <InfoRow label="Shipment Number" value={data.shipmentNumber}/>
          <InfoRow label="Status" value={data.status}/>
          <InfoRow label="Tracking Number" value={data.trackingNumber}/>
          <InfoRow label="Label Number" value={data.labelNumber}/>
          <InfoRow label="Sales Order" value={data.salesOrder?.orderNumber}/>
        </>
      );

    case "PICKLIST":
      return (
        <>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"20px"}}>
            <MetricCard icon="📋" label="Status" value={data.status} accent="#6366f1"/>
            <MetricCard icon="📦" label="Items" value={data.items?.length} accent="#8b5cf6"/>
          </div>
          <SectionTitle>Pick List Info</SectionTitle>
          <InfoRow label="Pick List #" value={data.pickListNumber}/>
          <InfoRow label="Status" value={data.status}/>
          <InfoRow label="Picking Type" value={data.pickingType}/>
          <InfoRow label="Warehouse" value={data.warehouse?.name}/>
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
                      <td style={{padding:"9px 14px",textAlign:"right",fontWeight:700,color:pi.pickedQuantity>=pi.quantity?"#16a34a":"#dc2626"}}>{pi.pickedQuantity}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}
        </>
      );

    default:
      return <p style={{color:"#64748b"}}>Entity type: <strong>{type}</strong></p>;
  }
};

const TYPE_META = {
  WAREHOUSE:{icon:"🏢",label:"Warehouse",color:"#dbeafe",text:"#1d4ed8"},
  ZONE:{icon:"📍",label:"Zone",color:"#fef9c3",text:"#854d0e"},
  AISLE:{icon:"🚶",label:"Aisle",color:"#f0fdf4",text:"#166534"},
  RACK:{icon:"📦",label:"Rack",color:"#fdf4ff",text:"#7e22ce"},
  SHELF:{icon:"🗂️",label:"Shelf",color:"#fff7ed",text:"#9a3412"},
  BIN:{icon:"🗃️",label:"Bin",color:"#ecfdf5",text:"#065f46"},
  ITEM:{icon:"🏷️",label:"Item",color:"#eff6ff",text:"#1e40af"},
  LOT:{icon:"🔢",label:"Lot",color:"#fdf4ff",text:"#6d28d9"},
  SERIALNUMBER:{icon:"🔑",label:"Serial Number",color:"#fef2f2",text:"#991b1b"},
  PURCHASEORDER:{icon:"🧾",label:"Purchase Order",color:"#f0fdf4",text:"#15803d"},
  SALESORDER:{icon:"🛒",label:"Sales Order",color:"#eff6ff",text:"#1d4ed8"},
  SHIPMENT:{icon:"🚚",label:"Shipment",color:"#fff7ed",text:"#c2410c"},
  PICKLIST:{icon:"📋",label:"Pick List",color:"#f0fdf4",text:"#166534"},
  COMPANY:{icon:"🏗️",label:"Company",color:"#f8fafc",text:"#0f172a"},
};

export default function BarcodeDetailsPage({ barcode: propBarcode, onClose }) {
  const { barcode: paramBarcode } = useParams();
  const navigate = useNavigate();

  const [barcode, setBarcode] = useState(propBarcode||paramBarcode||"");
  const [searchInput, setSearchInput] = useState(propBarcode||paramBarcode||"");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(()=>{ if(paramBarcode){setBarcode(paramBarcode);setSearchInput(paramBarcode);} },[paramBarcode]);
  useEffect(()=>{ if(propBarcode){setBarcode(propBarcode);setSearchInput(propBarcode);} },[propBarcode]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ if(barcode) loadDetails(); },[barcode]);

  const loadDetails = async () => {
    setLoading(true); setError(null); setDetails(null);
    try {
      const res = await smartErpApi.globalScan(barcode);
      setDetails(res.data.data);
    } catch(err) {
      console.error(err);
      setError(err.response?.data?.error||"Barcode not found or not recognized in the system.");
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const val = searchInput.trim();
    if(!val) return;
    if(paramBarcode) navigate("/wms/barcode/"+encodeURIComponent(val));
    else setBarcode(val);
  };

  const typeMeta = details?(TYPE_META[(details.type||"").toUpperCase()]||{icon:"📌",label:details.type,color:"#f8fafc",text:"#0f172a"}):null;
  const barcodeValue = barcode&&barcode.trim().length>=2?barcode:null;

  return (
    <div style={{padding:"28px",fontFamily:"'Inter',-apple-system,sans-serif",minHeight:"100vh",background:"#f1f5f9"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px",flexWrap:"wrap"}}>
        <button onClick={onClose||(()=>navigate("/wms/barcode-dashboard"))} style={{
          background:"white",border:"1px solid #e2e8f0",borderRadius:"8px",padding:"8px 14px",
          cursor:"pointer",fontSize:"13px",fontWeight:600,color:"#475569"
        }}>← Back</button>
        <div>
          <h1 style={{margin:0,fontSize:"22px",fontWeight:800,color:"#0f172a"}}>Barcode Details</h1>
          <p style={{margin:0,fontSize:"13px",color:"#64748b"}}>Scan or search any barcode to view full details</p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{display:"flex",gap:"10px",marginBottom:"24px"}}>
        <input
          value={searchInput}
          onChange={e=>setSearchInput(e.target.value)}
          placeholder="Enter barcode (e.g. BIN-AJ01, WH-260710-33-8884, ZN-...)"
          style={{flex:1,padding:"12px 16px",borderRadius:"10px",border:"1px solid #cbd5e1",
            fontSize:"14px",outline:"none",background:"white",color:"#0f172a",
            boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}
        />
        <button type="submit" style={{
          background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",border:"none",
          borderRadius:"10px",padding:"12px 24px",fontWeight:700,fontSize:"14px",cursor:"pointer",
          boxShadow:"0 4px 12px rgba(99,102,241,0.3)"
        }}>Search</button>
      </form>

      {loading&&(
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{width:"44px",height:"44px",border:"4px solid #e2e8f0",borderTop:"4px solid #6366f1",
            borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
          <p style={{color:"#64748b",margin:0}}>Fetching barcode details...</p>
        </div>
      )}

      {!loading&&error&&(
        <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"12px",
          padding:"20px 24px",color:"#dc2626",display:"flex",alignItems:"flex-start",gap:"12px"}}>
          <span style={{fontSize:"20px"}}>❌</span>
          <div>
            <strong style={{display:"block",marginBottom:"4px"}}>Barcode Not Found</strong>
            <span style={{fontSize:"13px"}}>{error}</span>
          </div>
        </div>
      )}

      {!loading&&!error&&details&&(
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"20px",alignItems:"start"}}>
          <div style={{background:"white",borderRadius:"16px",padding:"24px",
            boxShadow:"0 4px 16px rgba(0,0,0,0.07)",textAlign:"center"}}>
            <Badge label={(typeMeta?.icon||"")+" "+(typeMeta?.label||"")} color={typeMeta?.color} text={typeMeta?.text}/>
            <div style={{margin:"20px 0 10px 0",display:"flex",justifyContent:"center"}}>
              {barcodeValue
                ? <Barcode value={barcodeValue} width={1.5} height={55} fontSize={11} margin={0}/>
                : <span style={{color:"#94a3b8",fontSize:"13px"}}>No barcode value</span>}
            </div>
            <div style={{background:"#f8fafc",borderRadius:"8px",padding:"8px 12px",
              fontFamily:"monospace",fontSize:"12px",color:"#475569",wordBreak:"break-all",marginTop:"8px"}}>
              {barcode}
            </div>
          </div>

          <div style={{background:"white",borderRadius:"16px",padding:"28px",boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px",
              paddingBottom:"16px",borderBottom:"1px solid #f1f5f9"}}>
              <span style={{fontSize:"28px"}}>{typeMeta?.icon}</span>
              <div>
                <h2 style={{margin:0,fontSize:"18px",fontWeight:800,color:"#0f172a"}}>
                  {details.data?.name||details.data?.code||details.data?.itemCode||details.data?.poNumber||details.data?.orderNumber||details.data?.serialNumber||details.data?.pickListNumber||details.data?.lotNumber||details.data?.shipmentNumber||details.data?.companyName||barcode}
                </h2>
                <span style={{fontSize:"12px",color:"#94a3b8",fontWeight:500}}>{typeMeta?.label} Entity</span>
              </div>
            </div>
            {renderDetails(details)}
          </div>
        </div>
      )}

      {!loading&&!error&&!details&&!barcode&&(
        <div style={{textAlign:"center",padding:"80px 20px",color:"#94a3b8"}}>
          <div style={{fontSize:"56px",marginBottom:"16px"}}>🔍</div>
          <h3 style={{color:"#475569",margin:"0 0 8px 0"}}>Search a Barcode</h3>
          <p style={{fontSize:"14px"}}>Enter any barcode above to view full details — Bin, Zone, Item, Order, and more.</p>
        </div>
      )}
    </div>
  );
}

export { BarcodeDetailsPage };
