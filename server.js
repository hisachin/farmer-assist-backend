require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // In production, you might want to gracefully shutdown server here
});
