// src/hooks/useAuth.js
import {Auth, Hub} from 'aws-amplify';
import {useEffect, useState} from 'react';

const ATTACH_API_URL =
    'https://wjngrfdjy3.execute-api.eu-north-1.amazonaws.com/attach';

export function useAuth() {
  const [user, setUser] = useState(null);

  const ensureIoTPolicyAttached = async () => {
    try {
      const creds = await Auth.currentCredentials();
      let headers = {'Content-Type': 'application/json'};
      try {
        const session = await Auth.currentSession();
        headers.Authorization = session.getIdToken().getJwtToken();
      } catch {
      }

      await fetch(ATTACH_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({identityId: creds.identityId}),
      });
    } catch (e) {
      console.warn('Policy attach error:', e);
    }
  };

  const checkUser = async () => {
    try {
      const u = await Auth.currentAuthenticatedUser();
      setUser(u);
      await ensureIoTPolicyAttached();
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const unsub = Hub.listen('auth', ({payload: {event}}) => {
      if (event === 'signIn' || event === 'cognitoHostedUI')
        checkUser();
      else if (event === 'signOut')
        setUser(null);
    });
    checkUser();
    return unsub;
  }, []);

  const signIn = () => Auth.federatedSignIn();
  const signOut = () => Auth.signOut();

  return {user, signIn, signOut};
}