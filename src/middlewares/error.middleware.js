const logger = require('../config/logger');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error';
        logger.error(`[UNEXPECTED] ${err.message}`, { stack: err.stack });
    } else {
        logger.error(`[API ERROR] ${statusCode} - ${message}`);
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(config.isDevelopment() && { stack: err.stack }),
    };

    res.status(statusCode || 500).send(response);
};

module.exports = errorHandler;
