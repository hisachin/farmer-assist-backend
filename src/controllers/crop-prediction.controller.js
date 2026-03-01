const cropPredictionService = require('../services/crop-prediction.service');
const weatherService = require('../services/weather.service');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class CropPredictionController {
    /**
     * Get crop predictive analysis based on weather forecast
     */
    async getPredictiveAnalysis(req, res, next) {
        try {
            const { cropType, lat, lon, locationName } = req.query;

            // Validate required parameters
            if (!cropType) {
                return next(new ApiError(400, 'cropType is required'));
            }

            // Get weather data for the location
            const weatherData = await weatherService.getRealTimeWeather(lat, lon, locationName);
            logger.info(`Retrieved weather data for location: ${weatherData.locationName}`);

            // Get predictive analysis from Bedrock
            const prediction = await cropPredictionService.getPredictiveAnalysis(
                weatherData,
                cropType,
                weatherData.locationName
            );

            res.status(200).json({
                success: true,
                location: weatherData.locationName,
                data: prediction
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get multiple crop predictions for comparison
     */
    async getMultipleCropAnalysis(req, res, next) {
        try {
            const { crops, lat, lon, locationName } = req.body;

            // Validate inputs
            if (!crops || !Array.isArray(crops) || crops.length === 0) {
                return next(new ApiError(400, 'crops array is required'));
            }

            // Get weather data once
            const weatherData = await weatherService.getRealTimeWeather(lat, lon, locationName);
            logger.info(`Retrieved weather data for location: ${weatherData.locationName}`);

            // Get predictions for each crop
            const predictions = await Promise.all(
                crops.map(cropType =>
                    cropPredictionService.getPredictiveAnalysis(
                        weatherData,
                        cropType,
                        weatherData.locationName
                    )
                )
            );

            res.status(200).json({
                success: true,
                location: weatherData.locationName,
                predictions: predictions
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get advanced prediction with historical data comparison
     */
    async getAdvancedPrediction(req, res, next) {
        try {
            const { cropType, lat, lon, locationName, historicalData } = req.body;

            if (!cropType) {
                return next(new ApiError(400, 'cropType is required'));
            }

            // Get weather data
            const weatherData = await weatherService.getRealTimeWeather(lat, lon, locationName);
            logger.info(`Retrieved weather data for advanced analysis: ${weatherData.locationName}`);

            // Get advanced prediction
            const prediction = await cropPredictionService.getAdvancedPrediction(
                weatherData,
                cropType,
                weatherData.locationName,
                historicalData
            );

            res.status(200).json({
                success: true,
                location: weatherData.locationName,
                data: prediction
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get recommendation for best crop to plant
     */
    async getRecommendedCrop(req, res, next) {
        try {
            const { availableCrops, lat, lon, locationName } = req.body;

            if (!availableCrops || !Array.isArray(availableCrops)) {
                return next(new ApiError(400, 'availableCrops array is required'));
            }

            // Get weather data
            const weatherData = await weatherService.getRealTimeWeather(lat, lon, locationName);

            // Get analysis for all available crops
            const analyses = await Promise.all(
                availableCrops.map(cropType =>
                    cropPredictionService.getPredictiveAnalysis(
                        weatherData,
                        cropType,
                        weatherData.locationName
                    ).catch(error => ({
                        crop: cropType,
                        error: error.message
                    }))
                )
            );

            // Filter successful analyses and sort by crop health score
            const successfulAnalyses = analyses.filter(a => !a.error);
            successfulAnalyses.sort((a, b) => {
                const scoreA = a.analysis?.cropHealth?.score || 0;
                const scoreB = b.analysis?.cropHealth?.score || 0;
                return scoreB - scoreA;
            });

            res.status(200).json({
                success: true,
                location: weatherData.locationName,
                recommendation: {
                    bestCrop: successfulAnalyses[0] || null,
                    allAnalyses: successfulAnalyses,
                    failedAnalyses: analyses.filter(a => a.error)
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CropPredictionController();
