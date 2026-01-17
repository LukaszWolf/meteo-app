import { Amplify } from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import awsconfig from "./aws-exports";

// UI Components
import NavBar from "./components/NavBar";
import Landing from "./components/Landing";
import Footer from "./components/Footer";
import WeatherDashboard from "./components/WeatherDashboard";
import StationClaimPanel from "./components/StationClaimPanel";
import CitySearch from "./components/CitySearch";
import HistoryPanel from "./components/HistoryPanel";

// Style
import "./App.css";
import "./NavBar.css";
import "./Landing.css";
import "./Footer.css";
import "./WeatherDashboard.css";
import "./CitySearch.css";

// Nasze nowe Hooki
import { useAuth } from "./hooks/useAuth";
import { useStationData } from "./hooks/useStationData";
import { useStationClaim } from "./hooks/useStationClaim";

// Konfiguracja Amplify (tylko raz)
Amplify.configure(awsconfig);
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: "eu-north-1",
  aws_pubsub_endpoint: "wss://an7hi8lzvqru3-ats.iot.eu-north-1.amazonaws.com/mqtt",
}));

export default function App() {
  // 1. Autoryzacja
  const { user, signIn, signOut } = useAuth();

  // 2. Dane ze stacji (zależą od usera)
  const { history, measurement, reloadData } = useStationData(user);

  // 3. Parowanie (po sukcesie odświeżamy dane)
  const claim = useStationClaim(user, reloadData);

  // ===== Renderowanie =====
  if (!user) {
    return (
      <div>
        <NavBar LogoutLoginText="Zaloguj się" onAuthClick={signIn} />
        <Landing onSignIn={signIn} />
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <NavBar LogoutLoginText="Wyloguj się" onAuthClick={signOut} />
      
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
          thing={claim.thing}
          setThing={claim.setThing}
          nonce={claim.nonce}
          setNonce={claim.setNonce}
          handleClaim={claim.handleClaim}
          claimStatus={claim.claimStatus}
        />
      </section>
      
      <Footer/>
    </div>
  );
}