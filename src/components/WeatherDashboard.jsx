const getUvLevel = (uv) => {
  if (uv == null) return "low";
  if (uv <= 2) return "low";
  if (uv <= 5) return "moderate";
  if (uv <= 7) return "high";
  if (uv <= 10) return "very-high";
  return "extreme";
};

export default function WeatherDashboard({ data }) {
  const { indoorTemp, outdoorTemp, pressure, humidity, uvIndex } = data || {};
  const uvLevel = getUvLevel(uvIndex);

  return (
    <section className="dash-main-grid">
      {/* KARTA: NA ZEWNĄTRZ */}
      <div className={`dash-card dash-outdoor uv-${uvLevel}`}>
        <div className="dash-section-header">
          <span className="dash-status-dot"></span>
          <div className="dash-section-title">NA ZEWNĄTRZ</div>
        </div>
        
        <div className="dash-main-content">
          <div className="dash-temp-display">
            {outdoorTemp != null ? `${outdoorTemp.toFixed(1)}°` : "—"}
            <span className="dash-unit">C</span>
          </div>
          
          <div className="dash-details-grid">
            <div className="dash-detail-item">
              <span className="dash-detail-label">Ciśnienie</span>
              <span className="dash-detail-value">{pressure != null ? `${pressure.toFixed(0)} hPa` : "—"}</span>
            </div>
            <div className="dash-detail-item">
              <span className="dash-detail-label">Wilgotność</span>
              <span className="dash-detail-value">{humidity != null ? `${humidity.toFixed(0)}%` : "—"}</span>
            </div>
            <div className="dash-detail-item">
              <span className="dash-detail-label">Indeks UV</span>
              <span className="dash-detail-value">{uvIndex != null ? uvIndex.toFixed(1) : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KARTA: W DOMU */}
      <div className="dash-card dash-indoor">
        <div className="dash-section-header">
          <span className="dash-status-dot"></span>
          <div className="dash-section-title">W DOMU</div>
        </div>
        
        <div className="dash-main-content">
          <div className="dash-temp-display">
            {indoorTemp != null ? `${indoorTemp.toFixed(1)}°` : "—"}
            <span className="dash-unit">C</span>
          </div>
          

        </div>
      </div>
    </section>
  );
}