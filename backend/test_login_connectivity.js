const axios = require('axios');

const LOGIN_URL = 'http://10.45.186.251:5000/api/auth/login';

async function testLogin() {
    console.log(`Testing Login at ${LOGIN_URL}...`);
    try {
        // Try a dummy login to see if we get a proper 401/400/404 or a connection error
        // If we get connection error -> IP issue
        // If we get 400/401 -> IP is fine, API is working
        const response = await axios.post(LOGIN_URL, {
            email: 'test@example.com',
            password: 'wrongpassword'
        });

        console.log('Response:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('✅ Server responded!');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
            if (error.response.status === 400 || error.response.status === 401) {
                console.log('-> API is reachable and working (handling invalid creds correctly).');
            }
        } else {
            console.log('❌ Connection Failed!');
            console.log('Error:', error.message);
            console.log('-> This indicates an IP/Network issue.');
        }
    }
}

testLogin();
