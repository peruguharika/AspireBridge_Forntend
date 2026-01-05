const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected to DB. Listing users...');
        const users = await User.find({}, 'email name userType password');
        console.log('Total Users:', users.length);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.userType}): ${u.email}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
