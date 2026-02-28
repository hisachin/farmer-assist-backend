const axios = require('axios');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class WeatherService {
    /**
     * Fetches weather data for a given latitude and longitude from Open-Meteo.
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Formatted weather data
     */
    async getRealTimeWeather(lat, lon, locationName) {
        // Coerce inputs to numbers if they are strings from query params
        const numLat = lat ? parseFloat(lat) : undefined;
        const numLon = lon ? parseFloat(lon) : undefined;

        // Default to Bengaluru coordinates if not provided or invalid
        const latitude = (numLat !== undefined && !isNaN(numLat)) ? numLat : 12.9716;
        const longitude = (numLon !== undefined && !isNaN(numLon)) ? numLon : 77.5946;

        try {
            // Free Open-Meteo API, no API key required
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&wind_speed_unit=ms`;

            const response = await axios.get(url);
            const current = response.data.current;
            const daily = response.data.daily;

            // Use a small tolerance for coordinate matching (floating point comparison)
            const isDefault = Math.abs(latitude - 12.9716) < 0.01 && Math.abs(longitude - 77.5946) < 0.01;

            // Format daily forecast
            const forecast = daily.time.map((time, index) => ({
                date: time,
                maxTemp: `${daily.temperature_2m_max[index]}°`,
                minTemp: `${daily.temperature_2m_min[index]}°`,
                weatherCode: daily.weather_code[index]
            }));

            let finalLocationName = locationName;
            if (!finalLocationName) {
                finalLocationName = isDefault ? 'Bengaluru, India' : `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
            }

            return {
                locationName: finalLocationName,
                temperature: `${current.temperature_2m}°`,
                humidity: `${current.relative_humidity_2m}%`,
                windSpeed: `${current.wind_speed_10m} m/s`,
                precipitation: `${current.precipitation} mm`,
                forecast: forecast
            };
        } catch (error) {
            logger.error('Error fetching weather data from external API', error);
            throw new ApiError(502, 'Failed to fetch weather data from external service');
        }
    }
}

module.exports = new WeatherService();
