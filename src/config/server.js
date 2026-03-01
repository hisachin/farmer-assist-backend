/**
 * Server Configuration
 * 
 * Server, port, and basic HTTP settings
 */

const env = require('./environment');

module.exports = {
  // Server
  NODE_ENV: env.NODE_ENV,
  PORT: parseInt(process.env.PORT || env.port, 10),
  
  // CORS
  CORS: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Request Handling
  BODY_LIMIT: '10mb',
  PARAM_LIMIT: '50kb',

  // API
  API: {
    VERSION: 'v1',
    PREFIX: '/api/v1',
    WEATHER: '/weather',
    CROP_PREDICTION: '/crop-prediction',
    TIMEOUT: 30000 // 30 seconds
  },

  // Security
  SECURITY: {
    HELMET_ENABLED: !env.isDev,
    RATE_LIMITING_ENABLED: env.isProd
  }
};
