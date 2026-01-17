// src/components/HistoryChart.jsx
import { useMemo, useRef, useEffect } from "react";

function getTs(m) { return m.ts ?? m.lastUpdate ?? null; }

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

export default function HistoryChart({ 
  history, 
  dataKey, 
  color = "#4f8cff", 
  title, 
  gradientId 
}) {
  const scrollRef = useRef(null);
  
  // 1. Sortowanie danych
  const ordered = useMemo(() => sortByTs(history || []), [history]);
  
  // 2. Mapowanie na punkty (dynamiczny klucz dataKey)
  const points = useMemo(() => {
    return ordered.map(m => ({
      ts: getTs(m),
      val: m[dataKey] // np. m.outdoorTemp lub m.indoorTemp
    })).filter(p => p.ts != null && p.val != null);
  }, [ordered, dataKey]);

  // Przewijanie do końca po załadowaniu
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [points]);

  if (points.length < 2) return null;

  // Obliczenia skali
  const values = points.map(p => p.val);
  const minV = Math.min(...values) - 1;
  const maxV = Math.max(...values) + 1;
  const range = maxV - minV || 1;

  const pointSpacing = 70; 
  const height = 260;
  const paddingSide = 50;
  const paddingTopBottom = 60;
  const chartWidth = Math.max(points.length * pointSpacing, 800); 
  const width = chartWidth + paddingSide * 2;
  const chartHeight = height - paddingTopBottom * 2;

  const getX = (i) => paddingSide + (i * (chartWidth / (points.length - 1)));
  const getY = (v) => height - paddingTopBottom - ((v - minV) / range) * chartHeight;

  // Generowanie ścieżki SVG
  const pathData = points.reduce((acc, p, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.val)}`, "");
  
  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - paddingTopBottom} L ${paddingSide} ${height - paddingTopBottom} Z`;

  return (
    <div style={{ marginBottom: "30px" }}>
      {title && (
        <h3 style={{ fontSize: "14px", fontWeight: "600", opacity: 0.8, marginBottom: "12px", color: "#fff" }}>
          {title}
        </h3>
      )}
      
      <div 
        ref={scrollRef}
        style={{ 
          width: "100%", 
          overflowX: "auto", 
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: `${color}33 transparent`, // color + hex alpha
          paddingBottom: "10px"
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: `${width}px`, height: `${height}px`, display: "block" }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Linia zerowa/bazowa (opcjonalnie) */}
          <line x1={0} y1={getY(minV)} x2={width} y2={getY(minV)} stroke="rgba(255,255,255,0.05)" />
          
          <path d={areaData} fill={`url(#${gradientId})`} />
          <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => {
            const dateObj = new Date(p.ts);
            const prevDateObj = i > 0 ? new Date(points[i - 1].ts) : null;
            // Pokaż datę jeśli to pierwszy punkt lub dzień się zmienił
            const showDate = i === 0 || (dateObj.getDate() !== prevDateObj?.getDate());

            return (
              <g key={i}>
                {showDate && i !== 0 && (
                  <line x1={getX(i)} y1={paddingTopBottom} x2={getX(i)} y2={height - paddingTopBottom} stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                )}
                
                <circle cx={getX(i)} cy={getY(p.val)} r="4" fill={color} />
                
                {/* Wartość */}
                <text x={getX(i)} y={getY(p.val) - 15} fill="#fff" fontSize="13" textAnchor="middle" fontWeight="bold">
                  {p.val.toFixed(1)}°
                </text>
                
                {/* Godzina */}
                <text x={getX(i)} y={height - 35} fill="rgba(255,255,255,0.5)" fontSize="11" textAnchor="middle">
                  {formatTimeHHMM(p.ts)}
                </text>
                
                {/* Data (tylko przy zmianie dnia) */}
                {showDate && (
                  <text x={getX(i)} y={height - 15} fill={color} fontSize="12" textAnchor="middle" fontWeight="bold">
                    {formatDateDDMM(p.ts)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}