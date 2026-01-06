const mongoose = require('mongoose');
require('dotenv').config();

async function forceAddMoneyToWallet() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Define schemas
        const userSchema = new mongoose.Schema({}, { strict: false });
        const walletSchema = new mongoose.Schema({}, { strict: false });

        const User = mongoose.model('User', userSchema);
        const Wallet = mongoose.model('Wallet', walletSchema);

        // Find the most recent aspirant
        const aspirant = await User.findOne({ userType: 'aspirant' }).sort({ createdAt: -1 });

        if (!aspirant) {
            console.log('❌ No aspirant found in database');
            console.log('💡 Please signup as aspirant first\n');
            await mongoose.connection.close();
            return;
        }

        console.log('👤 Found Aspirant:');
        console.log(`   Name: ${aspirant.name}`);
        console.log(`   Email: ${aspirant.email}`);
        console.log(`   User ID: ${aspirant._id}\n`);

        // Find or create wallet
        let wallet = await Wallet.findOne({ userId: aspirant._id.toString() });

        const amountToAdd = 5000; // Add ₹5000 for testing

        if (!wallet) {
            console.log('💳 No wallet found. Creating new wallet...');

            // Create new wallet
            wallet = new Wallet({
                userId: aspirant._id.toString(),
                userType: 'aspirant',
                balance: amountToAdd,
                lockedBalance: 0,
                totalEarnings: 0,
                totalWithdrawn: 0,
                transactions: [{
                    type: 'credit',
                    amount: amountToAdd,
                    source: 'test',
                    description: 'Test money added for development',
                    status: 'completed',
                    createdAt: new Date(),
                    timestamp: new Date()
                }],
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await wallet.save();
            console.log(`✅ NEW WALLET CREATED with ₹${amountToAdd}\n`);

        } else {
            console.log('💳 Wallet found. Current balance: ₹' + (wallet.balance || 0));

            // Update existing wallet
            const oldBalance = wallet.balance || 0;
            wallet.balance = (wallet.balance || 0) + amountToAdd;

            // Ensure transactions array exists
            if (!wallet.transactions) {
                wallet.transactions = [];
            }

            // Add transaction
            wallet.transactions.push({
                type: 'credit',
                amount: amountToAdd,
                source: 'test',
                description: 'Test money added for development (forced)',
                status: 'completed',
                createdAt: new Date(),
                timestamp: new Date()
            });

            wallet.updatedAt = new Date();

            await wallet.save();
            console.log(`✅ WALLET UPDATED: ₹${oldBalance} → ₹${wallet.balance}\n`);
        }

        // Verify the update
        const verifyWallet = await Wallet.findOne({ userId: aspirant._id.toString() });

        console.log('═'.repeat(70));
        console.log('✅ VERIFICATION - Wallet Status:');
        console.log('═'.repeat(70));
        console.log(`💰 Balance: ₹${verifyWallet.balance}`);
        console.log(`🔒 Locked Balance: ₹${verifyWallet.lockedBalance || 0}`);
        console.log(`📊 Total Transactions: ${verifyWallet.transactions?.length || 0}`);
        console.log('═'.repeat(70));

        console.log('\n🎉 SUCCESS! Money added to wallet.\n');
        console.log('📱 Next Steps:');
        console.log('   1. Close and reopen your Android app');
        console.log('   2. Check wallet balance (should show ₹' + verifyWallet.balance + ')');
        console.log('   3. Try making a payment');
        console.log('   4. Select "Pay using Wallet balance"');
        console.log('   5. Payment should succeed!\n');

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

console.log('💰 FORCE ADDING MONEY TO WALLET...\n');
forceAddMoneyToWallet();
