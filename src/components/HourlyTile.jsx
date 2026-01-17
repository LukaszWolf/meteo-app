// src/components/HourlyTile.jsx
import { getWeatherIcon } from "../utils/weatherUtils";

export default function HourlyTile({ item }) {
  return (
    <div
      className="hourly-tile"
      style={{
        padding: "8px 10px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize: 12,
        minWidth: "70px"
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {item.displayTime}
      </div>
      
      {/* IKONA POGODY */}
      <div style={{ fontSize: "24px", marginBottom: "4px" }}>
        {getWeatherIcon(item.code)}
      </div>

      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {Math.round(item.temp)}°C
      </div>
      
      {item.hum != null && (
        <div style={{ opacity: 0.8, fontSize: "10px", marginTop: "2px" }}>
          {item.hum}%
        </div>
      )}
    </div>
  );
}