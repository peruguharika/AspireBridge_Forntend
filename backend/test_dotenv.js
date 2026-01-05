console.log('Loading dotenv...');
try {
    const result = require('dotenv').config();
    console.log('Dotenv result:', result.error ? 'Error' : 'Success');
    console.log('URI exists:', !!process.env.MONGODB_URI);
} catch (e) {
    console.error('Failed to load dotenv:', e);
}
