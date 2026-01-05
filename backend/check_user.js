const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        const email = 'harikap1919.sse@saveetha.com';
        console.log(`Checking for user: ${email}`);
        const user = await User.findOne({ email: email });
        if (user) {
            console.log('User FOUND.');
            console.log('User Details:', user);
        } else {
            console.log('User NOT FOUND.');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
