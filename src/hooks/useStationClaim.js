// src/hooks/useStationClaim.js
import {Auth, PubSub} from 'aws-amplify';
import {useState} from 'react';

const CLAIM_API_URL =
    'https://rp6817rcg4.execute-api.eu-north-1.amazonaws.com/claim/reply';

export function useStationClaim(user, onSuccess) {
  const [thing, setThing] = useState('');
  const [nonce, setNonce] = useState('');
  const [claimStatus, setClaimStatus] = useState('');

  const handleClaim = async () => {
    try {
      if (!user) {
        setClaimStatus('Zaloguj się najpierw.');
        return;
      }
      if (!thing || !nonce) {
        setClaimStatus('Wypełnij oba pola.');
        return;
      }

      setClaimStatus('Wysyłam kod...');
      const dataTopic = `devices/${thing}/data`;
      let isConfirmed = false;

      // Subskrypcja MQTT
      const subscription = PubSub.subscribe(dataTopic).subscribe({
        next: (msg) => {
          isConfirmed = true;
          setClaimStatus('Sparowano pomyślnie!');
          subscription.unsubscribe();
          if (onSuccess) onSuccess();  // Odśwież dane po sukcesie
        },
        error: (e) => console.error(e),
      });

      // API Request
      const creds = await Auth.currentCredentials();
      let headers = {'Content-Type': 'application/json'};
      try {
        const session = await Auth.currentSession();
        headers.Authorization = session.getIdToken().getJwtToken();
      } catch {
      }

      await fetch(CLAIM_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(
            {thingName: thing, identityId: creds.identityId, nonce}),
      });

      // Timeout check
      setTimeout(() => {
        if (!isConfirmed) {
          subscription.unsubscribe();
          if (claimStatus !== 'Sparowano pomyślnie!') {
            setClaimStatus('Wysłano. Czekam na dane...');
          }
        }
      }, 15000);

    } catch (e) {
      setClaimStatus('Błąd: ' + e.message);
    }
  };

  return {thing, setThing, nonce, setNonce, claimStatus, handleClaim};
}