export default function NavBar({ LogoutLoginText, onAuthClick }) {
  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href="/">Meteo<span>•</span>App</a>
        <nav aria-label="Główne">
          <ul className="menu">
            <li><a href="#live-data">Dane na żywo</a></li>
            <li><span>•</span></li>
            <li><a href="#forecast">Prognoza pogody</a></li>
            <li><span>•</span></li>
            <li><a href="#history">Historia</a></li>
            <li><span>•</span></li>
            <li><a href="#pairing">Parowanie</a></li>
            <li>
              <button className="cta" onClick={onAuthClick}>
                {LogoutLoginText}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}