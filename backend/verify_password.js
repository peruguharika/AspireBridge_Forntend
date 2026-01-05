const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Ensure we point to the right DB
const uri = process.env.MONGODB_URI.includes('mentorconnect')
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI.replace(/\/[^/]*\?/, '/mentorconnect?');

console.log('Connecting to verify user...');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        const email = 'harikap1919.sse@saveetha.com';
        const passwordToCheck = '123456';

        const user = await mongoose.connection.db.collection('users').findOne({ email: email });

        if (!user) {
            console.log('User NOT FOUND');
            process.exit(0);
        }

        console.log('User Found:');
        console.log(`- ID: ${user._id}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Type: ${user.userType}`);
        console.log(`- Hashed Password: ${user.password.substring(0, 20)}...`);

        console.log('Verifying password "123456"...');
        const isMatch = await bcrypt.compare(passwordToCheck, user.password);

        if (isMatch) {
            console.log('✅ Password MATCHES!');
        } else {
            console.log('❌ Password DOES NOT MATCH.');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
