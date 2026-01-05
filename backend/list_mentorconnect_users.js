const mongoose = require('mongoose');
require('dotenv').config();

// Ensure we point to the right DB
const uri = process.env.MONGODB_URI.includes('mentorconnect')
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI.replace(/\/[^/]*\?/, '/mentorconnect?');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Total Users in 'mentorconnect': ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} [${u.userType}]`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
