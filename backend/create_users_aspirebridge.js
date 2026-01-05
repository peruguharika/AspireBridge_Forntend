const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

console.log('Creating users in aspirebridge...');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to:', mongoose.connection.name);

        const usersToCreate = [
            { name: "Harika", email: "harikap1919.sse@saveetha.com", userType: "aspirant", password: "123456", examType: "UPSC", approved: true, approvalStatus: 'approved' },
            { name: "Harsham", email: "harsham@gmail.com", userType: "achiever", password: "123456", examType: "UPSC", rank: "1", year: "2023", approved: true, approvalStatus: 'approved' },
            { name: "Srivennela", email: "srivennela904@gmail.com", userType: "achiever", password: "123456", examType: "NEET", rank: "10", year: "2023", approved: true, approvalStatus: 'approved' }
        ];

        for (const u of usersToCreate) {
            const exists = await User.findOne({ email: u.email });
            if (exists) {
                console.log(`⚠️ ${u.email} already exists`);
            } else {
                const newUser = new User(u);
                await newUser.save();
                console.log(`✅ Created: ${u.email} [${u.userType}]`);
            }
        }

        console.log('\nDone!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
