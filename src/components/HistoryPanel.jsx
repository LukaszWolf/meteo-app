// src/components/IndoorHistoryPanel.jsx
import IndoorHistoryChart from "./IndoorHistoryChart";
import OutdoorHistoryChart from "./OutdoorHistoryChart";

export default function HistoryPanel({ history }) {
  console.log("IndoorHistoryPanel history:", history);
  if (!history || history.length === 0) {
    return null;
  }

  return (
    
    <section className="city-search-section">
      
      <div className="city-search-card">
        <OutdoorHistoryChart history={history || []} />
        <IndoorHistoryChart history={history || []} />

      </div>
    </section>
  );
}
