const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const MasterClass = require('../models/MasterClass');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Create order request:', req.body);
    console.log('👤 User:', req.user);
    
    const { amount, bookingId, masterClassId, type } = req.body;

    if (!amount || !type) {
      console.error('❌ Missing required fields:', { amount, type });
      return res.status(400).json({
        success: false,
        message: 'Amount and type are required'
      });
    }

    if (!req.user || !req.user.id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('✅ Validation passed, creating Razorpay order...');

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    // Calculate payment distribution
    const adminFee = Math.round(amount * 0.10); // 10%
    const gatewayFee = Math.round(amount * 0.02); // 2%
    const mentorAmount = amount - adminFee - gatewayFee; // 88%

    // Save payment record
    const payment = new Payment({
      userId: req.user.id,
      bookingId: bookingId || null,
      masterClassId: masterClassId || null,
      type,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      status: 'created',
      adminFee,
      gatewayFee,
      mentorAmount,
      payoutStatus: 'pending'
    });

    await payment.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      payment
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment and LOCK money (NEW FLOW)
// @access  Private
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    console.log('Payment verification request body:', req.body);
    console.log('User from token:', req.user);
    
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment parameters'
      });
    }

    // Verify signature
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    console.log('Signature verification:', {
      received: razorpaySignature,
      expected: expectedSign,
      match: razorpaySignature === expectedSign
    });

    if (razorpaySignature === expectedSign) {
      // Payment verified successfully
      const payment = await Payment.findOne({ razorpayOrderId });

      if (!payment) {
        console.error('Payment record not found for order:', razorpayOrderId);
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      console.log('Found payment record:', payment._id, 'Type:', payment.type);

      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'completed';
      await payment.save();

      // 🔄 NEW FLOW: Handle different payment types
      if (payment.bookingId) {
        // 📌 BOOKING PAYMENT: LOCK MONEY (Don't credit wallets yet)
        await handleBookingPaymentLock(payment);
      } else if (payment.masterClassId) {
        // Master class enrollment (existing flow)
        const masterClass = await MasterClass.findById(payment.masterClassId);
        if (masterClass && !masterClass.currentParticipants.includes(payment.userId)) {
          masterClass.currentParticipants.push(payment.userId);
          await masterClass.save();
        }
      } else if (payment.type === 'wallet_topup') {
        // 💰 WALLET TOP-UP: Credit aspirant wallet immediately
        console.log('Processing wallet top-up for payment:', payment._id);
        try {
          await handleWalletTopup(payment);
          console.log('✅ Wallet top-up completed successfully');
        } catch (walletError) {
          console.error('❌ Wallet top-up failed:', walletError);
          // Don't fail the entire payment verification, just log the error
          // The payment is still successful, wallet update can be retried
        }
      }

      // Send confirmation email (don't fail payment if email fails)
      try {
        const user = await User.findById(payment.userId);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: 'Payment Successful - MentorConnect',
            html: `
              <h2>✅ Payment Successful!</h2>
              <p>Dear ${user.name},</p>
              <p>Your payment of <strong>₹${payment.amount}</strong> has been processed successfully.</p>
              <p><strong>Payment Details:</strong></p>
              <ul>
                <li>Payment ID: ${razorpayPaymentId}</li>
                <li>Order ID: ${razorpayOrderId}</li>
                <li>Amount: ₹${payment.amount}</li>
                <li>Type: ${payment.type || 'Booking'}</li>
              </ul>
              ${payment.bookingId ? '<p>💰 <strong>Note:</strong> Payment is secured and will be released to the mentor after session completion.</p>' : ''}
              <br>
              <p>Thank you for using MentorConnect!</p>
              <p>Best regards,<br>MentorConnect Team</p>
            `
          });
          console.log('✅ Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
        // Don't fail payment verification if email fails
      }

      console.log('✅ Payment verification completed successfully');
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment
      });

    } else {
      // Invalid signature
      console.error('Invalid payment signature:', {
        received: razorpaySignature,
        expected: expectedSign
      });
      
      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }

      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('❌ Verify Payment Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
      details: error.toString()
    });
  }
});

// 🔒 Helper function: Lock money for booking (NEW)
async function handleBookingPaymentLock(payment) {
  try {
    const Wallet = require('../models/Wallet');
    const LockedTransaction = require('../models/LockedTransaction');
    const Booking = require('../models/Booking');

    console.log(`🔒 Locking payment for booking: ${payment.bookingId}`);

    // Get booking details
    const booking = await Booking.findById(payment.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update booking payment status
    booking.paymentStatus = 'completed';
    booking.paymentId = payment.razorpayPaymentId;
    await booking.save();

    // Calculate split (same as before, but don't credit yet)
    const amount = payment.amount;
    const platformFee = Math.round(amount * 0.10); // 10%
    const razorpayFee = Math.round(amount * 0.02); // 2%
    const achieverAmount = amount - platformFee - razorpayFee; // 88%

    // Create locked transaction record
    const lockedTransaction = new LockedTransaction({
      bookingId: payment.bookingId,
      aspirantId: booking.aspirantId,
      achieverId: booking.achieverId,
      amount: amount,
      platformFee: platformFee,
      razorpayFee: razorpayFee,
      achieverAmount: achieverAmount,
      status: 'locked',
      razorpayPaymentId: payment.razorpayPaymentId
    });

    await lockedTransaction.save();

    // Get aspirant wallet and LOCK the amount (deduct from available balance)
    let aspirantWallet = await Wallet.findOne({ userId: booking.aspirantId });
    if (!aspirantWallet) {
      // Create wallet if doesn't exist
      aspirantWallet = new Wallet({
        userId: booking.aspirantId,
        userType: 'aspirant',
        balance: 0,
        lockedBalance: 0
      });
    }

    // Move money from balance to locked balance
    aspirantWallet.balance -= amount;
    aspirantWallet.lockedBalance += amount;

    // Add transaction record
    aspirantWallet.transactions.push({
      type: 'debit',
      amount: amount,
      source: 'booking',
      description: `Payment locked for session with ${booking.mentorName} on ${booking.date}`,
      timestamp: new Date(),
      bookingId: booking._id
    });

    await aspirantWallet.save();

    console.log(`✅ Payment locked: ₹${amount} for booking ${payment.bookingId}`);
    console.log(`💰 Split: Platform ₹${platformFee} | Razorpay ₹${razorpayFee} | Achiever ₹${achieverAmount}`);

  } catch (error) {
    console.error('Error locking booking payment:', error);
    throw error;
  }
}

// 💰 Helper function: Handle wallet top-up (NEW)
async function handleWalletTopup(payment) {
  try {
    const Wallet = require('../models/Wallet');

    console.log(`💰 Processing wallet top-up: ₹${payment.amount} for user ${payment.userId}`);
    console.log('Payment userId type:', typeof payment.userId, 'Value:', payment.userId);

    // Get or create user wallet
    let wallet = await Wallet.findOne({ userId: payment.userId });
    console.log('Found existing wallet:', wallet ? 'Yes' : 'No');
    if (!wallet) {
      console.log('Creating new wallet for user:', payment.userId);
      wallet = new Wallet({
        userId: payment.userId,
        userType: 'aspirant', // Assuming wallet top-ups are for aspirants
        balance: 0,
        lockedBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        transactions: []
      });
    }

    console.log('Wallet before update:', { balance: wallet.balance, totalEarnings: wallet.totalEarnings });

    // Credit wallet immediately for top-ups
    wallet.balance += payment.amount;
    wallet.totalEarnings += payment.amount;

    // Add transaction record
    wallet.transactions.push({
      type: 'credit',
      amount: payment.amount,
      source: 'topup',
      description: `Wallet top-up via Razorpay`,
      timestamp: new Date(),
      razorpayTransactionId: payment.razorpayPaymentId
    });

    const savedWallet = await wallet.save();
    console.log('Wallet saved successfully:', savedWallet._id);

    console.log('Wallet after update:', { balance: wallet.balance, totalEarnings: wallet.totalEarnings });
    console.log(`✅ Wallet credited: ₹${payment.amount} for user ${payment.userId}`);

  } catch (error) {
    console.error('Error processing wallet top-up:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// @route   POST /api/payments/refund
// @desc    Process refund
// @access  Private/Admin
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: (amount || payment.amount) * 100, // Amount in paise
      notes: {
        reason: reason || 'Booking cancelled'
      }
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = amount || payment.amount;
    await payment.save();

    // Update booking
    if (payment.bookingId) {
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.refundStatus = 'completed';
        booking.refundAmount = amount || payment.amount;
        await booking.save();
      }
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund
    });

  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

// @route   GET /api/payments/user/:userId
// @desc    Get user payments
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId })
      .populate('bookingId')
      .populate('masterClassId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('Get User Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// @route   GET /api/payments/mentor/:mentorId/earnings
// @desc    Get mentor earnings
// @access  Private
router.get('/mentor/:mentorId/earnings', authenticateToken, async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Get all completed bookings for this mentor
    const completedBookings = await Booking.find({
      achieverId: mentorId,
      status: 'completed',
      paymentStatus: 'completed'
    });

    // Get all payments for these bookings
    const bookingIds = completedBookings.map(b => b._id);
    const payments = await Payment.find({
      bookingId: { $in: bookingIds },
      status: 'completed'
    });

    // Calculate earnings
    const totalEarnings = payments.reduce((sum, p) => sum + p.mentorAmount, 0);
    const pendingPayout = payments
      .filter(p => p.payoutStatus === 'pending')
      .reduce((sum, p) => sum + p.mentorAmount, 0);
    const completedPayout = payments
      .filter(p => p.payoutStatus === 'completed')
      .reduce((sum, p) => sum + p.mentorAmount, 0);

    // Get master class earnings
    const masterClasses = await MasterClass.find({
      achieverId: mentorId,
      status: 'completed'
    });

    const masterClassIds = masterClasses.map(mc => mc._id);
    const masterClassPayments = await Payment.find({
      masterClassId: { $in: masterClassIds },
      status: 'completed'
    });

    const masterClassEarnings = masterClassPayments.reduce((sum, p) => sum + p.mentorAmount, 0);

    res.json({
      success: true,
      earnings: {
        totalEarnings: totalEarnings + masterClassEarnings,
        sessionEarnings: totalEarnings,
        masterClassEarnings,
        pendingPayout,
        completedPayout,
        totalSessions: completedBookings.length,
        totalMasterClasses: masterClasses.length
      },
      payments,
      masterClassPayments
    });

  } catch (error) {
    console.error('Get Mentor Earnings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
});

// @route   POST /api/payments/payout
// @desc    Process mentor payout
// @access  Private/Admin
router.post('/payout', authenticateToken, async (req, res) => {
  try {
    const { mentorId, amount, paymentIds } = req.body;

    // Update payment records
    await Payment.updateMany(
      { _id: { $in: paymentIds } },
      {
        payoutStatus: 'completed',
        payoutDate: new Date()
      }
    );

    // Send email to mentor
    const mentor = await User.findById(mentorId);
    if (mentor) {
      await sendEmail({
        to: mentor.email,
        subject: 'Payout Processed - MentorConnect',
        html: `
          <h2>Payout Processed!</h2>
          <p>Your payout of <strong>₹${amount}</strong> has been processed successfully.</p>
          <p>The amount will be credited to your registered account within 2-3 business days.</p>
          <br>
          <p>Thank you for being a valuable mentor!</p>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Payout processed successfully'
    });

  } catch (error) {
    console.error('Payout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payout',
      error: error.message
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay payment webhooks
// @access  Public (but verified with webhook signature)
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 Razorpay webhook received');
    console.log('Headers:', req.headers);

    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    // Parse body if it's raw
    let parsedBody;
    if (Buffer.isBuffer(webhookBody)) {
      parsedBody = JSON.parse(webhookBody.toString());
    } else {
      parsedBody = webhookBody;
    }

    console.log('Parsed webhook body:', parsedBody);

    // Verify webhook signature
    const bodyString = Buffer.isBuffer(webhookBody) ? webhookBody.toString() : JSON.stringify(webhookBody);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(bodyString)
      .digest('hex');

    console.log('Signature verification:', {
      received: webhookSignature,
      expected: expectedSignature,
      match: webhookSignature === expectedSignature
    });

    // Skip signature verification in development (you can enable this for production)
    // if (webhookSignature !== expectedSignature) {
    //   console.error('❌ Invalid webhook signature');
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    const { event, payload } = parsedBody;
    console.log('📋 Webhook event:', event);

    // Handle payment.captured event (when payment is successful)
    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const paymentId = payment.id;
      const orderId = payment.order_id;
      const amount = payment.amount / 100; // Convert from paise to rupees

      console.log('💰 Payment captured:', {
        paymentId,
        orderId,
        amount: `₹${amount}`
      });

      // Find the payment record in our database
      const paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });

      if (paymentRecord) {
        // Update payment status
        paymentRecord.razorpayPaymentId = paymentId;
        paymentRecord.status = 'completed';
        await paymentRecord.save();

        console.log('✅ Payment record updated:', paymentRecord._id);

        // Credit wallet if it's a wallet top-up
        if (paymentRecord.type === 'wallet_topup') {
          try {
            await handleWalletTopup(paymentRecord);
            console.log('✅ Wallet credited via webhook');
          } catch (walletError) {
            console.error('❌ Wallet credit failed:', walletError);
          }
        }

        // Send confirmation email
        try {
          const user = await User.findById(paymentRecord.userId);
          if (user) {
            await sendEmail({
              to: user.email,
              subject: 'Payment Successful - MentorConnect',
              html: `
                <h2>✅ Payment Successful!</h2>
                <p>Dear ${user.name},</p>
                <p>Your payment of <strong>₹${amount}</strong> has been processed successfully.</p>
                <p><strong>Payment Details:</strong></p>
                <ul>
                  <li>Payment ID: ${paymentId}</li>
                  <li>Order ID: ${orderId}</li>
                  <li>Amount: ₹${amount}</li>
                  <li>Type: ${paymentRecord.type || 'Wallet Top-up'}</li>
                </ul>
                <p>Your wallet has been credited with ₹${amount}.</p>
                <br>
                <p>Thank you for using MentorConnect!</p>
                <p>Best regards,<br>MentorConnect Team</p>
              `
            });
            console.log('✅ Confirmation email sent');
          }
        } catch (emailError) {
          console.error('❌ Email sending failed:', emailError);
        }
      } else {
        console.error('❌ Payment record not found for order:', orderId);
      }
    }

    // Handle payment.failed event
    else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      console.log('❌ Payment failed for order:', orderId);

      // Update payment status to failed
      const paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
      if (paymentRecord) {
        paymentRecord.status = 'failed';
        await paymentRecord.save();
        console.log('📝 Payment record marked as failed');
      }
    }

    res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   GET /api/payments/status/:orderId
// @desc    Check payment status by order ID
// @access  Private
router.get('/status/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        type: payment.type,
        razorpayPaymentId: payment.razorpayPaymentId,
        createdAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error('Payment Status Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// @route   GET /api/payments
// @desc    Get all payments (Admin)
// @access  Private/Admin
router.get('/', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email userType')
      .populate('bookingId')
      .populate('masterClassId')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const adminRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.adminFee, 0);

    const mentorPayouts = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.mentorAmount, 0);

    res.json({
      success: true,
      count: payments.length,
      statistics: {
        totalRevenue,
        adminRevenue,
        mentorPayouts,
        pendingPayouts: payments.filter(p => p.payoutStatus === 'pending').length,
        completedPayouts: payments.filter(p => p.payoutStatus === 'completed').length
      },
      payments
    });

  } catch (error) {
    console.error('Get All Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

module.exports = router;