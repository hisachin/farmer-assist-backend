const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./config/logger');
const errorHandler = require('./middlewares/error.middleware');
const weatherRoutes = require('./routes/weather.routes');
const cropPredictionRoutes = require('./routes/crop-prediction.routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging - use config for morgan format
const morganFormat = config.isProduction() ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: { write: message => logger.info(message.trim()) } }));

// Mount API Routes - use config for API paths
const apiPrefix = config.server.API.PREFIX;
app.use(`${apiPrefix}${config.server.API.WEATHER}`, weatherRoutes);
app.use(`${apiPrefix}${config.server.API.CROP_PREDICTION}`, cropPredictionRoutes);

// Undefined Route Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
