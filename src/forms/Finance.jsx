import React, { useEffect, useMemo, useState } from "react";
import { smartErpApi } from "../services/smartErpApi";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [vendorReturns, setVendorReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dailyRange, setDailyRange] = useState(7);
  const [txFilter, setTxFilter] = useState({ type: "all", customer: "", dateFrom: "", dateTo: "" });
  const [formData, setFormData] = useState({ salesOrderId: "", amount: "", paymentMethod: "Credit Card", reference: "" });

  useEffect(() => { loadAllFinanceData(); }, []);

  const loadAllFinanceData = async () => {
    setLoading(true);
    try {
      const [txRes, vrRes, invRes, pmRes, custRes, soRes] = await Promise.allSettled([
        smartErpApi.reportsTransactions(), smartErpApi.getVendorReturns(),
        smartErpApi.getInvoices(), smartErpApi.getPayments(),
        smartErpApi.getCustomers(), smartErpApi.getSalesOrders()
      ]);
      if (txRes.status === "fulfilled") {
        setTransactions((txRes.value.data || []).map(tx => ({
          ...tx, quantity: Number(tx.quantity || tx.Quantity || 0),
          transactionType: tx.transactionType || tx.TransactionType || "MOVE",
          lotNumber: tx.lotNumber || tx.LotNumber, itemName: tx.itemName || tx.itemCode || `Item-${tx.itemId}`,
          transactionDate: tx.transactionDate || tx.TransactionDate
        })));
      }
      if (vrRes.status === "fulfilled") setVendorReturns(vrRes.value.data || []);
      if (invRes.status === "fulfilled") setInvoices(invRes.value.data || []);
      if (pmRes.status === "fulfilled") setPayments(pmRes.value.data || []);
      if (custRes.status === "fulfilled") {
        const d = custRes.value.data || []; setCustomers(d);
        if (d.length > 0 && selectedCustomerId === null) setSelectedCustomerId(d[0].id);
      }
      if (soRes.status === "fulfilled") setSalesOrders(soRes.value.data || []);
      setError("");
    } catch (err) { setError("Failed to load financial records."); console.error(err); }
    finally { setLoading(false); }
  };

  const openOrderDetail = async (salesOrderId) => {
    setShowDetailModal(true); setDetailLoading(true); setOrderDetails(null);
    try {
      const res = await smartErpApi.getSalesOrder(salesOrderId);
      setOrderDetails(res.data);
    } catch (e) { console.error(e); }
    finally { setDetailLoading(false); }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await smartErpApi.recordSalesPayment({
        salesOrderId: Number(formData.salesOrderId), amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod, transactionReference: formData.reference
      });
      alert("Payment recorded successfully!");
      setShowPaymentModal(false);
      setFormData({ salesOrderId: "", amount: "", paymentMethod: "Credit Card", reference: "" });
      loadAllFinanceData();
    } catch (err) { alert("Failed to record payment: " + err.message); }
  };

  // ─── COMPUTED VALUES ──────────────────────────────────────────────
  const totalInvoiced = useMemo(() => invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0), [invoices]);
  const totalCollected = useMemo(() => payments.reduce((s, p) => s + Number(p.amount || 0), 0), [payments]);
  const totalOutstanding = useMemo(() => customers.reduce((s, c) => s + Number(c.outstandingBalance || 0), 0), [customers]);
  const collectionRate = useMemo(() => totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : "0.0", [totalInvoiced, totalCollected]);

  const filteredCustomers = useMemo(() => customers.filter(c => {
    const q = customerFilter.toLowerCase();
    return c.companyName?.toLowerCase().includes(q) || c.customerCode?.toLowerCase().includes(q) || c.contactPerson?.toLowerCase().includes(q);
  }), [customers, customerFilter]);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === Number(selectedCustomerId)) || null, [customers, selectedCustomerId]);

  const customerSalesOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return salesOrders.filter(so =>
      so.customerId === selectedCustomer.id ||
      (so.customerName || "").trim().toLowerCase() === (selectedCustomer.companyName || "").trim().toLowerCase()
    );
  }, [selectedCustomer, salesOrders]);

  const customerLedger = useMemo(() => {
    if (!selectedCustomer) return [];
    const soIds = customerSalesOrders.map(so => so.id);
    const ledger = [];
    invoices.filter(inv => soIds.includes(inv.salesOrderId)).forEach(inv => {
      ledger.push({ id: `inv-${inv.id}`, date: new Date(inv.createdAt), type: "Invoice", reference: inv.invoiceNumber,
        details: `Invoice for SO #${inv.salesOrderId}`, debit: Number(inv.totalAmount), credit: 0,
        salesOrderId: inv.salesOrderId, salesOrderNumber: inv.salesOrderNumber });
    });
    payments.filter(p => soIds.includes(p.salesOrderId)).forEach(p => {
      ledger.push({ id: `pay-${p.id}`, date: new Date(p.createdAt), type: "Payment", reference: p.transactionReference,
        details: `${p.paymentMethod} (${p.status})`, debit: 0, credit: Number(p.amount),
        salesOrderId: p.salesOrderId, salesOrderNumber: p.orderNumber });
    });
    ledger.sort((a, b) => a.date.getTime() - b.date.getTime());
    let bal = 0;
    return ledger.map(tx => { bal += tx.debit - tx.credit; return { ...tx, balance: bal }; });
  }, [selectedCustomer, customerSalesOrders, invoices, payments]);

  const dailyCollections = useMemo(() => {
    const map = {};
    const now = new Date(); const start = new Date(now); start.setDate(start.getDate() - dailyRange);
    payments.forEach(p => {
      const d = new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      if (!map[d]) map[d] = { date: new Date(p.createdAt), count: 0, total: 0, methods: {} };
      map[d].count++; map[d].total += Number(p.amount || 0);
      const m = p.paymentMethod || "Other"; map[d].methods[m] = (map[d].methods[m] || 0) + Number(p.amount || 0);
    });
    return Object.values(map).filter(r => r.date >= start).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [payments, dailyRange]);

  const monthlyCollections = useMemo(() => {
    const map = {};
    payments.forEach(p => {
      const d = new Date(p.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      if (!map[key]) map[key] = { key, label, date: d, count: 0, total: 0, methods: {} };
      map[key].count++; map[key].total += Number(p.amount || 0);
      const m = p.paymentMethod || "Other"; map[key].methods[m] = (map[key].methods[m] || 0) + Number(p.amount || 0);
    });
    return Object.values(map).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [payments]);

  // ALL TRANSACTIONS NOW INCLUDES RAW TRANSACTIONS + INVOICES + PAYMENTS
  const allFinancialTx = useMemo(() => {
    const list = [];
    
    // Add raw transactions
    transactions.forEach(tx => {
      list.push({ 
        id: `tx-${tx.id || Math.random()}`, 
        date: new Date(tx.transactionDate || tx.createdAt || new Date()), 
        type: tx.transactionType || "Transaction", 
        reference: tx.reference || tx.id || "N/A",
        amount: Number(tx.amount || 0), 
        direction: tx.amount > 0 ? "debit" : "credit", 
        customer: tx.customerName || "N/A",
        salesOrderId: tx.salesOrderId, 
        orderNumber: tx.orderNumber, 
        status: tx.status || "Completed" 
      });
    });

    // Add Invoices
    invoices.forEach(inv => {
      const so = salesOrders.find(s => s.id === inv.salesOrderId);
      list.push({ 
        id: `inv-${inv.id}`, 
        date: new Date(inv.createdAt), 
        type: "Invoice", 
        reference: inv.invoiceNumber,
        amount: Number(inv.totalAmount), 
        direction: "debit", 
        customer: so?.customerName || "N/A",
        salesOrderId: inv.salesOrderId, 
        orderNumber: inv.salesOrderNumber || so?.orderNumber, 
        status: so?.status || "N/A" 
      });
    });

    // Add Payments
    payments.forEach(p => {
      list.push({ 
        id: `pay-${p.id}`, 
        date: new Date(p.createdAt), 
        type: "Payment", 
        reference: p.transactionReference,
        amount: Number(p.amount), 
        direction: "credit", 
        customer: p.customerName || "N/A",
        salesOrderId: p.salesOrderId, 
        orderNumber: p.orderNumber, 
        status: p.status 
      });
    });

    // Safely sort using getTime()
    list.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply Filters
    return list.filter(tx => {
      if (txFilter.type !== "all" && tx.type !== txFilter.type) return false;
      if (txFilter.customer && !(tx.customer || "").toLowerCase().includes(txFilter.customer.toLowerCase())) return false;
      if (txFilter.dateFrom && tx.date < new Date(txFilter.dateFrom)) return false;
      if (txFilter.dateTo && tx.date > new Date(txFilter.dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [invoices, payments, salesOrders, transactions, txFilter]); // Added transactions to dependency array

  const customerReceivables = useMemo(() => {
    return customers.filter(c => Number(c.outstandingBalance || 0) > 0).map(c => {
      const orders = salesOrders.filter(so =>
        so.customerId === c.id || (so.customerName || "").trim().toLowerCase() === (c.companyName || "").trim().toLowerCase()
      );
      const custInvoices = invoices.filter(inv => orders.some(o => o.id === inv.salesOrderId));
      const custPayments = payments.filter(p => orders.some(o => o.id === p.salesOrderId));
      const totalInv = custInvoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
      const totalPaid = custPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
      const unpaid = custInvoices.filter(i => {
        const paidForInv = payments.filter(p => p.salesOrderId === i.salesOrderId).reduce((s, p) => s + Number(p.amount || 0), 0);
        return paidForInv < Number(i.totalAmount || 0);
      });
      const days = unpaid.length > 0 ? Math.max(...unpaid.map(i => Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000))) : 0;
      return { ...c, totalInvoiced: totalInv, totalPaid, outstanding: Number(c.outstandingBalance || 0), invoiceCount: custInvoices.length, daysOverdue: days, orderCount: orders.length };
    }).sort((a, b) => b.outstanding - a.outstanding);
  }, [customers, salesOrders, invoices, payments]);

  const TABS = [
    { id: "overview", label: "Financial Overview", icon: "📊" },
    { id: "receivables", label: "Customer Receivables", icon: "💰" },
    { id: "transactions", label: "All Transactions", icon: "📋" },
    { id: "collections", label: "Daily & Monthly", icon: "📅" },
  ];

  return (
    <div className="fin-wrapper bg-light min-vh-100 pb-5 pt-3">
      <div className="container-fluid px-4">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-end bg-white p-3 rounded shadow-sm mb-3 border-bottom">
          <div>
            <h4 className="fw-bold m-0 text-dark">Finance & Accounts</h4>
            <span className="small text-muted text-uppercase">Complete Financial Management · Receivables · Collections</span>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm fw-bold" onClick={loadAllFinanceData} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : "↻"} Refresh
            </button>
            <button className="btn btn-primary btn-sm fw-bold px-3" onClick={() => setShowPaymentModal(true)}>+ Record Payment</button>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 mb-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold">{error}</span>
          <button className="btn-close btn-sm" onClick={() => setError("")}></button>
        </div>}

        {/* TABS */}
        <div className="bg-white rounded shadow-sm mb-3">
          <ul className="nav nav-tabs border-0">
            {TABS.map(t => (
              <li key={t.id} className="nav-item">
                <button className={`nav-link fw-bold px-4 py-3 border-0 rounded-0 ${activeTab === t.id ? "active" : "text-muted"}`}
                  style={{ background: "none", borderBottom: activeTab === t.id ? "3px solid #0f4c81" : "none", color: activeTab === t.id ? "#0f4c81" : "#6c757d" }}
                  onClick={() => setActiveTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* TAB 1: FINANCIAL OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div className="row g-3 mb-4">
              {[
                { label: "Total Revenue Invoiced", value: `₹${totalInvoiced.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#0d6efd", sub: `${invoices.length} invoices` },
                { label: "Total Collections", value: `₹${totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#198754", sub: `${payments.length} payments` },
                { label: "Outstanding Receivables", value: `₹${totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#dc3545", sub: `${customerReceivables.length} customers` },
                { label: "Collection Rate", value: `${collectionRate}%`, color: "#6f42c1", sub: "of invoiced amount" },
              ].map((kpi, i) => (
                <div key={i} className="col-md-3">
                  <div className="bg-white p-3 rounded shadow-sm" style={{ borderLeft: `5px solid ${kpi.color}` }}>
                    <span className="fin-label">{kpi.label}</span>
                    <div className="d-flex justify-content-between align-items-end mt-2">
                      <span className="h4 fw-bold m-0" style={{ color: kpi.color }}>{kpi.value}</span>
                      <span className="fin-sub">{kpi.sub}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              <div className="col-xl-8">
                <div className="bg-white shadow-sm rounded" style={{ height: 420, display: "flex", flexDirection: "column" }}>
                  <div className="border-bottom p-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Recent Payments Received</span>
                    <span className="badge bg-success">{payments.length} total</span>
                  </div>
                  <div className="table-responsive flex-grow-1 overflow-auto">
                    {loading ? <div className="d-flex align-items-center justify-content-center h-100"><div className="spinner-border text-primary" /></div> : (
                      <table className="table table-hover align-middle mb-0 fin-table">
                        <thead className="table-light sticky-top">
                          <tr><th>Date</th><th>Customer</th><th>Order</th><th>Method</th><th className="text-end">Amount</th><th>Status</th><th>Details</th></tr>
                        </thead>
                        <tbody>
                          {payments.slice(0, 50).map(p => (
                            <tr key={p.id}>
                              <td className="text-muted small">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                              <td className="fw-bold">{p.customerName || "—"}</td>
                              <td className="font-monospace small">{p.orderNumber || `SO-${p.salesOrderId}`}</td>
                              <td><span className="badge bg-light text-dark border">{p.paymentMethod}</span></td>
                              <td className="text-end font-monospace fw-bold text-success">₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                              <td><span className={`badge ${p.status === "Captured" ? "bg-success" : "bg-warning"}`}>{p.status}</span></td>
                              <td><button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => openOrderDetail(p.salesOrderId)}>View →</button></td>
                            </tr>
                          ))}
                          {payments.length === 0 && <tr><td colSpan="7" className="text-center py-4 text-muted">No payments recorded yet.</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-xl-4">
                <div className="bg-white shadow-sm rounded" style={{ height: 420, display: "flex", flexDirection: "column" }}>
                  <div className="border-bottom p-3"><span className="fw-bold">Top Outstanding Customers</span></div>
                  <div className="flex-grow-1 overflow-auto">
                    {customerReceivables.slice(0, 10).map((c, i) => (
                      <div key={c.id} className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom cursor-pointer" onClick={() => { setSelectedCustomerId(c.id); setActiveTab("receivables"); }}>
                        <div>
                          <div className="fw-bold small">{i + 1}. {c.companyName}</div>
                          <div className="fin-sub">{c.customerCode} · {c.invoiceCount} invoices</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-danger font-monospace small">₹{c.outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                          {c.daysOverdue > 0 && <span className="badge bg-danger" style={{ fontSize: "0.6rem" }}>{c.daysOverdue}d overdue</span>}
                        </div>
                      </div>
                    ))}
                    {customerReceivables.length === 0 && <div className="text-center py-5 text-muted small">No outstanding receivables.</div>}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: CUSTOMER RECEIVABLES */}
        {activeTab === "receivables" && (
          <>
            <div className="row g-3 mb-4">
              {[
                { label: "Total Receivables", value: `₹${totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#dc3545" },
                { label: "Customers with Dues", value: customerReceivables.length, color: "#fd7e14" },
                { label: "Total Invoiced", value: `₹${totalInvoiced.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#0d6efd" },
                { label: "Total Collected", value: `₹${totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#198754" },
              ].map((k, i) => (
                <div key={i} className="col-md-3">
                  <div className="bg-white p-3 rounded shadow-sm" style={{ borderLeft: `5px solid ${k.color}` }}>
                    <span className="fin-label">{k.label}</span>
                    <span className="h4 fw-bold d-block mt-1" style={{ color: k.color }}>{k.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              <div className="col-xl-5">
                <div className="bg-white shadow-sm rounded" style={{ height: 680, display: "flex", flexDirection: "column" }}>
                  <div className="border-bottom p-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Customer Receivables Directory</span>
                    <input type="text" className="form-control form-control-sm w-50" placeholder="Search..." value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} />
                  </div>
                  <div className="table-responsive flex-grow-1 overflow-auto">
                    <table className="table table-hover align-middle mb-0 fin-table">
                      <thead className="table-light sticky-top">
                        <tr><th>Code</th><th>Customer</th><th className="text-end">Invoiced</th><th className="text-end">Paid</th><th className="text-end">Due</th></tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map(c => {
                          const cr = customerReceivables.find(x => x.id === c.id);
                          return (
                            <tr key={c.id} className={selectedCustomerId === c.id ? "table-primary cursor-pointer" : "cursor-pointer"} onClick={() => setSelectedCustomerId(c.id)}>
                              <td className="font-monospace small text-muted">{c.customerCode}</td>
                              <td><div className="fw-bold">{c.companyName}</div><div className="fin-sub">{c.contactPerson}</div></td>
                              <td className="text-end font-monospace small">₹{(cr?.totalInvoiced || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                              <td className="text-end font-monospace small text-success">₹{(cr?.totalPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                              <td className={`text-end font-monospace fw-bold ${Number(c.outstandingBalance || 0) > 0 ? "text-danger" : "text-success"}`}>
                                ₹{Number(c.outstandingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredCustomers.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No customers found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-xl-7">
                <div className="bg-white shadow-sm rounded" style={{ height: 680, display: "flex", flexDirection: "column" }}>
                  {selectedCustomer ? (
                    <>
                      <div className="p-3 text-white" style={{ backgroundColor: "#1e3a5f" }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="badge bg-primary mb-1">{selectedCustomer.customerCode}</span>
                            <h6 className="fw-bold m-0">{selectedCustomer.companyName}</h6>
                            <div className="small mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                              📞 {selectedCustomer.phone || "N/A"} · ✉ {selectedCustomer.email || "N/A"}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fin-sub" style={{ color: "rgba(255,255,255,0.6)" }}>Outstanding Balance</div>
                            <h5 className="fw-bold text-warning m-0">₹{Number(selectedCustomer.outstandingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h5>
                            <div className="fin-sub" style={{ color: "rgba(255,255,255,0.6)" }}>Credit: ₹{Number(selectedCustomer.creditLimit || 0).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      </div>
                      <div className="border-bottom p-2 fw-bold text-uppercase fin-label">Statement of Account</div>
                      <div className="table-responsive flex-grow-1 overflow-auto">
                        <table className="table table-hover mb-0 fin-table">
                          <thead className="table-light sticky-top">
                            <tr><th>Date</th><th>Doc Ref</th><th>Details</th><th className="text-end">Debit (+)</th><th className="text-end">Credit (−)</th><th className="text-end">Balance</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {customerLedger.length === 0 ? (
                              <tr><td colSpan="7" className="text-center py-4 text-muted">No transactions for this customer.</td></tr>
                            ) : customerLedger.map(tx => (
                              <tr key={tx.id}>
                                <td className="text-muted small">{tx.date.toLocaleDateString("en-IN")}</td>
                                <td><span className={`badge ${tx.type === "Invoice" ? "bg-light text-dark border" : "bg-success"}`}>{tx.type}</span>
                                  <div className="font-monospace small fw-bold mt-1">{tx.reference}</div></td>
                                <td className="small text-muted">{tx.details}</td>
                                <td className="text-end font-monospace">{tx.debit > 0 ? `₹${tx.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                                <td className="text-end font-monospace text-success">{tx.credit > 0 ? `₹${tx.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                                <td className={`text-end font-monospace fw-bold ${tx.balance > 0 ? "text-danger" : "text-success"}`}>₹{tx.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                <td><button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => openOrderDetail(tx.salesOrderId)}>View →</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                      <span className="fs-1 mb-2">👥</span><h6>Select a customer to view their statement of account.</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: ALL TRANSACTIONS */}
        {activeTab === "transactions" && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-2">
                <select className="form-select form-select-sm" value={txFilter.type} onChange={e => setTxFilter({ ...txFilter, type: e.target.value })}>
                  <option value="all">All Types</option>
                  <option value="Invoice">Invoices Only</option>
                  <option value="Payment">Payments Only</option>
                </select>
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control form-control-sm" placeholder="Filter by customer..." value={txFilter.customer} onChange={e => setTxFilter({ ...txFilter, customer: e.target.value })} />
              </div>
              <div className="col-md-2">
                <input type="date" className="form-control form-control-sm" value={txFilter.dateFrom} onChange={e => setTxFilter({ ...txFilter, dateFrom: e.target.value })} />
              </div>
              <div className="col-md-2">
                <input type="date" className="form-control form-control-sm" value={txFilter.dateTo} onChange={e => setTxFilter({ ...txFilter, dateTo: e.target.value })} />
              </div>
              <div className="col-md-3 d-flex align-items-center">
                <span className="fin-sub">Showing <strong>{allFinancialTx.length}</strong> transactions</span>
              </div>
            </div>
            <div className="bg-white shadow-sm rounded" style={{ height: 600, display: "flex", flexDirection: "column" }}>
              <div className="table-responsive flex-grow-1 overflow-auto">
                <table className="table table-hover align-middle mb-0 fin-table">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Date</th><th>Type</th><th>Reference</th><th>Customer</th><th>Order</th><th>Status</th><th className="text-end">Debit</th><th className="text-end">Credit</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFinancialTx.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-4 text-muted">No transactions found.</td></tr>
                    ) : allFinancialTx.map(tx => (
                      <tr key={tx.id}>
                        <td className="text-muted small">{tx.date.toLocaleDateString("en-IN")} <span className="fin-sub">{tx.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></td>
                        <td><span className={`badge ${tx.type === "Invoice" ? "bg-info" : "bg-success"}`}>{tx.type}</span></td>
                        <td className="font-monospace small fw-bold">{tx.reference}</td>
                        <td className="fw-bold">{tx.customer}</td>
                        <td className="font-monospace small">{tx.orderNumber || (tx.salesOrderId ? `SO-${tx.salesOrderId}` : "—")}</td>
                        <td><span className={`badge ${tx.status === "Paid" || tx.status === "Captured" ? "bg-success" : tx.status === "Delivered" || tx.status === "Shipped" ? "bg-primary" : "bg-warning"}`}>{tx.status}</span></td>
                        <td className="text-end font-monospace">{tx.direction === "debit" ? `₹${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                        <td className="text-end font-monospace text-success">{tx.direction === "credit" ? `₹${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                        <td>
                          {tx.salesOrderId && (
                            <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => openOrderDetail(tx.salesOrderId)}>Details →</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 4: DAILY & MONTHLY COLLECTIONS */}
        {activeTab === "collections" && (
          <>
            <div className="row g-4">
              <div className="col-xl-6">
                <div className="bg-white shadow-sm rounded" style={{ height: 580, display: "flex", flexDirection: "column" }}>
                  <div className="border-bottom p-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Daily Collections</span>
                    <select className="form-select form-select-sm w-auto" value={dailyRange} onChange={e => setDailyRange(Number(e.target.value))}>
                      <option value={7}>Last 7 Days</option><option value={14}>Last 14 Days</option><option value={30}>Last 30 Days</option><option value={90}>Last 90 Days</option>
                    </select>
                  </div>
                  <div className="p-3 border-bottom d-flex gap-4">
                    <div><span className="fin-label">Total Collected ({dailyRange}d)</span><span className="h5 fw-bold text-success d-block">₹{dailyCollections.reduce((s, d) => s + d.total, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                    <div><span className="fin-label">Total Payments</span><span className="h5 fw-bold text-primary d-block">{dailyCollections.reduce((s, d) => s + d.count, 0)}</span></div>
                    <div><span className="fin-label">Avg / Day</span><span className="h5 fw-bold text-dark d-block">₹{dailyCollections.length > 0 ? (dailyCollections.reduce((s, d) => s + d.total, 0) / dailyCollections.length).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}</span></div>
                  </div>
                  <div className="table-responsive flex-grow-1 overflow-auto">
                    <table className="table table-hover align-middle mb-0 fin-table">
                      <thead className="table-light sticky-top"><tr><th>Date</th><th className="text-center">Payments</th><th className="text-end">Total Collected</th><th>Breakdown</th></tr></thead>
                      <tbody>
                        {dailyCollections.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-muted">No collections in this period.</td></tr> :
                          dailyCollections.map((d, i) => (
                            <tr key={i}>
                              <td className="fw-bold">{d.date.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</td>
                              <td className="text-center"><span className="badge bg-primary">{d.count}</span></td>
                              <td className="text-end font-monospace fw-bold text-success">₹{d.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                              <td>{Object.entries(d.methods).map(([m, v]) => <span key={m} className="badge bg-light text-dark border me-1" style={{ fontSize: "0.6rem" }}>{m}: ₹{Number(v).toLocaleString("en-IN")}</span>)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-xl-6">
                <div className="bg-white shadow-sm rounded" style={{ height: 580, display: "flex", flexDirection: "column" }}>
                  <div className="border-bottom p-3"><span className="fw-bold">Monthly Collections Summary</span></div>
                  <div className="p-3 border-bottom d-flex gap-4">
                    <div><span className="fin-label">Grand Total</span><span className="h5 fw-bold text-success d-block">₹{monthlyCollections.reduce((s, m) => s + m.total, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                    <div><span className="fin-label">Total Months</span><span className="h5 fw-bold text-primary d-block">{monthlyCollections.length}</span></div>
                    <div><span className="fin-label">Best Month</span><span className="h5 fw-bold text-dark d-block">{monthlyCollections.length > 0 ? `₹${Math.max(...monthlyCollections.map(m => m.total)).toLocaleString("en-IN")}` : "₹0"}</span></div>
                  </div>
                  <div className="table-responsive flex-grow-1 overflow-auto">
                    <table className="table table-hover align-middle mb-0 fin-table">
                      <thead className="table-light sticky-top"><tr><th>Month</th><th className="text-center">Payments</th><th className="text-end">Total Collected</th><th>By Method</th></tr></thead>
                      <tbody>
                        {monthlyCollections.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-muted">No monthly data.</td></tr> :
                          monthlyCollections.map(m => (
                            <tr key={m.key}>
                              <td className="fw-bold">{m.label}</td>
                              <td className="text-center"><span className="badge bg-info">{m.count}</span></td>
                              <td className="text-end font-monospace fw-bold text-success">₹{m.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                              <td>{Object.entries(m.methods).map(([k, v]) => <div key={k} className="fin-sub">{k}: <span className="fw-bold">₹{Number(v).toLocaleString("en-IN")}</span></div>)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      {showDetailModal && (
        <div className="fin-overlay">
          <div className="fin-modal fin-modal-lg">
            <div className="fin-modal-header">
              <h6 className="m-0 fw-bold">📦 Complete Order Details — End to End Lifecycle</h6>
              <button className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
            </div>
            <div className="fin-modal-body">
              {detailLoading ? (
                <div className="d-flex align-items-center justify-content-center py-5"><div className="spinner-border text-primary" /></div>
              ) : orderDetails ? (
                <>
                  {/* Order Summary */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ backgroundColor: "#f0f4f8" }}>
                        <div className="fin-label">Order Information</div>
                        <div className="mt-2"><span className="fw-bold fs-5">{orderDetails.orderNumber}</span></div>
                        <div className="small mt-1">Customer: <strong>{orderDetails.customerName}</strong></div>
                        <div className="small">Created: {new Date(orderDetails.createdAt).toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ backgroundColor: "#f0f4f8" }}>
                        <div className="fin-label">Financial Summary</div>
                        <div className="d-flex justify-content-between mt-2 small"><span>Subtotal:</span><span className="font-monospace">₹{Number(orderDetails.subTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                        <div className="d-flex justify-content-between small"><span>Tax (18%):</span><span className="font-monospace">₹{Number(orderDetails.taxAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                        <div className="d-flex justify-content-between fw-bold mt-1 pt-1 border-top"><span>Total:</span><span className="font-monospace text-primary">₹{Number(orderDetails.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                        <div className="mt-2"><span className={`badge ${orderDetails.paymentStatus === "Paid" ? "bg-success" : orderDetails.paymentStatus === "Partially Paid" ? "bg-warning" : "bg-danger"}`}>{orderDetails.paymentStatus}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-4">
                    <div className="fw-bold mb-2 small text-uppercase">Order Items</div>
                    <table className="table table-sm fin-table mb-0">
                      <thead className="table-light">
                        <tr><th>#</th><th>Item Code</th><th>Warehouse</th><th className="text-end">Qty</th><th className="text-end">Unit Price</th><th className="text-end">Line Total</th></tr>
                      </thead>
                      <tbody>
                        {(orderDetails.items || []).map((item, i) => (
                          <tr key={item.id}>
                            <td className="text-muted">{i + 1}</td>
                            <td className="fw-bold">{item.itemCode || `Item-${item.itemId}`}</td>
                            <td>{item.warehouseName || `WH-${item.warehouseId}`}</td>
                            <td className="text-end font-monospace">{item.quantity}</td>
                            <td className="text-end font-monospace">₹{Number(item.unitPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="text-end font-monospace fw-bold">₹{Number(item.lineTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                        {(!orderDetails.items || orderDetails.items.length === 0) && <tr><td colSpan="6" className="text-center text-muted py-3">No items found.</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Lifecycle Timeline */}
                  <div className="mb-3">
                    <div className="fw-bold mb-3 small text-uppercase">Order Lifecycle — Status Timeline</div>
                    <div className="d-flex flex-column gap-0">
                      {(orderDetails.statusHistory || []).map((h, i) => (
                        <div key={i} className="d-flex gap-3 align-items-start">
                          <div className="d-flex flex-column align-items-center">
                            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: i === 0 ? "#0d6efd" : "#adb5bd", flexShrink: 0 }}></div>
                            {i < (orderDetails.statusHistory || []).length - 1 && <div style={{ width: 2, height: 28, backgroundColor: "#dee2e6" }}></div>}
                          </div>
                          <div className="pb-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge ${h.status === "Delivered" ? "bg-success" : h.status === "Paid" ? "bg-primary" : h.status === "Cancelled" ? "bg-danger" : "bg-secondary"}`}>{h.status}</span>
                              <span className="fin-sub text-muted">{new Date(h.createdAt).toLocaleString("en-IN")}</span>
                            </div>
                            {h.remarks && <div className="small text-muted mt-1">{h.remarks}</div>}
                          </div>
                        </div>
                      ))}
                      {(!orderDetails.statusHistory || orderDetails.statusHistory.length === 0) && <div className="text-muted small">No status history available.</div>}
                    </div>
                  </div>

                  {/* Payment History for this order */}
                  <div className="mb-2">
                    <div className="fw-bold mb-2 small text-uppercase">Payments for this Order</div>
                    <table className="table table-sm fin-table mb-0">
                      <thead className="table-light"><tr><th>Date</th><th>Reference</th><th>Method</th><th className="text-end">Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {payments.filter(p => p.salesOrderId === orderDetails.id).map(p => (
                          <tr key={p.id}>
                            <td className="small">{new Date(p.createdAt).toLocaleString("en-IN")}</td>
                            <td className="font-monospace small fw-bold">{p.transactionReference}</td>
                            <td><span className="badge bg-light text-dark border">{p.paymentMethod}</span></td>
                            <td className="text-end font-monospace fw-bold text-success">₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td><span className={`badge ${p.status === "Captured" ? "bg-success" : "bg-warning"}`}>{p.status}</span></td>
                          </tr>
                        ))}
                        {payments.filter(p => p.salesOrderId === orderDetails.id).length === 0 && <tr><td colSpan="5" className="text-center text-muted py-3">No payments recorded.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : <div className="text-center py-5 text-muted">Could not load order details.</div>}
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fin-overlay">
          <div className="fin-modal">
            <div className="fin-modal-header"><h6 className="m-0 fw-bold">Record Incoming Payment</h6><button className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button></div>
            <div className="fin-modal-body">
              <form onSubmit={handleRecordPayment}>
                <div className="mb-3"><label className="fin-label">Sales Order ID *</label>
                  <input type="number" className="form-control form-control-sm font-monospace" value={formData.salesOrderId} onChange={e => setFormData({ ...formData, salesOrderId: e.target.value })} placeholder="e.g. 12" required /></div>
                <div className="row g-3 mb-3">
                  <div className="col-6"><label className="fin-label">Amount *</label>
                    <input type="number" step="0.01" className="form-control form-control-sm text-end font-monospace" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required /></div>
                  <div className="col-6"><label className="fin-label">Method *</label>
                    <select className="form-select form-select-sm" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                      <option>Credit Card</option><option>Bank Transfer</option><option>Cash</option><option>Check</option><option>Credit Note</option><option>UPI</option>
                    </select></div>
                </div>
                <div className="mb-4"><label className="fin-label">Reference</label>
                  <input type="text" className="form-control form-control-sm font-monospace" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="Txn ID / Check #" /></div>
                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm px-3 fw-bold">Post Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fin-wrapper { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 0.85rem; color: #263238; }
        .fin-label { font-size: 0.68rem; text-transform: uppercase; color: #607d8b; font-weight: 700; letter-spacing: 0.5px; display: block; }
        .fin-sub { font-size: 0.7rem; color: #78909c; }
        .fin-table { font-size: 0.8rem; }
        .fin-table thead th { background: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 0.68rem; border-bottom: 2px solid #cbd5e1; padding: 8px 10px; white-space: nowrap; }
        .fin-table tbody td { padding: 8px 10px; border-color: #e2e8f0; }
        .cursor-pointer { cursor: pointer; }
        .table-primary { background-color: #e0f2fe !important; }
        .fin-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
        .fin-modal { background: #fff; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); width: 520px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
        .fin-modal-lg { width: 820px; }
        .fin-modal-header { background: #1e3a5f; color: #fff; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
        .fin-modal-body { padding: 20px; overflow-y: auto; flex: 1; }
      `}</style>
    </div>
  );
}