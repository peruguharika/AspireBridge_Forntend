const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected.');
        console.log('Current DB:', mongoose.connection.name);

        // Use the admin interface to list databases
        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const result = await admin.listDatabases();

        console.log('Available Databases:');
        result.databases.forEach(db => {
            console.log(`- ${db.name} (Size: ${db.sizeOnDisk})`);
        });

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
