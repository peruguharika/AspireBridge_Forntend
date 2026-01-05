const mongoose = require('mongoose');
console.log('Calling mongoose.connect...');
try {
    mongoose.connect('mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('mongoose.connect called (async).');
} catch (e) {
    console.error('mongoose.connect synchronous error:', e);
}
