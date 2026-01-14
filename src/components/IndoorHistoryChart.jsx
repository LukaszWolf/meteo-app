import { useMemo, useRef, useEffect } from "react";

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

function formatDateDDMM(ts) {
  if (ts == null) return "";
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function IndoorHistoryChart({ history }) {
  const scrollRef = useRef(null);
  const ordered = useMemo(() => sortByTs(history || []), [history]);
  const points = useMemo(() => {
    return ordered.map(m => ({
      ts: getTs(m),
      temp: getIndoorTemp(m)
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
  const height = 220;
  const padding = 50;
  const chartWidth = Math.max(points.length * pointSpacing, 800); 
  const width = chartWidth + padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (i) => padding + (i * (chartWidth / (points.length - 1)));
  const getY = (t) => height - padding - ((t - minT) / range) * chartHeight;

  const pathData = points.reduce((acc, p, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.temp)}`, "");
  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 className="city-search-title" style={{ marginBottom: 15, fontSize: "1rem" }}>W domu</h3>
      
      <div 
        ref={scrollRef}
        style={{ 
          width: "100%", 
          overflowX: "auto", 
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(52, 211, 153, 0.3) transparent"
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: `${width}px`, height: `${height}px`, display: "block" }}>
          <defs>
            <linearGradient id="gradIndoor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0.4)" />
              <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
            </linearGradient>
          </defs>
          <path d={areaData} fill="url(#gradIndoor)" />
          <path d={pathData} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => {
            const showDate = i === 0 || (new Date(p.ts).getDate() !== new Date(points[i - 1].ts).getDate());
            return (
              <g key={i}>
                {showDate && i !== 0 && (
                  <line x1={getX(i)} y1={padding} x2={getX(i)} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                )}
                <circle cx={getX(i)} cy={getY(p.temp)} r="4" fill="#34d399" />
                <text x={getX(i)} y={getY(p.temp) - 12} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="600">{p.temp.toFixed(1)}°</text>
                <text x={getX(i)} y={height - 24} fill="rgba(255,255,255,0.3)" fontSize="11" textAnchor="middle">{formatTimeHHMM(p.ts)}</text>
                {showDate && (
                  <text x={getX(i)} y={height - 8} fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="bold">{formatDateDDMM(p.ts)}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}