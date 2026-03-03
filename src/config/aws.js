/**
 * AWS Bedrock Configuration
 * 
 * AWS credentials, Bedrock model settings
 */

const env = require('./environment');

// Build AWS credentials.
// On ECS/Fargate with a task role the SDK picks up credentials automatically
// via the container credential provider — no env vars needed.
// Only return explicit credentials when the env vars are present.
const getCredentials = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey };
  }

  // On ECS the SDK resolves credentials from the task role automatically.
  // Return undefined so the SDK uses the default credential chain.
  return undefined;
};

module.exports = {
  // Credentials (undefined when running with an IAM task role)
  CREDENTIALS: getCredentials(),

  // AWS Configuration — default to ap-south-1 to match our deployment region
  REGION: process.env.AWS_REGION || 'ap-south-1',
  
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
