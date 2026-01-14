import { useMemo } from "react";

function getTs(m) { return m.ts ?? m.lastUpdate ?? null; }
function getIndoorTemp(m) { return m.indoorTemp ?? null; }

function sortByTs(history) {
  return [...history].sort((a, b) => (getTs(a) ?? 0) - (getTs(b) ?? 0));
}

function formatTimeHHMM(ts) {
  if (ts == null) return "";
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function IndoorHistoryChart({ history }) {
  const ordered = useMemo(() => sortByTs(history || []), [history]);
  const points = useMemo(() => {
    return ordered.slice(-12).map(m => ({
      ts: getTs(m),
      temp: getIndoorTemp(m)
    })).filter(p => p.ts != null && p.temp != null);
  }, [ordered]);

  if (points.length < 2) return null;

  const minT = Math.min(...points.map(p => p.temp)) - 1;
  const maxT = Math.max(...points.map(p => p.temp)) + 1;
  const range = maxT - minT || 1;

  const width = 1000;
  const height = 180; // Nieco niższy dla balansu
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (i) => padding + (i * (chartWidth / (points.length - 1)));
  const getY = (t) => height - padding - ((t - minT) / range) * chartHeight;

  const pathData = points.reduce((acc, p, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.temp)}`, "");

  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div>
      <h2 className="city-search-title" style={{ marginBottom: 15 }}>W domu</h2>
      
      <div style={{ width: "100%", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="gradIndoor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0.5)" />
              <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
            </linearGradient>
          </defs>

          <path d={areaData} fill="url(#gradIndoor)" />
          <path d={pathData} fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(p.temp)} r="5" fill="#34d399" />
              <text x={getX(i)} y={getY(p.temp) - 15} fill="#fff" fontSize="14" textAnchor="middle" fontWeight="600">
                {p.temp.toFixed(1)}°
              </text>
              <text x={getX(i)} y={height - 5} fill="rgba(255,255,255,0.4)" fontSize="12" textAnchor="middle">
                {formatTimeHHMM(p.ts)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}