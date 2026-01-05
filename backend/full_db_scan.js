const mongoose = require('mongoose');
require('dotenv').config();

const baseUri = process.env.MONGODB_URI.split('?')[0].replace(/\/mentorconnect$/, '').replace(/\/test$/, '').replace(/\/$/, '');
const queryParams = '?retryWrites=true&w=majority';

async function scanAllDatabases() {
    console.log('=== FULL DATABASE SCAN ===');
    console.log('Base URI:', baseUri.replace(/:[^:@]+@/, ':****@'));

    try {
        // Connect to admin to list all databases
        const adminConn = await mongoose.createConnection(`${baseUri}/admin${queryParams}`).asPromise();
        const admin = new mongoose.mongo.Admin(adminConn.db);
        const list = await admin.listDatabases();
        await adminConn.close();

        console.log('\n📊 ALL DATABASES IN CLUSTER:');
        for (const db of list.databases) {
            console.log(`\n=== DATABASE: "${db.name}" (Size: ${(db.sizeOnDisk / 1024).toFixed(1)} KB) ===`);

            if (db.name === 'admin' || db.name === 'local') continue;

            try {
                const conn = await mongoose.createConnection(`${baseUri}/${db.name}${queryParams}`).asPromise();

                // Check if users collection exists
                const collections = await conn.db.listCollections().toArray();
                const hasUsers = collections.some(c => c.name === 'users');

                if (hasUsers) {
                    const users = await conn.collection('users').find({}).toArray();
                    console.log(`   Users collection: ${users.length} users`);
                    users.forEach(u => {
                        console.log(`   - ${u.email} [${u.userType}]`);
                    });
                } else {
                    console.log(`   (No users collection)`);
                    console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
                }

                await conn.close();
            } catch (e) {
                console.log(`   Error scanning: ${e.message}`);
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    }

    process.exit(0);
}

scanAllDatabases();
