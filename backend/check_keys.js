const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
const config = dotenv.parse(fs.readFileSync(envPath));
console.log('RAZORPAY_KEY_ID:', config.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET length:', config.RAZORPAY_KEY_SECRET ? config.RAZORPAY_KEY_SECRET.length : 'MISSING');
