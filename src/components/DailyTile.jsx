// src/components/DailyTile.jsx
import { getWeatherIcon } from "../utils/weatherUtils";

export default function DailyTile({ item }) {
  return (
    <div
      className="daily-tile"
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize: 12,
        minWidth: "80px"
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {item.label}
      </div>

      {/* IKONA POGODY */}
      <div style={{ fontSize: "28px", marginBottom: "4px" }}>
        {getWeatherIcon(item.code)}
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
        {Math.round(item.tMax)}° <span style={{ opacity: 0.6, fontSize: "0.9em" }}>/ {Math.round(item.tMin)}°</span>
      </div>

      <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "4px", display: "flex", gap: "6px" }}>
        {item.sunrise && <span>↑ {item.sunrise}</span>}
        {item.sunset && <span>↓ {item.sunset}</span>}
      </div>
    </div>
  );
}