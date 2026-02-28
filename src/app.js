const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./config/logger');
const errorHandler = require('./middlewares/error.middleware');
const weatherRoutes = require('./routes/weather.routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: { write: message => logger.info(message.trim()) } }));

// Mount API Routes
app.use('/api/v1/weather', weatherRoutes);

// Undefined Route Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
