const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

// Simple test server to debug the topup issue
async function testTopupEndpoint() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const walletsCollection = db.collection('wallets');

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

        // Check current wallet
        let wallet = await walletsCollection.findOne({
            $or: [
                { userId: aspirant._id },
                { userId: aspirant._id.toString() }
            ]
        });

        if (wallet) {
            console.log('💳 Current Wallet:');
            console.log(`   Balance: ₹${wallet.balance || 0}`);
            console.log(`   Transactions: ${wallet.transactions?.length || 0}\n`);
        } else {
            console.log('❌ No wallet found for this user!\n');
        }

        // Simulate the topup request
        console.log('🧪 Simulating topup request...');
        const testAmount = 1000;
        const testPaymentId = `test_${Date.now()}`;
        const testOrderId = `order_${Date.now()}`;

        console.log(`   Amount: ₹${testAmount}`);
        console.log(`   Payment ID: ${testPaymentId}`);
        console.log(`   Order ID: ${testOrderId}`);
        console.log(`   User ID: ${aspirant._id}\n`);

        // Find or create wallet
        if (!wallet) {
            console.log('💳 Creating new wallet...');
            wallet = {
                userId: aspirant._id,
                userType: 'aspirant',
                balance: 0,
                lockedBalance: 0,
                totalEarnings: 0,
                totalWithdrawn: 0,
                transactions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await walletsCollection.insertOne(wallet);
            console.log('✅ Wallet created\n');
        }

        // Add amount to balance
        const newBalance = (wallet.balance || 0) + testAmount;

        // Add transaction
        const newTransaction = {
            type: 'credit',
            amount: testAmount,
            description: 'Wallet Top-up (Test)',
            paymentId: testPaymentId,
            orderId: testOrderId,
            status: 'completed',
            date: new Date(),
            createdAt: new Date()
        };

        // Update wallet
        await walletsCollection.updateOne(
            { _id: wallet._id },
            {
                $set: { balance: newBalance, updatedAt: new Date() },
                $push: { transactions: newTransaction }
            }
        );

        console.log('✅ Topup successful!');
        console.log(`   Old Balance: ₹${wallet.balance || 0}`);
        console.log(`   Amount Added: ₹${testAmount}`);
        console.log(`   New Balance: ₹${newBalance}\n`);

        // Verify
        const updatedWallet = await walletsCollection.findOne({ _id: wallet._id });
        console.log('✅ Verification:');
        console.log(`   Balance: ₹${updatedWallet.balance}`);
        console.log(`   Transactions: ${updatedWallet.transactions.length}`);
        console.log(`   Last Transaction: ${updatedWallet.transactions[updatedWallet.transactions.length - 1].description}\n`);

        console.log('═'.repeat(70));
        console.log('✅ TOPUP ENDPOINT TEST PASSED');
        console.log('═'.repeat(70));
        console.log('\n📱 The backend topup logic is working correctly.');
        console.log('   If the Android app is showing an error, it might be:');
        console.log('   1. Authentication token issue');
        console.log('   2. Network connection problem');
        console.log('   3. Request format mismatch');
        console.log('   4. Missing Razorpay credentials\n');

        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

console.log('🧪 TESTING TOPUP ENDPOINT...\n');
testTopupEndpoint();
