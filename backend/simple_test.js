const axios = require('axios');

const BASE_URL = 'http://10.45.186.251:5000/api';

console.log('='.repeat(60));
console.log('TESTING BACKEND & SIGNUP');
console.log('='.repeat(60));

async function test() {
    try {
        // Test 1: Health Check
        console.log('\n1. Testing Backend Health...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Backend is running!');
        console.log('   Database:', health.data.database);
        console.log('   Status:', health.data.status);

        // Test 2: Aspirant Signup
        console.log('\n2. Testing Aspirant Signup...');
        const aspirant = {
            name: 'Test Aspirant',
            email: `test.asp.${Date.now()}@test.com`,
            password: 'test123',
            phone: '1234567890',
            userType: 'aspirant',
            examCategory: 'SSC',
            examSubCategory: 'SSC CGL'
        };

        const aspResponse = await axios.post(`${BASE_URL}/auth/signup`, aspirant);
        console.log('✅ Aspirant signup successful!');
        console.log('   Email:', aspResponse.data.user.email);
        console.log('   Approved:', aspResponse.data.user.approved);
        console.log('   Token:', aspResponse.data.token ? 'Generated' : 'Not generated');

        // Test 3: Achiever Signup
        console.log('\n3. Testing Achiever Signup...');
        const achiever = {
            name: 'Test Achiever',
            email: `test.ach.${Date.now()}@test.com`,
            password: 'test123',
            phone: '1234567891',
            userType: 'achiever',
            examCategory: 'UPSC',
            examSubCategory: 'UPSC CSE',
            rank: '100',
            year: '2024',
            bio: 'Test bio'
        };

        const achResponse = await axios.post(`${BASE_URL}/auth/signup`, achiever);
        console.log('✅ Achiever signup successful!');
        console.log('   Email:', achResponse.data.user.email);
        console.log('   Approved:', achResponse.data.user.approved);
        console.log('   Approval Status:', achResponse.data.user.approvalStatus);
        console.log('   Token:', achResponse.data.token ? 'Generated' : 'Not generated');

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60));

    } catch (error) {
        console.log('\n' + '='.repeat(60));
        console.log('❌ TEST FAILED!');
        console.log('='.repeat(60));

        if (error.code === 'ECONNREFUSED') {
            console.log('\n❌ Backend server is NOT running!');
            console.log('   Start it with: npm start');
        } else if (error.response) {
            console.log('\n❌ API Error:');
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data.message || error.response.data);
        } else {
            console.log('\n❌ Error:', error.message);
        }
        process.exit(1);
    }
}

test();
