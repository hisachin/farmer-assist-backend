const weatherService = require('../services/weather.service');
const ApiError = require('../utils/ApiError');

class WeatherController {
    async getWeather(req, res, next) {
        try {
            const { lat, lon, locationName } = req.query;

            const weatherData = await weatherService.getRealTimeWeather(lat, lon, locationName);

            res.status(200).json({
                success: true,
                data: weatherData
            });
        } catch (error) {
            next(error); // Pass error to global error handler
        }
    }
}

module.exports = new WeatherController();
