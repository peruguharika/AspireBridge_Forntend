const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

let authToken = null;
let userId = null;

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: '/api' + path,
            method: method,
            headers: headers
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(body);
        req.end();
    });
}

async function test(name, fn) {
    try {
        const result = await fn();
        if (result.pass) {
            console.log(`✅ ${name}`);
        } else {
            console.log(`❌ ${name}: ${result.reason}`);
        }
    } catch (e) {
        console.log(`❌ ${name}: ${e.message}`);
    }
}

async function runTests() {
    console.log('=== ASPIREBRIDGE API WORKFLOW TESTS ===\n');
    console.log('📌 Testing without modifying database\n');

    // 1. Health Check
    await test('Health Check', async () => {
        const res = await request('/health');
        return { pass: res.status === 200 && res.body.status === 'OK', reason: JSON.stringify(res.body) };
    });

    // 2. Login (Aspirant)
    await test('Login (Aspirant)', async () => {
        const res = await request('/auth/login', 'POST', JSON.stringify({
            email: 'harikap1919.sse@saveetha.com',
            password: '123456'
        }));
        if (res.status === 200 && res.body.token) {
            authToken = res.body.token;
            userId = res.body.user?._id || res.body.user?.id;
            return { pass: true };
        }
        return { pass: false, reason: `Status ${res.status}: ${JSON.stringify(res.body)}` };
    });

    // 3. Get User Profile
    await test('Get User Profile', async () => {
        if (!userId) return { pass: false, reason: 'No user ID' };
        const res = await request(`/users/${userId}`);
        return { pass: res.status === 200 && res.body.success, reason: JSON.stringify(res.body) };
    });

    // 4. Get Achievers List
    await test('Get Achievers (Mentors)', async () => {
        const res = await request('/users?userType=achiever');
        return { pass: res.status === 200, reason: JSON.stringify(res.body) };
    });

    // 5. Login (Achiever)
    console.log('\n--- Achiever Workflow ---');
    await test('Login (Achiever)', async () => {
        const res = await request('/auth/login', 'POST', JSON.stringify({
            email: 'harsham@gmail.com',
            password: '123456'
        }));
        if (res.status === 200 && res.body.token) {
            authToken = res.body.token;
            userId = res.body.user?._id || res.body.user?.id;
            return { pass: true };
        }
        return { pass: false, reason: `Status ${res.status}: ${JSON.stringify(res.body)}` };
    });

    // 6. Get Own Availability
    await test('Get Own Availability', async () => {
        if (!userId) return { pass: false, reason: 'No user ID' };
        const res = await request(`/availability/${userId}`);
        return { pass: res.status === 200, reason: `Status ${res.status}` };
    });

    // 7. Get Bookings
    await test('Get Bookings', async () => {
        if (!userId) return { pass: false, reason: 'No user ID' };
        const res = await request(`/bookings/user/${userId}`);
        return { pass: res.status === 200, reason: `Status ${res.status}` };
    });

    // 8. Admin Login
    console.log('\n--- Admin Workflow ---');
    await test('Admin Login', async () => {
        const res = await request('/auth/admin-login', 'POST', JSON.stringify({
            email: process.env.ADMIN_EMAIL || 'admin@aspirebridge.com',
            password: process.env.ADMIN_PASSWORD || 'admin123'
        }));
        if (res.status === 200 && res.body.token) {
            authToken = res.body.token;
            return { pass: true };
        }
        return { pass: false, reason: `Status ${res.status}: ${JSON.stringify(res.body)}` };
    });

    // 9. Admin Stats
    await test('Admin Stats', async () => {
        const res = await request('/admin/stats');
        return { pass: res.status === 200 || res.status === 401, reason: `Status ${res.status}` };
    });

    // 10. Sessions Route
    await test('Sessions Endpoint', async () => {
        const res = await request('/sessions');
        return { pass: res.status === 200 || res.status === 401, reason: `Status ${res.status}` };
    });

    // Summary
    console.log('\n=== TEST COMPLETE ===');
}

runTests().catch(console.error);
