const mongoose = require('mongoose');
const uri = 'mongodb+srv://venkeyy8180_db_user:venkeyy8180@cluster0.tzuuknm.mongodb.net/aspirebridge?retryWrites=true&w=majority';

console.log('Testing URI:', uri);
mongoose.connect(uri)
    .then(() => {
        console.log('✅ Success! Password is correct.');
        process.exit(0);
    })
    .catch(err => {
        console.log('❌ Failed:', err.message);
        process.exit(1);
    });
