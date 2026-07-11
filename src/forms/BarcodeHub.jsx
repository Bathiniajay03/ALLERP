import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import Barcode from 'react-barcode';
import { useParams, useNavigate } from 'react-router-dom';
import { smartErpApi } from '../services/smartErpApi';
import api from '../services/apiClient';

/* ─── tiny helpers ─────────────────────────────────────────────────── */
const Badge = ({ label, color = '#e2e8f0', text = '#475569' }) => (
  <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:'999px',
    background:color, color:text, fontSize:'12px', fontWeight:700, letterSpacing:'0.04em' }}>
    {label}
  </span>
);
const MetricCard = ({ icon, label, value, accent='#6366f1' }) => (
  <div className='card shadow-sm border-0 h-100' style={{ borderTop:`4px solid ${accent}` }}>
    <div className='card-body p-3 text-center'>
      <div style={{fontSize:'24px',marginBottom:'8px'}}>{icon}</div>
      <div style={{fontSize:'22px',fontWeight:800,color:'#0f172a',lineHeight:1}}>{value ?? '—'}</div>
      <div style={{fontSize:'12px',color:'#64748b',marginTop:'6px',fontWeight:600}}>{label}</div>
    </div>
  </div>
);
const InfoRow = ({ label, value, code, onEntityClick }) =>
  (value != null && String(value) !== '') ? (
    <div className='d-flex py-2 border-bottom'>
      <div className='text-muted fw-bold' style={{ width:'150px', fontSize:'13px' }}>{label}</div>
      <div 
        className='fw-semibold' 
        style={{ 
          flex:1, 
          fontSize:'13px', 
          wordBreak:'break-all',
          color: code ? '#3b82f6' : '#0f172a',
          cursor: code ? 'pointer' : 'default',
          textDecoration: code ? 'underline' : 'none'
        }}
        onClick={() => code && onEntityClick && onEntityClick(code)}
      >
        {value}
      </div>
    </div>
  ) : null;

const SectionTitle = ({ children }) => (
  <h4 className='d-flex align-items-center gap-2 m-0' style={{ fontSize:'14px', fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.05em' }}>
    <span style={{height:'3px',width:'16px',background:'#6366f1',borderRadius:'2px'}}/>
    {children}
  </h4>
);

const Crumb = ({ parts, onEntityClick }) => (
  <div className='d-flex align-items-center flex-wrap gap-2 mb-3 p-2 px-3 rounded bg-light border'>
    {parts.filter(Boolean).map((p,i,arr)=>(
      <React.Fragment key={i}>
        {i>0 && <span className='text-muted'>›</span>}
        <span 
          style={{
            fontWeight:i===arr.length-1?700:500, 
            color:i===arr.length-1?'#6366f1': (p.code ? '#3b82f6' : '#475569'), 
            fontSize:'13px',
            cursor: p.code ? 'pointer' : 'default',
            textDecoration: p.code ? 'underline' : 'none'
          }}
          onClick={() => p.code && onEntityClick && onEntityClick(p.code)}
        >
          {p.label || p}
        </span>
      </React.Fragment>
    ))}
  </div>
);

const InventoryTable = ({ invs, emptyMsg='No stock recorded here.', onEntityClick }) => {
  if (!invs || invs.length === 0)
    return <div className='p-4 text-center text-muted fst-italic small'>{emptyMsg}</div>;
  return (
    <div className='table-responsive'>
      <table className='table table-hover align-middle mb-0' style={{fontSize:'13px'}}>
        <thead className='table-light'>
          <tr>
            <th className='text-muted'>Item</th>
            <th className='text-muted'>Lot</th>
            <th className='text-muted'>Bin</th>
            <th className='text-end text-muted'>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {invs.map((inv,idx)=>(
            <tr key={idx}>
              <td 
                className='text-dark fw-bold' 
                style={{cursor: inv.item?.barcode ? 'pointer' : 'default', color: inv.item?.barcode ? '#3b82f6' : 'inherit'}}
                onClick={() => inv.item?.barcode && onEntityClick && onEntityClick(inv.item?.barcode || inv.item?.itemCode)}
              >
                {inv.item?.description||'Unknown'}
              </td>
              <td 
                className='text-muted' 
                style={{cursor: inv.lot ? 'pointer' : 'default', color: inv.lot ? '#3b82f6' : 'inherit', textDecoration: inv.lot ? 'underline' : 'none'}}
                onClick={() => inv.lot && onEntityClick && onEntityClick(inv.lot?.lotNumber)}
              >
                {inv.lot?.lotNumber||'N/A'}
              </td>
              <td 
                className='text-muted'
                style={{cursor: inv.wmsBin || inv.locationCode ? 'pointer' : 'default', color: inv.wmsBin || inv.locationCode ? '#3b82f6' : 'inherit', textDecoration: inv.wmsBin || inv.locationCode ? 'underline' : 'none'}}
                onClick={() => (inv.wmsBin || inv.locationCode) && onEntityClick && onEntityClick(inv.wmsBin?.code || inv.locationCode)}
              >
                {inv.wmsBin?.code||inv.locationCode||'—'}
              </td>
              <td className='text-end fw-bold text-dark'>{inv.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── per-entity detail renderers (kept from existing BarcodeDetailsPage) ─── */
const renderDetails = (details, onEntityClick) => {
  if (!details) return null;
  const { type, data, metrics, inventories, serials, hierarchy, item, lots, warehouse, zone, aisle, rack, shelf, wmsBin, lot } = details;
  const T = (type||'').toUpperCase();

  switch(T) {
    case 'COMPANY': return (
      <div className='row g-4'>
        <div className='col-12'>
          <div className='card shadow-sm border-0'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Company Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Code' value={data.companyCode} code={data.companyCode} onEntityClick={onEntityClick}/>
              <InfoRow label='Name' value={data.companyName}/>
              <InfoRow label='GST' value={data.gSTNumber}/>
              <InfoRow label='Website' value={data.website}/>
              <InfoRow label='Status' value={data.status}/>
            </div>
          </div>
        </div>
      </div>
    );

    case 'WAREHOUSE': return (
      <div className='row g-4'>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col'><MetricCard icon='🏗️' label='Zones' value={metrics?.totalZones} accent='#6366f1'/></div>
            <div className='col'><MetricCard icon='🚶' label='Aisles' value={metrics?.totalAisles} accent='#8b5cf6'/></div>
            <div className='col'><MetricCard icon='📦' label='Racks' value={metrics?.totalRacks} accent='#ec4899'/></div>
            <div className='col'><MetricCard icon='🗃️' label='Bins' value={metrics?.totalBins} accent='#f59e0b'/></div>
            <div className='col'><MetricCard icon='📊' label='Stock' value={metrics?.totalStock} accent='#10b981'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Warehouse Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Code' value={data.code} code={data.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Name' value={data.name}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Stock List</SectionTitle></div>
            <div className='card-body p-0'><InventoryTable invs={inventories} onEntityClick={onEntityClick}/></div>
          </div>
        </div>
      </div>
    );

    case 'ZONE': return (
      <div className='row g-4'>
        <div className='col-12'>
          <Crumb 
            onEntityClick={onEntityClick}
            parts={[
              { label: data.warehouse?.name, code: data.warehouse?.code },
              { label: data.name, code: data.code }
            ]}
          />
        </div>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col'><MetricCard icon='🚶' label='Aisles' value={metrics?.totalAisles} accent='#6366f1'/></div>
            <div className='col'><MetricCard icon='📦' label='Racks' value={metrics?.totalRacks} accent='#8b5cf6'/></div>
            <div className='col'><MetricCard icon='🗃️' label='Bins' value={metrics?.totalBins} accent='#f59e0b'/></div>
            <div className='col'><MetricCard icon='📊' label='Stock' value={metrics?.totalStock} accent='#10b981'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Zone Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Zone Code' value={data.code} code={data.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Zone Name' value={data.name}/>
              <InfoRow label='Warehouse' value={data.warehouse?.name} code={data.warehouse?.code} onEntityClick={onEntityClick}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Stock in Zone</SectionTitle></div>
            <div className='card-body p-0'><InventoryTable invs={inventories} onEntityClick={onEntityClick}/></div>
          </div>
        </div>
      </div>
    );

    case 'AISLE': return (
      <div className='row g-4'>
        <div className='col-12'>
          <Crumb 
            onEntityClick={onEntityClick}
            parts={[
              { label: data.zone?.warehouse?.name, code: data.zone?.warehouse?.code },
              { label: data.zone?.name, code: data.zone?.code },
              { label: 'Aisle '+data.code, code: data.code }
            ]}
          />
        </div>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col'><MetricCard icon='📦' label='Racks' value={metrics?.totalRacks} accent='#6366f1'/></div>
            <div className='col'><MetricCard icon='🗂️' label='Shelves' value={metrics?.totalShelves} accent='#8b5cf6'/></div>
            <div className='col'><MetricCard icon='🗃️' label='Bins' value={metrics?.totalBins} accent='#f59e0b'/></div>
            <div className='col'><MetricCard icon='📊' label='Stock' value={metrics?.totalStock} accent='#10b981'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Aisle Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Aisle Code' value={data.code} code={data.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Zone' value={data.zone?.name} code={data.zone?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Warehouse' value={data.zone?.warehouse?.name} code={data.zone?.warehouse?.code} onEntityClick={onEntityClick}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Stock in Aisle</SectionTitle></div>
            <div className='card-body p-0'><InventoryTable invs={inventories} onEntityClick={onEntityClick}/></div>
          </div>
        </div>
      </div>
    );

    case 'RACK': return (
      <div className='row g-4'>
        <div className='col-12'>
          <Crumb 
            onEntityClick={onEntityClick}
            parts={[
              { label: data.aisle?.zone?.warehouse?.name, code: data.aisle?.zone?.warehouse?.code },
              { label: data.aisle?.zone?.name, code: data.aisle?.zone?.code },
              { label: 'Aisle ' + data.aisle?.code, code: data.aisle?.code },
              { label: 'Rack ' + data.code, code: data.code }
            ]}
          />
        </div>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col'><MetricCard icon='🗂️' label='Shelves' value={metrics?.totalShelves} accent='#8b5cf6'/></div>
            <div className='col'><MetricCard icon='🗃️' label='Bins' value={metrics?.totalBins} accent='#f59e0b'/></div>
            <div className='col'><MetricCard icon='📊' label='Stock' value={metrics?.totalStock} accent='#10b981'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Rack Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Rack Code' value={data.code} code={data.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Aisle' value={data.aisle?.code} code={data.aisle?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Zone' value={data.aisle?.zone?.name} code={data.aisle?.zone?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Warehouse' value={data.aisle?.zone?.warehouse?.name} code={data.aisle?.zone?.warehouse?.code} onEntityClick={onEntityClick}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Stock in Rack</SectionTitle></div>
            <div className='card-body p-0'><InventoryTable invs={inventories} onEntityClick={onEntityClick}/></div>
          </div>
        </div>
      </div>
    );

    case 'SHELF': return (
      <div className='row g-4'>
        <div className='col-12'>
          <Crumb 
            onEntityClick={onEntityClick}
            parts={[
              { label: data.rack?.aisle?.zone?.warehouse?.name, code: data.rack?.aisle?.zone?.warehouse?.code },
              { label: data.rack?.aisle?.zone?.name, code: data.rack?.aisle?.zone?.code },
              { label: 'Aisle ' + data.rack?.aisle?.code, code: data.rack?.aisle?.code },
              { label: 'Rack ' + data.rack?.code, code: data.rack?.code },
              { label: 'Shelf ' + data.code, code: data.code }
            ]}
          />
        </div>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col'><MetricCard icon='🗃️' label='Bins' value={metrics?.totalBins} accent='#f59e0b'/></div>
            <div className='col'><MetricCard icon='📊' label='Stock' value={metrics?.totalStock} accent='#10b981'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Shelf Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Shelf Code' value={data.code} code={data.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Rack' value={data.rack?.code} code={data.rack?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Aisle' value={data.rack?.aisle?.code} code={data.rack?.aisle?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Zone' value={data.rack?.aisle?.zone?.name} code={data.rack?.aisle?.zone?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Warehouse' value={data.rack?.aisle?.zone?.warehouse?.name} code={data.rack?.aisle?.zone?.warehouse?.code} onEntityClick={onEntityClick}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Stock on Shelf</SectionTitle></div>
            <div className='card-body p-0'><InventoryTable invs={inventories} onEntityClick={onEntityClick}/></div>
          </div>
        </div>
      </div>
    );

    case 'BIN': return (
      <div className='row g-4'>
        <div className='col-12'>
          <Crumb 
            onEntityClick={onEntityClick}
            parts={[
              { label: data.shelf?.rack?.aisle?.zone?.warehouse?.name, code: data.shelf?.rack?.aisle?.zone?.warehouse?.code },
              { label: data.shelf?.rack?.aisle?.zone?.name, code: data.shelf?.rack?.aisle?.zone?.code },
              { label: 'Aisle ' + data.shelf?.rack?.aisle?.code, code: data.shelf?.rack?.aisle?.code },
              { label: 'Rack ' + data.shelf?.rack?.code, code: data.shelf?.rack?.code },
              { label: 'Shelf ' + data.shelf?.code, code: data.shelf?.code },
              { label: 'Bin ' + data.code, code: data.code }
            ]}
          />
        </div>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col'><MetricCard icon='📦' label='Max Volume' value={metrics?.maxVolume!=null?metrics.maxVolume+' m³':'—'} accent='#6366f1'/></div>
            <div className='col'><MetricCard icon='⚖️' label='Max Weight' value={metrics?.maxWeight!=null?metrics.maxWeight+' kg':'—'} accent='#8b5cf6'/></div>
            <div className='col'><MetricCard icon='📊' label='Stock' value={inventories?.reduce((s,i)=>s+i.quantity,0)??0} accent='#10b981'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Bin Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Bin Code' value={data.code} code={data.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Shelf' value={data.shelf?.code} code={data.shelf?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Rack' value={data.shelf?.rack?.code} code={data.shelf?.rack?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Aisle' value={data.shelf?.rack?.aisle?.code} code={data.shelf?.rack?.aisle?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Zone' value={data.shelf?.rack?.aisle?.zone?.name} code={data.shelf?.rack?.aisle?.zone?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Warehouse' value={data.shelf?.rack?.aisle?.zone?.warehouse?.name} code={data.shelf?.rack?.aisle?.zone?.warehouse?.code} onEntityClick={onEntityClick}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Current Stock</SectionTitle></div>
            <div className='card-body p-0'><InventoryTable invs={inventories} onEntityClick={onEntityClick}/></div>
          </div>
        </div>
        {serials&&serials.length>0&&(
          <div className='col-12'>
            <div className='card shadow-sm border-0'>
              <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Serial Numbers in Bin</SectionTitle></div>
              <div className='card-body'>
                <div className='row g-2'>
                  {serials.map((s,i)=>(
                    <div key={i} className='col-6 col-md-4 col-lg-3'>
                      <div 
                        className='p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25'
                        style={{ cursor: 'pointer' }}
                        onClick={() => onEntityClick && onEntityClick(s.serialNumber)}
                      >
                        <div className='fw-bold text-success' style={{fontSize:'13px'}}>{s.serialNumber}</div>
                        <div className='text-muted' style={{fontSize:'12px'}}>{s.item?.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    case 'ITEM': return (
      <div className='row g-4'>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col-6 col-md-4'><MetricCard icon='🏷️' label='Unit Price' value={data.unitPrice!=null?'₹'+data.unitPrice:'—'} accent='#6366f1'/></div>
            <div className='col-6 col-md-4'><MetricCard icon='🔢' label='Serial Count' value={metrics?.serialCount} accent='#8b5cf6'/></div>
            <div className='col-6 col-md-4'><MetricCard icon='📍' label='Lot Tracked' value={data.isLotTracked?'Yes':'No'} accent='#f59e0b'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Item Master</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Item Code' value={data.itemCode} code={data.barcode || data.itemCode} onEntityClick={onEntityClick}/>
              <InfoRow label='Description' value={data.description}/>
              <InfoRow label='Category' value={data.category}/>
              <InfoRow label='UOM' value={data.uOM||data.uom}/>
              <InfoRow label='Barcode' value={data.barcode} code={data.barcode} onEntityClick={onEntityClick}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Stock by Location</SectionTitle></div>
            <div className='card-body p-0'>
              {inventories&&inventories.length>0?(
                <div className='table-responsive'>
                  <table className='table table-hover align-middle mb-0' style={{fontSize:'13px'}}>
                    <thead className='table-light'><tr>
                      <th className='text-muted'>Warehouse</th>
                      <th className='text-muted'>Location Path</th>
                      <th className='text-end text-muted'>Qty</th>
                    </tr></thead>
                    <tbody>{inventories.map((inv,i)=>(
                      <tr key={i}>
                        <td 
                          className='text-dark fw-bold'
                          style={{cursor: inv.warehouse?.code ? 'pointer' : 'default', color: inv.warehouse?.code ? '#3b82f6' : 'inherit'}}
                          onClick={() => inv.warehouse?.code && onEntityClick && onEntityClick(inv.warehouse?.code)}
                        >{inv.warehouse?.name||'—'}</td>
                        <td 
                          className='text-muted'
                          style={{cursor: inv.wmsBin?.code || inv.locationCode ? 'pointer' : 'default', color: inv.wmsBin?.code || inv.locationCode ? '#3b82f6' : 'inherit', textDecoration: inv.wmsBin?.code || inv.locationCode ? 'underline' : 'none'}}
                          onClick={() => (inv.wmsBin?.code || inv.locationCode) && onEntityClick && onEntityClick(inv.wmsBin?.code || inv.locationCode)}
                        >{inv.wmsBin?.fullPath||inv.wmsBin?.code||inv.locationCode||'—'}</td>
                        <td className='text-end fw-bold text-dark'>{inv.quantity}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ):<div className='p-4 text-center text-muted fst-italic small'>No stock available.</div>}
            </div>
          </div>
        </div>
        {lots&&lots.length>0&&(
          <div className='col-12'>
            <div className='card shadow-sm border-0'>
              <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Lots</SectionTitle></div>
              <div className='card-body'>
                <div className='row g-3'>
                  {lots.map((l,i)=>(
                    <div key={i} className='col-6 col-md-4 col-lg-3'>
                      <div 
                        className='p-3 rounded bg-primary bg-opacity-10 border border-primary border-opacity-25'
                        style={{ cursor: 'pointer' }}
                        onClick={() => onEntityClick && onEntityClick(l.lotNumber)}
                      >
                        <div className='fw-bold text-primary' style={{fontSize:'14px'}}>{l.lotNumber}</div>
                        <div className='text-muted' style={{fontSize:'12px'}}>Expires: {l.expiresAt?new Date(l.expiresAt).toLocaleDateString():'Never'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    case 'LOT': return (
      <div className='row g-4'>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Lot Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Lot Number' value={data.lotNumber} code={data.lotNumber} onEntityClick={onEntityClick}/>
              <InfoRow label='Item' value={item?.description} code={item?.barcode || item?.itemCode} onEntityClick={onEntityClick}/>
              <InfoRow label='Item Code' value={item?.itemCode} code={item?.barcode || item?.itemCode} onEntityClick={onEntityClick}/>
              <InfoRow label='Expires At' value={data.expiresAt?new Date(data.expiresAt).toLocaleDateString():'Never'}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Lot Stock Bins</SectionTitle></div>
            <div className='card-body p-0'>
              {inventories&&inventories.length>0?(
                <div className='table-responsive'>
                  <table className='table table-hover align-middle mb-0' style={{fontSize:'13px'}}>
                    <thead className='table-light'><tr>
                      <th className='text-muted'>Warehouse</th>
                      <th className='text-muted'>Bin</th>
                      <th className='text-end text-muted'>Qty</th>
                    </tr></thead>
                    <tbody>{inventories.map((inv,i)=>(
                      <tr key={i}>
                        <td 
                          className='text-dark fw-bold'
                          style={{cursor: inv.warehouse?.code ? 'pointer' : 'default', color: inv.warehouse?.code ? '#3b82f6' : 'inherit'}}
                          onClick={() => inv.warehouse?.code && onEntityClick && onEntityClick(inv.warehouse?.code)}
                        >{inv.warehouse?.name||'—'}</td>
                        <td 
                          className='text-muted'
                          style={{cursor: inv.wmsBin?.code ? 'pointer' : 'default', color: inv.wmsBin?.code ? '#3b82f6' : 'inherit', textDecoration: inv.wmsBin?.code ? 'underline' : 'none'}}
                          onClick={() => inv.wmsBin?.code && onEntityClick && onEntityClick(inv.wmsBin?.code)}
                        >{inv.wmsBin?.code||'—'}</td>
                        <td className='text-end fw-bold text-dark'>{inv.quantity}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ):<div className='p-4 text-center text-muted fst-italic small'>No stock remaining.</div>}
            </div>
          </div>
        </div>
      </div>
    );

    case 'SERIALNUMBER': return (
      <div className='row g-4'>
        <div className='col-lg-6'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Serial Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Serial Number' value={data.serialNumber} code={data.serialNumber} onEntityClick={onEntityClick}/>
              <InfoRow label='Status' value={data.status}/>
            </div>
          </div>
        </div>
        <div className='col-lg-6'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Hierarchy Location</SectionTitle></div>
            <div className='card-body'>
              <div className='row g-2'>
                {[
                  ['🏭','Item',hierarchy?.item, item?.barcode || item?.itemCode],
                  ['🏢','Warehouse',hierarchy?.warehouse, warehouse?.code],
                  ['📍','Zone',hierarchy?.zone, zone?.code],
                  ['🚶','Aisle',hierarchy?.aisle, aisle?.code],
                  ['📦','Rack',hierarchy?.rack, rack?.code],
                  ['🗂️','Shelf',hierarchy?.shelf, shelf?.code],
                  ['🗃️','Bin',hierarchy?.bin, wmsBin?.code],
                  ['🔢','Lot',hierarchy?.lot, lot?.lotNumber]
                ].map(([icon,lbl,val, clickCode],i)=>(
                  <div key={i} className='col-6 col-sm-4 col-lg-6 col-xl-4'>
                    <div 
                      className={`p-2 border rounded bg-light text-center h-100 ${val && clickCode ? 'shadow-sm' : ''}`}
                      style={{ cursor: (val && clickCode) ? 'pointer' : 'default', transition: 'all .2s' }}
                      onClick={() => (val && clickCode && onEntityClick) && onEntityClick(clickCode)}
                    >
                      <div style={{fontSize:'18px'}}>{icon}</div>
                      <div className='text-muted fw-bold mt-1' style={{fontSize:'11px'}}>{lbl}</div>
                      <div className='text-dark fw-bold' style={{fontSize:'13px', color: clickCode ? '#3b82f6' : '#1e293b', textDecoration: clickCode ? 'underline' : 'none'}}>{val||'—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    case 'PURCHASEORDER': return (
      <div className='row g-4'>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col-4'><MetricCard icon='📋' label='Status' value={data.status} accent='#6366f1'/></div>
            <div className='col-4'><MetricCard icon='📦' label='Ordered' value={data.quantity} accent='#f59e0b'/></div>
            <div className='col-4'><MetricCard icon='✅' label='Received' value={data.receivedQuantity} accent='#10b981'/></div>
          </div>
        </div>
        <div className='col-12'>
          <div className='card shadow-sm border-0'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>PO Info</SectionTitle></div>
            <div className='card-body'>
              <div className='row g-4'>
                <div className='col-md-6'>
                  <InfoRow label='PO Number' value={data.poNumber} code={data.poNumber} onEntityClick={onEntityClick}/>
                  <InfoRow label='Status' value={data.status}/>
                  <InfoRow label='Date' value={data.orderDate?new Date(data.orderDate).toLocaleDateString():'—'}/>
                </div>
                <div className='col-md-6'>
                  <InfoRow label='Item' value={data.item?.description} code={data.item?.barcode || data.item?.itemCode} onEntityClick={onEntityClick}/>
                  <InfoRow label='Warehouse' value={data.warehouse?.name} code={data.warehouse?.code} onEntityClick={onEntityClick}/>
                  <InfoRow label='Vendor' value={data.vendor?.name}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    case 'SALESORDER': return (
      <div className='row g-4'>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col-6'><MetricCard icon='🛒' label='Status' value={data.status} accent='#6366f1'/></div>
            <div className='col-6'><MetricCard icon='📦' label='Items' value={data.items?.length} accent='#8b5cf6'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Sales Order Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Order Number' value={data.orderNumber} code={data.orderNumber} onEntityClick={onEntityClick}/>
              <InfoRow label='Status' value={data.status}/>
              <InfoRow label='Date' value={data.orderDate?new Date(data.orderDate).toLocaleDateString():'—'}/>
              <InfoRow label='Customer' value={data.customer?.name||data.customerName}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          {data.items&&data.items.length>0&&(
            <div className='card shadow-sm border-0 h-100'>
              <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Ordered Items</SectionTitle></div>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover align-middle mb-0' style={{fontSize:'13px'}}>
                    <thead className='table-light'><tr>
                      <th className='text-muted'>Item</th>
                      <th className='text-end text-muted'>Qty</th>
                    </tr></thead>
                    <tbody>{data.items.map((it,i)=>(
                      <tr key={i}>
                        <td 
                          className='text-dark fw-bold'
                          style={{cursor: it.item?.barcode ? 'pointer' : 'default', color: it.item?.barcode ? '#3b82f6' : 'inherit'}}
                          onClick={() => it.item?.barcode && onEntityClick && onEntityClick(it.item?.barcode || it.item?.itemCode)}
                        >{it.item?.description||'—'}</td>
                        <td className='text-end fw-bold text-dark'>{it.quantity}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    case 'SHIPMENT': return (
      <div className='row g-4'>
        <div className='col-12'>
          <div className='card shadow-sm border-0'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Shipment Info</SectionTitle></div>
            <div className='card-body'>
              <div className='row g-4'>
                <div className='col-md-6'>
                  <InfoRow label='Shipment #' value={data.shipmentNumber} code={data.shipmentNumber} onEntityClick={onEntityClick}/>
                  <InfoRow label='Status' value={data.status}/>
                  <InfoRow label='Sales Order' value={data.salesOrder?.orderNumber} code={data.salesOrder?.orderNumber} onEntityClick={onEntityClick}/>
                </div>
                <div className='col-md-6'>
                  <InfoRow label='Tracking #' value={data.trackingNumber} code={data.trackingNumber} onEntityClick={onEntityClick}/>
                  <InfoRow label='Label #' value={data.labelNumber}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    case 'PICKLIST': return (
      <div className='row g-4'>
        <div className='col-12'>
          <div className='row g-3'>
            <div className='col-6'><MetricCard icon='📋' label='Status' value={data.status} accent='#6366f1'/></div>
            <div className='col-6'><MetricCard icon='📦' label='Items' value={data.items?.length} accent='#8b5cf6'/></div>
          </div>
        </div>
        <div className='col-lg-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Pick List Info</SectionTitle></div>
            <div className='card-body'>
              <InfoRow label='Pick List #' value={data.pickListNumber} code={data.pickListNumber} onEntityClick={onEntityClick}/>
              <InfoRow label='Status' value={data.status}/>
              <InfoRow label='Type' value={data.pickingType}/>
              <InfoRow label='Warehouse' value={data.warehouse?.name} code={data.warehouse?.code} onEntityClick={onEntityClick}/>
              <InfoRow label='Created' value={data.createdDate?new Date(data.createdDate).toLocaleDateString():'—'}/>
            </div>
          </div>
        </div>
        <div className='col-lg-7'>
          {data.items&&data.items.length>0&&(
            <div className='card shadow-sm border-0 h-100'>
              <div className='card-header bg-white pt-4 pb-0 border-0'><SectionTitle>Pick Items</SectionTitle></div>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover align-middle mb-0' style={{fontSize:'13px'}}>
                    <thead className='table-light'><tr>
                      <th className='text-muted'>Item</th>
                      <th className='text-end text-muted'>To Pick</th>
                      <th className='text-end text-muted'>Picked</th>
                    </tr></thead>
                    <tbody>{data.items.map((pi,i)=>(
                      <tr key={i}>
                        <td 
                          className='text-dark fw-bold'
                          style={{cursor: pi.item?.barcode ? 'pointer' : 'default', color: pi.item?.barcode ? '#3b82f6' : 'inherit'}}
                          onClick={() => pi.item?.barcode && onEntityClick && onEntityClick(pi.item?.barcode || pi.item?.itemCode)}
                        >{pi.item?.description||'—'}</td>
                        <td className='text-end text-dark'>{pi.quantity}</td>
                        <td className='text-end fw-bold' style={{color:pi.pickedQuantity>=pi.quantity?'#16a34a':'#dc2626'}}>
                          {pi.pickedQuantity}
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    default:
      return <p className='text-muted m-0 p-4'>Entity type: <strong>{type}</strong></p>;
  }
};

/* ─── type meta map ───────────────────────────────────────────────── */
const TYPE_META = {
  WAREHOUSE:     { icon:'🏢', label:'Warehouse',      color:'#dbeafe', text:'#1d4ed8' },
  ZONE:          { icon:'📍', label:'Zone',           color:'#fef9c3', text:'#854d0e' },
  AISLE:         { icon:'🚶', label:'Aisle',          color:'#f0fdf4', text:'#166534' },
  RACK:          { icon:'📦', label:'Rack',           color:'#fdf4ff', text:'#7e22ce' },
  SHELF:         { icon:'🗂️', label:'Shelf',         color:'#fff7ed', text:'#9a3412' },
  BIN:           { icon:'🗃️', label:'Bin',           color:'#ecfdf5', text:'#065f46' },
  ITEM:          { icon:'🏷️', label:'Item',          color:'#eff6ff', text:'#1e40af' },
  LOT:           { icon:'🔢', label:'Lot',            color:'#fdf4ff', text:'#6d28d9' },
  SERIALNUMBER:  { icon:'🔑', label:'Serial Number',  color:'#fef2f2', text:'#991b1b' },
  PURCHASEORDER: { icon:'🧾', label:'Purchase Order', color:'#f0fdf4', text:'#15803d' },
  SALESORDER:    { icon:'🛒', label:'Sales Order',    color:'#eff6ff', text:'#1d4ed8' },
  SHIPMENT:      { icon:'🚚', label:'Shipment',       color:'#fff7ed', text:'#c2410c' },
  PICKLIST:      { icon:'📋', label:'Pick List',      color:'#f0fdf4', text:'#166534' },
  COMPANY:       { icon:'🏗️', label:'Company',       color:'#f8fafc', text:'#0f172a' },
};

/* ──────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                       */
/* ──────────────────────────────────────────────────────────────────── */
export default function BarcodeHub() {
  const { barcode: urlBarcode } = useParams();
  const navigate = useNavigate();

  // --- state ---
  const [manualInput, setManualInput]   = useState(urlBarcode || '');
  const [suggestions, setSuggestions]   = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeBarcode, setActiveBarcode] = useState(urlBarcode || '');
  const [details, setDetails]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // unknown barcode popup
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState('');
  const [productForm, setProductForm] = useState({
    itemCode: '', description: '', barcode: '', category: 'General', uom: 'NOS',
    price: 0, unitPrice: 0, warehouseLocation: '', isLotTracked: false, serialPrefix: '',
    maxStockLevel: 1000, safetyStock: 10, leadTimeDays: 3, averageDailySales: 0
  });

  // camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError]   = useState('');
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const inputRef    = useRef(null);

  // recent scans
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('barcodeHistory') || '[]'); }
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
        const next = [{ barcode: trimmed, type: res.data.data?.type||'Unknown', ts: Date.now() },
          ...prev.filter(h => h.barcode !== trimmed)].slice(0, 8);
        localStorage.setItem('barcodeHistory', JSON.stringify(next));
        return next;
      });
    } catch(err) {
      if (err.response?.status === 404) {
        // Unknown Barcode Intercept
        setUnknownBarcode(trimmed);
        setProductForm(prev => ({ ...prev, barcode: trimmed, itemCode: trimmed }));
        setShowRegisterPopup(true);
      } else {
        setError(err.response?.data?.error || 'Barcode not found or not recognized.');
      }
    } finally { setLoading(false); }
  }, []);

  /* ── auto-load if URL param ── */
  useEffect(() => {
    if (urlBarcode) fetchDetails(urlBarcode);
  }, [urlBarcode, fetchDetails]);

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
    setCameraError(''); setCameraActive(true);
    try {
      readerRef.current = new BrowserMultiFormatReader();
      const devices = await readerRef.current.listVideoInputDevices();
      if (!devices || devices.length === 0) {
        setCameraError('No camera found on this device.');
        setCameraActive(false); return;
      }
      setCameraDevices(devices);
      const back = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
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
      setCameraError('Could not access camera. Check browser permissions.');
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
      await api.post('/smart-erp/products', {
        ...productForm,
        price: Number(productForm.price), unitPrice: Number(productForm.unitPrice),
        maxStockLevel: Number(productForm.maxStockLevel), safetyStock: Number(productForm.safetyStock),
        leadTimeDays: Number(productForm.leadTimeDays), averageDailySales: Number(productForm.averageDailySales)
      });
      await smartErpApi.generateSingleBarcode({ entityType: 'Item', entityId: 0, customPart: unknownBarcode });
      setShowRegisterPopup(false);
      alert('Product registered successfully!');
      fetchDetails(unknownBarcode); // Fetch it now that it exists
    } catch (err) {
      console.error(err);
      alert('Failed to register item: ' + (err.response?.data?.message || 'Check fields.'));
    }
  };

  /* ── helpers ── */
  const typeMeta = details ? (TYPE_META[(details.type||'').toUpperCase()] || { icon:'📌', label:details.type, color:'#f8fafc', text:'#0f172a' }) : null;
  const barcodeVal = activeBarcode?.trim().length >= 2 ? activeBarcode : null;

  const entityLabel = details?.data?.name || details?.data?.code || details?.data?.itemCode ||
    details?.data?.poNumber || details?.data?.orderNumber || details?.data?.serialNumber ||
    details?.data?.pickListNumber || details?.data?.lotNumber || details?.data?.shipmentNumber ||
    details?.data?.companyName || activeBarcode;

  return (
    <div className='erp-app-wrapper font-sans min-vh-100 bg-light'>
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
      <div className='bg-white border-bottom shadow-sm px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-3'>
        <div className='d-flex align-items-center gap-3'>
          <button onClick={() => navigate('/wms/barcode-dashboard')}
            className='btn btn-light border fw-bold text-muted px-3'
            style={{ borderRadius:'8px', fontSize:'13px' }}>
            ← Back
          </button>
          <div>
            <h1 className='m-0 fw-bold text-dark' style={{fontSize:'22px'}}>📱 Barcode Hub</h1>
            <p className='text-muted m-0' style={{fontSize:'12px'}}>Scan via camera · Manual entry · Live details</p>
          </div>
        </div>
        {activeBarcode && details && (
          <Badge label={(typeMeta?.icon||'')+' '+typeMeta?.label} color={typeMeta?.color} text={typeMeta?.text}/>
        )}
      </div>

      <div className='container-fluid py-4' style={{ maxWidth:'1600px' }}>
        <div className='row g-4'>
          {/* ─── LEFT PANEL ─────────────────────────────────────────── */}
          <div className='col-12 col-xl-3 col-lg-4 d-flex flex-column gap-4'>

            {/* Search box */}
            <div className='card shadow-sm border-0'>
              <div className='card-body p-4'>
                <h6 className='text-muted fw-bold text-uppercase mb-3' style={{fontSize:'12px', letterSpacing:'0.05em'}}>
                  🔍 Enter Barcode
                </h6>
                <form onSubmit={handleSubmit} className='d-flex flex-column gap-3'>
                  <div className='position-relative'>
                    <input
                      id='barcode-hub-input'
                      ref={inputRef}
                      className='barcode-hub-input form-control erp-input bg-light border-0 shadow-none'
                      type='text'
                      value={manualInput}
                      onChange={e => setManualInput(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                      placeholder='e.g. AJ-260711-1-0001...'
                      autoComplete='off'
                      style={{ padding:'12px 40px 12px 16px', borderRadius:'10px', fontSize:'14px', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.05)' }}
                    />
                    {manualInput && (
                      <button type='button' onClick={() => { setManualInput(''); setDetails(null); setError(null); setActiveBarcode(''); setSuggestions([]); }}
                        className='position-absolute top-50 end-0 translate-middle-y btn btn-link text-muted text-decoration-none px-3'
                        style={{ fontSize:'18px' }}>×</button>
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className='position-absolute w-100 bg-white border rounded shadow-lg mt-1' style={{ zIndex:1000, overflow:'hidden' }}>
                        {suggestions.map((s,idx) => (
                          <div key={idx} className='sugg-item d-flex justify-content-between align-items-center px-3 py-2 border-bottom'
                            onMouseDown={() => handleSuggestionClick(s)} style={{ cursor:'pointer' }}>
                            <span className='fw-bold text-dark' style={{fontSize:'13px'}}>{s.barcode}</span>
                            <span className='badge bg-light text-dark border'>
                              {TYPE_META[(s.entityType||'').toUpperCase()]?.icon} {s.entityType}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type='submit'
                    className='btn text-white w-100 fw-bold'
                    style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', padding:'12px', borderRadius:'10px', fontSize:'14px' }}>
                    Search Barcode
                  </button>
                </form>
              </div>
            </div>

            {/* Camera scanner */}
            <div className='card shadow-sm border-0'>
              <div className='card-body p-4'>
                <h6 className='text-muted fw-bold text-uppercase mb-3' style={{fontSize:'12px', letterSpacing:'0.05em'}}>
                  📷 Camera Scanner
                </h6>
                {cameraActive ? (
                  <div className='position-relative bg-dark rounded overflow-hidden shadow-inner' style={{ aspectRatio:'4/3' }}>
                    <video ref={videoRef} className='w-100 h-100' style={{ objectFit:'cover' }}/>
                    <div className='position-absolute w-100' style={{ height:'2px', background:'rgba(99,102,241,0.8)', animation:'scanLine 2s ease-in-out infinite', left:0 }}/>
                    <div className='position-absolute top-0 start-0 w-100 p-2 d-flex justify-content-between align-items-center'>
                      <span className='badge bg-dark bg-opacity-75 text-primary'>Point at barcode</span>
                      <button onClick={stopCamera} className='btn btn-sm btn-dark text-white fw-bold'>✕ Close</button>
                    </div>
                  </div>
                ) : (
                  <div className='d-flex flex-column gap-3'>
                    {cameraError && <div className='alert alert-danger m-0 py-2 small fw-bold'>{cameraError}</div>}
                    <button className='btn-cam btn text-white w-100 fw-bold' onClick={startCamera}
                      style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)', padding:'12px', borderRadius:'10px', fontSize:'14px' }}>
                      Open Camera Scanner
                    </button>
                    {cameraDevices.length > 1 && (
                      <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)} className='form-select form-select-sm bg-light'>
                        {cameraDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label||'Camera '+d.deviceId.slice(0,8)}</option>)}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent scans */}
            {history.length > 0 && (
              <div className='card shadow-sm border-0'>
                <div className='card-body p-4'>
                  <h6 className='text-muted fw-bold text-uppercase mb-3' style={{fontSize:'12px', letterSpacing:'0.05em'}}>
                    🕑 Recent Scans
                  </h6>
                  <div className='d-flex flex-column gap-2'>
                    {history.map((h,i) => (
                      <div key={i} className='hist-chip border px-3 py-2 rounded bg-light d-flex justify-content-between align-items-center'
                        onClick={() => { setManualInput(h.barcode); setActiveBarcode(h.barcode); fetchDetails(h.barcode); }}
                        style={{ cursor:'pointer' }}>
                        <span className='text-dark fw-bold text-truncate' style={{fontSize:'13px', maxWidth:'65%'}}>{h.barcode}</span>
                        <span className='text-muted small'>{TYPE_META[(h.type||'').toUpperCase()]?.icon} {h.type}</span>
                      </div>
                    ))}
                  </div>
                  <button className='btn btn-light border w-100 mt-3 btn-sm fw-bold text-muted' onClick={() => { setHistory([]); localStorage.removeItem('barcodeHistory'); }}>
                    Clear History
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT PANEL (results) ───────────────────────────────── */}
          <div className='col-12 col-xl-9 col-lg-8' style={{animation:'slideUp .35s ease'}}>

            {loading && (
              <div className='card shadow-sm border-0 text-center py-5'>
                <div className='spinner-border text-primary mx-auto mb-3' role='status' style={{width:'3rem',height:'3rem',borderWidth:'0.25rem'}}/>
                <h5 className='text-muted fw-bold'>Fetching details...</h5>
              </div>
            )}

            {!loading && error && (
              <div className='card shadow-sm border-danger text-center py-5 bg-danger bg-opacity-10'>
                <div className='display-4 mb-3'>❌</div>
                <h3 className='text-danger fw-bold'>Barcode Not Found</h3>
                <p className='text-muted'>{error}</p>
                <button className='btn btn-danger fw-bold mx-auto mt-3' onClick={() => { inputRef.current?.focus(); setError(null); }}>Try Again</button>
              </div>
            )}

            {!loading && !error && !details && (
              <div className='card shadow-sm border-0 text-center py-5' style={{ border:'2px dashed #cbd5e1 !important', background:'transparent' }}>
                <div className='display-3 mb-3 opacity-50'>📱</div>
                <h3 className='text-muted fw-bold'>Ready to Scan</h3>
                <p className='text-muted' style={{ maxWidth:'400px', margin:'0 auto' }}>
                  Use the <strong>camera scanner</strong> to scan a barcode, or <strong>type a barcode</strong> in the search box. All entity types are supported.
                </p>
              </div>
            )}

            {!loading && !error && details && (
              <div style={{animation:'slideUp .3s ease'}}>
                <div className='card shadow-sm border-0 mb-4'>
                  <div className='card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-4'>
                    <div className='d-flex align-items-center gap-4'>
                      <div className='text-center px-4 py-3 bg-light rounded border border-light shadow-sm'>
                        {barcodeVal
                          ? <Barcode value={barcodeVal} width={1.5} height={45} fontSize={12} margin={0} background='transparent'/>
                          : <span className='text-muted small'>No visual</span>}
                      </div>
                      <div>
                        <Badge label={(typeMeta?.icon||'')+' '+typeMeta?.label} color={typeMeta?.color} text={typeMeta?.text}/>
                        <h2 className='m-0 mt-2 fw-bolder text-dark'>{entityLabel}</h2>
                      </div>
                    </div>
                    <button className='btn text-white scan-again fw-bold px-4 py-2 shadow-sm'
                      onClick={() => { setDetails(null); setError(null); setActiveBarcode(''); setManualInput(''); setTimeout(() => inputRef.current?.focus(), 50); }}
                      style={{ background:'#6366f1', borderRadius:'8px' }}>
                      🔄 Scan Another
                    </button>
                  </div>
                </div>

                {renderDetails(details, (code) => {
                  setManualInput(code);
                  setActiveBarcode(code);
                  fetchDetails(code);
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Unknown Barcode Item Registration Popup ── */}
      {showRegisterPopup && (
        <div className='modal-backdrop bg-dark bg-opacity-75 d-flex justify-content-center align-items-center p-3' style={{zIndex:1050, position:'fixed', top:0, left:0, width:'100%', height:'100%'}}>
          <div className='card shadow-lg border-0 w-100' style={{ maxWidth:'650px', maxHeight:'90vh', overflowY:'auto' }}>
            <div className='card-header bg-white p-4 border-bottom-0'>
              <h4 className='text-danger fw-bold m-0'>❌ Unknown Barcode Scanned</h4>
              <p className='text-muted mt-2 mb-0'>
                The barcode <strong className='bg-light px-2 py-1 rounded'>{unknownBarcode}</strong> is not registered. Fill out the details below to save it as a new Item.
              </p>
            </div>
            <div className='card-body p-4 pt-0'>
              <form onSubmit={handleCreateProduct}>
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label small fw-bold text-muted m-0'>Description *</label>
                    <input type='text' className='form-control bg-light' required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label small fw-bold text-muted m-0'>Category *</label>
                    <input type='text' className='form-control bg-light' required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label small fw-bold text-muted m-0'>UOM *</label>
                    <input type='text' className='form-control bg-light' required value={productForm.uom} onChange={e => setProductForm({...productForm, uom: e.target.value})} />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label small fw-bold text-muted m-0'>Unit Price (₹) *</label>
                    <input type='number' className='form-control bg-light' required value={productForm.unitPrice} onChange={e => setProductForm({...productForm, unitPrice: e.target.value})} />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label small fw-bold text-muted m-0'>Safety Stock</label>
                    <input type='number' className='form-control bg-light' value={productForm.safetyStock} onChange={e => setProductForm({...productForm, safetyStock: e.target.value})} />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label small fw-bold text-muted m-0'>Serial Prefix</label>
                    <input type='text' className='form-control bg-light' value={productForm.serialPrefix} onChange={e => setProductForm({...productForm, serialPrefix: e.target.value})} />
                  </div>
                </div>
                <div className='d-flex justify-content-end gap-2 mt-4 pt-3 border-top'>
                  <button type='button' className='btn btn-light fw-bold text-muted px-4' onClick={() => setShowRegisterPopup(false)}>Cancel</button>
                  <button type='submit' className='btn btn-success fw-bold px-4 shadow-sm'>Save & Continue</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
