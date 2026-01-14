import React from "react";

export default function StationClaimPanel({ 
  thing, 
  setThing, 
  nonce, 
  setNonce, 
  handleClaim, 
  claimStatus 
}) {
  return (
    <section className="city-search-section">
      <div className="city-search-card">
        <div className="city-search-header">
          <div>
            <h2 className="city-search-title">Połącz nową stację</h2>
            <p className="city-search-subtitle">
              Wprowadź dane urządzenia, aby przypisać je do swojego konta.
            </p>
          </div>
        </div>

        <div className="selected-city-wrapper" style={{ borderTop: "none", marginTop: 0 }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "16px",
            marginTop: "16px" 
          }}>
            <div className="city-search-input-row">
              <label style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px", display: "block" }}>
                Nazwa urządzenia
              </label>
              <input
                className="city-search-input"
                placeholder="np. station-001"
                value={thing}
                onChange={(e) => setThing(e.target.value)}
              />
            </div>

            <div className="city-search-input-row">
              <label style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px", display: "block" }}>
                Kod autoryzacji
              </label>
              <input
                className="city-search-input"
                placeholder="Wpisz kod z ESP"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button 
                className="cta" 
                onClick={handleClaim}
                style={{ width: "100%", height: "42px", borderRadius: "12px" }}
              >
                Sparuj stację
              </button>
            </div>
          </div>

          {claimStatus && (
            <div style={{ 
              marginTop: "20px",
              padding: "12px",
              borderRadius: "12px",
              fontSize: "14px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              {claimStatus}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}