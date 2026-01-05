const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Ensure we point to the right DB
const uri = process.env.MONGODB_URI.includes('mentorconnect')
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI.replace(/\/[^/]*\?/, '/mentorconnect?');

console.log('Connecting to verify users...');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        const usersToCheck = [
            { email: 'harsham@gmail.com', expectedType: 'achiever' },
            { email: 'srivennela904@gmail.com', expectedType: 'achiever' }
        ];
        const passwordToCheck = '123456';

        const userCollection = mongoose.connection.db.collection('users');

        for (const target of usersToCheck) {
            console.log(`\n--- Checking ${target.email} ---`);
            const user = await userCollection.findOne({ email: target.email });

            if (!user) {
                console.log('❌ User NOT FOUND');
                continue;
            }

            console.log(`User Found (ID: ${user._id})`);
            console.log(`Type in DB: ${user.userType}`);
            console.log(`Expected: ${target.expectedType}`);

            if (user.userType === target.expectedType) {
                console.log('✅ User Type MATCHES');
            } else {
                console.log(`❌ User Type MISMATCH (Found: ${user.userType})`);
            }

            if (user.password) {
                const isMatch = await bcrypt.compare(passwordToCheck, user.password);
                if (isMatch) {
                    console.log('✅ Password (123456) MATCHES');
                } else {
                    console.log('❌ Password DOES NOT MATCH');
                }
            } else {
                console.log('❌ No password field found');
            }
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
