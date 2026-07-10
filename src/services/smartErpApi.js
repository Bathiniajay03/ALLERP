import api from "./apiClient";

const wmsApi = {
  getTopology: (warehouseId) => api.get(`/wms/topology/${warehouseId}`),
  getBins: (warehouseId) => api.get(`/wms/bins/warehouse/${warehouseId}`),
  getHeatmap: (warehouseId) => api.get(`/wms/heatmap/${warehouseId}`),
  getWmsStock: (warehouseId) => api.get(`/wms/stock/${warehouseId}`),

  getItems: () => api.get('/wms/lookup/items'),
  getLots: () => api.get('/wms/lookup/lots'),

  createZone: (data) => api.post('/wms/zones', data),
  createAisle: (data) => api.post('/wms/aisles', data),
  createRack: (data) => api.post('/wms/racks', data),
  createShelf: (data) => api.post('/wms/shelves', data),
  createBin: (data) => api.post('/wms/bins', data),

  generatePickList: (data) => api.post('/wmsoperations/generate-picklist', data),
  getPickLists: (warehouseId) => api.get(`/wmsoperations/pick-lists/${warehouseId}`),
  confirmPick: (pickItemId) => api.post(`/wmsoperations/pick-lists/${pickItemId}/confirm`),
  putAway: (data) => api.post('/wmsoperations/put-away', data),

  // Barcode and Scanner endpoints
  bulkGenerateBarcodes: () => api.post('/barcode/generate-bulk'),
  getBarcodeDashboard: () => api.get('/barcode/dashboard'),
  globalScan: (barcode) => api.get(`/barcode/scan/${encodeURIComponent(barcode)}`),
  getBarcodeSettings: () => api.get('/barcode/settings'),
  saveBarcodeSettings: (prefixes) => api.post('/barcode/settings', prefixes),
  updateBarcodeStatus: (payload) => api.post('/barcode/update-status', payload),
  generateSingleBarcode: (payload) => api.post('/barcode/generate-single', payload),
  logBarcodePrint: (payload) => api.post('/barcode/print-log', payload),
  unifiedSearchBarcode: (q) => api.get(`/barcode/search?q=${encodeURIComponent(q)}`),
  scannerTransfer: (data) => api.post('/wmsscanner/transfer', data),
  scannerCycleCount: (data) => api.post('/wmsscanner/cycle-count', data),
  recommendBin: (itemId, warehouseId) => api.get(`/wmsoperations/recommend-bin/${itemId}/${warehouseId}`),
  getCycleCounts: () => api.get('/wmsoperations/cycle-counts'),
  approveCycleCount: (id) => api.post(`/wmsoperations/cycle-counts/${id}/approve`),
  rejectCycleCount: (id) => api.post(`/wmsoperations/cycle-counts/${id}/reject`)
};

export const smartErpApi = {
  ...wmsApi,

  // System & Authentication
  initialize: () => api.post("/smart-erp/startup/initialize"),
  health: () => api.get("/smart-erp/startup/health"),

  login: (payload) =>
    api.post("/smart-erp/auth/login", payload),

  verifyMfa: (payload) =>
    api.post("/smart-erp/auth/verify-mfa", payload),

  companyLogin: (payload) =>
    api.post("/smart-erp/auth/company-login", payload),

  publicOnboard: (payload) =>
    api.post("/smart-erp/public/onboard", payload),

  registerUser: (payload) =>
    api.post("/admin/create-user", payload),

  logout: (payload) =>
    api.post("/smart-erp/auth/logout", payload),

  getUsers: () =>
    api.get("/admin/users"),

  getSystemSettings: () =>
    api.get("/admin/system-settings"),

  updateSystemSettings: (payload) =>
    api.post("/admin/system-settings", payload),

  getClientSystemSettings: () =>
    api.get("/client/settings/smtp"),

  updateClientSystemSettings: (payload) =>
    api.post("/client/settings/smtp", payload),

  getRiders: () =>
    api.get("/rider/all"),

  createRider: (payload) =>
    api.post("/rider/create", payload),

  getCustomers: () =>
    api.get("/customers"),

  getCurrentAccess: () =>
    api.get("/admin/me/access"),

  updateUserPermissions: (payload) =>
    api.post("/admin/update-permissions", payload),

  updateUser: (id, payload) =>
    api.put(`/users/${id}`, payload),

  deleteUser: (id) =>
    api.delete(`/users/${id}`),

  blockUser: (id) =>
    api.post(`/users/${id}/block`),

  unblockUser: (id) =>
    api.post(`/users/${id}/unblock`),

  getWorkerMonitor: (params = {}) =>
    api.get("/useractivitylogs/worker-monitor", { params }),

  getScannerOperations: (params = {}) =>
    api.get("/scanneroperations", { params }),


  // Product & Inventory
  createProduct: (payload) =>
    api.post("/smart-erp/products", payload),

  receiveInventory: (payload) =>
    api.post("/stock/in", payload),

  dispatchInventory: (payload) =>
    api.post("/stock/out", payload),


  // Orders Workflow
  createOrder: (payload) =>
    api.post("/smart-erp/orders", payload),

  getCustomerOrders: () =>
    api.get("/public/orders"),

  getCustomerOrderById: (id) =>
    api.get(`/public/orders/${id}`),

  updateCustomerOrderStatus: (id, payload) =>
    api.put(`/public/orders/${id}/status`, payload),

  assignDelivery: (payload) =>
    api.post("/delivery/assign", payload),

  updateDeliveryStatus: (payload) =>
    api.post("/delivery/update-status", payload),

  assignPicking: (orderId) =>
    api.post(`/smart-erp/orders/${orderId}/assign-picking`),

  verifyScan: (orderId, payload) =>
    api.post(`/smart-erp/orders/${orderId}/verify-scan`, payload),

  shipOrder: (orderId) =>
    api.post(`/smart-erp/orders/${orderId}/ship`),


  // Robot System
  registerRobot: (payload) =>
    api.post("/smart-erp/robots", payload),

  updateRobotStatus: (robotId, payload) =>
    api.put(`/smart-erp/robots/${robotId}/status`, payload),

  robotFleet: () =>
    api.get("/smart-erp/robots/fleet"),

  robotTasks: () =>
    api.get("/smart-erp/robots/tasks"),

  robotTaskEvent: (taskId, payload) =>
    api.post(`/smart-erp/robots/tasks/${taskId}/event`, payload),

  completeRobotTask: (taskId) =>
    api.post(`/smart-erp/robots/tasks/${taskId}/complete`),


  // Device Integration
  deviceEvent: (payload) =>
    api.post("/smart-erp/devices/event", payload),


  // Procurement
  createVendor: (payload) =>
    api.post("/smart-erp/procurement/vendors", payload),

  getVendors: () =>
    api.get("/smart-erp/procurement/vendors"),

  createPurchaseOrder: (payload) =>
    api.post("/smart-erp/procurement/purchase-orders", payload),

  getPurchaseOrders: () =>
    api.get("/smart-erp/procurement/purchase-orders"),

  receivePurchaseOrder: (poId, payload) =>
    api.post(`/smart-erp/procurement/purchase-orders/${poId}/receive`, payload),

  runAiAutomation: () =>
    api.post("/smart-erp/ai/automation/run"),


  // Finance
  capturePayment: (payload) =>
    api.post("/smart-erp/finance/capture-payment", payload),


  // Sales Orders
  createSalesOrder: (payload) =>
    api.post("/sales-orders", payload),

  getSalesOrders: () =>
    api.get("/sales-orders"),

  getSalesOrder: (id) =>
    api.get(`/sales-orders/${id}`),

  updateSalesOrderStatus: (id, payload) =>
    api.put(`/sales-orders/${id}/status`, payload),


  // Shipments & Invoice
  createShipment: (payload) =>
    api.post("/shipments", payload),

  generateInvoice: (payload) =>
    api.post("/invoices", payload),

  recordSalesPayment: (payload) =>
    api.post("/payments", payload),

  getPayments: () =>
    api.get("/payments"),

  getInvoices: () =>
    api.get("/invoices"),


  // Dashboard
  notificationsUnreadCount: () =>
    api.get("/smart-erp/notifications/unread-count"),

  dashboard: () =>
    api.get("/smart-erp/dashboard/realtime"),

  analytics: () =>
    api.get("/smart-erp/analytics/report"),


  // Warehouses
  warehouses: () =>
    api.get("/warehouses"),

  createWarehouse: (code, name, location = '') => {
    const locationParam = location ? `&location=${encodeURIComponent(location)}` : "";
    return api.post(
      `/warehouses?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}${locationParam}`
    );
  },


  // Stock
  stockAlerts: () =>
    api.get("/smart-erp/stock-alerts"),

  stockItems: () =>
    api.get("/stock/items"),

  stockInventory: () =>
    api.get("/stock/inventory"),

  stockSerials: (params = {}) => api.get("/stock/serials", { params }),

  stockTransactions: () =>
    api.get("/stock/transactions"),

  reportsTransactions: () =>
    api.get("/reports/transactions"),

  getItemByBarcode: (barcode) =>
    api.get(`/items/barcode/${encodeURIComponent(barcode)}`),

  checkItemBarcode: (barcode) =>
    api.get(`/items/barcode-check/${encodeURIComponent(barcode)}`),


  // Vendor Returns
  createVendorReturn: (payload) =>
    api.post("/vendor-returns", payload),

  getVendorReturns: () =>
    api.get("/vendor-returns"),

  approveVendorReturn: (id, payload) =>
    api.post(`/vendor-returns/${id}/approve`, payload),

  shipVendorReturn: (id, payload) =>
    api.post(`/vendor-returns/${id}/ship`, payload),

  refundVendorReturn: (id, payload) =>
    api.post(`/vendor-returns/${id}/refund`, payload),

  listDocuments: (entityType, entityId) =>
    api.get(`/documents/${entityType}/${entityId}`),

  uploadDocument: (entityType, entityId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/documents/${entityType}/${entityId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  deleteDocument: (documentId) =>
    api.delete(`/documents/${documentId}`),

  documentDownloadUrl: (documentId) => {
    const baseUrl = api.defaults.baseURL || "";
    const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${base}/documents/${documentId}/download`;
  },

  // =============================
  // Super Admin APIs
  // =============================
  getSuperAdminMetrics: () =>
    api.get("/super-admin/metrics"),

  getCompanies: () =>
    api.get("/super-admin/companies"),

  getCompany: (id) =>
    api.get(`/super-admin/companies/${id}`),

  getCompanyUsers: (id) =>
    api.get(`/super-admin/companies/${id}/users`),

  updateCompany: (id, payload) =>
    api.put(`/super-admin/companies/${id}`, payload),

  suspendCompany: (id) =>
    api.post(`/super-admin/companies/${id}/suspend`),

  activateCompany: (id) =>
    api.post(`/super-admin/companies/${id}/activate`),

  extendTrialHour: (id) =>
    api.post(`/super-admin/companies/${id}/extend-trial-hour`),

  deleteCompany: (id) =>
    api.delete(`/super-admin/companies/${id}`),

  resetCompanyData: (id) =>
    api.post(`/super-admin/companies/${id}/reset-data`),

  resetCompanyAdminPassword: (id, payload) =>
    api.post(`/super-admin/companies/${id}/reset-admin-password`, payload),

  wizardOnboard: (payload) =>
    api.post("/super-admin/wizard/onboard", payload),

  // =============================
  // Company Dashboard (Tenant)
  // =============================
  getCompanyDashboard: () =>
    api.get("/company/dashboard/stats"),

  getCompanySettings: () =>
    api.get("/company/dashboard/settings"),

  updateCompanySettings: (payload) =>
    api.put("/company/dashboard/settings", payload),

  initializeWmsLayout: (warehouseId) =>
    api.post(`/wms/initialize-layout?warehouseId=${warehouseId}`),

  getWmsLayout: (warehouseId) =>
    api.get(`/wms/layout?warehouseId=${warehouseId}`),

  getWmsHeatmap: (warehouseId) =>
    api.get(`/wms/heatmap?warehouseId=${warehouseId}`),

  // =============================
  // WMS APIs
  // =============================


  recommendWmsPutaway: (payload) =>
    api.post("/wms/putaway/recommend", payload),

  generateWmsPickList: (payload) =>
    api.post("/wms/picklists/generate", payload),

  transferWmsBin: (payload) =>
    api.post("/wms/bin-transfers", payload),

  getWmsReplenishments: (warehouseId) =>
    api.get(`/wms/replenishments?warehouseId=${warehouseId}`),

  createWmsCycleCount: (payload) =>
    api.post("/wms/cycle-counts", payload),
};



//   shipOrder: (orderId) =>
//     api.post(`/smart-erp/orders/${orderId}/ship`),


//   // =========================
//   // Robot System
//   // =========================
//   registerRobot: (payload) =>
//     api.post("/smart-erp/robots", payload),

//   updateRobotStatus: (robotId, payload) =>
//     api.put(`/smart-erp/robots/${robotId}/status`, payload),

//   robotFleet: () =>
//     api.get("/smart-erp/robots/fleet"),

//   robotTasks: () =>
//     api.get("/smart-erp/robots/tasks"),

//   robotTaskEvent: (taskId, payload) =>
//     api.post(`/smart-erp/robots/tasks/${taskId}/event`, payload),

//   completeRobotTask: (taskId) =>
//     api.post(`/smart-erp/robots/tasks/${taskId}/complete`),


//   // =========================
//   // Device Integration
//   // =========================
//   deviceEvent: (payload) =>
//     api.post("/smart-erp/devices/event", payload),


//   // =========================
//   // Procurement
//   // =========================
//   createVendor: (payload) =>
//     api.post("/smart-erp/procurement/vendors", payload),

//   getVendors: () =>
//     api.get("/smart-erp/procurement/vendors"),

//   createPurchaseOrder: (payload) =>
//     api.post("/smart-erp/procurement/purchase-orders", payload),

//   getPurchaseOrders: () =>
//     api.get("/smart-erp/procurement/purchase-orders"),

//   receivePurchaseOrder: (poId, payload) =>
//     api.post(`/smart-erp/procurement/purchase-orders/${poId}/receive`, payload),

//   runAiAutomation: () =>
//     api.post("/smart-erp/ai/automation/run"),


//   // =========================
//   // Finance
//   // =========================
//   capturePayment: (payload) =>
//     api.post("/smart-erp/finance/capture-payment", payload),


//   // =========================
//   // Sales Orders
//   // =========================
//   createSalesOrder: (payload) =>
//     api.post("/sales-orders", payload),

//   getSalesOrders: () =>
//     api.get("/sales-orders"),

//   getSalesOrder: (id) =>
//     api.get(`/sales-orders/${id}`),

//   updateSalesOrderStatus: (id, payload) =>
//     api.put(`/sales-orders/${id}/status`, payload),


//   // =========================
//   // Shipments & Invoice
//   // =========================
//   createShipment: (payload) =>
//     api.post("/shipments", payload),

//   generateInvoice: (payload) =>
//     api.post("/invoices", payload),

//   recordSalesPayment: (payload) =>
//     api.post("/payments", payload),


//   // =========================
//   // Dashboard
//   // =========================
//   notificationsUnreadCount: () =>
//     api.get("/smart-erp/notifications/unread-count"),

//   dashboard: () =>
//     api.get("/smart-erp/dashboard/realtime"),

//   analytics: () =>
//     api.get("/smart-erp/analytics/report"),


//   // =========================
//   // Vendor Returns
//   // =========================
//   createVendorReturn: (payload) =>
//     api.post("/vendor-returns", payload),

//   getVendorReturns: () =>
//     api.get("/vendor-returns"),

//   approveVendorReturn: (id, payload) =>
//     api.post(`/vendor-returns/${id}/approve`, payload),

//   shipVendorReturn: (id, payload) =>
//     api.post(`/vendor-returns/${id}/ship`, payload),

//   refundVendorReturn: (id, payload) =>
//     api.post(`/vendor-returns/${id}/refund`, payload),


//   // =========================
//   // Warehouses
//   // =========================
//   warehouses: () =>
//     api.get("/warehouses"),

//   createWarehouse: (code, name) =>
//     api.post(
//       `/warehouses?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`
//     ),


//   // =========================
//   // Stock
//   // =========================
//   stockAlerts: () =>
//     api.get("/smart-erp/stock-alerts"),

//   stockItems: () =>
//     api.get("/stock/items"),

//   stockInventory: () =>
//     api.get("/stock/inventory"),

//   stockTransactions: () =>
//     api.get("/stock/transactions")
// };
