
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log("Attempting to connect to MongoDB...");

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log("Connected successfully!");
        process.exit(0);
    })
    .catch(err => {
        console.log("CONNECTION ERROR DETAILS:");
        console.log(err.message);
        console.log("-------------------------");
        console.log("Name:", err.name);
        console.log("Code:", err.code);
        console.log("CodeName:", err.codeName);
        process.exit(1);
    });
