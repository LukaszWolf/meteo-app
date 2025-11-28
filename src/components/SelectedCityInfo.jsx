// src/components/SelectedCityInfo.jsx
import { useEffect, useState } from "react";
import CityWeatherPanel from "./CityWeatherPanel";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// prosty format czasu HH:MM z ISO
function formatTimeHHMM(isoString) {
  if (!isoString) return "";
  const idxT = isoString.indexOf("T");
  if (idxT === -1) return isoString;
  const timePart = isoString.slice(idxT + 1);
  return timePart.slice(0, 5); // "HH:MM"
}

export default function SelectedCityInfo({ city }) {
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    if (!city) {
      setWeather(null);
      setWeatherError("");
      return;
    }

    const params = new URLSearchParams({
      latitude: String(city.latitude),
      longitude: String(city.longitude),
      current_weather: "true",
      hourly: "temperature_2m,relative_humidity_2m,weathercode",
      daily:
        "temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode",
      timezone: "auto",
      forecast_days: "10",
    });

    const url = `${FORECAST_URL}?${params.toString()}`;

    setWeatherLoading(true);
    setWeatherError("");

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Błąd pobierania pogody");
        }
        return res.json();
      })
      .then((data) => {
        setWeather(data);
      })
      .catch((err) => {
        console.error(err);
        setWeather(null);
        setWeatherError(String(err));
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  }, [city]);

  if (!city) {
    return <p>Nie wybrano miasta.</p>;
  }

  // --- wyliczenie wschodu / zachodu dla "dzisiaj" ---
  let todaySunrise = null;
  let todaySunset = null;

  if (
    weather &&
    weather.daily &&
    weather.daily.time &&
    weather.daily.sunrise &&
    weather.daily.sunset &&
    weather.current_weather?.time
  ) {
    const currentDate = weather.current_weather.time.slice(0, 10); // "YYYY-MM-DD"
    const idx = weather.daily.time.findIndex((d) => d === currentDate);
    if (idx !== -1) {
      todaySunrise = weather.daily.sunrise[idx] || null;
      todaySunset = weather.daily.sunset[idx] || null;
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3 className="selected-city-title">
        Wybrane miasto:{" "}
        <span>
          {city.name}, {city.country}
          {city.admin1 ? ` (${city.admin1})` : ""}
        </span>
      </h3>

      {weatherLoading && <p>Ładuję pogodę...</p>}
      {weatherError && (
        <p style={{ color: "red" }}>Błąd pobierania pogody: {weatherError}</p>
      )}

      {weather && weather.current_weather && (
        <div>
          <p>Aktualna temperatura: {weather.current_weather.temperature} °C</p>
          <p>Wiatr: {weather.current_weather.windspeed} km/h</p>

          {todaySunrise && todaySunset && (
            <>
              <p>Wschód słońca: {formatTimeHHMM(todaySunrise)}</p>
              <p>Zachód słońca: {formatTimeHHMM(todaySunset)}</p>
            </>
          )}
        </div>
      )}

      <CityWeatherPanel weather={weather} />
    </div>
  );
}
