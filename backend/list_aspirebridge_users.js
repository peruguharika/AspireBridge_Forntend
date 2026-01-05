const mongoose = require('mongoose');
require('dotenv').config();

console.log('Checking users in aspirebridge...');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to:', mongoose.connection.name);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`\nTotal Users: ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} [${u.userType}]`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
