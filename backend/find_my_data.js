const mongoose = require('mongoose');
require('dotenv').config();

// Base URI without DB name
const baseUri = process.env.MONGODB_URI.split('?')[0].replace(/\/mentorconnect$/, '').replace(/\/test$/, '').replace(/\/$/, '');
const queryParams = '?retryWrites=true&w=majority';
const options = { useNewUrlParser: true, useUnifiedTopology: true };

// Targets to find
const targets = ['harsham@gmail.com', 'srivennela904@gmail.com', 'harikap1919.sse@saveetha.com'];

async function checkDatabase(dbName) {
    const uri = `${baseUri}/${dbName}${queryParams}`;
    console.log(`\n🔍 Checking Database: "${dbName}"...`);

    try {
        const conn = await mongoose.createConnection(uri, options).asPromise();
        const users = await conn.collection('users').find({ email: { $in: targets } }).toArray();

        if (users.length > 0) {
            console.log(`✅ FOUND DATA in "${dbName}":`);
            users.forEach(u => {
                console.log(`   - ${u.email}`);
                console.log(`     Type: ${u.userType}, Pass: ${u.password ? 'Has Password' : 'NO PASSWORD'}`);
            });
            return { name: dbName, count: users.length };
        } else {
            console.log(`❌ No target users found in "${dbName}".`);
        }
        await conn.close();
        return null;
    } catch (e) {
        console.log(`⚠️  Could not connect to "${dbName}": ${e.message}`);
        return null;
    }
}

async function run() {
    // 1. List all DBs first to be sure
    try {
        // Connect to admin/default to list
        const defaultConn = await mongoose.createConnection(`${baseUri}/admin${queryParams}`, options).asPromise();
        const admin = new mongoose.mongo.Admin(defaultConn.db);
        const list = await admin.listDatabases();
        await defaultConn.close();

        const dbNames = list.databases.map(d => d.name).filter(n => n !== 'admin' && n !== 'local');
        console.log('Available Databases:', dbNames);

        let match = null;
        for (const name of dbNames) {
            const result = await checkDatabase(name);
            if (result && result.count >= 2) { // Determine "best" match
                match = result.name;
            }
        }

        if (match) {
            console.log(`\n🏆 CONCLUSION: The correct database seems to be "${match}".`);
            console.log(`   It contains the missing users.`);
        } else {
            console.log('\n⚠️  Could not find these users in ANY database.');
        }

    } catch (e) {
        console.error('Fatal Error:', e);
    }
    process.exit(0);
}

run();
