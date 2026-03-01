/**
 * AWS Bedrock Configuration
 * 
 * AWS credentials, Bedrock model settings
 */

const env = require('./environment');

// Validate AWS credentials
const validateAWSCreds = () => {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && env.isProd) {
    throw new Error(`Missing required AWS credentials: ${missing.join(', ')}`);
  }
  
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
};

module.exports = {
  // Credentials
  CREDENTIALS: validateAWSCreds(),
  
  // AWS Configuration
  REGION: process.env.AWS_REGION || 'us-east-1',
  
  // Bedrock Model Settings
  MODEL: {
    ID: process.env.BEDROCK_MODEL_ID || 'moonshot.kimi-k2-thinking',
    MAX_TOKENS: parseInt(process.env.BEDROCK_MAX_TOKENS || '2000', 10),
    TEMPERATURE: parseFloat(process.env.BEDROCK_TEMPERATURE || '0.7'),
    TOP_P: parseFloat(process.env.BEDROCK_TOP_P || '0.9')
  },

  // Inference Settings
  INFERENCE: {
    TIMEOUT: 60000, // 60 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  },

  // Bedrock Model Details
  MODELS: {
    CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
    CLAUDE_3_5_SONNET: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    KIMI_K2: 'moonshot.kimi-k2-thinking'
  }
};
