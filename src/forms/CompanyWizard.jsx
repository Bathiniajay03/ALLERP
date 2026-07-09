import React, { useState } from "react";
import { smartErpApi } from "../services/smartErpApi";

export default function CompanyWizard({ onFinish }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatLocalDateTime = (date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzoffset).toISOString().slice(0, 16);
  };

  const [manualBasePlan, setManualBasePlan] = useState("Basic");
  const [manualDurationUnit, setManualDurationUnit] = useState("Days");
  const [manualDurationValue, setManualDurationValue] = useState(7);
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [manualStartDate, setManualStartDate] = useState(formatLocalDateTime(new Date()));
  const [manualEndDate, setManualEndDate] = useState(formatLocalDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));

  const [formData, setFormData] = useState({
    company: {
      companyCode: "",
      companyName: "",
      legalName: "",
      gstNumber: "",
      panNumber: "",
      country: "United States",
      state: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logo: "",
      primaryColor: "#0f172a",
      subscriptionPlan: "Trial",
      subscriptionStatus: "Active",
      maxUsers: 5,
      maxWarehouses: 3,
      maxStorageBytes: 1073741824, // 1 GB
      maxApiCallsPerMonth: 10000,
      maxInventoryRecords: 1000,
      enableFinance: true,
      enableAI: true,
      enableReports: true,
      enableWarehouse: true,
      enableAutomation: true,
      enableScanner: true,
      enablePurchaseOrders: true,
      enableSales: true
    },
    adminUser: {
      username: "",
      email: "",
      password: "",
      name: ""
    },
    warehouseCode: "MAIN",
    warehouseName: "Main Warehouse",
    timezone: "UTC",
    currency: "USD",
    taxRate: 0,
    fiscalYearStart: "January"
  });

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      company: { ...prev.company, [name]: value }
    }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      adminUser: { ...prev.adminUser, [name]: value }
    }));
  };

  const handleRootChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.company.companyCode || !formData.company.companyName) {
        setError("Company Code and Name are required.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.adminUser.username || !formData.adminUser.password) {
        setError("Admin Username and Password are required.");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.warehouseCode || !formData.warehouseName) {
        setError("Warehouse Code and Name are required.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    let finalPayload = { ...formData };
    if (formData.company.subscriptionPlan === "Manual") {
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

      finalPayload.company.trialEndsAt = computedEndsAt ? computedEndsAt.toISOString() : null;
      finalPayload.company.subscriptionPlan = manualBasePlan;
    }

    try {
      await smartErpApi.wizardOnboard(finalPayload);
      alert("Company successfully onboarded!");
      onFinish();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to onboard company.");
    } finally {
      setLoading(false);
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

  return (
    <div className="card shadow-sm border-0 bg-white mx-auto" style={{ maxWidth: 800 }}>
      {/* Step Stepper Header */}
      <div className="card-header bg-light border-0 py-3">
        <div className="d-flex justify-content-between text-center">
          <div className={`fw-bold small flex-grow-1 ${step === 1 ? "text-primary" : "text-muted"}`}>
            1. Company Info
          </div>
          <div className={`fw-bold small flex-grow-1 ${step === 2 ? "text-primary" : "text-muted"}`}>
            2. Admin User
          </div>
          <div className={`fw-bold small flex-grow-1 ${step === 3 ? "text-primary" : "text-muted"}`}>
            3. Warehouse
          </div>
          <div className={`fw-bold small flex-grow-1 ${step === 4 ? "text-primary" : "text-muted"}`}>
            4. Settings
          </div>
          <div className={`fw-bold small flex-grow-1 ${step === 5 ? "text-primary" : "text-muted"}`}>
            5. Finish
          </div>
        </div>
        <div className="progress mt-2" style={{ height: 6 }}>
          <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>
      </div>

      <div className="card-body p-4">
        {error && <div className="alert alert-danger">{error}</div>}

        {/* STEP 1: Company Info */}
        {step === 1 && (
          <div>
            <h4 className="fw-bold mb-3">Company Registry Details</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Company Code (SKU Namespace)</label>
                <input type="text" name="companyCode" className="form-control" placeholder="e.g. ACME" value={formData.company.companyCode} onChange={handleCompanyChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Company Name</label>
                <input type="text" name="companyName" className="form-control" placeholder="e.g. Acme Corporation" value={formData.company.companyName} onChange={handleCompanyChange} required />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Legal Name / Billing Entity</label>
                <input type="text" name="legalName" className="form-control" placeholder="e.g. Acme Industrial Solutions LLC" value={formData.company.legalName} onChange={handleCompanyChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">GST Number / Tax ID</label>
                <input type="text" name="gstNumber" className="form-control" value={formData.company.gstNumber} onChange={handleCompanyChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">PAN Number / Tax Code</label>
                <input type="text" name="panNumber" className="form-control" value={formData.company.panNumber} onChange={handleCompanyChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Country</label>
                <input type="text" name="country" className="form-control" value={formData.company.country} onChange={handleCompanyChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">State</label>
                <input type="text" name="state" className="form-control" value={formData.company.state} onChange={handleCompanyChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">City</label>
                <input type="text" name="city" className="form-control" value={formData.company.city} onChange={handleCompanyChange} />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Address</label>
                <textarea name="address" className="form-control" rows="2" value={formData.company.address} onChange={handleCompanyChange}></textarea>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Create Admin User */}
        {step === 2 && (
          <div>
            <h4 className="fw-bold mb-3">Company Administrator Identity</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Admin Username</label>
                <input type="text" name="username" className="form-control" placeholder="e.g. acmeadmin" value={formData.adminUser.username} onChange={handleAdminChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Admin Full Name</label>
                <input type="text" name="name" className="form-control" placeholder="e.g. John Administrator" value={formData.adminUser.name} onChange={handleAdminChange} />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Admin Email</label>
                <input type="email" name="email" className="form-control" placeholder="admin@acme.com" value={formData.adminUser.email} onChange={handleAdminChange} />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Account Password</label>
                <input type="password" name="password" className="form-control" placeholder="Secure Password" value={formData.adminUser.password} onChange={handleAdminChange} required />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Create Default Warehouse */}
        {step === 3 && (
          <div>
            <h4 className="fw-bold mb-3">Default Storage Location</h4>
            <p className="text-muted">A default warehouse is required to hold initial inventory levels.</p>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Warehouse Code</label>
                <input type="text" name="warehouseCode" className="form-control" placeholder="e.g. WH-MAIN" value={formData.warehouseCode} onChange={handleRootChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Warehouse Name</label>
                <input type="text" name="warehouseName" className="form-control" placeholder="e.g. Main Distribution Center" value={formData.warehouseName} onChange={handleRootChange} required />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Financial Settings */}
        {step === 4 && (
          <div>
            <h4 className="fw-bold mb-3">Fiscal & Subscription Parameters</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Default Currency</label>
                <select name="currency" className="form-select" value={formData.currency} onChange={handleRootChange}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Timezone</label>
                <select name="timezone" className="form-select" value={formData.timezone} onChange={handleRootChange}>
                  <option value="UTC">UTC / GMT</option>
                  <option value="EST">Eastern Standard Time</option>
                  <option value="IST">India Standard Time</option>
                  <option value="CET">Central European Time</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Subscription Tier</label>
                <select name="subscriptionPlan" className="form-select" value={formData.company.subscriptionPlan} onChange={(e) => {
                  const val = e.target.value;
                  let limits = { maxUsers: 5, maxWarehouses: 3, maxStorageBytes: 1073741824 };
                  if (val !== "Manual") {
                    const temp = getBasePlanTemplate(val);
                    limits = {
                      maxUsers: temp.maxUsers,
                      maxWarehouses: temp.maxWarehouses,
                      maxStorageBytes: temp.maxStorageBytes,
                      enableFinance: temp.enableFinance,
                      enableAI: temp.enableAI,
                      enableReports: temp.enableReports,
                      enableWarehouse: temp.enableWarehouse,
                      enableAutomation: temp.enableAutomation,
                      enableScanner: temp.enableScanner,
                      enablePurchaseOrders: temp.enablePurchaseOrders,
                      enableSales: temp.enableSales
                    };
                  } else {
                    const temp = getBasePlanTemplate(manualBasePlan);
                    limits = {
                      maxUsers: temp.maxUsers,
                      maxWarehouses: temp.maxWarehouses,
                      maxStorageBytes: temp.maxStorageBytes,
                      enableFinance: temp.enableFinance,
                      enableAI: temp.enableAI,
                      enableReports: temp.enableReports,
                      enableWarehouse: temp.enableWarehouse,
                      enableAutomation: temp.enableAutomation,
                      enableScanner: temp.enableScanner,
                      enablePurchaseOrders: temp.enablePurchaseOrders,
                      enableSales: temp.enableSales
                    };
                  }

                  setFormData(prev => ({
                    ...prev,
                    company: {
                      ...prev.company,
                      subscriptionPlan: val,
                      ...limits
                    }
                  }));
                }}>
                  <option value="Trial">Trial Plan</option>
                  <option value="Basic">Basic Plan</option>
                  <option value="Professional">Professional Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                  <option value="Manual">Manual (Custom Term)</option>
                </select>
              </div>

              {formData.company.subscriptionPlan === "Manual" && (
                <div className="col-12 mt-2 bg-light p-3 rounded border">
                  <h6 className="fw-bold mb-3 text-secondary">Manual Custom Configuration</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Base Service Level</label>
                      <select className="form-select" value={manualBasePlan} onChange={e => {
                        const selectedBase = e.target.value;
                        setManualBasePlan(selectedBase);
                        const temp = getBasePlanTemplate(selectedBase);
                        setFormData(prev => ({
                          ...prev,
                          company: {
                            ...prev.company,
                            maxUsers: temp.maxUsers,
                            maxWarehouses: temp.maxWarehouses,
                            maxStorageBytes: temp.maxStorageBytes,
                            enableFinance: temp.enableFinance,
                            enableAI: temp.enableAI,
                            enableReports: temp.enableReports,
                            enableWarehouse: temp.enableWarehouse,
                            enableAutomation: temp.enableAutomation,
                            enableScanner: temp.enableScanner,
                            enablePurchaseOrders: temp.enablePurchaseOrders,
                            enableSales: temp.enableSales
                          }
                        }));
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
              <div className="col-md-6">
                <label className="form-label fw-bold">Branding Theme Color</label>
                <input type="color" name="primaryColor" className="form-control form-control-color w-100" value={formData.company.primaryColor} onChange={handleCompanyChange} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Finish */}
        {step === 5 && (
          <div className="text-center py-4">
            <h4 className="fw-bold text-success mb-3">Ready to Provision Platform</h4>
            <p className="text-muted">Review the details. Clicking Finish will write the registries and provision the data structures.</p>
            <div className="bg-light p-3 rounded text-start mb-4 mx-auto" style={{ maxWidth: 500 }}>
              <div className="row small g-2">
                <div className="col-6"><strong>Company Code:</strong></div>
                <div className="col-6">{formData.company.companyCode}</div>
                <div className="col-6"><strong>Company Name:</strong></div>
                <div className="col-6">{formData.company.companyName}</div>
                <div className="col-6"><strong>Admin Username:</strong></div>
                <div className="col-6">{formData.adminUser.username}</div>
                <div className="col-6"><strong>Warehouse Code:</strong></div>
                <div className="col-6">{formData.warehouseCode}</div>
                <div className="col-6"><strong>Subscription Tier:</strong></div>
                <div className="col-6">{formData.company.subscriptionPlan}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Footer Controls */}
      <div className="card-footer bg-light border-0 py-3 d-flex justify-content-between">
        {step > 1 ? (
          <button className="btn btn-outline-secondary px-4" onClick={prevStep} disabled={loading}>Previous</button>
        ) : (
          <div></div>
        )}

        {step < 5 ? (
          <button className="btn btn-primary px-4" onClick={nextStep}>Next Step</button>
        ) : (
          <button className="btn btn-success px-5 fw-bold" onClick={handleSubmit} disabled={loading}>
            {loading ? "Provisioning..." : "Finish & Provision"}
          </button>
        )}
      </div>
    </div>
  );
}
