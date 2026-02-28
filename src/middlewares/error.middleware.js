const logger = require('../config/logger');

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
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(statusCode || 500).send(response);
};

module.exports = errorHandler;
