/**
 * Weather API Configuration
 * 
 * External weather API endpoints and settings
 */

module.exports = {
  // Open-Meteo (free weather data)
  OPEN_METEO: {
    BASE_URL: 'https://api.open-meteo.com/v1',
    ENDPOINTS: {
      FORECAST: '/forecast'
    },
    PARAMS: {
      CURRENT: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
      DAILY: 'temperature_2m_max,temperature_2m_min,weather_code',
      TIMEZONE: 'auto',
      WIND_SPEED_UNIT: 'ms'
    },
    TIMEOUT: 10000 // 10 seconds
  },

  // Nominatim (OpenStreetMap reverse geocoding)
  NOMINATIM: {
    BASE_URL: 'https://nominatim.openstreetmap.org',
    ENDPOINTS: {
      REVERSE: '/reverse'
    },
    PARAMS: {
      FORMAT: 'json'
    },
    TIMEOUT: 5000, // 5 seconds
    USER_AGENT: 'FarmerAssist/1.0'
  },

  // Default Location (Bengaluru, India)
  DEFAULT_LOCATION: {
    LATITUDE: 12.9716,
    LONGITUDE: 77.5946,
    NAME: 'Bengaluru, India'
  },

  // Cache settings
  CACHE: {
    ENABLED: true,
    TTL: 3600 // 1 hour in seconds
  }
};
