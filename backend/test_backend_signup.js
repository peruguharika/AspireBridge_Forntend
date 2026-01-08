const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://192.168.137.168:5000/api';

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`),
    title: (msg) => console.log(`${colors.bold}${msg}${colors.reset}`)
};

async function testBackendHealth() {
    log.section();
    log.title('🏥 TESTING BACKEND HEALTH');
    log.section();

    try {
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
        log.success('Backend is running!');
        log.info(`Status: ${response.data.status}`);
        log.info(`Database: ${response.data.database}`);
        log.info(`Uptime: ${Math.floor(response.data.uptime)}s`);
        log.info(`Environment: ${response.data.environment || 'Not set'}`);
        return true;
    } catch (error) {
        log.error('Backend is NOT responding!');
        if (error.code === 'ECONNREFUSED') {
            log.error('Connection refused - Server is not running');
        } else if (error.code === 'ETIMEDOUT') {
            log.error('Connection timeout - Server may be unreachable');
        } else {
            log.error(`Error: ${error.message}`);
        }
        return false;
    }
}

async function testMongoDBConnection() {
    log.section();
    log.title('🗄️  TESTING MONGODB CONNECTION');
    log.section();

    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            log.error('MONGODB_URI not found in .env file!');
            return false;
        }

        log.info(`Connecting to: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        log.success('MongoDB connected successfully!');
        log.info(`Database: ${mongoose.connection.name}`);
        log.info(`Host: ${mongoose.connection.host}`);
        log.info(`Port: ${mongoose.connection.port}`);

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        log.info(`Collections: ${collections.map(c => c.name).join(', ')}`);

        return true;
    } catch (error) {
        log.error('MongoDB connection failed!');
        log.error(`Error: ${error.message}`);

        if (error.message.includes('authentication failed')) {
            log.warn('Authentication failed - Check username/password in MONGODB_URI');
        } else if (error.message.includes('ECONNREFUSED')) {
            log.warn('Connection refused - MongoDB server may not be running');
        } else if (error.message.includes('querySrv ENOTFOUND')) {
            log.warn('DNS lookup failed - Check MongoDB Atlas cluster URL');
        }

        return false;
    }
}

async function testSignupAspirant() {
    log.section();
    log.title('👤 TESTING ASPIRANT SIGNUP');
    log.section();

    const testUser = {
        name: 'Test Aspirant',
        email: `test.aspirant.${Date.now()}@example.com`,
        password: 'password123',
        phone: '9876543210',
        userType: 'aspirant',
        examCategory: 'SSC',
        examSubCategory: 'SSC CGL'
    };

    try {
        log.info(`Creating aspirant: ${testUser.email}`);
        const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);

        if (response.data.success) {
            log.success('Aspirant signup successful!');
            log.info(`User ID: ${response.data.user.id}`);
            log.info(`Name: ${response.data.user.name}`);
            log.info(`Email: ${response.data.user.email}`);
            log.info(`User Type: ${response.data.user.userType}`);
            log.info(`Approved: ${response.data.user.approved}`);
            log.info(`Token: ${response.data.token ? 'Generated ✓' : 'Not generated ✗'}`);
            return true;
        } else {
            log.error('Signup failed!');
            log.error(`Message: ${response.data.message}`);
            return false;
        }
    } catch (error) {
        log.error('Aspirant signup failed!');
        if (error.response) {
            log.error(`Status: ${error.response.status}`);
            log.error(`Message: ${error.response.data.message || error.response.data}`);
        } else {
            log.error(`Error: ${error.message}`);
        }
        return false;
    }
}

async function testSignupAchiever() {
    log.section();
    log.title('🏆 TESTING ACHIEVER SIGNUP');
    log.section();

    const testUser = {
        name: 'Test Achiever',
        email: `test.achiever.${Date.now()}@example.com`,
        password: 'password123',
        phone: '9876543211',
        userType: 'achiever',
        examCategory: 'UPSC',
        examSubCategory: 'UPSC CSE',
        rank: '100',
        year: '2024',
        bio: 'Test achiever bio',
        scorecardUrl: 'https://example.com/scorecard.jpg'
    };

    try {
        log.info(`Creating achiever: ${testUser.email}`);
        const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);

        if (response.data.success) {
            log.success('Achiever signup successful!');
            log.info(`User ID: ${response.data.user.id}`);
            log.info(`Name: ${response.data.user.name}`);
            log.info(`Email: ${response.data.user.email}`);
            log.info(`User Type: ${response.data.user.userType}`);
            log.info(`Rank: ${response.data.user.rank}`);
            log.info(`Approved: ${response.data.user.approved}`);
            log.info(`Approval Status: ${response.data.user.approvalStatus}`);
            log.info(`Token: ${response.data.token ? 'Generated ✓' : 'Not generated ✗'}`);
            return true;
        } else {
            log.error('Signup failed!');
            log.error(`Message: ${response.data.message}`);
            return false;
        }
    } catch (error) {
        log.error('Achiever signup failed!');
        if (error.response) {
            log.error(`Status: ${error.response.status}`);
            log.error(`Message: ${error.response.data.message || error.response.data}`);
        } else {
            log.error(`Error: ${error.message}`);
        }
        return false;
    }
}

async function testDuplicateSignup() {
    log.section();
    log.title('🔁 TESTING DUPLICATE EMAIL VALIDATION');
    log.section();

    const testUser = {
        name: 'Duplicate Test',
        email: `duplicate.test@example.com`,
        password: 'password123',
        userType: 'aspirant',
        examCategory: 'SSC'
    };

    try {
        // First signup
        log.info('Creating first user...');
        await axios.post(`${BASE_URL}/auth/signup`, testUser);
        log.success('First signup successful');

        // Try duplicate
        log.info('Attempting duplicate signup...');
        await axios.post(`${BASE_URL}/auth/signup`, testUser);
        log.error('Duplicate signup should have failed but succeeded!');
        return false;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            log.success('Duplicate email correctly rejected!');
            log.info(`Message: ${error.response.data.message}`);
            return true;
        } else {
            log.error('Unexpected error during duplicate test');
            log.error(`Error: ${error.message}`);
            return false;
        }
    }
}

async function checkExistingUsers() {
    log.section();
    log.title('👥 CHECKING EXISTING USERS IN DATABASE');
    log.section();

    try {
        const User = mongoose.model('User');
        const users = await User.find({}).select('name email userType approved approvalStatus createdAt').limit(10);

        if (users.length === 0) {
            log.warn('No users found in database');
        } else {
            log.success(`Found ${users.length} users (showing max 10):`);
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Type: ${user.userType}`);
                console.log(`   Approved: ${user.approved}`);
                console.log(`   Status: ${user.approvalStatus}`);
                console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
            });
        }
        return true;
    } catch (error) {
        log.error('Failed to check existing users');
        log.error(`Error: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('\n');
    log.title('🚀 ASPIREBRIDGE BACKEND & SIGNUP TEST SUITE');
    log.title('🕐 ' + new Date().toLocaleString());

    const results = {
        backendHealth: false,
        mongoConnection: false,
        aspirantSignup: false,
        achieverSignup: false,
        duplicateValidation: false,
        existingUsers: false
    };

    // Test 1: Backend Health
    results.backendHealth = await testBackendHealth();

    if (!results.backendHealth) {
        log.section();
        log.error('Backend is not running! Please start the server first.');
        log.info('Run: cd aspirebridge/backend && npm start');
        log.section();
        process.exit(1);
    }

    // Test 2: MongoDB Connection
    results.mongoConnection = await testMongoDBConnection();

    if (!results.mongoConnection) {
        log.section();
        log.error('MongoDB connection failed! Check your .env file.');
        log.section();
        await mongoose.connection.close();
        process.exit(1);
    }

    // Test 3: Check existing users
    results.existingUsers = await checkExistingUsers();

    // Test 4: Aspirant Signup
    results.aspirantSignup = await testSignupAspirant();

    // Test 5: Achiever Signup
    results.achieverSignup = await testSignupAchiever();

    // Test 6: Duplicate Email Validation
    results.duplicateValidation = await testDuplicateSignup();

    // Summary
    log.section();
    log.title('📊 TEST SUMMARY');
    log.section();

    const tests = [
        ['Backend Health', results.backendHealth],
        ['MongoDB Connection', results.mongoConnection],
        ['Existing Users Check', results.existingUsers],
        ['Aspirant Signup', results.aspirantSignup],
        ['Achiever Signup', results.achieverSignup],
        ['Duplicate Email Validation', results.duplicateValidation]
    ];

    tests.forEach(([name, passed]) => {
        if (passed) {
            log.success(name);
        } else {
            log.error(name);
        }
    });

    const passedCount = Object.values(results).filter(r => r).length;
    const totalCount = Object.keys(results).length;

    log.section();
    if (passedCount === totalCount) {
        log.success(`ALL TESTS PASSED! (${passedCount}/${totalCount})`);
    } else {
        log.warn(`SOME TESTS FAILED (${passedCount}/${totalCount} passed)`);
    }
    log.section();

    // Cleanup
    await mongoose.connection.close();
    log.info('MongoDB connection closed');
}

// Run tests
runAllTests().catch(error => {
    log.error('Test suite failed with error:');
    console.error(error);
    process.exit(1);
});
