
// //zolte zielone itd koleczko obok pm  zebey wiedziec czy git powietrze czy nie

// import { useEffect, useState } from "react";

// const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
// const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
// const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

// export default function WeatherApiDashboard() {
//   const [query, setQuery] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [loadingSuggestions, setLoadingSuggestions] = useState(false);

//   const [selectedCity, setSelectedCity] = useState(null);
//   const [weather, setWeather] = useState(null);
//   const [hourly24, setHourly24] = useState([]);
//   const [airQuality, setAirQuality] = useState(null);

//   const [weatherError, setWeatherError] = useState("");
//   const [airError, setAirError] = useState("");

//   // ---- helper do formatowania czasu hh:mm z ISO ----
//   const formatTimeHHMM = (isoString) => {
//     if (!isoString) return "";
//     // "2025-11-26T07:09" albo "2025-11-26T07:09+01:00"
//     const idxT = isoString.indexOf("T");
//     if (idxT === -1) return isoString;
//     const timePart = isoString.slice(idxT + 1); // np. "07:09+01:00"
//     return timePart.slice(0, 5); // "07:09"
//   };

//   // ---- PODPOWIEDZI MIAST (geocoding) ----
//   useEffect(() => {
//     const trimmed = query.trim();  //usuniecie spacji przed i po 

//     if (trimmed.length === 0) {
//       setSuggestions([]); //jak pusto
//       return;
//     }

//     if (trimmed.length < 2) {
//       setSuggestions([]);  //za krotkie zeby cos wyswietlic , dopiero od 2 znakow wyswietl
//       return;
//     }

//     const controller = new AbortController(); //do anulowania np fetcha

//     const timeoutId = setTimeout(() => {
//       setLoadingSuggestions(true); // ustawiamy loading na true

//       const url =
//         `${GEO_URL}?name=${encodeURIComponent(trimmed)}` + //budowanienie URL z zakodowanym zapytaniem
//         `&count=5&language=pl&format=json`;

//       fetch(url, { signal: controller.signal })
//         .then((res) => {  //sprawdzamy czy ok
//           if (!res.ok) { //
//             throw new Error("Błąd geocoding API");
//           }
//           return res.json();
//         })
//         .then((data) => { //ustawiamy sugestie
//           setSuggestions(data.results || []);
//         })
//         .catch((err) => { //obsluga bledow
//           if (err.name !== "AbortError") {
//             console.error(err);
//             setSuggestions([]);
//           }
//         })
//         .finally(() => setLoadingSuggestions(false)); //koniec ladowania
//     }, 400); //opoznienie 400ms od ostatniego wpisu

//     return () => {
//       clearTimeout(timeoutId); //czyscimy timeout
//       controller.abort();  //anulowanie fetch jesli komponent sie odmontuje lub query sie zmieni
//     };
//   }, [query]);

//   // ---- POGODA + JAKOŚĆ POWIETRZA (po kliknięciu miasta) ----
//   const handleSelectCity = async (city) => {
//     setSelectedCity(city);
//     setWeather(null);
//     setHourly24([]);
//     setAirQuality(null);
//     setWeatherError("");
//     setAirError("");

//     try {
//       // 1) POGODA – 10 dni + sunrise/sunset + hourly
//       const weatherParams = new URLSearchParams({//tworzenie parametrow zapytania
//           latitude: String(city.latitude),
        
//         longitude: String(city.longitude),
//         current_weather: "true",
//         hourly: "temperature_2m,relative_humidity_2m",
//         // DODANE: sunrise,sunset
//         daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
//         timezone: "auto",
//         forecast_days: "10",
//       });

//       const weatherRes = await fetch(
//         `${FORECAST_URL}?${weatherParams.toString()}`
//       );

//       if (!weatherRes.ok) {
//         throw new Error("Błąd pobierania pogody");
//       }

//       const weatherData = await weatherRes.json();
//       setWeather(weatherData);

//       // 24h z hourly
//       if (
//         weatherData.hourly &&
//         weatherData.hourly.time &&
//         weatherData.hourly.time.length > 0
//       ) {
//         const first24 = weatherData.hourly.time.slice(0, 24).map((t, idx) => ({
//           time: t,
//           temp: weatherData.hourly.temperature_2m[idx],
//           hum: weatherData.hourly.relative_humidity_2m[idx],
//         }));
//         setHourly24(first24);
//       }
//     } catch (e) {
//       console.error(e);
//       setWeatherError(String(e));
//     }

//     try {
//       // 2) JAKOŚĆ POWIETRZA + PYŁKI (Europa, sezon pyłkowy)
//       const aqParams = new URLSearchParams({
//         latitude: String(city.latitude),
//         longitude: String(city.longitude),
//         hourly:
//           "pm10,pm2_5,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide," +
//           "alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen",
//         timezone: "auto",
//       });

//       const aqRes = await fetch(
//         `${AIR_QUALITY_URL}?${aqParams.toString()}`
//       );

//       if (!aqRes.ok) {
//         throw new Error("Błąd pobierania jakości powietrza");
//       }

//       const aqData = await aqRes.json();
//       setAirQuality(aqData);
//     } catch (e) {
//       console.error(e);
//       setAirError(String(e));
//     }
//   };

//   // ---- z airQuality wyciągamy "obecne" pyłki (tylko jeśli są dane) ----
//   let pollenNow = [];
//   let hasPollen = false;

//   if (
//     airQuality &&
//     airQuality.hourly &&
//     airQuality.hourly.time &&
//     airQuality.hourly.time.length > 0
//   ) {
//     const idx = 0; // pierwsza godzina (najbliższa "teraz")
//     const pollenKeys = [
//       "alder_pollen",
//       "birch_pollen",
//       "grass_pollen",
//       "mugwort_pollen",
//       "olive_pollen",
//       "ragweed_pollen",
//     ];
//     const pollenLabels = {
//       alder_pollen: "Olsza",
//       birch_pollen: "Brzoza",
//       grass_pollen: "Trawy",
//       mugwort_pollen: "Bylica",
//       olive_pollen: "Oliwka",
//       ragweed_pollen: "Ambrozja",
//     };

//     pollenKeys.forEach((key) => {
//       const arr = airQuality.hourly[key];
//       const val = Array.isArray(arr) ? arr[idx] : null;
//       if (val != null) {
//         hasPollen = true;
//         pollenNow.push({
//           key,
//           label: pollenLabels[key],
//           value: val, // jednostka: grains/m³ wg dokumentacji
//         });
//       }
//     });
//   }

//   return (
//     <div style={{ marginTop: 24 }}>
//       <h2>Prognoza z Open-Meteo</h2>

//       <input
//         type="text"
//         placeholder="Wpisz miasto (np. Orzesze)"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         style={{ padding: 8, minWidth: 260 }}
//       />

//       {/* PODPOWIEDZI MIAST */}
//       {loadingSuggestions && <p>Szukanie miast...</p>}

//       {!loadingSuggestions && suggestions.length > 0 && (
//         <div style={{ marginTop: 8 }}>
//           {suggestions.map((city) => (
//             <p
//               key={city.id}
//               onClick={() => handleSelectCity(city)}
//               style={{
//                 margin: 0,
//                 padding: "4px 0",
//                 cursor: "pointer",
//               }}
//             >
//               <span>
//                 {city.name}, {city.country}
//                 {city.admin1 ? ` (${city.admin1})` : ""}
//               </span>
//             </p>
//           ))}
//         </div>
//       )}

//       {/* WYBRANE MIASTO */}
//       {selectedCity && (
//         <p style={{ marginTop: 16 }}>
//           Wybrane miasto:{" "}
//           <span>
//             {selectedCity.name}, {selectedCity.country}
//             {selectedCity.admin1 ? ` (${selectedCity.admin1})` : ""}
//           </span>
//         </p>
//       )}

//       {/* BŁĘDY */}
//       {weatherError && (
//         <p style={{ color: "red" }}>Błąd pobierania pogody: {weatherError}</p>
//       )}
//       {airError && (
//         <p style={{ color: "red" }}>
//           Błąd pobierania jakości powietrza: {airError}
//         </p>
//       )}

//       {/* AKTUALNA POGODA */}
//       {weather && weather.current_weather && (
//         <div style={{ marginTop: 16 }}>
//           <p>
//             Aktualna temperatura:{" "}
//             <span>{weather.current_weather.temperature} °C</span>
//           </p>
//           <p>
//             Wiatr: <span>{weather.current_weather.windspeed} km/h</span>
//           </p>
//           <p>
//             Kod pogody: <span>{weather.current_weather.weathercode}</span>
//           </p>
//         </div>
//       )}

//       {/* 10 DNI DAILY + WCHODY/ZACHODY */}
//       {weather && weather.daily && (
//         <div style={{ marginTop: 16 }}>
//           <p>Najbliższe 10 dni:</p>
//           {weather.daily.time.slice(0, 10).map((date, idx) => (
//             <p key={date}>
//               <span>{date}:</span>{" "}
//               <span>
//                 {weather.daily.temperature_2m_max[idx]} °C max,{" "}
//                 {weather.daily.temperature_2m_min[idx]} °C min
//               </span>{" "}
//               <span>
//                 | wschód:{" "}
//                 {formatTimeHHMM(weather.daily.sunrise?.[idx])}
//               </span>{" "}
//               <span>
//                 | zachód:{" "}
//                 {formatTimeHHMM(weather.daily.sunset?.[idx])}
//               </span>
//             </p>
//           ))}
//         </div>
//       )}

//       {/* GODZINÓWKA 24H */}
//       {hourly24.length > 0 && (
//         <div style={{ marginTop: 16 }}>
//           <p>Godzinowa prognoza (24h):</p>
//           {hourly24.map((h) => (
//             <p key={h.time}>
//               <span>{h.time}: </span>
//               <span>{h.temp} °C, </span>
//               <span>{h.hum} %</span>
//             </p>
//           ))}
//         </div>
//       )}

//       {/* JAKOŚĆ POWIETRZA – pierwsza godzina */}
//       {airQuality && airQuality.hourly && airQuality.hourly.time && (
//         <div style={{ marginTop: 16 }}>
//           <p>
//             Jakość powietrza (ok. {airQuality.hourly.time[0]}):
//           </p>
//           <p>
//             PM10: <span>{airQuality.hourly.pm10?.[0]} µg/m³</span>
//           </p>
//           <p>
//             PM2.5: <span>{airQuality.hourly.pm2_5?.[0]} µg/m³</span>
//           </p>
//           <p>
//             O₃: <span>{airQuality.hourly.ozone?.[0]} µg/m³</span>
//           </p>
//           <p>
//             NO₂:{" "}
//             <span>{airQuality.hourly.nitrogen_dioxide?.[0]} µg/m³</span>
//           </p>
//           <p>
//             SO₂:{" "}
//             <span>{airQuality.hourly.sulphur_dioxide?.[0]} µg/m³</span>
//           </p>
//           <p>
//             CO:{" "}
//             <span>{airQuality.hourly.carbon_monoxide?.[0]} µg/m³</span>
//           </p>
//         </div>
//       )}

//       {/* PYŁKI – TYLKO JEŚLI SĄ DANE */}
//       {hasPollen && (
//         <div style={{ marginTop: 16 }}>
//           <p>Pyłki (grains/m³, wartości modelowane):</p>
//           {pollenNow.map((p) => (
//             <p key={p.key}>
//               {p.label}: <span>{p.value}</span>
//             </p>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
 import { useEffect, useState } from "react";

 const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
 const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
 const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export default function WeatherApiDashboard() { 

    
}