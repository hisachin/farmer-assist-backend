/**
 * Central Configuration Hub
 * 
 * Single source of truth for all application configurations
 * Import this file to access all config values across the project
 * 
 * USAGE:
 * const config = require('./src/config');
 * console.log(config.server.PORT);
 * console.log(config.aws.REGION);
 * console.log(config.weather.NOMINATIM.TIMEOUT);
 */

const environmentConfig = require('./environment');
const serverConfig = require('./server');
const awsConfig = require('./aws');
const weatherConfig = require('./weather');
const loggingConfig = require('./logging');
const cropPredictionConfig = require('./crop-prediction');
const promptsConfig = require('./prompts');

/**
 * Composite configuration object
 * Organized by concern/domain
 */
const config = {
  // Environment settings
  environment: environmentConfig,

  // Server/HTTP settings
  server: serverConfig,

  // AWS & Bedrock settings
  aws: awsConfig,

  // External APIs
  weather: weatherConfig,

  // Logging
  logging: loggingConfig,

  // Crop Prediction & AI
  cropPrediction: cropPredictionConfig,

  // AI Prompts
  prompts: promptsConfig,

  // Utility methods
  isProduction: () => environmentConfig.isProd,
  isDevelopment: () => environmentConfig.isDev,
  isStaging: () => environmentConfig.name === 'staging'
};

/**
 * Validate critical configurations on startup
 */
const validateConfig = () => {
  const errors = [];

  // Check AWS credentials in production
  if (environmentConfig.isProd) {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      errors.push('AWS_ACCESS_KEY_ID is required in production');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      errors.push('AWS_SECRET_ACCESS_KEY is required in production');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Configuration Validation Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    if (environmentConfig.isProd) {
      throw new Error('Critical configuration errors detected');
    }
  }

  console.log('✅ Configuration validated successfully');
  console.log(`📍 Environment: ${environmentConfig.NODE_ENV}`);
  console.log(`🚀 Server: http://localhost:${serverConfig.PORT}`);
};

// Validate on module load (optional, can be called explicitly)
// validateConfig();

module.exports = config;
module.exports.validate = validateConfig;
