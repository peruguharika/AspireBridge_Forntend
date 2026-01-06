const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aspirebridge';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🔌 Connected to MongoDB');

        try {
            const mentors = await User.find({ role: 'Achiever' });
            console.log(`✅ Found ${mentors.length} Mentors in DB:`);
            mentors.forEach(m => console.log(`- ${m.name} (ID: ${m._id})`));

            process.exit(0);
        } catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Connection Error:', err);
        process.exit(1);
    });
