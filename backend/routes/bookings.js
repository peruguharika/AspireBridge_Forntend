const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      aspirantId,
      achieverId,
      aspirantName,
      aspirantEmail,
      mentorName,
      mentorExam,
      date,
      time,
      message,
      amount
    } = req.body;

    // Validation
    if (!aspirantId || !achieverId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create booking
    const booking = new Booking({
      aspirantId,
      achieverId,
      aspirantName,
      aspirantEmail,
      mentorName,
      mentorExam,
      date,
      time,
      message,
      amount: amount || 500,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    // Send email notification to achiever
    const achiever = await User.findById(achieverId);
    if (achiever && achiever.email) {
      await sendEmail({
        to: achiever.email,
        subject: 'New Booking Request - MentorConnect',
        html: `
          <h2>New Booking Request</h2>
          <p>You have received a new booking request from <strong>${aspirantName}</strong></p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p>Please log in to your dashboard to accept or decline this request.</p>
          <br>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/user/:userId
// @desc    Get bookings for a user
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;

    let bookings;
    if (userType === 'aspirant') {
      bookings = await Booking.find({ aspirantId: userId }).sort({ createdAt: -1 });
    } else if (userType === 'achiever') {
      bookings = await Booking.find({ achieverId: userId }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    booking.updatedAt = Date.now();

    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.body.cancelledBy || 'aspirant';
      booking.refundStatus = 'processing';
    }

    await booking.save();

    // Send email notifications
    const aspirant = await User.findById(booking.aspirantId);
    const achiever = await User.findById(booking.achieverId);

    if (status === 'confirmed' && aspirant) {
      await sendEmail({
        to: aspirant.email,
        subject: 'Booking Confirmed - MentorConnect',
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Your booking with <strong>${booking.mentorName}</strong> has been confirmed.</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p>You can join the session from your dashboard at the scheduled time.</p>
          <br>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    if (status === 'cancelled') {
      const recipient = booking.cancelledBy === 'aspirant' ? achiever : aspirant;
      if (recipient) {
        await sendEmail({
          to: recipient.email,
          subject: 'Booking Cancelled - MentorConnect',
          html: `
            <h2>Booking Cancelled</h2>
            <p>The booking scheduled for <strong>${booking.date}</strong> at <strong>${booking.time}</strong> has been cancelled.</p>
            ${booking.cancelledBy === 'achiever' ? '<p>A full refund will be processed within 5-7 business days.</p>' : ''}
            <br>
            <p>Best regards,<br>MentorConnect Team</p>
          `
        });
      }
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (Admin)
// @access  Private/Admin
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking with refund
// @access  Private
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { rejectionReason, rejectedBy } = req.body;
    const bookingId = req.params.id;

    if (!rejectionReason || !rejectedBy) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason and rejectedBy are required'
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be rejected
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject a completed or already cancelled booking'
      });
    }

    // Update booking status
    booking.status = 'rejected';
    booking.rejectionReason = rejectionReason;
    booking.rejectedBy = rejectedBy;
    booking.rejectedAt = new Date();
    booking.refundStatus = 'processing';
    await booking.save();

    // Find the payment for this booking
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ bookingId: bookingId, status: 'completed' });
    
    if (payment) {
      try {
        // Process refund through Razorpay
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: payment.amount * 100, // Full refund in paise
          notes: {
            reason: `Booking rejected by mentor: ${rejectionReason}`,
            bookingId: bookingId
          }
        });

        // Update payment record
        payment.status = 'refunded';
        payment.refundId = refund.id;
        payment.refundAmount = payment.amount;
        payment.refundReason = rejectionReason;
        await payment.save();

        // Update booking refund status
        booking.refundStatus = 'completed';
        booking.refundAmount = payment.amount;
        await booking.save();

        console.log('Refund processed successfully:', refund.id);
      } catch (refundError) {
        console.error('Refund processing error:', refundError);
        // Even if refund fails, we still reject the booking
        // Admin can process refund manually
        booking.refundStatus = 'failed';
        await booking.save();
      }
    }

    // Send email notifications
    const aspirant = await User.findById(booking.aspirantId);
    const achiever = await User.findById(booking.achieverId);

    if (aspirant) {
      await sendEmail({
        to: aspirant.email,
        subject: 'Booking Rejected - Full Refund Initiated',
        html: `
          <h2>Booking Rejected</h2>
          <p>Unfortunately, your booking with <strong>${booking.mentorName}</strong> has been rejected.</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Reason:</strong> ${rejectionReason}</p>
          <br>
          <p><strong>Refund Status:</strong> A full refund of ₹${booking.refundAmount || booking.amount} has been initiated and will be processed within 5-7 business days.</p>
          <p>You can check your refund status in your dashboard under the "My Bookings" section.</p>
          <br>
          <p>We apologize for any inconvenience caused.</p>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Booking rejected successfully and refund initiated',
      booking: {
        ...booking.toObject(),
        refundStatus: booking.refundStatus,
        refundAmount: booking.refundAmount
      }
    });

  } catch (error) {
    console.error('Reject Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking',
      error: error.message
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking (Admin)
// @access  Private/Admin
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

// @route   POST /api/bookings/wallet-booking
// @desc    Create booking using wallet balance
// @access  Private
router.post('/wallet-booking', authenticateToken, async (req, res) => {
  try {
    const {
      mentorId,
      mentorName,
      date,
      time,
      duration,
      amount,
      message
    } = req.body;

    const userId = req.user.id;

    // Validation
    if (!mentorId || !date || !time || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check wallet balance
    const Wallet = require('../models/Wallet');
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create booking
    const booking = new Booking({
      aspirantId: userId,
      achieverId: mentorId,
      aspirantName: user.name,
      aspirantEmail: user.email,
      mentorName,
      mentorExam: 'General',
      date,
      time,
      duration: duration || 60,
      message: message || 'Booked via wallet',
      amount,
      status: 'pending',
      paymentMethod: 'wallet',
      paymentStatus: 'completed'
    });

    await booking.save();

    // Deduct amount from wallet
    wallet.balance -= amount;
    
    // Add transaction record
    wallet.transactions.push({
      type: 'debit',
      amount,
      source: 'booking',
      description: `Session booking with ${mentorName}`,
      bookingId: booking._id,
      createdAt: new Date()
    });

    await wallet.save();

    // Send emails to both parties
    const mentor = await User.findById(mentorId);
    
    // Email to aspirant
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Booking Request Sent - MentorConnect',
        html: `
          <h2>🎯 Booking Request Sent!</h2>
          <p>Dear ${user.name},</p>
          <p>Your booking request has been sent to <strong>${mentorName}</strong>.</p>
          <p><strong>Session Details:</strong></p>
          <ul>
            <li>Date: ${new Date(date).toLocaleDateString()}</li>
            <li>Time: ${time}</li>
            <li>Duration: ${duration || 60} minutes</li>
            <li>Amount: ₹${amount} (Paid via Wallet)</li>
          </ul>
          <p>💰 <strong>Payment:</strong> ₹${amount} has been deducted from your wallet.</p>
          <p>The mentor will review your request and respond within 24 hours.</p>
          <br>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    // Email to mentor
    if (mentor && mentor.email) {
      await sendEmail({
        to: mentor.email,
        subject: 'New Booking Request - MentorConnect',
        html: `
          <h2>📅 New Booking Request!</h2>
          <p>Dear ${mentorName},</p>
          <p>You have received a new booking request from <strong>${user.name}</strong>.</p>
          <p><strong>Session Details:</strong></p>
          <ul>
            <li>Student: ${user.name} (${user.email})</li>
            <li>Date: ${new Date(date).toLocaleDateString()}</li>
            <li>Time: ${time}</li>
            <li>Duration: ${duration || 60} minutes</li>
            <li>Amount: ₹${amount}</li>
            <li>Message: ${message || 'No message'}</li>
          </ul>
          <p>💰 <strong>Payment:</strong> Student has paid via wallet. Amount will be released after session completion.</p>
          <p>Please log in to your dashboard to accept or decline this request.</p>
          <br>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully using wallet',
      booking,
      walletBalance: wallet.balance
    });

  } catch (error) {
    console.error('Wallet Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

module.exports = router;