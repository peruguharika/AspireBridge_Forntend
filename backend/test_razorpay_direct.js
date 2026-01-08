
const axios = require('axios');
const Razorpay = require('razorpay');
require('dotenv').config();

// 1. Direct Razorpay SDK Test
console.log("=== 1. Direct Razorpay SDK Test ===");
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log(`Key ID Present: ${!!keyId}`);
console.log(`Key Secret Present: ${!!keySecret}`);
// console.log(`Key Secret: ${keySecret}`); // CAREFUL WITH SECRETS

if (!keyId || !keySecret) {
    console.error("❌ Credentials missing in .env");
    process.exit(1);
}

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
});

async function testRazorpay() {
    try {
        const options = {
            amount: 50000, // 500 INR in paise
            currency: "INR",
            receipt: "order_rcptid_11",
            payment_capture: 1
        };
        const order = await razorpay.orders.create(options);
        console.log("✅ Razorpay Order Created Successfully via SDK:");
        console.log(`Order ID: ${order.id}`);
        console.log(`Amount: ${order.amount}`);
    } catch (error) {
        console.error("❌ Razorpay SDK Error:", error);
    }
}

// 2. Integration Test (Simulate Frontend Request if server is running)
// This requires a valid JWT token, so we might skip this or simulate a login first if needed.
// For now, let's just test the SDK capability.

testRazorpay();
