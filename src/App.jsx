import { useEffect, useRef, useState } from "react";
import { Amplify, Auth, Storage, Hub, PubSub } from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import awsconfig from "./aws-exports";

// 1) Amplify (Auth, Storage)
Amplify.configure(awsconfig);

// 2) PubSub over WSS (AWS IoT Core) — Twój endpoint WSS z /mqtt
const AWS_IOT_ENDPOINT =
  "wss://an7hi8lzvqru3-ats.iot.eu-north-1.amazonaws.com/mqtt";

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: "eu-north-1",
    aws_pubsub_endpoint: AWS_IOT_ENDPOINT,
  })
);

// 3) API Gateway
// - Lambda: claim-reply (publikuje reply na devices/<thing>/claim/reply)
const CLAIM_API_URL =
  "https://rp6817rcg4.execute-api.eu-north-1.amazonaws.com/claim/reply";

// - Lambda: attach-iot-policy (przypina IoT policy do IdentityId usera)
const ATTACH_API_URL =
  "https://wjngrfdjy3.execute-api.eu-north-1.amazonaws.com/attach";

// Helper do 1–2 s pauzy na propagację uprawnień
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [error, setError] = useState("");

  // UI do claim
  const [thing, setThing] = useState("");
  const [nonce, setNonce] = useState(""); // <-- nowe pole na nonce
  const [claimStatus, setClaimStatus] = useState("");
  const claimSubRef = useRef(null);

  // ===== Helpers =====

  // Przypięcie IoT policy do usera (idempotentne)
  const ensureIoTPolicyAttached = async () => {
    try {
      const creds = await Auth.currentCredentials();
      const identityId = creds.identityId; // eu-north-1:...
      console.log("[attach] currentCredentials:", creds);
      if (!identityId) {
        console.warn("[attach] Brak identityId!");
        return;
      }

      let headers = { "Content-Type": "application/json" };
      // Jeśli /attach jest chronione Cognito authorizerem — dodaj JWT
      try {
        const session = await Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        headers.Authorization = token;
        console.log("[attach] Dołączam Authorization (ID token)...");
      } catch {
        console.log("[attach] Brak tokenu (authorizer nie jest wymagany)...");
      }

      console.log("[attach] POST", ATTACH_API_URL, { identityId });
      const r = await fetch(ATTACH_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ identityId }),
      });

      const text = await r.text().catch(() => "");
      console.log("[attach] response status:", r.status, "body:", text);

      if (!r.ok) {
        console.warn("attach policy failed:", text);
      } else {
        console.log("attach policy OK for", identityId);
      }
    } catch (e) {
      console.warn("attach policy error:", e);
    }
  };

  const checkUser = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      console.log("[auth] current user:", currentUser);
      setUser(currentUser);
      await ensureIoTPolicyAttached();
      await loadFiles();
    } catch (e) {
      console.warn("[auth] no user:", e);
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
      setFileContent("");
    } catch (err) {
      console.error("Błąd wylogowania:", err);
    }
  };

  const loadFiles = async () => {
    try {
      const creds = await Auth.currentCredentials();
      const id = creds.identityId; // eu-north-1:...
      console.log("[s3] IdentityId:", id);
      const { results } = await Storage.list(`users/${id}/stations/`, {
        level: "public",
      });
      console.log("[s3] list results:", results);
      setFiles(results || []);
    } catch (err) {
      console.error("Błąd ładowania plików:", err);
      setFiles([]);
    }
  };

  const fetchData = async (key) => {
    try {
      const result = await Storage.get(key, { download: true, level: "public" });
      const text = await result.Body.text();
      setFileContent(text);
      setError("");
    } catch (err) {
      setError(String(err));
    }
  };

  // ===== CLAIM (ESP → request; app → reply przez Lambda) =====
  const handleClaim = async () => {
    try {
      if (!user) {
        setClaimStatus("Zaloguj się najpierw.");
        return;
      }
      if (!thing) {
        setClaimStatus("Podaj thingName (np. station-001).");
        return;
      }
      if (!nonce) {
        setClaimStatus("Wpisz kod (nonce) z konsoli ESP.");
        return;
      }

      // 1) Upewnij się, że mamy uprawnienia IoT i daj chwilę na propagację
      setClaimStatus("🔐 Przygotowuję uprawnienia IoT...");
      await ensureIoTPolicyAttached();
      await sleep(1500);

      const creds = await Auth.currentCredentials();
      const identityId = creds.identityId;

      let headers = { "Content-Type": "application/json" };
      try {
        const session = await Auth.currentSession();
        headers.Authorization = session.getIdToken().getJwtToken();
        console.log("[claim] Added Authorization header");
      } catch {}

      console.log("[claim] POST", CLAIM_API_URL, {
        thingName: thing,
        identityId,
        nonce,
      });

      const res = await fetch(CLAIM_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ thingName: thing, identityId, nonce }),
      });
      const bodyText = await res.text().catch(() => "");
      console.log("[claim] reply status:", res.status, "body:", bodyText);

      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${bodyText}`);
      }

      setClaimStatus(
        `✅ Sparowano! Urządzenie zacznie wysyłać do users/${identityId}/stations/${thing}/...`
      );

      setTimeout(() => loadFiles(), 30000);
    } catch (e) {
      setClaimStatus("❌ Błąd: " + String(e));
      console.error("[claim] outer error:", e);
    }
  };

  // ===== Hub (nasłuch logowania/wylogowania) =====
  useEffect(() => {
    const unsub = Hub.listen("auth", async ({ payload: { event } }) => {
      console.log("[hub] event:", event);
      if (event === "signIn" || event === "cognitoHostedUI") {
        await checkUser();
      } else if (event === "signOut") {
        setUser(null);
        setFiles([]);
        setFileContent("");
      }
    });
    checkUser();
    return () => unsub();
  }, []);

  // ===== UI =====
  return (
    <div style={{ padding: 24 }}>
      <h1>Meteo Dashboard</h1>

      {!user ? (
        <button onClick={handleSignIn}>🔐 Zaloguj się</button>
      ) : (
        <>
          <p>
            Zalogowano jako: <b>{user.attributes?.email || user.username}</b>
          </p>
          <button onClick={handleSignOut}>🚪 Wyloguj</button>

          <h2>🔗 Połącz nową stację</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="thingName (np. station-001)"
              value={thing}
              onChange={(e) => setThing(e.target.value)}
            />
            <input
              placeholder="kod z ESP (nonce)"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
            />
            <button onClick={handleClaim}>Połącz</button>
          </div>
          <p style={{ whiteSpace: "pre-wrap" }}>{claimStatus}</p>

          <h2>📁 Twoje dane</h2>
          {!files || files.length === 0 ? (
            <p>Brak plików w S3</p>
          ) : (
            <ul>
              {files.map((f) => (
                <li key={f.key}>
                  {f.key}{" "}
                  <button onClick={() => fetchData(f.key)}>📥 Pobierz</button>
                </li>
              ))}
            </ul>
          )}

          {error && <pre style={{ color: "red" }}>{error}</pre>}

          {fileContent && (
            <pre
              style={{
                background: "#f6f6f6",
                border: "1px solid #ccc",
                padding: 12,
                marginTop: 16,
                whiteSpace: "pre-wrap",
              }}
            >
              {fileContent}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
