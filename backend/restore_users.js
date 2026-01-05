const mongoose = require('mongoose');
const User = require('./models/User'); // Use the model to handle password hashing automatically
require('dotenv').config();

// Point to mentorconnect
const uri = process.env.MONGODB_URI.includes('mentorconnect')
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI.replace(/\/[^/]*\?/, '/mentorconnect?');

console.log('Connecting to restore users...');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        const usersToRestore = [
            {
                name: "Harsham",
                email: "harsham@gmail.com",
                userType: "achiever",
                password: "123456",
                examType: "UPSC", // Defaults
                rank: "1",
                year: "2023",
                approved: true,
                approvalStatus: 'approved'
            },
            {
                name: "Srivennela",
                email: "srivennela904@gmail.com",
                userType: "achiever",
                password: "123456",
                examType: "NEET", // Defaults
                rank: "10",
                year: "2023",
                approved: true,
                approvalStatus: 'approved'
            }
        ];

        for (const u of usersToRestore) {
            console.log(`\nProcessing ${u.email}...`);
            const exists = await User.findOne({ email: u.email });

            if (exists) {
                console.log(`⚠️ User ${u.email} ALREADY EXISTS in mentorconnect.`);
                // Optional: Update type if wrong?
                if (exists.userType !== u.userType) {
                    exists.userType = u.userType;
                    await exists.save();
                    console.log(`   Updated UserType to ${u.userType}`);
                }
            } else {
                console.log(`➕ Creating ${u.email}...`);
                const newUser = new User(u);
                await newUser.save();
                console.log(`✅ Created successfully.`);
            }
        }

        // Final confirmation of Harika
        console.log('\nVerifying Harika...');
        const harika = await User.findOne({ email: 'harikap1919.sse@saveetha.com' });
        if (harika) {
            console.log(`✅ Harika exists as ${harika.userType}`);
            if (harika.userType !== 'aspirant') {
                harika.userType = 'aspirant';
                await harika.save();
                console.log('   Fixed Harika to Aspirant.');
            }
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
