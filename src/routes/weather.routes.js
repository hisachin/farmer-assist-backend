const express = require('express');
const weatherController = require('../controllers/weather.controller');

const router = express.Router();

// Weather endpoint is public - no auth required
// (Weather data is fetched from free Open-Meteo API)
router.get('/', weatherController.getWeather);

module.exports = router;
