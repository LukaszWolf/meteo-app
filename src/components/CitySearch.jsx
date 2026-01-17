import { useEffect, useState, useRef } from "react";
import CitySearchInput from "./CitySearchInput";
import CitySuggestionsList from "./CitySuggestionsList";
import SelectedCityInfo from "./SelectedCityInfo";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

export default function CitySearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  
  // Ref do trzymania identyfikatora timera
  const debounceRef = useRef(null);

  useEffect(() => {
    // Czyścimy poprzedni timer przy każdej zmianie query
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    // Ustawiamy nowy timer (500ms)
    debounceRef.current = setTimeout(() => {
      const url = `${GEO_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=pl&format=json`;

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Error fetching city suggestions");
          return res.json();
        })
        .then((data) => {
          setSuggestions(data.results || []);
        })
        .catch((err) => {
          console.error(err);
          setSuggestions([]);
        });
    }, 500); // <-- 500ms opóźnienia

    // Cleanup function: czyści timer jeśli komponent zostanie odmontowany
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <section className="city-search-section">
      <div className="city-search-card">
        <div className="city-search-header">
          <div>
            <h2 className="city-search-title">Prognoza pogody</h2>
            <p className="city-search-subtitle">
              Wyszukaj miejscowość i sprawdź prognozę godzinową oraz dzienną.
            </p>
          </div>
        </div>

        <div className="city-search-input-row">
          <CitySearchInput
            query={query}
            onChange={(newQuery) => setQuery(newQuery)}
          />
          <CitySuggestionsList
            suggestions={suggestions}
            onSelect={(city) => {
              console.log("Wybrane miasto:", city);
              setSelectedCity(city);
              // Opcjonalnie: czyścimy podpowiedzi po wyborze
              setSuggestions([]); 
            }}
          />
        </div>

        <div className="selected-city-wrapper">
          <SelectedCityInfo city={selectedCity} />
        </div>
      </div>
    </section>
  );
}