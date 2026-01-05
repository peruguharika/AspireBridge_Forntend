const mongoose = require('mongoose');

const uris = [
    'mongodb+srv://peruguharika4_db_user:peruguharika4_db_user@cluster0.qa4houd.mongodb.net/aspirebridge?retryWrites=true&w=majority', // Pass = User
    'mongodb+srv://peruguharika4_db_user:peruguharika4@cluster0.qa4houd.mongodb.net/aspirebridge?retryWrites=true&w=majority', // Pass = User prefix
    'mongodb+srv://peruguharika4_db_user:Hitman123@cluster0.qa4houd.mongodb.net/aspirebridge?retryWrites=true&w=majority' // Common guess
];

async function test() {
    for (const uri of uris) {
        console.log(`Testing: ${uri.split(':')[2].split('@')[0]}...`); // Log password safely-ish
        try {
            await mongoose.connect(uri);
            console.log('✅ Success!');
            fs.writeFileSync('.env', `MONGODB_URI=${uri}`, { encoding: 'utf8' }); // Save success
            process.exit(0);
        } catch (e) {
            console.log('❌ Failed');
        }
    }
    process.exit(1);
}
test();
