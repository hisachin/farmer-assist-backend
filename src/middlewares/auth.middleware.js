const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Unauthorized: No token provided'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new ApiError(401, 'Unauthorized: Invalid token'));
    }
};

module.exports = authMiddleware;
