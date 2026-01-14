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

function formatDateDDMM(ts) {
  if (ts == null) return "";
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function OutdoorHistoryChart({ history }) {
  const scrollRef = useRef(null);
  const ordered = useMemo(() => sortByTs(history || []), [history]);
  const points = useMemo(() => {
    return ordered.map(m => ({
      ts: getTs(m),
      temp: getOutdoorTemp(m)
    })).filter(p => p.ts != null && p.temp != null);
  }, [ordered]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [points]);

  if (points.length < 2) return null;

  const temps = points.map(p => p.temp);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const range = maxT - minT || 1;

  const pointSpacing = 70; 
  const height = 260; // Zwiększone, aby data była widoczna
  const paddingSide = 50;
  const paddingTopBottom = 60;
  const chartWidth = Math.max(points.length * pointSpacing, 800); 
  const width = chartWidth + paddingSide * 2;
  const chartHeight = height - paddingTopBottom * 2;

  const getX = (i) => paddingSide + (i * (chartWidth / (points.length - 1)));
  const getY = (t) => height - paddingTopBottom - ((t - minT) / range) * chartHeight;

  const pathData = points.reduce((acc, p, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.temp)}`, "");
  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - paddingTopBottom} L ${paddingSide} ${height - paddingTopBottom} Z`;

  return (
    <div style={{ marginBottom: "40px" }}>
      {/* Nagłówek identyczny jak w prognozie */}
      <h2 className="city-search-title" style={{ marginBottom: "4px" }}>
        Historia pomiarów
      </h2>
      <p className="city-search-subtitle" style={{ marginBottom: "20px" }}>
        Wykres odczytów temperatury
      </p>

      <h3 style={{ fontSize: "14px", fontWeight: "600", opacity: 0.8, marginBottom: "12px", color: "#fff" }}>
        Na zewnątrz
      </h3>
      
      <div 
        ref={scrollRef}
        style={{ 
          width: "100%", 
          overflowX: "auto", 
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(79, 140, 255, 0.3) transparent",
          paddingBottom: "10px"
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: `${width}px`, height: `${height}px`, display: "block" }}>
          <defs>
            <linearGradient id="gradOutdoor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(79, 140, 255, 0.5)" />
              <stop offset="100%" stopColor="rgba(79, 140, 255, 0)" />
            </linearGradient>
          </defs>
          <line x1={0} y1={getY(minT)} x2={width} y2={getY(minT)} stroke="rgba(255,255,255,0.05)" />
          <path d={areaData} fill="url(#gradOutdoor)" />
          <path d={pathData} fill="none" stroke="#4f8cff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => {
            const dateObj = new Date(p.ts);
            const prevDateObj = i > 0 ? new Date(points[i - 1].ts) : null;
            const showDate = i === 0 || (dateObj.getDate() !== prevDateObj?.getDate());

            return (
              <g key={i}>
                {showDate && i !== 0 && (
                  <line x1={getX(i)} y1={paddingTopBottom} x2={getX(i)} y2={height - paddingTopBottom} stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                )}
                <circle cx={getX(i)} cy={getY(p.temp)} r="4" fill="#4f8cff" />
                <text x={getX(i)} y={getY(p.temp) - 15} fill="#fff" fontSize="13" textAnchor="middle" fontWeight="bold">{p.temp.toFixed(1)}°</text>
                <text x={getX(i)} y={height - 35} fill="rgba(255,255,255,0.5)" fontSize="11" textAnchor="middle">{formatTimeHHMM(p.ts)}</text>
                {showDate && (
                  <text x={getX(i)} y={height - 15} fill="#4f8cff" fontSize="12" textAnchor="middle" fontWeight="bold">{formatDateDDMM(p.ts)}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}