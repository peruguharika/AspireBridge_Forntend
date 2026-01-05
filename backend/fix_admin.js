const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to:', mongoose.connection.name);

        const adminEmail = 'admin@aspirebridge.com';
        const adminPassword = 'admin123';

        // Check if admin exists
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user EXISTS');
            console.log('User Type:', admin.userType);

            // Verify password
            const bcrypt = require('bcryptjs');
            const isMatch = await bcrypt.compare(adminPassword, admin.password);
            console.log('Password matches:', isMatch);

            if (admin.userType !== 'admin') {
                console.log('Fixing userType to admin...');
                admin.userType = 'admin';
                await admin.save();
                console.log('Fixed!');
            }
        } else {
            console.log('Admin user NOT FOUND. Creating...');
            admin = new User({
                name: 'Admin',
                email: adminEmail,
                password: adminPassword,
                userType: 'admin',
                approved: true,
                approvalStatus: 'approved'
            });
            await admin.save();
            console.log('Admin user CREATED!');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
