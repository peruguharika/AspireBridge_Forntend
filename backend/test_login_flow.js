const axios = require('axios'); // We might not have axios installed, using http is safer but verbose.
// Let's use fetch if node version supports it or http. Node 22 should support fetch.

async function testAuth() {
    const baseUrl = 'http://localhost:5000/api/auth';

    const user = {
        name: "Test User 2",
        email: "testlogin2@example.com",
        password: "password123",
        userType: "aspirant",
        examType: "UPSC",
        rank: "1",
        year: "2024"
    };

    console.log('--- Testing Signup ---');
    try {
        const signupRes = await fetch(`${baseUrl}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const signupData = await signupRes.json();
        console.log(`Status: ${signupRes.status}`);
        console.log('Response:', signupData);
    } catch (e) {
        console.log('Signup failed (might already exist):', e.message);
    }

    console.log('\n--- Testing Login (Success Case) ---');
    try {
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                password: user.password
            })
        });
        const loginData = await loginRes.json();
        console.log(`Status: ${loginRes.status}`);
        console.log('Response Success:', loginData.success);
        if (loginData.token) console.log('Token received: Yes');
        if (!loginData.success) console.log('Message:', loginData.message);
    } catch (e) {
        console.error('Login Error:', e.message);
    }

    console.log('\n--- Testing Login (Failure Case) ---');
    try {
        const failRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                password: "wrongpassword"
            })
        });
        const failData = await failRes.json();
        console.log(`Status: ${failRes.status}`);
        console.log('Response Success:', failData.success);
        console.log('Message:', failData.message);
    } catch (e) {
        console.error('Fail Login Error:', e.message);
    }
}

testAuth();
