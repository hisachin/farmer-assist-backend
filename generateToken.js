require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const payload = { userId: '123', name: 'Test Farmer' };

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);
