const mongoose = require('mongoose');
require('dotenv').config();

console.log('='.repeat(60));
console.log('MONGODB CONNECTION TEST');
console.log('='.repeat(60));

async function testMongoDB() {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            console.log('❌ MONGODB_URI not found in .env file!');
            process.exit(1);
        }

        // Hide password in output
        const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
        console.log('\nConnecting to:', safeUri);

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log('\n✅ MongoDB Connected Successfully!');
        console.log('   Database:', mongoose.connection.name);
        console.log('   Host:', mongoose.connection.host);
        console.log('   Port:', mongoose.connection.port);
        console.log('   Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Collections in database:');
        collections.forEach(col => {
            console.log('   -', col.name);
        });

        // Count users
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const userCount = await User.countDocuments();
        console.log('\n👥 Total users:', userCount);

        if (userCount > 0) {
            const users = await User.find({}).select('name email userType approved').limit(5);
            console.log('\n📋 Sample users (max 5):');
            users.forEach((user, i) => {
                console.log(`   ${i + 1}. ${user.name} (${user.email})`);
                console.log(`      Type: ${user.userType}, Approved: ${user.approved}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ MongoDB is working correctly!');
        console.log('='.repeat(60));

        await mongoose.connection.close();

    } catch (error) {
        console.log('\n' + '='.repeat(60));
        console.log('❌ MongoDB Connection Failed!');
        console.log('='.repeat(60));
        console.log('\nError:', error.message);

        if (error.message.includes('authentication failed')) {
            console.log('\n💡 Tip: Check username/password in MONGODB_URI');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Tip: MongoDB server may not be running');
        } else if (error.message.includes('querySrv ENOTFOUND')) {
            console.log('\n💡 Tip: Check MongoDB Atlas cluster URL');
        }

        process.exit(1);
    }
}

testMongoDB();
