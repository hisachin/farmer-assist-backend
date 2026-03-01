/**
 * Crop Prediction / AI Configuration
 * 
 * Settings for crop prediction analysis and AI models
 */

module.exports = {
  // Analysis Settings
  ANALYSIS: {
    MAX_CROPS_PER_REQUEST: 10,
    CACHE_RESULTS: true,
    CACHE_TTL: 3600 // 1 hour
  },

  // Prompt Settings
  PROMPTS: {
    CROP_ANALYSIS_MAX_LENGTH: 2000,
    CROP_COMPARISON_MAX_LENGTH: 3000,
    INCLUDE_HISTORICAL_DATA: true
  },

  // Response Parsing
  PARSING: {
    // Allow multiple response format attempts
    FORMATS: ['code_block', 'reasoning_tag', 'json_object', 'synthetic'],
    MAX_PARSE_ATTEMPTS: 4,
    TRUNCATION_REPAIR_ENABLED: true
  },

  // Agriculture Data
  CROPS: {
    COMMON: ['wheat', 'rice', 'cotton', 'corn', 'potato', 'tomato', 'onion'],
    COMPARISON_SET: ['wheat', 'rice', 'cotton'],
    RECOMMENDATION_SET: ['wheat', 'rice', 'corn', 'potato', 'cotton', 'sugarcane']
  },

  // Health Score Thresholds
  HEALTH_SCORES: {
    EXCELLENT: { min: 80, label: 'excellent' },
    GOOD: { min: 60, label: 'good' },
    FAIR: { min: 40, label: 'fair' },
    POOR: { min: 0, label: 'poor' }
  },

  // Risk Levels
  RISK_LEVELS: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  }
};
