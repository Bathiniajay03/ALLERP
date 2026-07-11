import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { smartErpApi } from "../services/smartErpApi";

export default function BarcodeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await smartErpApi.unifiedSearchBarcode(val);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (barcode) => {
    navigate("/wms/barcode/" + encodeURIComponent(barcode));
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif", color: "#1e293b", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>Unified Barcode Search</h2>
        <p style={{ color: "#64748b", marginBottom: "30px", textAlign: "center" }}>Search for any barcode, item description, serial, or lot code instantly.</p>

        <div style={{ position: "relative", marginBottom: "30px" }}>
          <input 
            type="text" 
            value={query} 
            onChange={handleSearch}
            placeholder="Type barcode or keyword (e.g. ITM-AJ01, LOT-001)..."
            style={{ width: "100%", padding: "14px 20px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", outline: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}
          />
          {loading && (
            <span style={{ position: "absolute", right: "20px", top: "16px", color: "#64748b", fontSize: "14px" }}>Searching...</span>
          )}

          {results.length > 0 && (
            <ul style={{ 
              position: "absolute", top: "54px", left: 0, right: 0, background: "white", 
              borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", 
              listStyle: "none", padding: 0, margin: 0, zIndex: 100, border: "1px solid #e2e8f0", overflow: "hidden"
            }}>
              {results.map((r, idx) => (
                <li 
                  key={idx} 
                  onClick={() => handleSelect(r.barcode)}
                  style={{ padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ fontWeight: "600", color: "#0f172a" }}>{r.barcode}</span>
                  <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "12px", color: "#475569", fontWeight: "500" }}>{r.entityType}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "12px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
          🔍 Search results will display here. Select an item to view full details.
        </div>
      </div>
    </div>
  );
}
