const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import models
const Payment = require('./models/Payment');
const Wallet = require('./models/Wallet');
const User = require('./models/User');

async function debugRecentPayment() {
  try {
    console.log('🔍 Debugging recent payment issue...');
    
    // Get the most recent payments (last 5)
    console.log('\n📋 Most Recent Payments:');
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');
    
    recentPayments.forEach((payment, index) => {
      console.log(`${index + 1}. Payment ID: ${payment._id}`);
      console.log(`   User: ${payment.userId?.name || 'Unknown'} (${payment.userId?.email || 'No email'})`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Type: ${payment.type}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Razorpay Order ID: ${payment.razorpayOrderId}`);
      console.log(`   Razorpay Payment ID: ${payment.razorpayPaymentId || 'Not set'}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log('   ---');
    });
    
    // Get current wallet state for giri
    console.log('\n💰 Current Wallet State for giri:');
    const wallet = await Wallet.findOne({ userId: '693fe9dd3719dde2bbdc86f0' }); // giri's user ID
    
    if (wallet) {
      console.log(`   Balance: ₹${wallet.balance}`);
      console.log(`   Total Earnings: ₹${wallet.totalEarnings}`);
      console.log(`   Transactions: ${wallet.transactions.length}`);
      console.log(`   Last Updated: ${wallet.updatedAt}`);
      
      // Show recent transactions
      console.log('\n   Recent Transactions:');
      wallet.transactions.slice(-5).forEach((tx, txIndex) => {
        console.log(`     ${txIndex + 1}. ${tx.type} ₹${tx.amount} - ${tx.source} - ${tx.description}`);
        console.log(`        Time: ${tx.timestamp || tx.createdAt || 'No timestamp'}`);
        console.log(`        Razorpay ID: ${tx.razorpayTransactionId || 'None'}`);
      });
    } else {
      console.log('   ❌ No wallet found for giri');
    }
    
    // Check for any completed payments not in wallet
    console.log('\n🔍 Checking for unprocessed completed payments...');
    const completedPayments = await Payment.find({
      type: 'wallet_topup',
      status: 'completed',
      userId: '693fe9dd3719dde2bbdc86f0' // giri's user ID
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${completedPayments.length} completed wallet top-up payments for giri:`);
    
    for (const payment of completedPayments) {
      const matchingTransaction = wallet?.transactions.find(tx => 
        tx.razorpayTransactionId === payment.razorpayPaymentId ||
        (tx.source === 'topup' && Math.abs(tx.amount - payment.amount) < 0.01 &&
         Math.abs(new Date(tx.timestamp) - new Date(payment.createdAt)) < 10 * 60 * 1000) // Within 10 minutes
      );
      
      if (!matchingTransaction) {
        console.log(`❌ UNPROCESSED: Payment ${payment._id}`);
        console.log(`   Amount: ₹${payment.amount}`);
        console.log(`   Payment ID: ${payment.razorpayPaymentId}`);
        console.log(`   Created: ${payment.createdAt}`);
        console.log(`   Status: ${payment.status}`);
        console.log('   → This payment needs to be processed!');
      } else {
        console.log(`✅ PROCESSED: Payment ${payment._id} (₹${payment.amount})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugRecentPayment();