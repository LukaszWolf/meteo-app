import { useEffect, useState } from "react";
import  CitySearchInput  from "./CitySearchInput";
import CitySuggestionsList from "./CitySuggestionsList";
import SelectedCityInfo from "./SelectedCityInfo";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

export default function CitySearch() {
    const [query, setQuery] = useState(""); //zapytanie uzytkownika(miasto)
    const [suggestions, setSuggestions] = useState([]); //propozycje miast
    const [selectedCity, setSelectedCity] = useState(null); //wybrane miasto
    
    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed.length < 2) {
            setSuggestions([]);
            return;
        }

        const url = `${GEO_URL}?name=${encodeURIComponent(trimmed)}` +
        `&count=5&language=pl&format=json`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error fetching city suggestions");
      }
      return res.json();
    })
    .then((data) => {
      setSuggestions(data.results || []);
    })
    .catch((err) => {
      console.error(err);
      setSuggestions([]);
    });
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