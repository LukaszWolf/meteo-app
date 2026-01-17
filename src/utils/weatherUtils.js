// src/utils/weatherUtils.js

export const getWeatherIcon = (code) => {
  if (code == null) return '❓';

  // Kody WMO (Open-Meteo)
  switch (code) {
    case 0:
      return '☀️';  // Bezchmurnie
    case 1:
      return '🌤️';  // Przeważnie bezchmurnie
    case 2:
      return '⛅';  // Częściowe zachmurzenie
    case 3:
      return '☁️';  // Pochmurno
    case 45:
    case 48:
      return '🌫️';  // Mgła
    case 51:
    case 53:
    case 55:
      return '🌦️';  // Mżawka
    case 56:
    case 57:
      return '🌨️';  // Marznąca mżawka
    case 61:
    case 63:
    case 65:
      return '🌧️';  // Deszcz
    case 66:
    case 67:
    case 71:
    case 73:
    case 75:
      return '❄️';  // Śnieg
    case 77:
      return '🌨️';  // Ziarna śniegu
    case 80:
    case 81:
    case 82:
      return '🌧️';  // Przelotny deszcz
    case 85:
    case 86:
      return '❄️';  // Przelotny śnieg
    case 95:
      return '⛈️';  // Burza
    case 96:
    case 99:
      return '⛈️';  // Burza z gradem
    default:
      return '❓';
  }
};