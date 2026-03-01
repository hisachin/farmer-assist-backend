/**
 * Logging Configuration
 * 
 * Winston logger settings
 */

const env = require('./environment');

module.exports = {
  // Log Level
  LEVEL: process.env.LOG_LEVEL || env.logLevel,

  // Format
  FORMAT: process.env.LOG_FORMAT || 'json',

  // File Locations
  FILES: {
    COMBINED: process.env.LOG_FILE_COMBINED || './logs/combined.log',
    ERROR: process.env.LOG_FILE_ERROR || './logs/error.log',
    INFO: process.env.LOG_FILE_INFO || './logs/info.log'
  },

  // Settings
  SETTINGS: {
    COMBINED: {
      maxsize: 5242880, // 5MB
      maxFiles: 5
    },
    ERROR: {
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }
  },

  // Console Logging
  CONSOLE: {
    ENABLED: !env.isProd,
    COLORIZE: !env.isProd
  },

  // Metadata to include
  METADATA: {
    SERVICE: process.env.SERVICE_NAME || 'farmer-assist-api',
    VERSION: process.env.APP_VERSION || '1.0.0',
    ENVIRONMENT: env.NODE_ENV
  }
};
