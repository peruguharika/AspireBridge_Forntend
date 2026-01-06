const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function testTopupAPI() {
    try {
        console.log('🧪 TESTING TOPUP API DIRECTLY...\n');

        // Connect to MongoDB to get a real user
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Find an aspirant
        const aspirant = await usersCollection.findOne({ userType: 'aspirant' });

        if (!aspirant) {
            console.log('❌ No aspirant found');
            await mongoose.connection.close();
            return;
        }

        console.log('👤 Testing with user:');
        console.log(`   Name: ${aspirant.name}`);
        console.log(`   Email: ${aspirant.email}`);
        console.log(`   User ID: ${aspirant._id}\n`);

        // First, let's create an order
        console.log('📝 Step 1: Creating order...');

        // We need to get a JWT token first
        // For testing, let's try to login
        try {
            const loginResponse = await axios.post('http://10.45.186.251:5000/api/auth/login', {
                email: aspirant.email,
                password: 'password123' // Common test password
            });

            if (loginResponse.data.success) {
                const token = loginResponse.data.token;
                console.log(`✅ Login successful, got token: ${token.substring(0, 20)}...\n`);

                // Now test create order
                console.log('📝 Step 2: Creating payment order...');
                const orderResponse = await axios.post(
                    'http://10.45.186.251:5000/api/payments/create-order',
                    {
                        amount: 500,
                        type: 'wallet_topup'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('Order Response:', JSON.stringify(orderResponse.data, null, 2));

                if (orderResponse.data.success) {
                    const orderId = orderResponse.data.orderId;
                    console.log(`✅ Order created: ${orderId}\n`);

                    // Now test topup
                    console.log('📝 Step 3: Testing wallet topup...');
                    const topupResponse = await axios.post(
                        'http://10.45.186.251:5000/api/wallets/topup',
                        {
                            paymentId: `test_${Date.now()}`,
                            orderId: orderId,
                            userId: aspirant._id.toString(),
                            amount: 500
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log('\n═══════════════════════════════════════════════════════');
                    console.log('TOPUP RESPONSE:');
                    console.log('═══════════════════════════════════════════════════════');
                    console.log(JSON.stringify(topupResponse.data, null, 2));
                    console.log('═══════════════════════════════════════════════════════\n');

                    if (topupResponse.data.success) {
                        console.log('✅ TOPUP SUCCESSFUL!');
                        console.log(`   New Balance: ₹${topupResponse.data.newBalance}`);
                    } else {
                        console.log('❌ TOPUP FAILED!');
                        console.log(`   Message: ${topupResponse.data.message}`);
                    }
                } else {
                    console.log('❌ Order creation failed:', orderResponse.data.message);
                }

            } else {
                console.log('❌ Login failed. Cannot test without token.');
                console.log('   Try creating a user with password "password123" first.');
            }

        } catch (loginError) {
            if (loginError.response) {
                console.log('❌ Login error:', loginError.response.data);
            } else {
                console.log('❌ Login error:', loginError.message);
            }
            console.log('\n💡 Cannot test without authentication.');
            console.log('   Make sure you have a user account in the database.');
        }

        await mongoose.connection.close();
        console.log('\n✅ MongoDB connection closed');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

console.log('🧪 DIRECT API TEST - WALLET TOPUP\n');
testTopupAPI();
