import { useEffect, useRef, useState } from "react";
import { Amplify, Auth, Storage, Hub, PubSub } from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import awsconfig from "./aws-exports";
import "./NavBar.css";
import "./App.css";
import "./Landing.css";
import "./Footer.css";
import "./WeatherDashboard.css";
import "./CitySearch.css";

import NavBar from "./components/NavBar";
import Landing from "./components/Landing";
import Footer from "./components/Footer";
import WeatherDashboard from "./components/WeatherDashboard";
import StationClaimPanel from "./components/StationClaimPanel";
import CitySearch from "./components/CitySearch";
import HistoryPanel from "./components/HistoryPanel";

// 1) Amplify
Amplify.configure(awsconfig);

// 2) PubSub
const AWS_IOT_ENDPOINT = "wss://an7hi8lzvqru3-ats.iot.eu-north-1.amazonaws.com/mqtt";

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: "eu-north-1",
    aws_pubsub_endpoint: AWS_IOT_ENDPOINT,
  })
);

// 3) API Gateway
const CLAIM_API_URL = "https://rp6817rcg4.execute-api.eu-north-1.amazonaws.com/claim/reply";
const ATTACH_API_URL = "https://wjngrfdjy3.execute-api.eu-north-1.amazonaws.com/attach";

// Helper
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  
  // UI do claim
  const [thing, setThing] = useState("");
  const [nonce, setNonce] = useState("");
  const [claimStatus, setClaimStatus] = useState("");

  // Dane do pogody
  const [measurement, setMeasurement] = useState(null);
  const [history, setHistory] = useState([]);

  // ===== Helpers =====

  const mapJsonToDashboardData = (json) => {
    return {
      outdoorTemp: json.outdoorTemperatureRead != null ? json.outdoorTemperatureRead / 10 : null,
      humidity: json.humidityRead ?? null,
      pressure: json.pressureRead ?? null,
      uvIndex: json.uvIndexRead != null ? json.uvIndexRead / 10 : null,
      indoorTemp: json.indoorTemperatureRead != null ? json.indoorTemperatureRead : null,
      lastUpdate: json.ts ?? null,
      userId: json.userId ?? null,
      stationId: json.stationId ?? null,
    };
  };

  const ensureIoTPolicyAttached = async () => {
    try {
      const creds = await Auth.currentCredentials();
      const identityId = creds.identityId;
      if (!identityId) return;

      let headers = { "Content-Type": "application/json" };
      try {
        const session = await Auth.currentSession();
        headers.Authorization = session.getIdToken().getJwtToken();
      } catch {}

      await fetch(ATTACH_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ identityId }),
      });
    } catch (e) {
      console.warn("attach policy error:", e);
    }
  };

  const checkUser = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
      await ensureIoTPolicyAttached();
      await loadFiles();
    } catch (e) {
      setUser(null);
    }
  };

  const handleSignIn = async () => {
    try {
      await Auth.federatedSignIn();
    } catch (err) {
      console.error("Błąd logowania:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      setFiles([]);
      setHistory([]);
      setMeasurement(null);
    } catch (err) {
      console.error("Błąd wylogowania:", err);
    }
  };

  // ⚠️ ZMODYFIKOWANE ŁADOWANIE PLIKÓW (LIMIT 48)
  const loadFiles = async () => {
    try {
      const creds = await Auth.currentCredentials();
      const id = creds.identityId;
      console.log("[s3] IdentityId:", id);

      // 1. Pobierz listę wszystkich plików
      const { results } = await Storage.list(`users/${id}/stations/`, {
        level: "public",
      });
      
      console.log(`[s3] Znaleziono ${results.length} plików.`);

      // 2. Sortowanie: Najnowsze na początku (wg lastModified)
      // lastModified zazwyczaj jest obiektem Date lub stringiem
      results.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

      // 3. Pobieramy tylko 48 najnowszych plików
      const recentFiles = results.slice(0, 48);
      console.log(`[s3] Pobieram treść z ${recentFiles.length} najnowszych plików.`);

      setFiles(recentFiles);

      if (recentFiles.length > 0) {
        const historyData = [];
        
        // 4. Pobieranie treści równolegle (szybciej niż pętla for..of)
        // Uwaga: Promise.all jest szybsze, ale przy 48 requestach S3 może przyciąć.
        // Jeśli będzie błąd "Too Many Requests", wróć do pętli for.
        await Promise.all(recentFiles.map(async (file) => {
          try {
            const result = await Storage.get(file.key, { download: true, level: "public" });
            const text = await result.Body.text();
            const obj = JSON.parse(text);
            const dashData = mapJsonToDashboardData(obj);
            historyData.push(dashData);
          } catch (err) {
            console.warn(`Błąd ładowania ${file.key}:`, err);
          }
        }));
        
        // 5. Sortujemy historię chronologicznie (od najstarszego do najnowszego) dla wykresu
        historyData.sort((a, b) => (a.lastUpdate || 0) - (b.lastUpdate || 0));
        setHistory(historyData);
        
        // 6. Ustawiamy najnowszy pomiar jako measurement
        if (historyData.length > 0) {
          setMeasurement(historyData[historyData.length - 1]);
        }
      }
    } catch (err) {
      console.error("Błąd ładowania plików:", err);
      setFiles([]);
      setHistory([]);
    }
  };

  const handleClaim = async () => {
    try {
      if (!user) {
        setClaimStatus("Zaloguj się najpierw.");
        return;
      }
      if (!thing || !nonce) {
        setClaimStatus("Błąd: Wypełnij oba pola.");
        return;
      }

      setClaimStatus("Wysyłam kod do stacji...");

      const dataTopic = `devices/${thing}/data`; 
      let isConfirmed = false;

      const subscription = PubSub.subscribe(dataTopic).subscribe({
        next: (msg) => {
          console.log("Odebrano pierwsze dane po sparowaniu:", msg);
          isConfirmed = true;
          setClaimStatus("Sparowano pomyślnie!");
          subscription.unsubscribe();
          setTimeout(() => loadFiles(), 2000);
        },
        error: (error) => console.error("Błąd subskrypcji:", error),
      });

      const creds = await Auth.currentCredentials();
      const identityId = creds.identityId;

      let headers = { "Content-Type": "application/json" };
      try {
        const session = await Auth.currentSession();
        headers.Authorization = session.getIdToken().getJwtToken();
      } catch (e) {}

      const res = await fetch(CLAIM_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ thingName: thing, identityId, nonce }),
      });

      if (!res.ok) {
        subscription.unsubscribe();
        setClaimStatus("Błąd serwera: Nie udało się wysłać zapytania.");
        return;
      }

      setTimeout(() => {
        if (!isConfirmed) {
          subscription.unsubscribe();
          // To nie musi być błąd, stacja może wysłać dane później, ale ostrzegamy usera
          if(claimStatus !== "Sparowano pomyślnie!") {
             setClaimStatus("Wysłano. Czekam na dane ze stacji (może to chwilę potrwać)...");
          }
        }
      }, 15000);

    } catch (e) {
      setClaimStatus("Wystąpił błąd: " + e.message);
    }
  };

  useEffect(() => {
    const unsub = Hub.listen("auth", async ({ payload: { event } }) => {
      if (event === "signIn" || event === "cognitoHostedUI") {
        await checkUser();
      } else if (event === "signOut") {
        setUser(null);
        setFiles([]);
        setHistory([]);
        setMeasurement(null);
      }
    });
    checkUser();
    return () => unsub();
  }, []);

  return (
    <div>
      {!user ? (
        <>
          <NavBar LogoutLoginText="Zaloguj się" onAuthClick={handleSignIn} />
          <Landing onSignIn={handleSignIn} />
          <Footer />
        </>
      ) : (
        <>
          <NavBar LogoutLoginText="Wyloguj się" onAuthClick={handleSignOut} />
          
          <section id="live-data" className="page-section">
            {measurement && <WeatherDashboard data={measurement} />}
          </section>
        
          <section id="forecast" className="page-section">
            <CitySearch />
          </section>

          <section id="history" className="page-section">
            <HistoryPanel history={history} />
          </section>

          <section id="pairing" className="page-section">
            <StationClaimPanel 
              thing={thing}
              setThing={setThing}
              nonce={nonce}
              setNonce={setNonce}
              handleClaim={handleClaim}
              claimStatus={claimStatus}
            />
          </section>
          <Footer/>
        </>
      )}
    </div>
  );
}