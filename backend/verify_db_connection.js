const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aspirebridge';

console.log(`Checking connection to: ${MONGO_URI}`);

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`Available Collections: ${collections.map(c => c.name).join(', ')}`);
        } catch (e) {
            console.log('Warning: Could not list collections');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ CONNECTION FAILED');
        console.error(err.message);
        process.exit(1);
    });
