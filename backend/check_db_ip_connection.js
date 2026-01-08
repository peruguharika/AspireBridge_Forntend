const mongoose = require('mongoose');
const dns = require('dns');
const { promisify } = require('util');
require('dotenv').config();

const dnsLookup = promisify(dns.lookup);

async function checkDatabaseConnection() {
    console.log('🔍 ================================');
    console.log('🔍 DATABASE CONNECTION CHECK');
    console.log('🔍 ================================\n');

    // Step 1: Check if MONGODB_URI exists
    console.log('📋 Step 1: Checking Environment Variables');
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env file');
        process.exit(1);
    }
    console.log('✅ MONGODB_URI found in environment');

    // Step 2: Parse and display connection details
    console.log('\n📋 Step 2: Parsing Connection String');
    const uri = process.env.MONGODB_URI;
    console.log('Connection URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials

    // Extract hostname/IP from URI
    let hostname = '';
    try {
        const match = uri.match(/@([^:/]+)/);
        if (match) {
            hostname = match[1];
            console.log('📍 Extracted Hostname/IP:', hostname);
        }
    } catch (err) {
        console.error('❌ Error parsing URI:', err.message);
    }

    // Step 3: DNS/IP Resolution Check
    if (hostname) {
        console.log('\n📋 Step 3: Checking IP Resolution');
        try {
            const { address, family } = await dnsLookup(hostname);
            console.log('✅ Hostname resolved successfully');
            console.log('   IP Address:', address);
            console.log('   IP Version:', family === 4 ? 'IPv4' : 'IPv6');
        } catch (err) {
            console.error('❌ DNS Resolution failed:', err.message);
            console.log('⚠️  This might indicate network issues or incorrect hostname');
        }
    }

    // Step 4: Test MongoDB Connection
    console.log('\n📋 Step 4: Testing MongoDB Connection');
    console.log('⏳ Attempting to connect...');

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 second timeout
        });

        console.log('\n✅ ================================');
        console.log('✅ MongoDB Connected Successfully!');
        console.log('✅ ================================');
        console.log('📊 Database Name:', mongoose.connection.name);
        console.log('📊 Host:', mongoose.connection.host);
        console.log('📊 Port:', mongoose.connection.port);
        console.log('📊 Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

        // Test a simple query
        console.log('\n📋 Step 5: Testing Database Query');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('✅ Database query successful');
        console.log('📊 Available Collections:', collections.length);
        console.log('   Collections:', collections.map(c => c.name).join(', '));

        await mongoose.connection.close();
        console.log('\n✅ Connection test completed successfully');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ ================================');
        console.error('❌ MongoDB Connection Failed!');
        console.error('❌ ================================');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);

        if (err.message.includes('ECONNREFUSED')) {
            console.error('\n⚠️  Connection Refused - Possible causes:');
            console.error('   1. MongoDB server is not running');
            console.error('   2. Firewall blocking the connection');
            console.error('   3. Incorrect IP address or port');
        } else if (err.message.includes('ETIMEDOUT')) {
            console.error('\n⚠️  Connection Timeout - Possible causes:');
            console.error('   1. Network connectivity issues');
            console.error('   2. IP address is unreachable');
            console.error('   3. MongoDB server is not responding');
        } else if (err.message.includes('Authentication failed')) {
            console.error('\n⚠️  Authentication Failed - Possible causes:');
            console.error('   1. Incorrect username or password');
            console.error('   2. User does not have access to the database');
        }

        process.exit(1);
    }
}

// Run the check
checkDatabaseConnection();
