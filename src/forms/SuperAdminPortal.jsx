import React, { useState, useEffect } from "react";
import { smartErpApi } from "../services/smartErpApi";
import CompanyWizard from "./CompanyWizard";
import SuperAdminChatInbox from "../components/SuperAdminChatInbox";



export default function SuperAdminPortal({ defaultTab = "companies" }) {
  const [companies, setCompanies] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemErrors, setSystemErrors] = useState([]);
  const [systemBackups, setSystemBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);

  // Modal states for actions
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Add custom API calls on smartErpApi
      const compRes = await smartErpApi.getCompanies();
      const metricRes = await smartErpApi.getSuperAdminMetrics();
      const errorRes = await smartErpApi.getSystemErrors();
      
      try {
        const backupRes = await smartErpApi.getBackups();
        setSystemBackups(backupRes?.data?.data || []);
      } catch (err) {
        console.warn("Failed to fetch backups:", err);
      }
      
      setCompanies(compRes.data || []);
      setMetrics(metricRes.data || null);
      setSystemErrors(errorRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load Super Admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuspend = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this company?")) return;
    try {
      await smartErpApi.suspendCompany(id);
      setActionMessage("Company suspended successfully.");
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to suspend company.");
    }
  };

  const handleActivate = async (id) => {
    try {
      await smartErpApi.activateCompany(id);
      setActionMessage("Company activated successfully.");
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to activate company.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to delete this company?")) return;
    try {
      await smartErpApi.deleteCompany(id);
      setActionMessage("Company deleted successfully.");
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete company.");
    }
  };

  const handleResetData = async (id) => {
    if (!window.confirm("DANGER: This will delete ALL transactions, orders, serials, and inventory under this company. This cannot be undone. Proceed?")) return;
    try {
      await smartErpApi.resetCompanyData(id);
      setActionMessage("Company data reset completed.");
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset company data.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    const companyId = selectedCompany?.id ?? selectedCompany?.Id;
    try {
      await smartErpApi.resetCompanyAdminPassword(companyId, { password: newPassword });
      setActionMessage("Admin password reset successfully.");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset admin password.");
    }
  };

  const formatLocalDateTime = (date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzoffset).toISOString().slice(0, 16);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  const [manualBasePlan, setManualBasePlan] = useState("Basic");
  const [manualDurationUnit, setManualDurationUnit] = useState("Days");
  const [manualDurationValue, setManualDurationValue] = useState(7);
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [manualStartDate, setManualStartDate] = useState(formatLocalDateTime(new Date()));
  const [manualEndDate, setManualEndDate] = useState(formatLocalDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  const handleOpenEditModal = (company) => {
    setSelectedCompany(company);
    setEditFormData({
      companyName: company.companyName ?? company.CompanyName ?? "",
      legalName: company.legalName ?? company.LegalName ?? "",
      gstNumber: company.gstNumber ?? company.GSTNumber ?? "",
      panNumber: company.panNumber ?? company.PANNumber ?? "",
      logo: company.logo ?? company.Logo ?? "",
      primaryColor: company.primaryColor ?? company.PrimaryColor ?? "#3b82f6",
      sidebarBgColor: company.sidebarBgColor ?? company.SidebarBgColor ?? "#0f172a",
      sidebarTextColor: company.sidebarTextColor ?? company.SidebarTextColor ?? "#f8fafc",
      subscriptionPlan: company.subscriptionPlan ?? company.SubscriptionPlan ?? "Basic",
      maxUsers: company.maxUsers ?? company.MaxUsers ?? 5,
      maxWarehouses: company.maxWarehouses ?? company.MaxWarehouses ?? 3,
      maxStorageBytes: company.maxStorageBytes ?? company.MaxStorageBytes ?? 1073741824,
      enableFinance: company.enableFinance ?? company.EnableFinance ?? true,
      enableAI: company.enableAI ?? company.EnableAI ?? true,
      enableReports: company.enableReports ?? company.EnableReports ?? true,
      enableWarehouse: company.enableWarehouse ?? company.EnableWarehouse ?? true,
      enableAutomation: company.enableAutomation ?? company.EnableAutomation ?? true,
      enableScanner: company.enableScanner ?? company.EnableScanner ?? true,
      enablePurchaseOrders: company.enablePurchaseOrders ?? company.EnablePurchaseOrders ?? true,
      enableSales: company.enableSales ?? company.EnableSales ?? true,
      country: company.country ?? company.Country ?? "United States",
      state: company.state ?? company.State ?? "",
      city: company.city ?? company.City ?? "",
      address: company.address ?? company.Address ?? "",
      phone: company.phone ?? company.Phone ?? "",
      email: company.email ?? company.Email ?? "",
      website: company.website ?? company.Website ?? "",
      storefrontEyebrow: company.storefrontEyebrow ?? company.StorefrontEyebrow ?? "Quick commerce",
      storefrontTitle: company.storefrontTitle ?? company.StorefrontTitle ?? "Daily essentials, delivered fast",
      storefrontDescription: company.storefrontDescription ?? company.StorefrontDescription ?? "Browse fresh groceries, snacks, personal care, and household items from your live ERP catalog.",
    });
    setShowEditModal(true);
  };

  const getBasePlanTemplate = (basePlan) => {
    switch (basePlan) {
      case "Trial":
        return {
          maxUsers: 5,
          maxWarehouses: 3,
          maxStorageBytes: 1073741824, // 1 GB
          maxApiCallsPerMonth: 10000,
          maxInventoryRecords: 1000,
          enableFinance: false,
          enableAI: false,
          enableReports: false,
          enableWarehouse: true,
          enableAutomation: false,
          enableScanner: true,
          enablePurchaseOrders: false,
          enableSales: true,
        };
      case "Basic":
        return {
          maxUsers: 10,
          maxWarehouses: 5,
          maxStorageBytes: 5368709120, // 5 GB
          maxApiCallsPerMonth: 50000,
          maxInventoryRecords: 5000,
          enableFinance: true,
          enableAI: false,
          enableReports: true,
          enableWarehouse: true,
          enableAutomation: false,
          enableScanner: true,
          enablePurchaseOrders: false,
          enableSales: true,
        };
      case "Professional":
        return {
          maxUsers: 30,
          maxWarehouses: 15,
          maxStorageBytes: 21474836480, // 20 GB
          maxApiCallsPerMonth: 200000,
          maxInventoryRecords: 20000,
          enableFinance: true,
          enableAI: true,
          enableReports: true,
          enableWarehouse: true,
          enableAutomation: true,
          enableScanner: true,
          enablePurchaseOrders: true,
          enableSales: true,
        };
      case "Enterprise":
        return {
          maxUsers: 999999, // Unlimited
          maxWarehouses: 999999, // Unlimited
          maxStorageBytes: 536870912000, // 500 GB
          maxApiCallsPerMonth: 99999999, // Unlimited
          maxInventoryRecords: 99999999,
          enableFinance: true,
          enableAI: true,
          enableReports: true,
          enableWarehouse: true,
          enableAutomation: true,
          enableScanner: true,
          enablePurchaseOrders: true,
          enableSales: true,
        };
      default:
        return {};
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    const id = selectedCompany?.id ?? selectedCompany?.Id;
    
    let finalData = { ...editFormData };
    if (editFormData.subscriptionPlan === "Manual") {
      let computedEndsAt = null;
      const now = new Date();
      if (manualDurationUnit === "Hours") {
        now.setHours(now.getHours() + parseInt(manualDurationValue || 0));
      } else if (manualDurationUnit === "Days") {
        now.setDate(now.getDate() + parseInt(manualDurationValue || 0));
      } else if (manualDurationUnit === "Weeks") {
        now.setDate(now.getDate() + parseInt(manualDurationValue || 0) * 7);
      } else if (manualDurationUnit === "Months") {
        now.setMonth(now.getMonth() + parseInt(manualDurationValue || 0));
      } else if (manualDurationUnit === "Custom") {
        if (customExpiryDate) computedEndsAt = new Date(customExpiryDate);
      } else if (manualDurationUnit === "Range") {
        if (manualEndDate) computedEndsAt = new Date(manualEndDate);
      }
      if (manualDurationUnit !== "Custom" && manualDurationUnit !== "Range") {
        computedEndsAt = now;
      }
      
      finalData.trialEndsAt = computedEndsAt ? computedEndsAt.toISOString() : null;
      finalData.subscriptionPlan = manualBasePlan;
    }

    try {
      await smartErpApi.updateCompany(id, finalData);
      setActionMessage("Company settings and UI branding updated successfully.");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update company details.");
    }
  };
  const getCalculatedTimeRange = () => {
    const start = new Date();
    let end = new Date();
    
    if (manualDurationUnit === "Hours") {
      end.setHours(end.getHours() + parseInt(manualDurationValue || 0));
    } else if (manualDurationUnit === "Days") {
      end.setDate(end.getDate() + parseInt(manualDurationValue || 0));
    } else if (manualDurationUnit === "Weeks") {
      end.setDate(end.getDate() + parseInt(manualDurationValue || 0) * 7);
    } else if (manualDurationUnit === "Months") {
      end.setMonth(end.getMonth() + parseInt(manualDurationValue || 0));
    } else if (manualDurationUnit === "Custom") {
      if (customExpiryDate) end = new Date(customExpiryDate);
    } else if (manualDurationUnit === "Range") {
      if (manualStartDate) return { start: new Date(manualStartDate).toLocaleString(), end: new Date(manualEndDate).toLocaleString() };
    }
    
    return {
      start: start.toLocaleString(),
      end: end.toLocaleString()
    };
  };

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCompanyUsers, setDetailCompanyUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleOpenDetailModal = async (company) => {
    setSelectedCompany(company);
    setShowDetailModal(true);
    setLoadingUsers(true);
    setDetailCompanyUsers([]);
    try {
      const id = company.id ?? company.Id;
      const res = await smartErpApi.getCompanyUsers(id);
      setDetailCompanyUsers(res.data || []);
    } catch (err) {
      console.error("Failed");
    } finally {
      setLoadingUsers(false);
    }
  };



  const handleTriggerBackup = async () => {
    if (!window.confirm("Are you sure you want to trigger a manual database backup?")) return;
    setBackupLoading(true);
    try {
      await smartErpApi.triggerBackup();
      setActionMessage("Manual backup triggered successfully.");
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to trigger backup.");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (id) => {
    if (!window.confirm("CRITICAL WARNING: Restoring a backup will overwrite the current database state! Proceed?")) return;
    setBackupLoading(true);
    try {
      await smartErpApi.restoreBackup(id);
      setActionMessage("Backup restored successfully.");
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to restore backup.");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleDownloadBackup = async (id) => {
    try {
      const response = await smartErpApi.downloadBackup(id);
      
      // Extract filename from Content-Disposition header if available
      let filename = `backup_${id}.sql`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download backup. You may not have permission.");
    }
  };

  const filteredCompanies = companies.filter(c => {
    const name = c?.companyName ?? c?.CompanyName ?? "";
    const code = c?.companyCode ?? c?.CompanyCode ?? "";
    return name.toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      code.toLowerCase().includes((searchTerm || "").toLowerCase());
  });

  if (showWizard) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Onboard New Company</h2>
          <button className="btn btn-secondary" onClick={() => { setShowWizard(false); fetchData(); }}>Back to Portal</button>
        </div>
        <CompanyWizard onFinish={() => { setShowWizard(false); fetchData(); }} />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1400 }}>
      {/* Action Messages */}
      {actionMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {actionMessage}
          <button type="button" className="btn-close" onClick={() => setActionMessage("")}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Hero Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 p-4 bg-white rounded-3 shadow-sm">
        <div>
          <h1 className="fw-bold text-dark m-0">SaaS Command Center</h1>
          <p className="text-muted m-0">Manage global tenants, system resources, and service plans.</p>
        </div>
        <button className="btn btn-primary px-4 py-2 fw-bold shadow-sm w-100 w-md-auto" onClick={() => setShowWizard(true)}>
          + Onboard Company Wizard
        </button>
      </div>

      {/* Metrics Cards Grid */}
      {metrics && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 p-md-4 bg-white h-100">
              <span className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>Total Tenants</span>
              <h2 className="fw-bold mt-2 text-primary fs-3">{metrics.totalCompanies}</h2>
              <span className="text-success small fw-bold" style={{ fontSize: '0.75rem' }}>● {metrics.activeCompanies} Active</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 p-md-4 bg-white h-100">
              <span className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>Storage Allocated</span>
              <h2 className="fw-bold mt-2 text-success fs-3">
                {(metrics.storageUsedBytes / (1024 * 1024)).toFixed(2)} MB
              </h2>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>System-wide storage</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 p-md-4 bg-white h-100">
              <span className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>API Calls</span>
              <h2 className="fw-bold mt-2 text-warning fs-3">{metrics.apiCalls}</h2>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Requests logged</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 p-md-4 bg-white h-100">
              <span className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>Active Users</span>
              <h2 className="fw-bold mt-2 text-danger fs-3">{metrics.activeUsers}</h2>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>All organizations</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Tabs Navigation */}
      <div className="bg-white rounded-3 shadow-sm p-3 mb-4 border-0">
        <ul className="nav nav-pills gap-2 flex-wrap">
          {[
            { id: "companies", label: "Tenant Directory", icon: "bi-building" },
            { id: "chats", label: "Support Chats Inbox", icon: "bi-chat-dots" },
            { id: "backups", label: "Disaster Recovery", icon: "bi-cloud-arrow-up" },
            { id: "system_errors", label: "System Error Logs", icon: "bi-bug" },
            { id: "audit", label: "System Audit Trail", icon: "bi-shield-lock" }
          ].map(tab => (
            <li key={tab.id} className="nav-item">
              <button
                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-semibold border-0 ${activeTab === tab.id ? "btn-primary shadow-sm" : "btn-light text-muted"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon} />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-4 rounded-3 shadow-sm border-0">
        {activeTab === "backups" ? (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold m-0">System Backups & Disaster Recovery</h4>
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleTriggerBackup}
                disabled={backupLoading}
              >
                {backupLoading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-cloud-arrow-up" />}
                Trigger Manual Backup
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle table-sm" style={{ fontSize: '0.85rem' }}>
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>File Size</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systemBackups.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">No backups found.</td>
                    </tr>
                  ) : systemBackups.map(b => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{formatDisplayDate(b.createdAt)}</td>
                      <td><span className="badge bg-secondary">{b.type}</span></td>
                      <td>
                        <span className={`badge bg-${b.status === 'Completed' ? 'success' : 'danger'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>{b.fileSizeBytes ? (b.fileSizeBytes / (1024 * 1024)).toFixed(2) + " MB" : "-"}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleDownloadBackup(b.id)}>
                          Download
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRestoreBackup(b.id)}>
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "system_errors" ? (
          <div>
            <h4 className="fw-bold mb-4">System Error Logs</h4>
            <div className="table-responsive">
              <table className="table table-hover align-middle table-sm" style={{ fontSize: '0.85rem' }}>
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Timestamp</th>
                    <th>Message</th>
                    <th>Path</th>
                    <th>Tenant</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {systemErrors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">No recent system errors found.</td>
                    </tr>
                  ) : systemErrors.map(e => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{new Date(e.timestamp).toLocaleString()}</td>
                      <td className="text-danger fw-bold">{e.message}</td>
                      <td><code>{e.method} {e.path}</code></td>
                      <td>{e.tenantId || e.companyId || "-"}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                          alert(e.stackTrace || "No Stack Trace");
                        }}>
                          Trace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "chats" ? (
          <SuperAdminChatInbox />
        ) : activeTab === "companies" ? (
          <div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <h4 className="fw-bold m-0">Active Tenants Directory</h4>
              <input
                type="text"
                className="form-control w-100 w-sm-25 shadow-sm"
                style={{ maxWidth: '300px' }}
                placeholder="Search by Code or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Fetching company registries...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Company</th>
                      <th>Plan</th>
                      <th>Country</th>
                      <th>Limits (Users / WH / Storage)</th>
                      <th>Status</th>
                      <th>Trial Ends</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((c, idx) => {
                      const id = c?.id ?? c?.Id;
                      const companyName = c?.companyName ?? c?.CompanyName ?? "";
                      const companyCode = c?.companyCode ?? c?.CompanyCode ?? "";
                      const logo = c?.logo ?? c?.Logo;
                      const primaryColor = c?.primaryColor ?? c?.PrimaryColor;
                      const legalName = c?.legalName ?? c?.LegalName;
                      const subscriptionPlan = c?.subscriptionPlan ?? c?.SubscriptionPlan ?? "";
                      const country = c?.country ?? c?.Country ?? "Global";
                      const maxUsers = c?.maxUsers ?? c?.MaxUsers;
                      const maxWarehouses = c?.maxWarehouses ?? c?.MaxWarehouses;
                      const maxStorageBytes = c?.maxStorageBytes ?? c?.MaxStorageBytes;
                      const subscriptionStatus = c?.subscriptionStatus ?? c?.SubscriptionStatus ?? "";
                      const trialEndsAt = c?.trialEndsAt ?? c?.TrialEndsAt;

                      return (
                        <tr key={id || `comp-${idx}`}>
                          <td style={{ cursor: "pointer" }} onClick={() => handleOpenDetailModal(c)} title="View Company Details & Users">
                            <div className="d-flex align-items-center">
                              {logo ? (
                                <img src={logo} alt={companyName} className="rounded-circle me-3" style={{ width: 40, height: 40, objectFit: "cover" }} />
                              ) : (
                                <div className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 40, height: 40, background: primaryColor || "#3b82f6" }}>
                                  {companyCode}
                                </div>
                              )}
                              <div>
                                <h6 className="fw-bold m-0">{companyName}</h6>
                                <span className="text-muted small">{legalName || "N/A"} ({companyCode})</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${subscriptionPlan === "Enterprise" ? "danger" : subscriptionPlan === "Professional" ? "warning" : "info"} text-dark fw-bold`}>
                              {subscriptionPlan}
                            </span>
                          </td>
                          <td>{country}</td>
                          <td>
                            <small className="d-block text-dark">
                              <strong>Users:</strong> {maxUsers} | <strong>WH:</strong> {maxWarehouses}
                            </small>
                            <small className="text-muted">
                              <strong>Storage:</strong> {(maxStorageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB
                            </small>
                          </td>
                          <td>
                            <span className={`badge bg-${subscriptionStatus === "Active" ? "success" : "secondary"}`}>
                              {subscriptionStatus}
                            </span>
                          </td>
                          <td>{trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : "Never"}</td>
                          <td className="text-end">
                            <button className="btn btn-outline-primary btn-sm me-2 fw-bold" onClick={() => { setSelectedCompany(c); setShowPasswordModal(true); }}>
                              Reset Pwd
                            </button>
                            <button className="btn btn-outline-warning btn-sm me-2 fw-bold" onClick={() => handleResetData(id)}>
                              Reset DB
                            </button>
                            <button className="btn btn-outline-info btn-sm me-2 fw-bold" onClick={() => handleOpenEditModal(c)}>
                              Edit UI / Plan
                            </button>
                            {subscriptionStatus === "Active" ? (
                              <button className="btn btn-danger btn-sm me-2" onClick={() => handleSuspend(id)}>Suspend</button>
                            ) : (
                              <button className="btn btn-success btn-sm me-2" onClick={() => handleActivate(id)}>Activate</button>
                            )}
                            <button className="btn btn-link text-danger p-0 align-middle" onClick={() => handleDelete(id)}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredCompanies.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">No companies match the search criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h4 className="fw-bold mb-3">Live System Operations Activity</h4>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Message</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.auditLogs?.map((log, idx) => {
                    const action = log.action ?? log.Action ?? "";
                    const message = log.message ?? log.Message ?? "";
                    const details = log.details ?? log.Details ?? "";
                    const createdAt = log.createdAt ?? log.CreatedAt;
                    return (
                      <tr key={log.id ?? log.Id ?? `log-${idx}`}>
                        <td>
                          <span className="text-muted small">
                            {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${action === "DELETE" ? "danger" : action === "PUT" || action === "UPDATE" ? "warning" : "success"}`}>
                            {action}
                          </span>
                        </td>
                        <td>{message}</td>
                        <td>
                          <pre className="m-0 bg-light p-2 rounded small" style={{ fontSize: "0.75rem", maxWidth: 500, overflow: "auto" }}>
                            {details}
                          </pre>
                        </td>
                      </tr>
                    );
                  })}
                  {(!metrics?.auditLogs || metrics.auditLogs.length === 0) && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">No system audit logs recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleResetPassword}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Reset Administrator Password</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Reset admin user credentials for <strong>{selectedCompany?.CompanyName}</strong>.</p>
                  <div className="mb-3">
                    <label className="form-label fw-bold">New Password</label>
                    <input type="password" placeholder="Min 6 characters" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit UI & Company Settings Modal */}
      {showEditModal && editFormData && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)", overflowY: "auto", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleUpdateCompany}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Configure Company UI Settings & Plan</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Company Name</label>
                      <input type="text" className="form-control" value={editFormData.companyName} onChange={e => setEditFormData({...editFormData, companyName: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Legal Name</label>
                      <input type="text" className="form-control" value={editFormData.legalName} onChange={e => setEditFormData({...editFormData, legalName: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Primary Brand Color (UI Theme)</label>
                      <div className="d-flex align-items-center gap-2">
                        <input type="color" className="form-control form-control-color" style={{ width: 60 }} value={editFormData.primaryColor} onChange={e => setEditFormData({...editFormData, primaryColor: e.target.value})} />
                        <input type="text" className="form-control" value={editFormData.primaryColor} onChange={e => setEditFormData({...editFormData, primaryColor: e.target.value})} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Logo URL</label>
                      <input type="text" className="form-control" value={editFormData.logo} onChange={e => setEditFormData({...editFormData, logo: e.target.value})} placeholder="https://logo-url.com" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Sidebar Background Color</label>
                      <div className="d-flex align-items-center gap-2">
                        <input type="color" className="form-control form-control-color" style={{ width: 60 }} value={editFormData.sidebarBgColor} onChange={e => setEditFormData({...editFormData, sidebarBgColor: e.target.value})} />
                        <input type="text" className="form-control" value={editFormData.sidebarBgColor} onChange={e => setEditFormData({...editFormData, sidebarBgColor: e.target.value})} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Sidebar Text / Icon Color</label>
                      <div className="d-flex align-items-center gap-2">
                        <input type="color" className="form-control form-control-color" style={{ width: 60 }} value={editFormData.sidebarTextColor} onChange={e => setEditFormData({...editFormData, sidebarTextColor: e.target.value})} />
                        <input type="text" className="form-control" value={editFormData.sidebarTextColor} onChange={e => setEditFormData({...editFormData, sidebarTextColor: e.target.value})} />
                      </div>
                    </div>

                    <div className="col-12 mt-3">
                      <h6 className="fw-bold border-bottom pb-2">Customer App Storefront Configuration</h6>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Hero Eyebrow Text</label>
                      <input type="text" className="form-control" value={editFormData.storefrontEyebrow || ""} onChange={e => setEditFormData({...editFormData, storefrontEyebrow: e.target.value})} placeholder="e.g. Quick commerce" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Hero Heading / Title</label>
                      <input type="text" className="form-control" value={editFormData.storefrontTitle || ""} onChange={e => setEditFormData({...editFormData, storefrontTitle: e.target.value})} placeholder="e.g. Daily essentials, delivered fast" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Hero Description / Subheading</label>
                      <textarea className="form-control" rows="2" value={editFormData.storefrontDescription || ""} onChange={e => setEditFormData({...editFormData, storefrontDescription: e.target.value})} placeholder="Describe the store catalog..."></textarea>
                    </div>

                    <hr />

                    <div className="col-md-4">
                      <label className="form-label fw-bold">Subscription Plan</label>
                      <select className="form-select" value={editFormData.subscriptionPlan} onChange={e => {
                        const newPlan = e.target.value;
                        let updatedFields = { subscriptionPlan: newPlan };
                        if (newPlan !== "Manual") {
                          updatedFields = { ...updatedFields, ...getBasePlanTemplate(newPlan) };
                        } else {
                          updatedFields = { ...updatedFields, ...getBasePlanTemplate(manualBasePlan) };
                        }
                        setEditFormData({...editFormData, ...updatedFields});
                      }}>
                        <option value="Trial">Trial</option>
                        <option value="Basic">Basic</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="Manual">Manual (Custom Term)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Max Users</label>
                      <input type="number" className="form-control" value={editFormData.maxUsers} onChange={e => setEditFormData({...editFormData, maxUsers: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Max Warehouses</label>
                      <input type="number" className="form-control" value={editFormData.maxWarehouses} onChange={e => setEditFormData({...editFormData, maxWarehouses: parseInt(e.target.value) || 0})} />
                    </div>

                    {editFormData.subscriptionPlan === "Manual" && (
                      <div className="col-12 mt-2 bg-light p-3 rounded border">
                        <h6 className="fw-bold mb-3 text-secondary">Manual Custom Configuration</h6>
                        <div className="row g-2">
                          <div className="col-md-4">
                            <label className="form-label fw-bold">Base Service Level</label>
                            <select className="form-select" value={manualBasePlan} onChange={e => {
                              const selectedBase = e.target.value;
                              setManualBasePlan(selectedBase);
                              setEditFormData({ ...editFormData, ...getBasePlanTemplate(selectedBase) });
                            }}>
                              <option value="Basic">Basic Profile</option>
                              <option value="Professional">Professional Profile</option>
                              <option value="Enterprise">Enterprise Profile</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label fw-bold">Duration Unit</label>
                            <select className="form-select" value={manualDurationUnit} onChange={e => setManualDurationUnit(e.target.value)}>
                              <option value="Hours">Hours</option>
                              <option value="Days">Days</option>
                              <option value="Weeks">Weeks</option>
                              <option value="Months">Months</option>
                              <option value="Custom">Custom Expiry Date</option>
                              <option value="Range">Date Range Selector</option>
                            </select>
                          </div>
                          {manualDurationUnit === "Range" ? (
                            <>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Start Date & Time</label>
                                <input type="datetime-local" className="form-control" value={manualStartDate} onChange={e => setManualStartDate(e.target.value)} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">End Date & Time</label>
                                <input type="datetime-local" className="form-control" value={manualEndDate} onChange={e => setManualEndDate(e.target.value)} required />
                              </div>
                            </>
                          ) : manualDurationUnit === "Custom" ? (
                            <div className="col-md-4">
                              <label className="form-label fw-bold">Expiry Date & Time</label>
                              <input type="datetime-local" className="form-control" value={customExpiryDate} onChange={e => setCustomExpiryDate(e.target.value)} required />
                            </div>
                          ) : (
                            <div className="col-md-4">
                              <label className="form-label fw-bold">Duration Value</label>
                              <input type="number" className="form-control" value={manualDurationValue} onChange={e => setManualDurationValue(parseInt(e.target.value) || 0)} min="1" />
                            </div>
                          )}
                          <div className="col-12 mt-3 p-2 bg-info-subtle border border-info rounded text-info-emphasis small fw-bold text-center">
                            Access Period Preview: Starts at <span className="text-primary">{getCalculatedTimeRange().start}</span> and expires at <span className="text-danger">{getCalculatedTimeRange().end}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <hr />
                    
                    <h6 className="fw-bold mb-0">Enabled Platforms / Modules</h6>
                    <div className="col-md-12">
                      <div className="row g-2">
                        {[
                          { key: "enableFinance", label: "Finance & Payments" },
                          { key: "enableAI", label: "AI Procurement" },
                          { key: "enableReports", label: "Reports & Analytics" },
                          { key: "enableWarehouse", label: "Warehouse Management" },
                          { key: "enableAutomation", label: "Automation Engine" },
                          { key: "enableScanner", label: "Barcode / Scanner" },
                          { key: "enablePurchaseOrders", label: "Purchase Orders" },
                          { key: "enableSales", label: "Sales & CRM" },
                        ].map(({ key, label }) => (
                          <div className="col-md-4" key={key}>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" id={`edit-${key}`} checked={editFormData[key]} onChange={e => setEditFormData({...editFormData, [key]: e.target.checked})} />
                              <label className="form-check-label" htmlFor={`edit-${key}`}>{label}</label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                  <button type="submit" className="btn btn-success fw-bold">Save Settings</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Client Overview / Details Modal */}
      {showDetailModal && selectedCompany && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)", overflowY: "auto", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white py-3">
                <div className="d-flex align-items-center">
                  {selectedCompany.logo || selectedCompany.Logo ? (
                    <img src={selectedCompany.logo || selectedCompany.Logo} alt="logo" className="rounded bg-white me-3" style={{ width: 45, height: 45, objectFit: "contain" }} />
                  ) : (
                    <div className="rounded bg-secondary me-3 d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 45, height: 45, fontSize: "1.2rem" }}>
                      {(selectedCompany.companyCode ?? selectedCompany.CompanyCode ?? "UK").substring(0,2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h5 className="modal-title fw-bold m-0">{selectedCompany.companyName ?? selectedCompany.CompanyName}</h5>
                    <span className="text-muted small">Code: {selectedCompany.companyCode ?? selectedCompany.CompanyCode}</span>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Left Column: Profile & Settings */}
                  <div className="col-lg-4 col-md-5">
                    <h6 className="fw-bold text-uppercase text-secondary mb-3 pb-1 border-bottom">Organization Registry</h6>
                    <table className="table table-sm table-borderless align-middle mb-4">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-semibold" style={{ width: "35%" }}>Legal Name:</td>
                          <td className="text-dark fw-bold">{selectedCompany.legalName ?? selectedCompany.LegalName ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">GST/Tax ID:</td>
                          <td>{selectedCompany.gstNumber ?? selectedCompany.GSTNumber ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">PAN Code:</td>
                          <td>{selectedCompany.panNumber ?? selectedCompany.PANNumber ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">Email:</td>
                          <td>{selectedCompany.email ?? selectedCompany.Email ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">Phone:</td>
                          <td>{selectedCompany.phone ?? selectedCompany.Phone ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">Website:</td>
                          <td>
                            {selectedCompany.website ?? selectedCompany.Website ? (
                              <a href={selectedCompany.website ?? selectedCompany.Website} target="_blank" rel="noreferrer" className="text-decoration-none">{selectedCompany.website ?? selectedCompany.Website}</a>
                            ) : "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">Region:</td>
                          <td>{selectedCompany.city ?? selectedCompany.City}, {selectedCompany.state ?? selectedCompany.State}, {selectedCompany.country ?? selectedCompany.Country}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">Timezone:</td>
                          <td>{selectedCompany.timezone ?? selectedCompany.Timezone ?? "UTC"} ({selectedCompany.currency ?? selectedCompany.Currency ?? "USD"})</td>
                        </tr>
                      </tbody>
                    </table>

                    <h6 className="fw-bold text-uppercase text-secondary mb-3 pb-1 border-bottom">Plan & Limits</h6>
                    <div className="bg-light p-3 rounded-3 border">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Service tier:</span>
                        <span className="badge bg-primary fw-bold">{selectedCompany.subscriptionPlan ?? selectedCompany.SubscriptionPlan}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Status:</span>
                        <span className={`badge bg-${(selectedCompany.subscriptionStatus ?? selectedCompany.SubscriptionStatus) === "Active" ? "success" : "danger"}`}>{selectedCompany.subscriptionStatus ?? selectedCompany.SubscriptionStatus}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Max Users Allowed:</span>
                        <span className="fw-bold text-dark">{selectedCompany.maxUsers ?? selectedCompany.MaxUsers} Users</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Max Warehouses:</span>
                        <span className="fw-bold text-dark">{selectedCompany.maxWarehouses ?? selectedCompany.MaxWarehouses} Locations</span>
                      </div>
                      <div className="d-flex justify-content-between mb-0">
                        <span className="text-muted small">Max Storage:</span>
                        <span className="fw-bold text-dark">{(((selectedCompany.maxStorageBytes ?? selectedCompany.MaxStorageBytes ?? 0) / (1024 * 1024 * 1024))).toFixed(1)} GB</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Modules & Registered Users */}
                  <div className="col-lg-8 col-md-7">
                    <h6 className="fw-bold text-uppercase text-secondary mb-3 pb-1 border-bottom">Accessing Modules</h6>
                    <div className="row g-2 mb-4">
                      {[
                        { flag: selectedCompany.enableFinance ?? selectedCompany.EnableFinance, label: "Finance & Payments" },
                        { flag: selectedCompany.enableAI ?? selectedCompany.EnableAI, label: "AI Procurement" },
                        { flag: selectedCompany.enableReports ?? selectedCompany.EnableReports, label: "Reports & Analytics" },
                        { flag: selectedCompany.enableWarehouse ?? selectedCompany.EnableWarehouse, label: "Warehouse Management" },
                        { flag: selectedCompany.enableAutomation ?? selectedCompany.EnableAutomation, label: "Automation Engine" },
                        { flag: selectedCompany.enableScanner ?? selectedCompany.EnableScanner, label: "Barcode / Scanner" },
                        { flag: selectedCompany.enablePurchaseOrders ?? selectedCompany.EnablePurchaseOrders, label: "Purchase Orders" },
                        { flag: selectedCompany.enableSales ?? selectedCompany.EnableSales, label: "Sales & CRM" },
                      ].map(({ flag, label }, idx) => (
                        <div className="col-md-4 col-sm-6" key={idx}>
                          <div className={`p-2 rounded-2 border d-flex align-items-center gap-2 ${flag ? "bg-success-subtle text-success border-success-subtle" : "bg-light text-muted border-light-subtle"}`}>
                            <span>{flag ? "✓" : "✗"}</span>
                            <span className="small fw-semibold">{label}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h6 className="fw-bold text-uppercase text-secondary mb-3 pb-1 border-bottom">Client Workers & Users ({detailCompanyUsers.length})</h6>
                    {loadingUsers ? (
                      <div className="text-center py-4">
                        <span className="spinner-border spinner-border-sm text-secondary me-2"></span>
                        <small className="text-muted">Fetching client workforce directories...</small>
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ maxHeight: 280 }}>
                        <table className="table table-sm table-striped table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                          <thead className="table-light">
                            <tr>
                              <th>Username</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Role</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Last Active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailCompanyUsers.map((u, uIdx) => (
                              <tr key={u.id ?? uIdx}>
                                <td className="fw-bold text-dark">{u.username}</td>
                                <td>{u.name}</td>
                                <td>{u.email || "N/A"}</td>
                                <td><span className="badge bg-light text-dark border">{u.role}</span></td>
                                <td><span className="text-uppercase small">{u.userType}</span></td>
                                <td>
                                  <span className={`badge bg-${u.isActive && u.status === "Active" ? "success" : "danger"}`}>
                                    {u.status || (u.isActive ? "Active" : "Inactive")}
                                  </span>
                                </td>
                                <td>
                                  <small className="text-muted">
                                    {u.lastLoginTime ? new Date(u.lastLoginTime).toLocaleString() : "Never"}
                                  </small>
                                </td>
                              </tr>
                            ))}
                            {detailCompanyUsers.length === 0 && (
                              <tr>
                                <td colSpan="7" className="text-center text-muted py-3">No active users registered under this tenant.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-top">
                <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={() => setShowDetailModal(false)}>Close Overview</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// import React, { useState, useEffect } from "react";
// import { smartErpApi } from "../services/smartErpApi";
// import CompanyWizard from "./CompanyWizard";

// export default function SuperAdminPortal() {
//   const [companies, setCompanies] = useState([]);
//   const [metrics, setMetrics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [showWizard, setShowWizard] = useState(false);
//   const [activeTab, setActiveTab] = useState("companies");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Modal states for actions
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [newPassword, setNewPassword] = useState("");
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [showDetailModal, setShowDetailModal] = useState(false); // NEW STATE FOR DETAILS
//   const [actionMessage, setActionMessage] = useState("");

//   const fetchData = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const compRes = await smartErpApi.getCompanies();
//       const metricRes = await smartErpApi.getSuperAdminMetrics();
//       setCompanies(compRes.data || []);
//       setMetrics(metricRes.data || null);
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to load Super Admin data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // --- Handlers ---
//   const handleSuspend = async (id) => {
//     if (!window.confirm("Are you sure you want to suspend this tenant?")) return;
//     try {
//       await smartErpApi.suspendCompany(id);
//       setActionMessage("Tenant suspended successfully.");
//       setShowDetailModal(false); // Close detail view if open
//       fetchData();
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to suspend company.");
//     }
//   };

//   const handleActivate = async (id) => {
//     try {
//       await smartErpApi.activateCompany(id);
//       setActionMessage("Tenant activated successfully.");
//       setShowDetailModal(false);
//       fetchData();
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to activate company.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("WARNING: Are you sure you want to completely remove this tenant?")) return;
//     try {
//       await smartErpApi.deleteCompany(id);
//       setActionMessage("Tenant deleted successfully.");
//       setShowDetailModal(false);
//       fetchData();
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to delete company.");
//     }
//   };

//   const handleResetData = async (id) => {
//     if (!window.confirm("DANGER: This will delete ALL transactional data for this tenant. Proceed?")) return;
//     try {
//       await smartErpApi.resetCompanyData(id);
//       setActionMessage("Tenant data reset completed.");
//       fetchData();
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to reset company data.");
//     }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     if (!newPassword) return;
//     const companyId = selectedCompany?.id ?? selectedCompany?.Id;
//     try {
//       await smartErpApi.resetCompanyAdminPassword(companyId, { password: newPassword });
//       setActionMessage("Admin password reset successfully.");
//       setShowPasswordModal(false);
//       setNewPassword("");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to reset admin password.");
//     }
//   };

//   const filteredCompanies = (companies || []).filter(c => {
//     const name = c?.companyName ?? c?.CompanyName ?? "";
//     const code = c?.companyCode ?? c?.CompanyCode ?? "";
//     return name.toLowerCase().includes((searchTerm || "").toLowerCase()) ||
//       code.toLowerCase().includes((searchTerm || "").toLowerCase());
//   });

//   if (showWizard) {
//     return (
//       <div className="container py-5 max-w-4xl">
//         <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
//           <div>
//             <h3 className="fw-bold m-0 text-dark">Onboard New Tenant</h3>
//             <p className="text-muted m-0 small">Provision a new organization and database schema.</p>
//           </div>
//           <button className="btn btn-light border shadow-sm fw-medium" onClick={() => { setShowWizard(false); fetchData(); }}>
//             ← Back to Portal
//           </button>
//         </div>
//         <CompanyWizard onFinish={() => { setShowWizard(false); fetchData(); }} />
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid py-4 bg-light min-vh-100" style={{ maxWidth: 1600 }}>
//       {/* Alerts */}
//       {actionMessage && (
//         <div className="alert alert-success border-0 shadow-sm d-flex justify-content-between align-items-center mb-4">
//           <span><strong className="me-2">✓</strong>{actionMessage}</span>
//           <button type="button" className="btn-close btn-sm" onClick={() => setActionMessage("")}></button>
//         </div>
//       )}
//       {error && (
//         <div className="alert alert-danger border-0 shadow-sm d-flex justify-content-between align-items-center mb-4">
//           <span><strong className="me-2">⚠</strong>{error}</span>
//           <button type="button" className="btn-close btn-sm" onClick={() => setError("")}></button>
//         </div>
//       )}

//       {/* Hero Header */}
//       <div className="d-flex justify-content-between align-items-end mb-4">
//         <div>
//           <h2 className="fw-bolder text-dark m-0 tracking-tight">SaaS Command Center</h2>
//           <p className="text-secondary m-0">Global overview of tenants, infrastructure, and audits.</p>
//         </div>
//         <button className="btn btn-dark px-4 py-2 fw-medium shadow-sm" onClick={() => setShowWizard(true)}>
//           + Provision Tenant
//         </button>
//       </div>

//       {/* Metrics Cards Grid */}
//       {metrics && (
//         <div className="row g-4 mb-5">
//           {[
//             { title: "Total Tenants", value: metrics.totalCompanies, sub: `${metrics.activeCompanies} Active`, color: "primary" },
//             { title: "Storage Allocated", value: `${(metrics.storageUsedBytes / (1024 * 1024)).toFixed(2)} MB`, sub: "System-wide volume", color: "success" },
//             { title: "API Invocations", value: metrics.apiCalls.toLocaleString(), sub: "Last 30 days", color: "warning" },
//             { title: "Active Users", value: metrics.activeUsers.toLocaleString(), sub: "Across all tenants", color: "info" }
//           ].map((m, i) => (
//             <div key={i} className="col-xl-3 col-md-6">
//               <div className="bg-white rounded-3 shadow-sm p-4 border-top border-3" style={{ borderTopColor: `var(--bs-${m.color})` }}>
//                 <span className="text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>{m.title}</span>
//                 <h3 className="fw-bolder mt-2 mb-1 text-dark">{m.value}</h3>
//                 <span className="text-muted small">{m.sub}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Main Content Area */}
//       <div className="bg-white rounded-4 shadow-sm border border-light overflow-hidden">
//         {/* Modern Tab Navigation */}
//         <div className="border-bottom bg-light px-4 pt-3">
//           <ul className="nav nav-tabs border-0 gap-3">
//             {[
//               { id: "companies", label: "Tenant Directory" },
//               { id: "audit", label: "System Audit Trail" }
//             ].map(tab => (
//               <li key={tab.id} className="nav-item">
//                 <button
//                   className={`nav-link fw-medium pb-3 border-0 bg-transparent ${activeTab === tab.id ? "text-primary border-bottom border-primary border-2" : "text-muted"}`}
//                   onClick={() => setActiveTab(tab.id)}
//                   style={{ borderRadius: 0, marginBottom: "-1px" }}
//                 >
//                   {tab.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="p-4">
//           {activeTab === "companies" ? (
//             <div>
//               <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h5 className="fw-bold m-0 text-dark">Active Tenants</h5>
//                 <input
//                   type="text"
//                   className="form-control form-control-sm border-light bg-light w-25"
//                   placeholder="Search tenants..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>

//               {loading ? (
//                 <div className="d-flex flex-column align-items-center justify-content-center py-5">
//                   <div className="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
//                   <span className="text-muted small">Synchronizing directories...</span>
//                 </div>
//               ) : (
//                 <div className="table-responsive">
//                   <table className="table table-hover align-middle border-top border-light mb-0" style={{ fontSize: "0.875rem" }}>
//                     <thead className="table-light text-secondary">
//                       <tr>
//                         <th className="fw-medium border-0 py-3">Tenant Details</th>
//                         <th className="fw-medium border-0 py-3">Plan & Limits</th>
//                         <th className="fw-medium border-0 py-3">Status</th>
//                         <th className="fw-medium border-0 py-3 text-end">Administration</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredCompanies.map((c, idx) => {
//                         const id = c?.id ?? c?.Id;
//                         const status = c?.subscriptionStatus ?? c?.SubscriptionStatus ?? "Inactive";
//                         const plan = c?.subscriptionPlan ?? c?.SubscriptionPlan ?? "Basic";

//                         return (
//                           <tr key={id || `comp-${idx}`}>
//                             <td className="py-3" style={{ cursor: "pointer" }} onClick={() => { setSelectedCompany(c); setShowDetailModal(true); }}>
//                               <div className="d-flex align-items-center">
//                                 <div className="rounded border bg-light d-flex align-items-center justify-content-center text-secondary fw-bold shadow-sm me-3" style={{ width: 40, height: 40 }}>
//                                   {(c?.companyCode ?? c?.CompanyCode ?? "UK").substring(0, 2).toUpperCase()}
//                                 </div>
//                                 <div>
//                                   <h6 className="fw-bold mb-1 text-dark">{c?.companyName ?? c?.CompanyName}</h6>
//                                   <span className="text-muted" style={{ fontSize: "0.75rem" }}>ID: {c?.companyCode ?? c?.CompanyCode} • {c?.country ?? c?.Country ?? "Global"}</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="py-3">
//                               <span className="badge bg-light text-dark border fw-medium mb-1">{plan}</span>
//                               <div className="text-muted" style={{ fontSize: "0.75rem" }}>
//                                 U: {c?.maxUsers ?? c?.MaxUsers} | WH: {c?.maxWarehouses ?? c?.MaxWarehouses}
//                               </div>
//                             </td>
//                             <td className="py-3">
//                               <span className={`badge rounded-pill fw-medium px-2 py-1 ${status === "Active" ? "bg-success bg-opacity-10 text-success border border-success" : "bg-secondary bg-opacity-10 text-secondary border border-secondary"}`}>
//                                 {status}
//                               </span>
//                               <div className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>
//                                 Renews: {c?.trialEndsAt ? new Date(c?.trialEndsAt).toLocaleDateString() : "N/A"}
//                               </div>
//                             </td>
//                             <td className="py-3 text-end">
//                               <div className="btn-group shadow-sm border rounded">
//                                 <button className="btn btn-light btn-sm text-dark fw-medium border-end" onClick={() => { setSelectedCompany(c); setShowDetailModal(true); }}>
//                                   View
//                                 </button>
//                                 <button className="btn btn-light btn-sm text-primary fw-medium border-end" onClick={() => { setSelectedCompany(c); setShowPasswordModal(true); }}>
//                                   Keys
//                                 </button>
//                                 <button className="btn btn-light btn-sm text-warning fw-medium border-end" onClick={() => handleResetData(id)}>
//                                   Wipe
//                                 </button>
//                                 {status === "Active" ? (
//                                   <button className="btn btn-light btn-sm text-secondary fw-medium border-end" onClick={() => handleSuspend(id)}>Suspend</button>
//                                 ) : (
//                                   <button className="btn btn-light btn-sm text-success fw-medium border-end" onClick={() => handleActivate(id)}>Activate</button>
//                                 )}
//                                 <button className="btn btn-light btn-sm text-danger fw-bold" onClick={() => handleDelete(id)}>✕</button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                       {filteredCompanies.length === 0 && (
//                         <tr><td colSpan="4" className="text-center py-5 text-muted">No organizations found.</td></tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div>
//               <h5 className="fw-bold mb-4 text-dark">System Operations Log</h5>
//               <div className="table-responsive">
//                 <table className="table table-hover align-middle border-top border-light mb-0" style={{ fontSize: "0.875rem" }}>
//                   <thead className="table-light text-secondary">
//                     <tr>
//                       <th className="fw-medium border-0 py-3">Timestamp</th>
//                       <th className="fw-medium border-0 py-3">Operation</th>
//                       <th className="fw-medium border-0 py-3">Event Detail</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {metrics?.auditLogs?.map((log, idx) => (
//                       <tr key={log.id ?? log.Id ?? `log-${idx}`}>
//                         <td className="text-muted py-3" style={{ width: "15%" }}>
//                           {log.createdAt ? new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "N/A"}
//                         </td>
//                         <td className="py-3" style={{ width: "10%" }}>
//                           <span className="badge bg-light text-dark border fw-medium">
//                             {log.action ?? log.Action}
//                           </span>
//                         </td>
//                         <td className="py-3">
//                           <span className="fw-medium text-dark d-block mb-1">{log.message ?? log.Message}</span>
//                           <pre className="m-0 text-muted" style={{ fontSize: "0.75rem", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
//                             {log.details ?? log.Details}
//                           </pre>
//                         </td>
//                       </tr>
//                     ))}
//                     {(!metrics?.auditLogs || metrics.auditLogs.length === 0) && (
//                       <tr><td colSpan="3" className="text-center py-5 text-muted">Audit stream is empty.</td></tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Tenant Details Modal */}
//       {showDetailModal && selectedCompany && (
//         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(2px)" }}>
//           <div className="modal-dialog modal-dialog-centered modal-lg">
//             <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
//               <div className="modal-header border-bottom bg-light px-4 py-3 align-items-center">
//                 <div className="d-flex align-items-center">
//                   <div className="rounded border bg-white d-flex align-items-center justify-content-center text-primary fw-bold shadow-sm me-3" style={{ width: 48, height: 48, fontSize: "1.2rem" }}>
//                     {(selectedCompany?.companyCode ?? selectedCompany?.CompanyCode ?? "UK").substring(0, 2).toUpperCase()}
//                   </div>
//                   <div>
//                     <h5 className="modal-title fw-bold text-dark mb-0">{selectedCompany?.companyName ?? selectedCompany?.CompanyName}</h5>
//                     <span className="text-muted small">Tenant ID: {selectedCompany?.companyCode ?? selectedCompany?.CompanyCode}</span>
//                   </div>
//                 </div>
//                 <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
//               </div>

//               <div className="modal-body p-4 bg-white">
//                 <div className="row g-4">
//                   {/* Left Column: Organization Info */}
//                   <div className="col-md-6">
//                     <h6 className="fw-bold text-uppercase text-secondary mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Organization Details</h6>
//                     <div className="bg-light rounded p-3 border border-light">
//                       <div className="mb-3">
//                         <small className="text-muted d-block">Legal Name</small>
//                         <span className="fw-medium text-dark">{selectedCompany?.legalName ?? selectedCompany?.LegalName ?? "Not Provided"}</span>
//                       </div>
//                       <div className="mb-3">
//                         <small className="text-muted d-block">Region / Country</small>
//                         <span className="fw-medium text-dark">{selectedCompany?.country ?? selectedCompany?.Country ?? "Global"}</span>
//                       </div>
//                       <div className="mb-0">
//                         <small className="text-muted d-block">Created On</small>
//                         <span className="fw-medium text-dark">
//                           {selectedCompany?.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString() : "Unknown"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right Column: Resources & Subscription */}
//                   <div className="col-md-6">
//                     <h6 className="fw-bold text-uppercase text-secondary mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Resource Allocation</h6>
//                     <div className="bg-light rounded p-3 border border-light">
//                       <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
//                         <small className="text-muted">Subscription Plan</small>
//                         <span className="badge bg-dark fw-medium">{selectedCompany?.subscriptionPlan ?? selectedCompany?.SubscriptionPlan ?? "Basic"}</span>
//                       </div>
//                       <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
//                         <small className="text-muted">Status</small>
//                         <span className={`badge rounded-pill fw-medium px-2 py-1 ${(selectedCompany?.subscriptionStatus ?? selectedCompany?.SubscriptionStatus) === "Active" ? "bg-success bg-opacity-10 text-success border border-success" : "bg-secondary bg-opacity-10 text-secondary border border-secondary"}`}>
//                           {selectedCompany?.subscriptionStatus ?? selectedCompany?.SubscriptionStatus ?? "Inactive"}
//                         </span>
//                       </div>
//                       <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
//                         <small className="text-muted">User Seats Allowed</small>
//                         <span className="fw-medium font-monospace">{selectedCompany?.maxUsers ?? selectedCompany?.MaxUsers ?? 0}</span>
//                       </div>
//                       <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
//                         <small className="text-muted">Max Warehouses</small>
//                         <span className="fw-medium font-monospace">{selectedCompany?.maxWarehouses ?? selectedCompany?.MaxWarehouses ?? 0}</span>
//                       </div>
//                       <div className="d-flex justify-content-between mb-0">
//                         <small className="text-muted">Storage Limit</small>
//                         <span className="fw-medium font-monospace">
//                           {((selectedCompany?.maxStorageBytes ?? selectedCompany?.MaxStorageBytes ?? 0) / (1024 * 1024 * 1024)).toFixed(1)} GB
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="modal-footer bg-light border-top p-3 justify-content-between">
//                 <div>
//                   {(selectedCompany?.subscriptionStatus ?? selectedCompany?.SubscriptionStatus) === "Active" ? (
//                     <button className="btn btn-outline-secondary btn-sm fw-medium me-2" onClick={() => handleSuspend(selectedCompany?.id ?? selectedCompany?.Id)}>Suspend Tenant</button>
//                   ) : (
//                     <button className="btn btn-outline-success btn-sm fw-medium me-2" onClick={() => handleActivate(selectedCompany?.id ?? selectedCompany?.Id)}>Activate Tenant</button>
//                   )}
//                   <button className="btn btn-outline-primary btn-sm fw-medium" onClick={() => { setShowDetailModal(false); setShowPasswordModal(true); }}>Reset Keys</button>
//                 </div>
//                 <button type="button" className="btn btn-dark btn-sm px-4 fw-medium" onClick={() => setShowDetailModal(false)}>Close Panel</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Minimalist Password Reset Modal */}
//       {showPasswordModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(2px)", zIndex: 1060 }}>
//           <div className="modal-dialog modal-dialog-centered modal-sm">
//             <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
//               <form onSubmit={handleResetPassword}>
//                 <div className="modal-body p-4">
//                   <h6 className="fw-bold text-dark mb-1">Reset Administrator Access</h6>
//                   <p className="text-muted small mb-4">Set a new root password for <strong>{selectedCompany?.companyName ?? selectedCompany?.CompanyName}</strong>.</p>

//                   <div className="mb-4">
//                     <label className="form-label text-secondary fw-semibold small">New Credentials</label>
//                     <input
//                       type="password"
//                       className="form-control bg-light border-light"
//                       placeholder="Minimum 8 characters"
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       required
//                     />
//                   </div>

//                   <div className="d-flex gap-2 justify-content-end mt-2">
//                     <button type="button" className="btn btn-light btn-sm px-3 fw-medium" onClick={() => setShowPasswordModal(false)}>Cancel</button>
//                     <button type="submit" className="btn btn-dark btn-sm px-4 fw-medium">Apply Reset</button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }