// src/components/HistoryPanel.jsx
import GenericHistoryChart from "./GenericHistoryChart";

export default function HistoryPanel({ history }) {
  console.log("HistoryPanel history:", history);
  
  if (!history || history.length === 0) {
    return (
      <section className="city-search-section">
        <div className="city-search-card" style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ opacity: 0.7 }}>Brak danych historycznych.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="city-search-section">
      <div className="city-search-card">
        
        <h2 className="city-search-title" style={{ marginBottom: "4px" }}>
          Historia pomiarów
        </h2>
        <p className="city-search-subtitle" style={{ marginBottom: "20px" }}>
          Wykresy temperatury z ostatnich godzin
        </p>

        {/* Wykres Zewnętrzny */}
        <HistoryChart 
          history={history} 
          dataKey="outdoorTemp" 
          color="#4f8cff" 
          title="Na zewnątrz" 
          gradientId="gradOutdoor"
        />

        {/* Wykres Wewnętrzny */}
        <HistoryChart 
          history={history} 
          dataKey="indoorTemp" 
          color="#34d399" 
          title="W domu" 
          gradientId="gradIndoor"
        />

      </div>
    </section>
  );
}