const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected to:', process.env.MONGODB_URI.split('@')[1]); // Hide password
        console.log('Database Name:', mongoose.connection.name);

        // List Collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Check Users collection specifically
        const userCollection = mongoose.connection.db.collection('users');
        const count = await userCollection.countDocuments();
        console.log('Total Users in "users" collection:', count);

        if (count > 0) {
            const users = await userCollection.find({}).limit(10).toArray();
            console.log('First 10 Users:');
            users.forEach(u => console.log(`- ${u.email} (Type: ${u.userType})`));
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
