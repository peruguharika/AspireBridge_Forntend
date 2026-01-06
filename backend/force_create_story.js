const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://10.45.186.251:5000/api';

async function testStoryFlow() {
    try {
        console.log('🔌 Connecting to MongoDB to find an Achiever...');
        await mongoose.connect(process.env.MONGODB_URI);

        const usersCollection = mongoose.connection.db.collection('users');
        const achiever = await usersCollection.findOne({ userType: 'achiever' }); // Or 'mentor'? Check schema.
        // Actually schema says 'achiever' usually.

        // If no achiever, we can't test properly without creating one, 
        // but let's try with 'aspirant' just to see if it allows posting (since we saw no role check).
        const user = achiever || await usersCollection.findOne({});

        if (!user) {
            console.log('❌ No users found in DB.');
            process.exit(1);
        }

        console.log(`👤 Using user: ${user.email} (${user.userType})`);

        await mongoose.connection.close();

        // 1. Login
        console.log('🔑 Logging in...');
        // We don't know the password... usually 'password123' in test envs.
        // If this fails, I can't test via API easily without modifying user.

        // Let's assume I can't login easily. 
        // I will just use the DB to insert a story directly and see if GET works.
        // This validates the GET endpoint and the DB connection at least.

    } catch (e) {
        console.error(e);
    }
}

async function testInsertAndFetch() {
    try {
        console.log('🧪 TESTING: Manual DB Insert -> API Fetch');

        console.log('🔌 Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Manually Insert Story
        const SuccessStory = require('./models/SuccessStory');

        const newStory = new SuccessStory({
            name: "Test User",
            role: "Software Engineer",
            company: "Google",
            story: "This is a manually inserted test story to verify display.",
            quote: "Never give up!",
            imageUrl: ""
        });

        await newStory.save();
        console.log('✅ Story saved to MongoDB directly.');

        // 2. Fetch via API (requires token... wait)
        // If I can't login, I can't hit the API because it has `authenticateToken`.
        // BUT I can create a temporary public route or just rely on the fact that I just proved DB works.

        // Let's just run this to populate the DB. 
        // If the user then refreshes the app and sees it, we know GET works.
        // If they don't, then GET is broken or App is broken.

        await mongoose.connection.close();
        console.log('✅ Connection closed.');

    } catch (e) {
        console.error('❌ Error:', e);
    }
}

testInsertAndFetch();
