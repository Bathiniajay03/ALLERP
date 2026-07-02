import React, { useState, useEffect } from "react";
import { smartErpApi } from "../services/smartErpApi";

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [settings, setSettings] = useState({
    "Smtp:Host": "",
    "Smtp:Port": "",
    "Smtp:Username": "",
    "Smtp:Password": "",
    "Smtp:FromEmail": "",
    "Smtp:FromName": "",
    "Smtp:EnableSsl": "true"
  });

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await smartErpApi.getSystemSettings();
      if (res.data) {
        // Map array of {key, value} back to object
        const settingsObj = { ...settings };
        res.data.forEach(item => {
          if (settingsObj[item.key] !== undefined) {
            settingsObj[item.key] = item.value;
          }
        });
        setSettings(settingsObj);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load system settings.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "true" : "false") : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      // Convert to array of key/value for the API
      const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await smartErpApi.updateSystemSettings(payload);
      setMessage({ text: "Settings saved successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to save system settings.", type: "danger" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">System Settings</h2>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: "", type: "" })} aria-label="Close"></button>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
          <h5 className="mb-0">SMTP Configuration</h5>
          <small className="text-muted">Configure the global email sender for the system.</small>
        </div>
        <div className="card-body">
          <form onSubmit={handleSave}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-label">SMTP Host</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Smtp:Host"
                    value={settings["Smtp:Host"]}
                    onChange={handleChange}
                    placeholder="e.g. smtp.gmail.com"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input
                    type="number"
                    className="form-control"
                    name="Smtp:Port"
                    value={settings["Smtp:Port"]}
                    onChange={handleChange}
                    placeholder="e.g. 587"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-label">Username / Email</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Smtp:Username"
                    value={settings["Smtp:Username"]}
                    onChange={handleChange}
                    placeholder="e.g. you@example.com"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-label">App Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="Smtp:Password"
                    value={settings["Smtp:Password"]}
                    onChange={handleChange}
                    placeholder="Enter SMTP App Password"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-label">From Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="Smtp:FromEmail"
                    value={settings["Smtp:FromEmail"]}
                    onChange={handleChange}
                    placeholder="e.g. noreply@example.com"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-label">From Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Smtp:FromName"
                    value={settings["Smtp:FromName"]}
                    onChange={handleChange}
                    placeholder="e.g. ProductERP Security"
                  />
                </div>
              </div>

              <div className="col-md-12 mb-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="enable-ssl-switch"
                    name="Smtp:EnableSsl"
                    checked={settings["Smtp:EnableSsl"] === "true"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="enable-ssl-switch">Enable SSL</label>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
              Save Configuration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
