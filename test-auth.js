require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const payload = { userId: '123', name: 'Test User' };

// 1. Generate a token
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log('--- JWT GENERATION ---');
console.log('Payload:', JSON.stringify(payload));
console.log('Secret (masked):', secret.substring(0, 4) + '...');
console.log('Generated Token:', token);

// 2. Verify a valid token
console.log('\n--- JWT VERIFICATION (VALID) ---');
try {
    const decoded = jwt.verify(token, secret);
    console.log('Verification Success!');
    console.log('Decoded Data:', JSON.stringify(decoded));
} catch (err) {
    console.error('Verification Failed:', err.message);
}

// 3. Verify an invalid token
console.log('\n--- JWT VERIFICATION (INVALID) ---');
try {
    const invalidToken = token + 'f'; // Corrupting the signature
    console.log('Trying with invalid token...');
    jwt.verify(invalidToken, secret);
} catch (err) {
    console.log('Verification correctly failed:', err.message);
}
