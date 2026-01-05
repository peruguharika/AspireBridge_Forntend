const mongoose = require('mongoose');
require('dotenv').config();

// Modify URI to point to 'mentorconnect' instead of default
const uri = process.env.MONGODB_URI.includes('?')
    ? process.env.MONGODB_URI.replace('?', '/mentorconnect?')  // If no DB list but query params
    : process.env.MONGODB_URI + 'mentorconnect'; // Simple append if clean host

// Better: parse and rebuild
const newUri = process.env.MONGODB_URI.replace(/\/[^/]*\?/, '/mentorconnect?');
// If regex fails (no db name in original), just insert it before '?'
const finalUri = newUri === process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace('?', '/mentorconnect?')
    : newUri;

console.log('Testing connection to mentorconnect DB...');

mongoose.connect(finalUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected to DB:', mongoose.connection.name);

        const userCollection = mongoose.connection.db.collection('users'); // Check raw collection first
        const count = await userCollection.countDocuments();
        console.log('Total Users:', count);

        const email = 'harikap1919.sse@saveetha.com';
        const user = await userCollection.findOne({ email: email });

        if (user) {
            console.log('Target User FOUND in mentorconnect!');
            console.log(`- ${user.email} (Type: ${user.userType})`);
        } else {
            console.log('Target User NOT FOUND in mentorconnect.');
            // List a few to be sure
            const users = await userCollection.find({}).limit(5).toArray();
            users.forEach(u => console.log(`- ${u.email}`));
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
