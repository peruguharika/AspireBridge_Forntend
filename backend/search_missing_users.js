const mongoose = require('mongoose');
require('dotenv').config();

const baseUri = process.env.MONGODB_URI.split('?')[0]; // Remove query params/db name
const options = { useNewUrlParser: true, useUnifiedTopology: true };
const emails = ['harsham@gmail.com', 'srivennela904@gmail.com'];

async function checkDB(dbName) {
    let uri;
    if (baseUri.includes('.net/')) {
        // Atlas
        uri = baseUri.replace(/\/[^/]*$/, `/${dbName}`);
    } else {
        uri = `${baseUri}/${dbName}`;
    }

    // Fix if lost params
    if (!uri.includes('?')) uri += '?retryWrites=true&w=majority';

    console.log(`\nConnecting to DB: ${dbName}...`);
    try {
        const conn = await mongoose.createConnection(uri, options).asPromise();
        console.log(`Connected to ${dbName}. Checking users...`);

        const found = await conn.collection('users').find({
            email: { $in: emails }
        }).toArray();

        if (found.length > 0) {
            console.log(`✅ FOUND ${found.length} users in ${dbName}:`);
            found.forEach(u => console.log(`- ${u.email} (${u.userType})`));
        } else {
            console.log(`❌ No target users found in ${dbName}.`);
        }

        await conn.close();
    } catch (e) {
        console.log(`Error connecting to ${dbName}:`, e.message);
    }
}

async function run() {
    await checkDB('mentorconnect');
    await checkDB('test');
    // await checkDB('admin'); // Unlikely
    process.exit(0);
}

run();
