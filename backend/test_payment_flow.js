
const http = require('http');

function request(path, method, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                ...headers
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
        req.write(payload);
        req.end();
    });
}

async function run() {
    const email = `test.payment.${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Testing Payment Flow with: ${email}`);

    // 1. Signup
    console.log('\n[1] Registering User...');
    const signupRes = await request('/auth/signup', 'POST', {
        name: "Payment Tester",
        email: email,
        password: password,
        userType: "aspirant",
        examType: "UPSC"
    });

    if (signupRes.status !== 201) {
        console.log('❌ Signup FAILED', signupRes.body);
        process.exit(1);
    }
    console.log('✅ Signup SUCCESS');

    // 2. Login
    console.log('\n[2] Logging In...');
    const loginRes = await request('/auth/login', 'POST', {
        email: email,
        password: password
    });

    if (loginRes.status !== 200 || !loginRes.body.token) {
        console.log('❌ Login FAILED', loginRes.body);
        process.exit(1);
    }
    const token = loginRes.body.token;
    console.log('✅ Login SUCCESS');

    // 3. Create Razorpay Order
    console.log('\n[3] Creating Razorpay Order...');
    const orderRes = await request('/payments/create-order', 'POST', {
        amount: 500,
        type: "session",
    }, {
        'Authorization': `Bearer ${token}`
    });

    if (orderRes.status === 200 && orderRes.body.success) {
        console.log('✅ Order Created SUCCESS');
        console.log('   Order ID:', orderRes.body.orderId);
        console.log('   Key ID:', orderRes.body.keyId);
        if (orderRes.body.keyId.startsWith('rzp_test')) {
            console.log('   Key OK: Yes');
        } else {
            console.log('   Key OK: No (Check .env)');
        }
    } else {
        console.log('❌ Order Creation FAILED', orderRes.body);
    }
}

run();
