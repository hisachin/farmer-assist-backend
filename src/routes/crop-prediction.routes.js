const express = require('express');
const cropPredictionController = require('../controllers/crop-prediction.controller');

const router = express.Router();

/**
 * GET /api/crop-prediction/analyze
 * Get predictive analysis for a specific crop
 * Query params:
 *   - cropType (required): Type of crop (wheat, rice, cotton, etc.)
 *   - lat (optional): Latitude for weather data
 *   - lon (optional): Longitude for weather data
 *   - locationName (optional): Location name
 */
router.get('/analyze', cropPredictionController.getPredictiveAnalysis.bind(cropPredictionController));

/**
 * POST /api/crop-prediction/compare
 * Get predictions for multiple crops for comparison
 * Body:
 *   - crops (required): Array of crop types
 *   - lat (optional): Latitude
 *   - lon (optional): Longitude
 *   - locationName (optional): Location name
 */
router.post('/compare', cropPredictionController.getMultipleCropAnalysis.bind(cropPredictionController));

/**
 * POST /api/crop-prediction/advanced
 * Get advanced prediction with historical data comparison
 * Body:
 *   - cropType (required): Type of crop
 *   - lat (optional): Latitude
 *   - lon (optional): Longitude
 *   - locationName (optional): Location name
 *   - historicalData (optional): Historical data for comparison
 */
router.post('/advanced', cropPredictionController.getAdvancedPrediction.bind(cropPredictionController));

/**
 * POST /api/crop-prediction/recommend
 * Get recommendation for best crop to plant
 * Body:
 *   - availableCrops (required): Array of crops available to plant
 *   - lat (optional): Latitude
 *   - lon (optional): Longitude
 *   - locationName (optional): Location name
 */
router.post('/recommend', cropPredictionController.getRecommendedCrop.bind(cropPredictionController));

module.exports = router;
