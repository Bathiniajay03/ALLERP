import React, { useState } from 'react';

const MODULES_DATA = [
  {
    category: "Sales & CRM",
    icon: "bi-cart-check",
    description: "Manage client relations, incoming orders, and customer databases.",
    items: [
      { name: "Order Management", path: "/order-management", desc: "Oversees the lifecycle of client orders, fulfillment pipelines, and general order dispatch progress tracking." },
      { name: "Sales Orders", path: "/sales-orders/list", desc: "A searchable historical log of all client orders, showing payment status, shipment state, and invoices." },
      { name: "Create Order", path: "/sales-orders/create", desc: "An interactive form to generate a new sales order with line item selection, discounts, and customer lookup." },
      { name: "Customers", path: "/customers", desc: "A directory of registered buyer profiles, showing their order histories, shipping details, and outstanding balances." }
    ]
  },
  {
    category: "Vendor Portal",
    icon: "bi-shop",
    description: "Handle supply chain operations, outbound purchase orders, and returns.",
    items: [
      { name: "Vendors", path: "/vendors", desc: "Maintains records of suppliers, product catalogues, lead times, and contact information." },
      { name: "Purchase Orders", path: "/purchase-orders", desc: "Allows ordering restock inventory from vendors, generating PDF PO slips, and receiving warehouse shipments." },
      { name: "Returns", path: "/vendor-returns", desc: "Logs damaged or surplus inventory returns back to suppliers, tracking reimbursement or replacement states." }
    ]
  },
  {
    category: "Warehouse & Lots",
    icon: "bi-box-seam",
    description: "Track inventory holdings, multi-warehouse topology, and lot/serial tracing.",
    items: [
      { name: "Stock Inventory", path: "/inventory", desc: "Real-time overview of item quantities across bins, tracking average costs, UOMs, and reorder levels." },
      { name: "Lots (Batches)", path: "/lots", desc: "Traces specific inventory batches/lots, tracking manufacturing dates, expiry dates, and batch quality checks." },
      { name: "Warehouses", path: "/warehouses", desc: "Manages warehouse buildings, physical addresses, storage capacities, and operational layouts." },
      { name: "Order Flow (Operations)", path: "/operations", desc: "Visual flow mapping showing physical movement of items from entry receiving to order packaging and shipping." }
    ]
  },
  {
    category: "Finance & Data",
    icon: "bi-cash-coin",
    description: "Analyze cash flow, run system audits, and setup inventory safety margins.",
    items: [
      { name: "Finance & Payments", path: "/finance", desc: "Tracks general accounts receivables/payables, customer invoice payments, and supplier payouts." },
      { name: "Reports", path: "/reports", desc: "Generates visual data charts, sales logs, profit margin sheets, and inventory turnover reports." },
      { name: "Stock Alerts", path: "/stock-alerts", desc: "Sets minimum threshold triggers for items, flashing alerts when stock drops below safety margins." }
    ]
  },
  {
    category: "Enterprise WMS",
    icon: "bi-building-gear",
    description: "Advanced Warehouse Management Suite incorporating automated scanners and layout topology.",
    items: [
      { name: "WMS Dashboard", path: "/wms/dashboard", desc: "Central control tower for WMS, showing capacity utilization, task queues, active pickers, and error logs." },
      { name: "Manual Put Away", path: "/wms/putaway", desc: "Allows staff to manually assign incoming stock to designated bins based on zone logic." },
      { name: "Bin Transfer", path: "/wms/transfer", desc: "Logs the physical movement of inventory from one warehouse bin to another to optimize space." },
      { name: "WMS Topology Map", path: "/wms/setup", desc: "Setup tool to define warehouse zones, aisles, racks, shelves, and individual bins." },
      { name: "Barcode Generator", path: "/wms/barcode-generator", desc: "Creates printable standard barcode labels for items, lots, serial numbers, and physical bin shelves." }
    ]
  },
  {
    category: "Local AI Hub",
    icon: "bi-cpu",
    description: "SaaS predictive models, intelligent stock suggestions, and assistant chats.",
    items: [
      { name: "Local AI Page", path: "/local-ai", desc: "Provides AI-driven forecasting for inventory levels, automated purchase order drafts, and natural language query processing." }
    ]
  },
  {
    category: "⚡ Super Admin Portal",
    icon: "bi-shield-lock",
    description: "Global system control tower for managing tenants, backups, and audits.",
    items: [
      { name: "Global Dashboard", path: "/super-admin/dashboard", desc: "SaaS manager displaying active subscribers, storage allocations, API logs, and new company onboarding wizards." },
      { name: "System Audit Trail", path: "/super-admin/audit", desc: "Tracks all administrative actions across the entire tenant ecosystem for security audits." },
      { name: "Disaster Recovery", path: "/super-admin/backups", desc: "Initiates manual MySQL database backups, displays backup histories, and restores previous database states." },
      { name: "System Error Logs", path: "/super-admin/logs", desc: "Monitors global C# backend runtime exceptions and StackTrace details in real-time." },
      { name: "Support Chats Inbox", path: "/super-admin/chats", desc: "Interact with live company clients and landing page visitors in a unified support chat console." }
    ]
  }
];

export default function ModuleGuide() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModules = MODULES_DATA.map(group => {
    const matchingItems = group.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (matchingItems.length > 0 || group.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return { ...group, items: matchingItems.length > 0 ? matchingItems : group.items };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="container-fluid py-4" style={{ minHeight: "90vh", backgroundColor: "#f8fafc" }}>
      
      {/* Header Banner */}
      <div className="card border-0 rounded-4 shadow-sm p-4 mb-4 text-white" style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-3">
            <i className="bi bi-book-half fs-1 text-white"></i>
          </div>
          <div>
            <h2 className="fw-bold m-0 text-white">MIND ERP Module Guide</h2>
            <p className="m-0 text-white-50 mt-1">Explore all application modules, page functionalities, and usage details.</p>
          </div>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="card border-0 rounded-3 shadow-sm p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 text-muted">
            <i className="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            className="form-control border-start-0 ps-1 py-2 shadow-none" 
            placeholder="Search pages, modules, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Documentation Grid */}
      <div className="row g-4">
        {filteredModules.map((group, gIdx) => (
          <div key={gIdx} className="col-12 col-xl-6">
            <div className="card h-100 border-0 rounded-3 shadow-sm p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-2 rounded bg-indigo-50 text-primary" style={{ backgroundColor: "rgba(79, 70, 229, 0.08)" }}>
                  <i className={`bi ${group.icon} fs-3`}></i>
                </div>
                <div>
                  <h4 className="fw-bold m-0 text-dark">{group.category}</h4>
                  <span className="text-muted small">{group.description}</span>
                </div>
              </div>
              
              <hr className="my-2 opacity-10" />

              <div className="mt-3">
                {group.items.length === 0 ? (
                  <p className="text-muted italic small">No matching pages found under this module.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="p-3 rounded border border-light bg-light bg-opacity-40">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold text-primary">{item.name}</span>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: "0.75rem" }}>
                            {item.path}
                          </span>
                        </div>
                        <p className="text-muted m-0 small" style={{ lineHeight: "1.4" }}>
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredModules.length === 0 && (
          <div className="col-12 text-center py-5">
            <i className="bi bi-file-earmark-break fs-1 text-muted"></i>
            <h5 className="fw-bold mt-3">No modules match your search query</h5>
            <p className="text-muted small">Try using general terms like 'WMS', 'PO', 'Backup', or 'Sales'.</p>
          </div>
        )}
      </div>

    </div>
  );
}
