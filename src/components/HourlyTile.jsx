// src/components/HourlyTile.jsx

export default function HourlyTile({ item }) {
  return (
       <div
      className="hourly-tile"
      style={{
        /* możesz zostawić tło, border itd. */
        padding: "8px 10px",
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
        {item.displayTime}
      </div>
      {/* tu później wstawimy ikonkę na podstawie item.code */}
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        {Math.round(item.temp)}°C
      </div>
      {item.hum != null && (
        <div style={{ opacity: 0.8 }}>Wilgotność: {item.hum}%</div>
      )}
      {item.code != null && (
        <div style={{ opacity: 0.7, marginTop: 4, fontSize: 11 }}>
          kod: {item.code}
        </div>
      )}
    </div>
  );
}
