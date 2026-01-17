// src/hooks/useStationData.js
import {Auth, Storage} from 'aws-amplify';
import {useEffect, useState} from 'react';

// Helper wewnątrz hooka (nie musi być eksportowany)
const mapJsonToDashboardData = (json) => {
  return {
    outdoorTemp: json.outdoorTemperatureRead != null ?
        json.outdoorTemperatureRead / 10 :
        null,
    humidity: json.humidityRead ?? null,
    pressure: json.pressureRead ?? null,
    uvIndex: json.uvIndexRead != null ? json.uvIndexRead / 10 : null,
    indoorTemp:
        json.indoorTemperatureRead != null ? json.indoorTemperatureRead : null,
    lastUpdate: json.ts ?? null,
  };
};

export function useStationData(user) {
  const [history, setHistory] = useState([]);
  const [measurement, setMeasurement] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const creds = await Auth.currentCredentials();
      const id = creds.identityId;

      // 1. Lista
      const {results} =
          await Storage.list(`users/${id}/stations/`, {level: 'public'});

      // 2. Sortowanie
      results.sort(
          (a, b) => new Date(b.lastModified) - new Date(a.lastModified));

      // 3. Limit 48
      const recentFiles = results.slice(0, 48);

      if (recentFiles.length > 0) {
        const historyData = [];

        await Promise.all(recentFiles.map(async (file) => {
          try {
            const result =
                await Storage.get(file.key, {download: true, level: 'public'});
            const text = await result.Body.text();
            const obj = JSON.parse(text);
            historyData.push(mapJsonToDashboardData(obj));
          } catch (err) {
            console.warn(`Błąd pliku ${file.key}`, err);
          }
        }));

        // Sortowanie chronologiczne dla wykresu
        historyData.sort((a, b) => (a.lastUpdate || 0) - (b.lastUpdate || 0));
        setHistory(historyData);

        if (historyData.length > 0) {
          setMeasurement(historyData[historyData.length - 1]);
        }
      }
    } catch (err) {
      console.error('Błąd danych:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ładuj dane, gdy użytkownik się zaloguje
  useEffect(() => {
    if (user) {
      loadFiles();
    } else {
      setHistory([]);
      setMeasurement(null);
    }
  }, [user]);

  // Zwracamy dane i funkcję do odświeżania (reload)
  return {history, measurement, loading, reloadData: loadFiles};
}