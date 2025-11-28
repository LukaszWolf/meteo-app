// src/components/DailyTile.jsx

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
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {item.label}  {/* np. "Śr 27.11" */}
      </div>

      {/* tu później wstawimy ikonkę wg item.code */}
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
        {Math.round(item.tMax)}° / {Math.round(item.tMin)}°
      </div>

      {item.sunrise && (
        <div style={{ opacity: 0.8 }}>↑ {item.sunrise}</div>
      )}
      {item.sunset && (
        <div style={{ opacity: 0.8 }}>↓ {item.sunset}</div>
      )}

      {item.code != null && (
        <div style={{ opacity: 0.7, marginTop: 4, fontSize: 11 }}>
          kod: {item.code}
        </div>
      )}
    </div>
  );
}
