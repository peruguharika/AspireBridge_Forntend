const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aspirebridge';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🔌 Connected to MongoDB');

        try {
            // Find achievers (case insensitive)
            const achievers = await User.find({ userType: { $regex: /^achiever$/i } });
            console.log(`✅ Found ${achievers.length} Achievers.`);

            let updatedCount = 0;
            for (const user of achievers) {
                console.log(`   User: ${user.name}, Approved: ${user.approved}, Status: ${user.approvalStatus}`);

                if (!user.approved || user.approvalStatus !== 'approved') {
                    user.approved = true;
                    user.approvalStatus = 'approved';
                    await user.save();
                    console.log(`   -> 🟢 Fixed Approval for ${user.name}`);
                    updatedCount++;
                }
            }

            console.log(`\n🎉 Processed all. Updated ${updatedCount} users.`);
            process.exit(0);
        } catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Connection Error:', err);
        process.exit(1);
    });
