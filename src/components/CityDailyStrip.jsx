// src/components/CityDailyStrip.jsx
import { useEffect, useState } from "react";
import DailyTile from "./DailyTile";

export default function CityDailyStrip({ items }) {
  if (!items || items.length === 0) return null;

  const getTilesPerPage = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;

    if (w < 480) return 3;    // bardzo mały ekran
    if (w < 768) return 4;    // normalny telefon
    if (w < 1024) return 5;   // tablet / mały laptop
    return 6;                 // większe ekrany
  };

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

  // maksymalny początek tak, żeby dało się pokazać pełne okno
  const maxStart = Math.max(0, items.length - tilesPerPage);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxStart;

  const safeStart = Math.min(startIndex, maxStart);
  const visibleItems = items.slice(safeStart, safeStart + tilesPerPage);

  const handlePrev = () => {
    if (!canGoPrev) return;
    setStartIndex((prev) => Math.max(0, prev - tilesPerPage));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setStartIndex((prev) => {
      const candidate = prev + tilesPerPage;
      // jeśli pełny skok wychodzi za daleko → przeskocz na maxStart
      return candidate >= maxStart ? maxStart : candidate;
    });
  };

  return (
    <div className="weather-strip">
      <button
        onClick={handlePrev}
        disabled={!canGoPrev}
        className="weather-strip-btn"
      >
        ◀
      </button>

      <div className="weather-tiles-row">
        {visibleItems.map((item) => (
          <DailyTile key={item.date} item={item} />
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className="weather-strip-btn"
      >
        ▶
      </button>
    </div>
  );
}
