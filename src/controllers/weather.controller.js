const weatherService = require('../services/weather.service');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

class WeatherController {
    async getWeather(req, res, next) {
        try {
            const { lat, lon, locationName } = req.query;
            
            logger.info(`📍 Weather request for lat=${lat}, lon=${lon}`);

            const weatherData = await weatherService.getRealTimeWeather(lat, lon, locationName);
            
            logger.info(`✓ Weather data retrieved: ${weatherData.locationName}`);

            // Return data directly without nested 'data' property for frontend compatibility
            res.status(200).json({
                success: true,
                locationName: weatherData.locationName,
                latitude: weatherData.latitude,
                longitude: weatherData.longitude,
                temperature: weatherData.temperature,
                humidity: weatherData.humidity,
                windSpeed: weatherData.windSpeed,
                precipitation: weatherData.precipitation,
                forecast: weatherData.forecast
            });
        } catch (error) {
            logger.error(`❌ Weather endpoint error: ${error.message}`);
            next(error); // Pass error to global error handler
        }
    }
}

module.exports = new WeatherController();
