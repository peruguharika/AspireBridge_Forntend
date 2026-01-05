const mongoose = require('mongoose');
require('dotenv').config();

// Ensure we point to the right DB
const uri = process.env.MONGODB_URI.includes('mentorconnect')
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI.replace(/\/[^/]*\?/, '/mentorconnect?');

console.log('Connecting to update user type...');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        const email = 'harikap1919.sse@saveetha.com';
        const newType = 'aspirant';

        const userCollection = mongoose.connection.db.collection('users');
        const user = await userCollection.findOne({ email: email });

        if (!user) {
            console.log('User NOT FOUND');
            process.exit(0);
        }

        console.log(`Current Type: ${user.userType}`);

        if (user.userType !== newType) {
            await userCollection.updateOne(
                { email: email },
                { $set: { userType: newType } }
            );
            console.log(`✅ Updated user type to: ${newType}`);
        } else {
            console.log(`User is already an ${newType}. No change needed.`);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
