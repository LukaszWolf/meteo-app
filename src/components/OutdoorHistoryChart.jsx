import { useEffect, useState, useMemo } from "react";

function getTs(m) { return m.ts ?? m.lastUpdate ?? null; }
function getOutdoorTemp(m) { return m.outdoorTemp ?? m.temp ?? null; }

function sortByTs(history) {
  return [...history].sort((a, b) => (getTs(a) ?? 0) - (getTs(b) ?? 0));
}

function formatTimeHHMM(ts) {
  if (ts == null) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function OutdoorHistoryChart({ history }) {
  const ordered = useMemo(() => sortByTs(history || []), [history]);
  const points = useMemo(() => {
    return ordered.slice(-12).map(m => ({
      ts: getTs(m),
      temp: getOutdoorTemp(m)
    })).filter(p => p.ts != null && p.temp != null);
  }, [ordered]);

  if (points.length < 2) {
    return <div className="city-search-title">Oczekiwanie na dane historyczne...</div>;
  }

  // Skalowanie
  const minT = Math.min(...points.map(p => p.temp)) - 1;
  const maxT = Math.max(...points.map(p => p.temp)) + 1;
  const range = maxT - minT || 1;

  // Parametry SVG
  const width = 1000;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (i) => padding + (i * (chartWidth / (points.length - 1)));
  const getY = (t) => height - padding - ((t - minT) / range) * chartHeight;

  // Budowanie ścieżki (Linear Path)
  const pathData = points.reduce((acc, p, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.temp)}`, "");

  // Ścieżka dla wypełnienia (Area)
  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div style={{ marginBottom: "30px" }}>
      <h2 className="city-search-title" style={{ marginBottom: 15 }}>Na zewnątrz</h2>
      
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="gradOutdoor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(79, 140, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(79, 140, 255, 0)" />
            </linearGradient>
          </defs>

          {/* Linie siatki poziomej (opcjonalnie) */}
          <line x1={padding} y1={getY(minT + 1)} x2={width-padding} y2={getY(minT + 1)} stroke="rgba(255,255,255,0.05)" />
          
          {/* Obszar wypełnienia */}
          <path d={areaData} fill="url(#gradOutdoor)" />
          
          {/* Główna linia wykresu */}
          <path d={pathData} fill="none" stroke="#4f8cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Punkty i etykiety */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(p.temp)} r="6" fill="#4f8cff" />
              <text x={getX(i)} y={getY(p.temp) - 15} fill="#fff" fontSize="14" textAnchor="middle" fontWeight="bold">
                {p.temp.toFixed(1)}°
              </text>
              <text x={getX(i)} y={height - 10} fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="middle">
                {formatTimeHHMM(p.ts)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}