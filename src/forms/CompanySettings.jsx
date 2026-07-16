import React, { useState, useEffect, useCallback } from "react";
import { smartErpApi } from "../services/smartErpApi";
import ClientChatWidget from "../components/ClientChatWidget";

export default function CompanySettings() {
  const [settings, setSettings] = useState({
    companyName: "", legalName: "", email: "", phone: "", website: "",
    address: "", city: "", state: "", country: "", gstNumber: "", panNumber: "",
    logo: "", primaryColor: "#0f172a", timezone: "UTC", currency: "USD",
    sidebarBgColor: "#0f172a", sidebarTextColor: "#f8fafc",
    storefrontEyebrow: "", storefrontTitle: "", storefrontDescription: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await smartErpApi.getCompanySettings();
      if (res.data) {
        setSettings({
          companyName: res.data.companyName || "",
          legalName: res.data.legalName || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          website: res.data.website || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          country: res.data.country || "",
          gstNumber: res.data.gstNumber || "",
          panNumber: res.data.panNumber || "",
          logo: res.data.logo || "",
          primaryColor: res.data.primaryColor || "#0f172a",
          timezone: res.data.timezone || "UTC",
          currency: res.data.currency || "USD",
          sidebarBgColor: res.data.sidebarBgColor || "#0f172a",
          sidebarTextColor: res.data.sidebarTextColor || "#f8fafc",
          storefrontEyebrow: res.data.storefrontEyebrow || "",
          storefrontTitle: res.data.storefrontTitle || "",
          storefrontDescription: res.data.storefrontDescription || "",
        });
      }
    } catch (err) {
      setError("Failed to load company settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(""); setError("");
    try {
      await smartErpApi.updateCompanySettings(settings);
      setSuccess("Company settings updated successfully.");
      // Apply dynamic branding live
      document.documentElement.style.setProperty("--brand-color", settings.primaryColor);
      document.documentElement.style.setProperty("--sidebar-bg", settings.sidebarBgColor);
      document.documentElement.style.setProperty("--sidebar-color", settings.sidebarTextColor);

      // Update sessionStorage so refresh maintains it instantly
      const currentBrand = JSON.parse(window.sessionStorage.getItem("erp_company_brand") || "{}");
      const updatedBrand = { 
        ...currentBrand, 
        companyName: settings.companyName,
        primaryColor: settings.primaryColor,
        logo: settings.logo,
        sidebarBgColor: settings.sidebarBgColor,
        sidebarTextColor: settings.sidebarTextColor,
        storefrontEyebrow: settings.storefrontEyebrow,
        storefrontTitle: settings.storefrontTitle,
        storefrontDescription: settings.storefrontDescription
      };
      window.sessionStorage.setItem("erp_company_brand", JSON.stringify(updatedBrand));

      // Dispatch event to App.jsx if needed (App.jsx also listens to window events if we wanted, but not strictly necessary since CSS variables update live)
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center gap-3 mb-4 bg-white p-4 rounded-3 shadow-sm">
        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4"
          style={{ width: 52, height: 52, background: settings.primaryColor || "#3b82f6", flexShrink: 0 }}>
          {(settings.companyName || "C")[0]}
        </div>
        <div>
          <h1 className="fw-bold m-0 fs-4">Company Settings</h1>
          <p className="text-muted m-0 small">Update your organisation's profile, branding and fiscal preferences.</p>
        </div>
      </div>

      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {success}<button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
      </div>}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}<button type="button" className="btn-close" onClick={() => setError("")}></button>
      </div>}

      <form onSubmit={handleSave}>

        {/* Company Identity */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold text-dark">Organisation Identity</h5>
            <p className="text-muted small">Displayed across invoices, portals, and reports.</p>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Company Display Name</label>
                <input type="text" name="companyName" className="form-control" value={settings.companyName} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Legal / Billing Name</label>
                <input type="text" name="legalName" className="form-control" value={settings.legalName} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">GST Number / Tax ID</label>
                <input type="text" name="gstNumber" className="form-control" value={settings.gstNumber} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">PAN / Tax Registration Code</label>
                <input type="text" name="panNumber" className="form-control" value={settings.panNumber} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Email</label>
                <input type="email" name="email" className="form-control" value={settings.email} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Phone</label>
                <input type="text" name="phone" className="form-control" value={settings.phone} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Website</label>
                <input type="text" name="website" className="form-control" value={settings.website} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold text-dark">Registered Address</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-bold">Street Address</label>
                <textarea name="address" className="form-control" rows="2" value={settings.address} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">City</label>
                <input type="text" name="city" className="form-control" value={settings.city} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">State / Province</label>
                <input type="text" name="state" className="form-control" value={settings.state} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Country</label>
                <input type="text" name="country" className="form-control" value={settings.country} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold text-dark">Brand & Theme</h5>
            <p className="text-muted small">Applied to your portal, login page and navbars.</p>
          </div>
          <div className="card-body p-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
                <label className="form-label fw-bold">Logo URL</label>
                <input type="text" name="logo" className="form-control" placeholder="https://cdn.example.com/logo.png" value={settings.logo} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Primary Brand Color</label>
                <div className="d-flex align-items-center gap-2">
                  <input type="color" name="primaryColor" className="form-control form-control-color" style={{ width: 60 }} value={settings.primaryColor} onChange={handleChange} />
                  <input type="text" name="primaryColor" className="form-control" value={settings.primaryColor} onChange={handleChange} />
                </div>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Sidebar Background Color</label>
                <div className="d-flex align-items-center gap-2">
                  <input type="color" name="sidebarBgColor" className="form-control form-control-color" style={{ width: 60 }} value={settings.sidebarBgColor} onChange={handleChange} />
                  <input type="text" name="sidebarBgColor" className="form-control" value={settings.sidebarBgColor} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Sidebar Text Color</label>
                <div className="d-flex align-items-center gap-2">
                  <input type="color" name="sidebarTextColor" className="form-control form-control-color" style={{ width: 60 }} value={settings.sidebarTextColor} onChange={handleChange} />
                  <input type="text" name="sidebarTextColor" className="form-control" value={settings.sidebarTextColor} onChange={handleChange} />
                </div>
              </div>

              <div className="col-12 text-center pt-2">
                {settings.logo && (
                  <img src={settings.logo} alt="Logo Preview" className="rounded-3 border"
                    style={{ maxHeight: 60, maxWidth: "100%", objectFit: "contain" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer App Storefront Customization */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold text-dark">Customer App Storefront</h5>
            <p className="text-muted small">Configure the hero banner texts shown to customers on your portal.</p>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-bold">Hero Eyebrow Text</label>
                <input type="text" name="storefrontEyebrow" className="form-control" placeholder="e.g. Quick commerce" value={settings.storefrontEyebrow} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Hero Heading / Title</label>
                <input type="text" name="storefrontTitle" className="form-control" placeholder="e.g. Daily essentials, delivered fast" value={settings.storefrontTitle} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Hero Description / Subheading</label>
                <textarea name="storefrontDescription" className="form-control" rows="3" placeholder="Describe your store catalog..." value={settings.storefrontDescription} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Fiscal Settings */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold text-dark">Fiscal & Regional Settings</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Default Currency</label>
                <select name="currency" className="form-select" value={settings.currency} onChange={handleChange}>
                  <option value="USD">USD – US Dollar ($)</option>
                  <option value="EUR">EUR – Euro (€)</option>
                  <option value="GBP">GBP – British Pound (£)</option>
                  <option value="INR">INR – Indian Rupee (₹)</option>
                  <option value="AED">AED – UAE Dirham (د.إ)</option>
                  <option value="SGD">SGD – Singapore Dollar (S$)</option>
                  <option value="CAD">CAD – Canadian Dollar (C$)</option>
                  <option value="AUD">AUD – Australian Dollar (A$)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Timezone</label>
                <select name="timezone" className="form-select" value={settings.timezone} onChange={handleChange}>
                  <option value="UTC">UTC / GMT</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                  <option value="CST">Central Standard Time (CST)</option>
                  <option value="MST">Mountain Standard Time (MST)</option>
                  <option value="PST">Pacific Standard Time (PST)</option>
                  <option value="IST">India Standard Time (IST)</option>
                  <option value="CET">Central European Time (CET)</option>
                  <option value="AST">Arabia Standard Time (AST)</option>
                  <option value="SGT">Singapore Standard Time (SGT)</option>
                  <option value="AEST">Australian Eastern Standard Time (AEST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary px-4" onClick={fetchSettings} disabled={saving}>
            Reset
          </button>
          <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={saving}>
            {saving ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</>
            ) : "Save Changes"}
          </button>
        </div>
      </form>
      <ClientChatWidget />
    </div>
  );
}
