/**
 * Environment Configuration
 * 
 * Single source of truth for environment-related settings
 * Supports: development, staging, production
 */

const NODE_ENV = process.env.NODE_ENV || 'development';

const environments = {
  development: {
    name: 'development',
    isDev: true,
    isProd: false,
    port: 3000,
    logLevel: 'debug'
  },
  staging: {
    name: 'staging',
    isDev: false,
    isProd: false,
    port: process.env.PORT || 3000,
    logLevel: 'info'
  },
  production: {
    name: 'production',
    isDev: false,
    isProd: true,
    port: process.env.PORT || 8080,
    logLevel: 'error'
  }
};

const currentEnv = environments[NODE_ENV] || environments.development;

module.exports = {
  NODE_ENV,
  ...currentEnv,
  environments
};
