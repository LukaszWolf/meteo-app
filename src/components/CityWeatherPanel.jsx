// src/components/CityWeatherPanel.jsx
import CityHourlyStrip from "./CityHourlyStrip";
import CityDailyStrip from "./CityDailyStrip";

// format "HH:MM" z ISO
function formatTimeHHMM(isoString) {
  if (!isoString) return "";
  const idxT = isoString.indexOf("T");
  if (idxT === -1) return isoString;
  const timePart = isoString.slice(idxT + 1);
  return timePart.slice(0, 5);
}

// format daty na np. "Śr 27.11"
function formatDateLabel(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function CityWeatherPanel({ weather }) {
  if (!weather) return null;

  // ------ GODZINÓWKA: 24h od następnej godziny ------
  let hourlyItems = [];
  if (
    weather.hourly &&
    weather.hourly.time &&
    weather.hourly.temperature_2m &&
    weather.hourly.weathercode
  ) {
    const times = weather.hourly.time;
    const len = times.length;
    const currentTime = weather.current_weather?.time;

    let startIdx = 0;
    if (currentTime) {
      const idx = times.findIndex((t) => t > currentTime);
      if (idx !== -1) {
        startIdx = idx;
      }
    }

    const endIdx = Math.min(startIdx + 24, len);

    for (let i = startIdx; i < endIdx; i++) {
      const time = times[i];
      hourlyItems.push({
        time,
        displayTime: formatTimeHHMM(time),
        temp: weather.hourly.temperature_2m[i],
        hum: weather.hourly.relative_humidity_2m
          ? weather.hourly.relative_humidity_2m[i]
          : null,
        code: weather.hourly.weathercode[i],
      });
    }
  }

  // ------ DZIENNA: do 10 dni, z labelkami i wschód/zachód ------
  let dailyItems = [];
  if (
    weather.daily &&
    weather.daily.time &&
    weather.daily.temperature_2m_max &&
    weather.daily.temperature_2m_min
  ) {
    const count = Math.min(10, weather.daily.time.length);
    for (let i = 0; i < count; i++) {
      const date = weather.daily.time[i];
      dailyItems.push({
        date,
        label: formatDateLabel(date),
        tMax: weather.daily.temperature_2m_max[i],
        tMin: weather.daily.temperature_2m_min[i],
        sunrise: weather.daily.sunrise
          ? formatTimeHHMM(weather.daily.sunrise[i])
          : null,
        sunset: weather.daily.sunset
          ? formatTimeHHMM(weather.daily.sunset[i])
          : null,
        code: weather.daily.weathercode
          ? weather.daily.weathercode[i]
          : null,
      });
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* PROGNOZA GODZINOWA */}
      {hourlyItems.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4>Prognoza godzinowa (24h)</h4>
          <CityHourlyStrip items={hourlyItems} />
        </div>
      )}

      {/* PROGNOZA DZIENNA */}
      {dailyItems.length > 0 && (
        <div>
          <h4>Prognoza dzienna (do 10 dni)</h4>
          <CityDailyStrip items={dailyItems} />
        </div>
      )}
    </div>
  );
}
