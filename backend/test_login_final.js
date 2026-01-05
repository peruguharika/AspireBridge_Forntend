const http = require('http');

function request(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    console.log('Raw body:', data);
                    resolve({ status: res.statusCode, body: {} });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(body);
        req.end();
    });
}

async function run() {
    const email = `test.user.${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Testing with email: ${email}`);

    // 1. Signup
    console.log('\n[1] Registering User...');
    const signupPayload = JSON.stringify({
        name: "Test Check",
        email: email,
        password: password,
        userType: "aspirant",
        examType: "UPSC",
        rank: "1",
        year: "2024"
    });

    try {
        const signupRes = await request('/signup', 'POST', signupPayload);
        console.log(`Signup Status: ${signupRes.status}`);
        if (signupRes.status === 201 && signupRes.body.success) {
            console.log('Signup SUCCESS');
        } else {
            console.log('Signup FAILED', signupRes.body);
            return;
        }
    } catch (e) {
        console.error('Signup Request Error:', e);
        return;
    }

    // 2. Login
    console.log('\n[2] Logging In...');
    const loginPayload = JSON.stringify({
        email: email,
        password: password
    });

    try {
        const loginRes = await request('/login', 'POST', loginPayload);
        console.log(`Login Status: ${loginRes.status}`);
        if (loginRes.status === 200 && loginRes.body.success) {
            console.log('Login SUCCESS');
            console.log('Token received:', !!loginRes.body.token);
        } else {
            console.log('Login FAILED', loginRes.body);
        }
    } catch (e) {
        console.error('Login Request Error:', e);
    }
}

run();
