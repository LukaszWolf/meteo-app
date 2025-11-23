export default function Landing({ onSignIn }) {
  return (
    <main className="landing">
      {/* HERO */}
      <section className="hero">
        <h1>Meteo — domowa stacja pogodowa z wykorzystaniem chmury</h1>
        <p className="lead">
          Zbieraj temperaturę, wilgotność i ciśnienie z własnych czujników. 
          Podgląd na żywo i historia — w przeglądarce.
        </p>
        <div className="cta-row">
          <button className="btn btn-primary" onClick={onSignIn}>Zaloguj / Załóż konto</button>
          <a className="btn btn-ghost" href="#how">Jak to działa</a>
        </div>
      </section>

      {/* O PRODUKCIE */}
      <section className="section">
        <h2>Co to jest?</h2>
        <p>
          Meteo to prosta platforma do zbierania i wizualizacji danych z Twoich czujników (np. ESP + BME280).
          Urządzenie wysyła dane przez MQTT do chmury, a aplikacja webowa prezentuje je w czytelnych kafelkach i na wykresach.
        </p>
              <ul className="feature-list">
          <li><b>Stacja meteo</b> – Wyswietlanie danych, zegar i wiele innych.</li>     
          <li><b>Moduł zewnętrzny</b> – zbieranie danych z czujników.</li>
          <li><b>Dane na żywo</b> – Pobieranie danych z chmury co 10 minut.</li>
          <li><b>Historia</b> – 10 ostatnich pomiarów na wykresie.</li>
          <li><b>Bezpieczeństwo</b> – dane w S3, CORS, certyfikaty AWS.</li>
          <li><b>Konta użytkowników</b> – logowanie i rejestracja w Cognito.</li>

        </ul>
      </section>

      {/* JAK TO DZIAŁA */}
      <section id="how" className="section">
        <h2>Jak to działa</h2>
        <ol className="steps">
          <li><span className="num">1</span> Podłącz stację do zasilania.</li>
          <li><span className="num">2</span> Podłącz urządzenie do sieci Wi-Fi.</li>
          <li><span className="num">3</span> Zaloguj się i sparuj urządzenie w aplikacji.</li>
          <li><span className="num">4</span> Oglądaj dane na żywo i przeglądaj historię.</li>
        </ol>
      </section>

      {/* SCREEN (placeholder) */}
      <section className="section">
        <h2>Podgląd aplikacji</h2>
        <div className="screenshot-placeholder" aria-label="Zrzut ekranu aplikacji (wkrótce)">
          {/* Pusty biały obraz — na razie tylko prostokąt */}
        </div>
        <p className="muted">To tylko placeholder. Prawdziwy zrzut dodamy później.</p>
      </section>

    </main>
  );
}
