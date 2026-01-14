import { useMemo, useRef, useEffect } from "react";

function getTs(m) { return m.ts ?? m.lastUpdate ?? null; }
function getOutdoorTemp(m) { return m.outdoorTemp ?? m.temp ?? null; }

function sortByTs(history) {
  return [...history].sort((a, b) => (getTs(a) ?? 0) - (getTs(b) ?? 0));
}

function formatTimeHHMM(ts) {
  if (ts == null) return "";
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function OutdoorHistoryChart({ history }) {
  const scrollRef = useRef(null);
  
  const ordered = useMemo(() => sortByTs(history || []), [history]);
  
  // Pobieramy więcej punktów, np. ostatnie 30 pomiarów zamiast 12
  const points = useMemo(() => {
    return ordered.map(m => ({
      ts: getTs(m),
      temp: getOutdoorTemp(m)
    })).filter(p => p.ts != null && p.temp != null);
  }, [ordered]);

  // Automatyczne przewinięcie do końca (najnowszych danych) po załadowaniu
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [points]);

  if (points.length < 2) {
    return <div className="city-search-title">Oczekiwanie na dane...</div>;
  }

  const minT = Math.min(...points.map(p => p.temp)) - 1;
  const maxT = Math.max(...points.map(p => p.temp)) + 1;
  const range = maxT - minT || 1;

  // DYNAMIKA: Szerokość wykresu zależy od liczby punktów (np. 80px na jeden punkt)
  // Minimalna szerokość to 100%, aby wykres nie był za wąski przy małej ilości danych
  const pointSpacing = 70; 
  const height = 220;
  const padding = 40;
  const chartWidth = Math.max(points.length * pointSpacing, 800); 
  const width = chartWidth + padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (i) => padding + (i * (chartWidth / (points.length - 1)));
  const getY = (t) => height - padding - ((t - minT) / range) * chartHeight;

  const pathData = points.reduce((acc, p, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.temp)}`, "");

  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div style={{ marginBottom: "30px" }}>
      <h2 className="city-search-title" style={{ marginBottom: 15 }}>Na zewnątrz (historia)</h2>
      
      {/* Kontener umożliwiający przesuwanie */}
      <div 
        ref={scrollRef}
        style={{ 
          width: "100%", 
          overflowX: "auto", 
          cursor: "grab",
          WebkitOverflowScrolling: "touch", // Płynność na iOS
          scrollbarWidth: "thin", // Cienki scrollbar na Firefox
          scrollbarColor: "rgba(255,255,255,0.2) transparent"
        }}
      >
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          style={{ 
            width: `${width}px`, // Sztywna szerokość wymusza scroll
            height: `${height}px`, 
            display: "block" 
          }}
        >
          <defs>
            <linearGradient id="gradOutdoor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(79, 140, 255, 0.5)" />
              <stop offset="100%" stopColor="rgba(79, 140, 255, 0)" />
            </linearGradient>
          </defs>

          {/* Linie siatki co 5 stopni */}
          <line x1={0} y1={getY(minT)} x2={width} y2={getY(minT)} stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />

          <path d={areaData} fill="url(#gradOutdoor)" />
          <path d={pathData} fill="none" stroke="#4f8cff" strokeWidth="3" strokeLinecap="round" />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(p.temp)} r="4" fill="#4f8cff" />
              <text x={getX(i)} y={getY(p.temp) - 12} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">
                {p.temp.toFixed(1)}°
              </text>
              <text x={getX(i)} y={height - 10} fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">
                {formatTimeHHMM(p.ts)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p style={{ fontSize: "11px", opacity: 0.5, textAlign: "center", marginTop: "8px" }}>
        ← Przesuń wykres, aby zobaczyć wcześniejsze godziny →
      </p>
    </div>
  );
}