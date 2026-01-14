// src/components/OutdoorHistoryChart.jsx
import { useEffect, useState } from "react";

// ---- helpery ----
function getTs(m) {
  // w plikach masz lastUpdate, ale obsłużmy też ts na przyszłość
  return m.ts ?? m.lastUpdate ?? null;
}

// W OutdoorHistoryChart.jsx
function getOutdoorTemp(m) {
  // Po mapowaniu w App.jsx pole będzie się nazywać 'temp' lub 'outdoorTemp'
  return m.outdoorTemp ?? m.temp ?? null;
}

function sortByTs(history) {
  return [...history].sort((a, b) => {
    const da = getTs(a) ?? 0;
    const db = getTs(b) ?? 0;
    return da - db;
  });
}

// sprawdzenie przymrozku "dzisiejszej nocy" + min temp
function checkFrostLastNight(historySorted) {
  if (!historySorted.length) {
    return { hadFrost: false, minTempBelow0: null };
  }

  const lastTs = getTs(historySorted[historySorted.length - 1]);
  if (lastTs == null) {
    return { hadFrost: false, minTempBelow0: null };
  }

  const baseDate = new Date(lastTs);
  if (Number.isNaN(baseDate.getTime())) {
    return { hadFrost: false, minTempBelow0: null };
  }

  const start = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    0,
    0,
    0
  );
  const end = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    8,
    0,
    0
  );

  let minBelow0 = null;

  historySorted.forEach((m) => {
    const t = getOutdoorTemp(m);
    const ts = getTs(m);
    if (t == null || ts == null || t >= 0) return;

    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return;
    if (d >= start && d <= end) {
      if (minBelow0 === null || t < minBelow0) {
        minBelow0 = t;
      }
    }
  });

  return {
    hadFrost: minBelow0 !== null,
    minTempBelow0: minBelow0,
  };
}

function formatTimeHHMM(ts) {
  if (ts == null) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ile kafelków na stronę – wersja „x2” jak ustawiłeś w indoor
function getTilesPerPage() {
  if (typeof window === "undefined") return 12;

  const w = window.innerWidth;
  if (w < 480) return 6;
  if (w < 768) return 8;
  if (w < 1024) return 10;
  return 12;
}

export default function OutdoorHistoryChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div>
        <h2 className="city-search-title" style={{ marginBottom: 6 }}>
          Na zewnątrz
        </h2>
        <p>Brak pomiarów temperatury na zewnątrz.</p>
      </div>
    );
  }

  const ordered = sortByTs(history);
  const { hadFrost, minTempBelow0 } = checkFrostLastNight(ordered);

  const last24 = ordered.slice(-24);

  const outdoorPoints = last24
    .map((m) => ({
      ts: getTs(m),
      temp: getOutdoorTemp(m),
    }))
    .filter((p) => p.ts != null && p.temp != null);

  if (outdoorPoints.length === 0) {
    return (
      <div>
        <h2 className="city-search-title" style={{ marginBottom: 6 }}>
          Na zewnątrz
        </h2>
        <p>Brak pomiarów temperatury na zewnątrz.</p>
      </div>
    );
  }

  // --- skalowanie wysokości słupków ---
  let minT = Infinity;
  let maxT = -Infinity;
  outdoorPoints.forEach((p) => {
    if (p.temp < minT) minT = p.temp;
    if (p.temp > maxT) maxT = p.temp;
  });

  if (!Number.isFinite(minT) || !Number.isFinite(maxT)) {
    minT = 0;
    maxT = 1;
  }

  if (maxT - minT < 0.1) {
    minT -= 0.05;
    maxT += 0.05;
  }
  const range = maxT - minT || 1;

  // --- logika paska (przewijanie strzałkami) ---
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

  const maxStart = Math.max(0, outdoorPoints.length - tilesPerPage);
  const safeStart = Math.min(startIndex, maxStart);

  const canGoPrev = safeStart > 0;
  const canGoNext = safeStart < maxStart;

  const visible = outdoorPoints.slice(safeStart, safeStart + tilesPerPage);

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
        Na zewnątrz
      </h2>

      {/* 🔵 INFO o przymrozku – TERAZ TU */}
      {hadFrost && (
        <div
          style={{
            marginTop: 4,
            marginBottom: 10,
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(150, 200, 255, 0.6)",
            background: "rgba(79, 140, 255, 0.16)",
            fontSize: 14,
          }}
        >
          Dzisiaj w nocy wystąpił przymrozek{" "}
          {minTempBelow0 != null &&
            `(temperatura na zewnątrz spadła do ${minTempBelow0.toFixed(
              1
            )} °C).`}
        </div>
      )}

      <div className="weather-strip" style={{ marginTop: 4 }}>
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
