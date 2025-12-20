const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import models
const Payment = require('./models/Payment');
const Wallet = require('./models/Wallet');
const User = require('./models/User');

async function fixMissingPayment() {
  try {
    console.log('🔧 Processing missing ₹100 payment...');
    
    // Find the specific unprocessed payment
    const paymentId = '694512e9c76feb5b84c5540f';
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      console.log('❌ Payment not found');
      return;
    }
    
    console.log(`Found payment: ₹${payment.amount} - Status: ${payment.status}`);
    console.log(`Razorpay Payment ID: ${payment.razorpayPaymentId}`);
    
    if (payment.status !== 'completed') {
      console.log('❌ Payment is not completed, cannot process');
      return;
    }
    
    // Find user's wallet
    const wallet = await Wallet.findOne({ userId: payment.userId });
    
    if (!wallet) {
      console.log('❌ Wallet not found for user');
      return;
    }
    
    console.log(`Current wallet balance: ₹${wallet.balance}`);
    
    // Check if this payment is already processed
    const existingTransaction = wallet.transactions.find(tx => 
      tx.razorpayTransactionId === payment.razorpayPaymentId
    );
    
    if (existingTransaction) {
      console.log('✅ Payment already processed in wallet');
      return;
    }
    
    // Process the payment
    const amount = payment.amount;
    
    // Add transaction to wallet
    wallet.transactions.push({
      type: 'credit',
      amount: amount,
      source: 'topup',
      description: `Wallet top-up via Razorpay (Missing Payment Fix)`,
      razorpayTransactionId: payment.razorpayPaymentId,
      timestamp: new Date()
    });
    
    // Update wallet balance
    wallet.balance += amount;
    wallet.totalEarnings += amount;
    
    // Save wallet
    await wallet.save();
    
    console.log(`✅ Successfully processed ₹${amount} payment`);
    console.log(`New wallet balance: ₹${wallet.balance}`);
    console.log(`Payment ID: ${payment.razorpayPaymentId}`);
    
  } catch (error) {
    console.error('❌ Error processing payment:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixMissingPayment();