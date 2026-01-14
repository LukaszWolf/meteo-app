const getUvLevel = (uv) => {
  if (uv == null) return "low";
  if (uv <= 2) return "low";
  if (uv <= 5) return "moderate";
  if (uv <= 7) return "high";
  if (uv <= 10) return "very-high";
  return "extreme";
};

export default function WeatherDashboard({ data }) {

  const {
    indoorTemp,
    outdoorTemp,
    pressure,
    humidity,
    uvIndex,
  } = data || {};

  const uvLevel = getUvLevel(uvIndex);

  const outdoorClasses = ["dash-card", "dash-outdoor", `uv-${uvLevel}`];
  if (humidity > 80 && (uvIndex ?? 0) < 1) {
    outdoorClasses.push("outdoor-rain");
  }

  return (
    <section className="dash-main-grid">
      
      {/* Na dworze */}
      <div className={outdoorClasses.join(" ")}>
        <div className="dash-section-title">NA ZEWNĄTRZ</div>
        <div className="dash-row">
          <div className="dash-icon dash-icon-weather" />
          <div className="dash-values">
            <div className="dash-temp-main">
              {outdoorTemp != null ? `${outdoorTemp.toFixed(1)} °C` : "—"}
            </div>
            <div className="dash-sub">
              Ciśnienie:{" "}
              {pressure != null ? `${pressure.toFixed(0)} hPa` : "—"} •{" "}
              Wilgotność:{" "}
              {humidity != null ? `${humidity.toFixed(0)} %` : "—"}
            </div>
            <div className="dash-sub">
              UV: {uvIndex != null ? uvIndex.toFixed(1) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* W domu */}
      <div className="dash-card dash-indoor">
        <div className="dash-section-title">W DOMU</div>
        <div className="dash-row">
          <div className="dash-icon dash-icon-house" />
          <div className="dash-values">
            <div className="dash-temp-main">
              {indoorTemp != null ? `${indoorTemp.toFixed(1)} °C` : "—"}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
