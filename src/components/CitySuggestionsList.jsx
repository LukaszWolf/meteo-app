export default function CitySuggestionsList({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <ul className="city-suggestions">
      {suggestions.map((city) => {
        const key =
          city.id ?? `${city.name}-${city.latitude}-${city.longitude}`;

        return (
          <li
            key={key}
            className="city-suggestion"
            onClick={() => onSelect(city)}
          >
            {city.name}, {city.country}
            {city.admin1 ? ` (${city.admin1})` : ""}
          </li>
        );
      })}
    </ul>
  );
}