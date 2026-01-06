const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllWallets() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Get all users
        const usersCollection = db.collection('users');
        const walletsCollection = db.collection('wallets');

        const aspirants = await usersCollection.find({ userType: 'aspirant' }).sort({ createdAt: -1 }).toArray();

        console.log(`📊 Found ${aspirants.length} aspirant(s)\n`);

        if (aspirants.length === 0) {
            console.log('❌ No aspirants found!');
            await mongoose.connection.close();
            return;
        }

        const amountToAdd = 5000;

        for (const aspirant of aspirants) {
            console.log('─'.repeat(70));
            console.log(`👤 Aspirant: ${aspirant.name}`);
            console.log(`   Email: ${aspirant.email}`);
            console.log(`   User ID: ${aspirant._id}`);

            // Try to find wallet with different ID formats
            let wallet = await walletsCollection.findOne({ userId: aspirant._id });
            if (!wallet) {
                wallet = await walletsCollection.findOne({ userId: aspirant._id.toString() });
            }
            if (!wallet) {
                wallet = await walletsCollection.findOne({ userId: String(aspirant._id) });
            }

            if (wallet) {
                console.log(`\n💳 Found existing wallet`);
                console.log(`   Current Balance: ₹${wallet.balance || 0}`);

                // Update wallet
                const newBalance = (wallet.balance || 0) + amountToAdd;
                const newTransaction = {
                    type: 'credit',
                    amount: amountToAdd,
                    source: 'test',
                    description: 'Test money added - FIXED',
                    status: 'completed',
                    createdAt: new Date(),
                    timestamp: new Date()
                };

                await walletsCollection.updateOne(
                    { _id: wallet._id },
                    {
                        $set: { balance: newBalance, updatedAt: new Date() },
                        $push: { transactions: newTransaction }
                    }
                );

                console.log(`   ✅ Updated Balance: ₹${newBalance}`);

            } else {
                console.log(`\n💳 No wallet found. Creating new one...`);

                // Create new wallet with all possible ID formats
                const newWallet = {
                    userId: aspirant._id,
                    userType: 'aspirant',
                    balance: amountToAdd,
                    lockedBalance: 0,
                    totalEarnings: 0,
                    totalWithdrawn: 0,
                    transactions: [{
                        type: 'credit',
                        amount: amountToAdd,
                        source: 'test',
                        description: 'Test money added - NEW WALLET',
                        status: 'completed',
                        createdAt: new Date(),
                        timestamp: new Date()
                    }],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await walletsCollection.insertOne(newWallet);
                console.log(`   ✅ Created wallet with ₹${amountToAdd}`);
            }

            // Verify
            const verifyWallet = await walletsCollection.findOne({
                $or: [
                    { userId: aspirant._id },
                    { userId: aspirant._id.toString() },
                    { userId: String(aspirant._id) }
                ]
            });

            if (verifyWallet) {
                console.log(`\n   ✅ VERIFIED: Wallet balance is now ₹${verifyWallet.balance}`);
            } else {
                console.log(`\n   ❌ WARNING: Could not verify wallet!`);
            }
            console.log('');
        }

        console.log('═'.repeat(70));
        console.log('✅ ALL WALLETS PROCESSED');
        console.log('═'.repeat(70));

        // Show summary
        const totalWallets = await walletsCollection.countDocuments();
        console.log(`\nTotal wallets in database: ${totalWallets}`);

        console.log('\n📱 Next Steps:');
        console.log('   1. Close and reopen your Android app');
        console.log('   2. Go to wallet/profile section');
        console.log('   3. Balance should show ₹5000');
        console.log('   4. Try making a payment');
        console.log('   5. Select "Pay using Wallet balance"');
        console.log('   6. Payment should succeed!\n');

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

console.log('🔧 FIXING ALL WALLETS...\n');
fixAllWallets();
