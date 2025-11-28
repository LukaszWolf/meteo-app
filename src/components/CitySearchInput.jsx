export default function CitySearchInput({ query, onChange }) {
    return (
        <input
            className="city-search-input"
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Wpisz nazwę miasta"
        />
    );
}