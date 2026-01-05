console.log('Loading mongoose...');
try {
    const mongoose = require('mongoose');
    console.log('Mongoose loaded.');
} catch (e) {
    console.error('Failed to load mongoose:', e);
}
