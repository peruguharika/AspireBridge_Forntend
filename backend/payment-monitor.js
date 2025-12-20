const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import models
const Payment = require('./models/Payment');
const Wallet = require('./models/Wallet');
const User = require('./models/User');

async function monitorPayments() {
  try {
    console.log('🔍 Payment Monitoring System - Starting...');
    console.log(`📅 Check Time: ${new Date().toISOString()}`);
    
    // Find all completed payments that might not be processed
    const completedPayments = await Payment.find({
      type: 'wallet_topup',
      status: 'completed',
      razorpayPaymentId: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });
    
    console.log(`📋 Found ${completedPayments.length} completed wallet top-up payments`);
    
    let unprocessedCount = 0;
    let processedCount = 0;
    
    for (const payment of completedPayments) {
      // Check if this payment is processed in the wallet
      const wallet = await Wallet.findOne({ userId: payment.userId });
      
      if (!wallet) {
        console.log(`❌ No wallet found for user ${payment.userId} - Payment ${payment._id}`);
        unprocessedCount++;
        continue;
      }
      
      // Check if payment is already processed
      const existingTransaction = wallet.transactions.find(tx => 
        tx.razorpayTransactionId === payment.razorpayPaymentId ||
        (tx.source === 'topup' && 
         Math.abs(tx.amount - payment.amount) < 0.01 &&
         Math.abs(new Date(tx.timestamp) - new Date(payment.createdAt)) < 30 * 60 * 1000) // Within 30 minutes
      );
      
      if (!existingTransaction) {
        console.log(`❌ UNPROCESSED PAYMENT DETECTED:`);
        console.log(`   Payment ID: ${payment._id}`);
        console.log(`   User ID: ${payment.userId}`);
        console.log(`   Amount: ₹${payment.amount}`);
        console.log(`   Razorpay Payment ID: ${payment.razorpayPaymentId}`);
        console.log(`   Created: ${payment.createdAt}`);
        console.log(`   → This payment needs manual processing!`);
        unprocessedCount++;
      } else {
        processedCount++;
      }
    }
    
    // Summary
    console.log('\n📊 MONITORING SUMMARY:');
    console.log(`✅ Processed Payments: ${processedCount}`);
    console.log(`❌ Unprocessed Payments: ${unprocessedCount}`);
    console.log(`📈 Total Completed Payments: ${completedPayments.length}`);
    
    if (unprocessedCount > 0) {
      console.log('\n🚨 ACTION REQUIRED:');
      console.log(`   ${unprocessedCount} payment(s) need manual processing`);
      console.log('   Run: node fix-missing-payment.js');
    } else {
      console.log('\n✅ ALL PAYMENTS PROPERLY PROCESSED');
    }
    
    // Check recent payment activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPayments = await Payment.find({
      createdAt: { $gte: yesterday },
      type: 'wallet_topup'
    });
    
    console.log(`\n📈 Recent Activity (24h): ${recentPayments.length} payments`);
    
    const recentCompleted = recentPayments.filter(p => p.status === 'completed').length;
    const recentPending = recentPayments.filter(p => p.status === 'created').length;
    const recentFailed = recentPayments.filter(p => p.status === 'failed').length;
    
    console.log(`   ✅ Completed: ${recentCompleted}`);
    console.log(`   ⏳ Pending: ${recentPending}`);
    console.log(`   ❌ Failed: ${recentFailed}`);
    
  } catch (error) {
    console.error('❌ Monitoring error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run monitoring
monitorPayments();