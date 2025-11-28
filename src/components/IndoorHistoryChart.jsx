// src/components/IndoorHistoryChart.jsx
import { useEffect, useState } from "react";

// ---- helpery do odczytu pól z obiektu ----
function getTs(m) {
  // w historii masz lastUpdate, ale na wszelki wypadek obsłużmy też ts
  return m.ts ?? m.lastUpdate ?? null;
}

function getIndoorTemp(m) {
  if (typeof m.indoorTemp === "number") return m.indoorTemp;
  return null;
}

// sortujemy po czasie
function sortByTs(history) {
  return [...history].sort((a, b) => {
    const da = getTs(a) ?? 0;
    const db = getTs(b) ?? 0;
    return da - db;
  });
}

// formatowanie godziny do "HH:MM"
function formatTimeHHMM(ts) {
  if (ts == null) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ile kafelków na stronę – zależnie od szerokości okna
function getTilesPerPage() {
  if (typeof window === "undefined") return 6;
  const w = window.innerWidth;
  if (w < 480) return 6;    // bardzo mały telefon
  if (w < 768) return 8;    // telefon
  if (w < 1024) return 10;  // tablet / mały laptop
  return 12;                // większe ekrany
}

export default function IndoorHistoryChart({ history }) {
  const ordered = sortByTs(history || []);
  const last24 = ordered.slice(-24);

  const indoorPoints = last24
    .map((m) => ({
      ts: getTs(m),
      temp: getIndoorTemp(m),
    }))
    .filter((p) => p.ts != null && p.temp != null);

  if (indoorPoints.length === 0) {
    return (
      <div>
        <h2 className="city-search-title" style={{ marginBottom: 6 }}>
          W domu
        </h2>
        <p>Brak pomiarów temperatury w domu.</p>
      </div>
    );
  }

  // ---- normalizacja wysokości słupków (skalowanie) ----
  let minT = Infinity;
  let maxT = -Infinity;
  indoorPoints.forEach((p) => {
    if (p.temp < minT) minT = p.temp;
    if (p.temp > maxT) maxT = p.temp;
  });

  if (!Number.isFinite(minT) || !Number.isFinite(maxT)) {
    minT = 0;
    maxT = 1;
  }

  // jak zakres jest malutki, dodaj "bufor", żeby słupki były widoczne
  if (maxT - minT < 0.1) {
    minT -= 0.05;
    maxT += 0.05;
  }
  const range = maxT - minT || 1;

  // ---- logika paska jak w prognozie godzinowej/dziennej ----
  const [tilesPerPage, setTilesPerPage] = useState(getTilesPerPage);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const onResize = () => {
      const next = getTilesPerPage();
      setTilesPerPage(next);
      setStartIndex(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxStart = Math.max(0, indoorPoints.length - tilesPerPage);
  const safeStart = Math.min(startIndex, maxStart);

  const canGoPrev = safeStart > 0;
  const canGoNext = safeStart < maxStart;

  const visible = indoorPoints.slice(safeStart, safeStart + tilesPerPage);

  const handlePrev = () => {
    if (!canGoPrev) return;
    const next = Math.max(0, safeStart - tilesPerPage);
    setStartIndex(next);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    const next = Math.min(maxStart, safeStart + tilesPerPage);
    setStartIndex(next);
  };

  return (
    <div>
      <h2 className="city-search-title" style={{ marginBottom: 6 }}>
        W domu
      </h2>

      <div
        className="weather-strip"
        style={{ marginTop: 4 }}
      >
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="weather-strip-btn"
        >
          ◀
        </button>

        <div className="weather-tiles-row">
          {visible.map((p, idx) => {
            const h = ((p.temp - minT) / range) * 100;

            return (
              <div
                key={`${p.ts}-${idx}`}
                className="hourly-tile"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "8px 10px",
                  background: "rgba(0, 0, 0, 0.16)",
                  borderRadius: 14,
                }}
              >
                {/* słupek */}
                <div
                  style={{
                    flex: "1 1 auto",
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      minHeight: "6%",
                      borderRadius: "6px 6px 0 0",
                      background:
                        "linear-gradient(to top, rgba(79,140,255,0.9), rgba(170,210,255,0.85))",
                    }}
                    title={`${p.temp.toFixed(1)} °C`}
                  />
                </div>

                {/* podpis: godzina + temperatura */}
                <div
                  style={{
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  <div>{formatTimeHHMM(p.ts)}</div>
                  <div>{p.temp.toFixed(1)} °C</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="weather-strip-btn"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
