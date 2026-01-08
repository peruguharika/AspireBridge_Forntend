
const mongoose = require('mongoose');
require('dotenv').config();

const bookingSchema = new mongoose.Schema({
    achieverId: String,
    aspirantId: String,
    aspirantName: String,
    mentorName: String,
    date: String,
    time: String,
    status: String,
    paymentStatus: String,
    paymentId: String,
    orderId: String,
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

async function checkLatestBooking() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB. Fetching latest booking...');

        const latestBooking = await Booking.findOne().sort({ createdAt: -1 });

        if (latestBooking) {
            console.log('\n✅ LATEST BOOKING FOUND:');
            console.log('-----------------------------------');
            console.log(`ID: ${latestBooking._id}`);
            console.log(`Mentor: ${latestBooking.mentorName}`);
            console.log(`Aspirant: ${latestBooking.aspirantName}`);
            console.log(`Status: ${latestBooking.status.toUpperCase()}`);
            console.log(`Payment Status: ${latestBooking.paymentStatus.toUpperCase()}`);
            console.log(`Payment ID: ${latestBooking.paymentId}`);
            console.log(`Order ID: ${latestBooking.orderId}`);
            console.log(`Created At: ${latestBooking.createdAt}`);
            console.log('-----------------------------------');

            if (latestBooking.status === 'confirmed' && latestBooking.paymentId) {
                console.log('Result: SUCCESS - Booking is Confirmed and Paid.');
            } else {
                console.log('Result: PENDING/FAILED - Check details above.');
            }
        } else {
            console.log('❌ No bookings found in the database.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

checkLatestBooking();
