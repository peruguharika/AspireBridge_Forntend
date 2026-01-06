const mongoose = require('mongoose');
require('dotenv').config();

async function checkWalletStatus() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Get models
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Wallet = mongoose.model('Wallet', new mongoose.Schema({}, { strict: false }));

        // Find all aspirants
        const aspirants = await User.find({ userType: 'aspirant' }).sort({ createdAt: -1 });

        console.log(`📊 Found ${aspirants.length} aspirant(s) in database\n`);

        if (aspirants.length === 0) {
            console.log('❌ No aspirants found!');
            console.log('💡 Please signup as aspirant in the app first.\n');
            await mongoose.connection.close();
            return;
        }

        // Check wallet for each aspirant
        for (const aspirant of aspirants) {
            console.log('─'.repeat(70));
            console.log(`👤 Aspirant: ${aspirant.name}`);
            console.log(`   Email: ${aspirant.email}`);
            console.log(`   User ID: ${aspirant._id}`);
            console.log(`   Created: ${aspirant.createdAt?.toLocaleString() || 'Unknown'}`);

            const wallet = await Wallet.findOne({ userId: aspirant._id });

            if (wallet) {
                console.log(`\n💳 Wallet Status:`);
                console.log(`   Balance: ₹${wallet.balance || 0}`);
                console.log(`   Locked Balance: ₹${wallet.lockedBalance || 0}`);
                console.log(`   Total Earnings: ₹${wallet.totalEarnings || 0}`);
                console.log(`   Total Withdrawn: ₹${wallet.totalWithdrawn || 0}`);
                console.log(`   Transactions: ${wallet.transactions?.length || 0}`);

                if (wallet.transactions && wallet.transactions.length > 0) {
                    console.log(`\n📝 Recent Transactions:`);
                    wallet.transactions.slice(-5).forEach((tx, i) => {
                        console.log(`   ${i + 1}. ${tx.type?.toUpperCase()} ₹${tx.amount} - ${tx.description}`);
                        console.log(`      Date: ${tx.createdAt?.toLocaleString() || 'Unknown'}`);
                    });
                }
            } else {
                console.log(`\n❌ NO WALLET FOUND for this user!`);
            }
            console.log('');
        }

        console.log('═'.repeat(70));
        console.log('\n💡 RECOMMENDATIONS:\n');

        const walletsCount = await Wallet.countDocuments();
        console.log(`Total wallets in database: ${walletsCount}`);

        if (walletsCount === 0) {
            console.log('\n⚠️  No wallets exist in database!');
            console.log('   This could mean:');
            console.log('   1. Wallets are not being created on signup');
            console.log('   2. The add_test_money script failed');
            console.log('   3. Database connection issue\n');
            console.log('✅ SOLUTION: Run the fix script below');
        }

        await mongoose.connection.close();
        console.log('\n✅ MongoDB connection closed');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

console.log('🔍 Checking Wallet Status...\n');
checkWalletStatus();
