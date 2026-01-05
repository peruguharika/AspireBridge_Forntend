const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
console.log('Checking .env at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('File exists.');
    const buf = fs.readFileSync(envPath);
    console.log('File size:', buf.length);
    const config = dotenv.parse(buf);
    console.log('Keys found:', Object.keys(config));

    // Check specifically for MONGODB_URI
    if (config.MONGODB_URI) {
        console.log('MONGODB_URI is present (length: ' + config.MONGODB_URI.length + ')');
    } else {
        console.log('MONGODB_URI is MISSING.');
    }
} else {
    console.log('File does NOT exist.');
}
