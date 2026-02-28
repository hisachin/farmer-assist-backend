const express = require('express');
const weatherController = require('../controllers/weather.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply auth middleware to protect the route
router.get('/', authMiddleware, weatherController.getWeather);

module.exports = router;
