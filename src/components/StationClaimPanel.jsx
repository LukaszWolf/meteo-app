import React from "react";
import "../StationClaimPanel.css";

export default function StationClaimPanel({ 
  thing, 
  setThing, 
  nonce, 
  setNonce, 
  handleClaim, 
  claimStatus 
}) {
  return (
    <section className="station-claim-section">
      <div className="city-search-card">
        <div className="city-search-header">
          <div>
            <h2 className="city-search-title">Połącz nową stację</h2>
            <p className="city-search-subtitle">Wprowadź dane urządzenia</p>
          </div>
        </div>

        <div className="selected-city-wrapper" style={{ borderTop: "none", marginTop: 0 }}>
          <div className="station-form-grid">
            
            <div className="claim-input-group">
              <label className="claim-label">Nazwa urządzenia</label>
              <input
                className="city-search-input"
                placeholder="np. station-001"
                value={thing}
                onChange={(e) => setThing(e.target.value)}
              />
            </div>

            <div className="claim-input-group">
              <label className="claim-label">Kod autoryzacji</label>
              <input
                className="city-search-input"
                placeholder="Wpisz kod z ESP"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
              />
            </div>

            <button 
              className="cta claim-button" 
              onClick={handleClaim}
              style={{ height: "42px", borderRadius: "12px" }}
            >
              Sparuj stację
            </button>
            
          </div>

{claimStatus && (
  <div className={`claim-status-box ${claimStatus.includes("Błąd") ? "error" : claimStatus.includes("pomyślnie") ? "success" : ""}`}>
    {claimStatus}
  </div>
)}
        </div>
      </div>
    </section>
  );
}