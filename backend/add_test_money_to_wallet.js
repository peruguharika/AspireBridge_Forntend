const mongoose = require('mongoose');
require('dotenv').config();

async function addTestMoneyToWallet() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Get User model to find aspirant
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Find an aspirant user
        const aspirant = await User.findOne({ userType: 'aspirant' }).sort({ createdAt: -1 });

        if (!aspirant) {
            console.log('❌ No aspirant found in database');
            console.log('💡 Please signup as aspirant first, then run this script');
            await mongoose.connection.close();
            return;
        }

        console.log(`\n👤 Found Aspirant:`);
        console.log(`   Name: ${aspirant.name}`);
        console.log(`   Email: ${aspirant.email}`);
        console.log(`   User ID: ${aspirant._id}`);

        // Get or create wallet
        const Wallet = mongoose.model('Wallet', new mongoose.Schema({}, { strict: false }));

        let wallet = await Wallet.findOne({ userId: aspirant._id });

        const amountToAdd = 2000; // Add ₹2000 for testing

        if (!wallet) {
            console.log('\n💳 Creating new wallet...');
            wallet = new Wallet({
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
                    description: 'Test money added for development',
                    status: 'completed',
                    createdAt: new Date()
                }]
            });
            await wallet.save();
            console.log(`✅ Wallet created with ₹${amountToAdd}`);
        } else {
            console.log('\n💳 Updating existing wallet...');
            console.log(`   Current Balance: ₹${wallet.balance}`);

            wallet.balance += amountToAdd;
            wallet.transactions.push({
                type: 'credit',
                amount: amountToAdd,
                source: 'test',
                description: 'Test money added for development',
                status: 'completed',
                createdAt: new Date()
            });

            await wallet.save();
            console.log(`✅ Added ₹${amountToAdd} to wallet`);
        }

        console.log(`\n💰 New Wallet Balance: ₹${wallet.balance}`);
        console.log(`\n🎉 Success! You can now use wallet to pay for bookings.`);
        console.log(`\n📱 Next Steps:`);
        console.log(`   1. Open Android app`);
        console.log(`   2. Go to booking payment screen`);
        console.log(`   3. Select "Pay using Wallet balance"`);
        console.log(`   4. Click "Pay Now"`);
        console.log(`   5. Booking should be confirmed!`);

        await mongoose.connection.close();
        console.log('\n✅ MongoDB connection closed');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the function
console.log('🚀 Adding Test Money to Wallet...\n');
addTestMoneyToWallet();
