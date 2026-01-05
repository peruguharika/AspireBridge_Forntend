const mongoose = require('mongoose');
require('dotenv').config();

const baseUri = process.env.MONGODB_URI.split('?')[0].replace(/\/mentorconnect$/, '').replace(/\/test$/, '').replace(/\/aspirebridge$/, '').replace(/\/$/, '');
const queryParams = '?retryWrites=true&w=majority';

async function checkAspireBridge() {
    console.log('=== Checking ASPIREBRIDGE Database ===');

    try {
        const uri = `${baseUri}/aspirebridge${queryParams}`;
        console.log('Connecting to aspirebridge...');

        const conn = await mongoose.createConnection(uri).asPromise();
        console.log('Connected!');

        const collections = await conn.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        if (collections.some(c => c.name === 'users')) {
            const users = await conn.collection('users').find({}).toArray();
            console.log(`\n✅ FOUND ${users.length} users in aspirebridge:`);
            users.forEach(u => {
                console.log(`   - ${u.email} [${u.userType}]`);
            });
        } else {
            console.log('❌ No users collection in aspirebridge');
        }

        await conn.close();
    } catch (e) {
        console.error('Error:', e.message);
    }

    process.exit(0);
}

checkAspireBridge();
