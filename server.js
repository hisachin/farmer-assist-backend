require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/config/logger');

const PORT = config.server.PORT;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} in ${config.environment.name} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // In production, you might want to gracefully shutdown server here
});
