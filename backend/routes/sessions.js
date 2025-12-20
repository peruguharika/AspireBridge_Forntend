const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const Payment = require('../models/Payment');
const { authenticateToken } = require('../middleware/auth');
const { generateZegoToken } = require('../services/zegoService');
const { sendEmail } = require('../services/emailService');
const SessionCompletionService = require('../services/sessionCompletionService');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/sessions
// @desc    Create session for booking
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookingId, aspirantId, achieverId } = req.body;

    // Check if session already exists
    const existingSession = await Session.findOne({ bookingId });
    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Session already exists for this booking'
      });
    }

    // Get booking details to set scheduled times
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate scheduled start and end times
    const scheduledStartTime = new Date(`${booking.date}T${booking.time}:00`);
    const scheduledEndTime = new Date(scheduledStartTime.getTime() + (booking.duration || 60) * 60000);

    // Generate unique room ID
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Generate Zegocloud tokens
    const aspirantToken = generateZegoToken(aspirantId, roomId);
    const achieverToken = generateZegoToken(achieverId, roomId);

    // Create session with enhanced tracking
    const session = new Session({
      bookingId,
      aspirantId,
      achieverId,
      roomId,
      status: 'scheduled',
      scheduledStartTime,
      scheduledEndTime,
      zegoCloudData: {
        appId: process.env.ZEGOCLOUD_APP_ID,
        serverSecret: process.env.ZEGOCLOUD_SERVER_SECRET,
        roomId
      }
    });

    await session.save();

    // Update booking with meeting link
    await Booking.findByIdAndUpdate(bookingId, {
      meetingLink: `/video-call?roomId=${roomId}&userId=${aspirantId}`
    });

    // Send booking confirmation emails to both participants
    try {
      const User = require('../models/User');
      const { sendBookingConfirmation } = require('../services/emailService');
      
      const aspirant = await User.findById(aspirantId);
      const achiever = await User.findById(achieverId);

      const bookingDetails = {
        mentorName: achiever ? achiever.name : booking.mentorName,
        date: booking.date,
        time: booking.time,
        amount: booking.amount
      };

      // Send confirmation to aspirant
      if (aspirant && aspirant.email) {
        await sendBookingConfirmation(aspirant.email, {
          ...bookingDetails,
          mentorName: achiever ? achiever.name : booking.mentorName
        });
        console.log(`✅ Booking confirmation sent to aspirant: ${aspirant.email}`);
      }

      // Send confirmation to achiever
      if (achiever && achiever.email) {
        await sendBookingConfirmation(achiever.email, {
          ...bookingDetails,
          mentorName: `Session with ${aspirant ? aspirant.name : booking.aspirantName}`
        });
        console.log(`✅ Booking confirmation sent to achiever: ${achiever.email}`);
      }

    } catch (emailError) {
      console.error('❌ Failed to send booking confirmation emails:', emailError);
      // Don't fail the session creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session,
      tokens: {
        aspirant: aspirantToken,
        achiever: achieverToken
      }
    });

  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
});

// @route   GET /api/sessions/booking/:bookingId
// @desc    Get session by booking ID
// @access  Private
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({ bookingId: req.params.bookingId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Get Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
});

// @route   PUT /api/sessions/:id/join
// @desc    Mark participant as joined
// @access  Private
router.put('/:id/join', authenticateToken, async (req, res) => {
  try {
    const { userType } = req.body; // 'aspirant' or 'achiever'
    console.log(`🔄 Join attempt - Session ID: ${req.params.id}, User Type: ${userType}`);
    
    const session = await Session.findById(req.params.id);

    if (!session) {
      console.log(`❌ Session not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    console.log(`📅 Session found - Scheduled: ${session.scheduledStartTime} to ${session.scheduledEndTime}`);

    const now = new Date();
    const sessionStart = new Date(session.scheduledStartTime);
    const sessionEnd = new Date(session.scheduledEndTime);

    // Allow joining 15 minutes before and 30 minutes after scheduled time for testing
    const joinWindowStart = new Date(sessionStart.getTime() - 15 * 60 * 1000); // 15 minutes before
    const joinWindowEnd = new Date(sessionEnd.getTime() + 30 * 60 * 1000); // 30 minutes after
    
    if (now < joinWindowStart || now > joinWindowEnd) {
      return res.status(400).json({
        success: false,
        message: 'Session join window is not active. You can join 15 minutes before to 30 minutes after the scheduled time.',
        timeWindow: {
          start: joinWindowStart,
          end: joinWindowEnd,
          current: now,
          scheduledStart: sessionStart,
          scheduledEnd: sessionEnd
        }
      });
    }

    // Mark participant as joined
    if (userType === 'aspirant') {
      session.aspirantJoined = true;
      session.aspirantJoinTime = now;
    } else if (userType === 'achiever') {
      session.achieverJoined = true;
      session.achieverJoinTime = now;
    }

    // Update attendance pattern
    if (session.aspirantJoined && session.achieverJoined) {
      session.attendancePattern = 'both-joined';
    } else if (session.aspirantJoined) {
      session.attendancePattern = 'aspirant-only';
    } else if (session.achieverJoined) {
      session.attendancePattern = 'achiever-only';
    }

    // Start session if first participant joins
    if (!session.actualStartTime) {
      session.actualStartTime = now;
      session.status = 'ongoing';
    }

    // Start grace period if only one participant has joined
    if ((session.aspirantJoined && !session.achieverJoined) || 
        (!session.aspirantJoined && session.achieverJoined)) {
      if (!session.gracePeriodStarted) {
        session.gracePeriodStarted = now;
      }
    }

    await session.save();

    console.log(`✅ ${userType} joined session successfully - Aspirant: ${session.aspirantJoined}, Achiever: ${session.achieverJoined}`);

    res.json({
      success: true,
      message: `${userType} joined session successfully`,
      session: {
        id: session._id,
        status: session.status,
        attendancePattern: session.attendancePattern,
        gracePeriodStarted: session.gracePeriodStarted,
        aspirantJoined: session.aspirantJoined,
        achieverJoined: session.achieverJoined
      }
    });

  } catch (error) {
    console.error('Join Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join session',
      error: error.message
    });
  }
});

// @route   PUT /api/sessions/:id/leave
// @desc    Mark participant as left (but can rejoin)
// @access  Private
router.put('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const { userType } = req.body; // 'aspirant' or 'achiever'
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const now = new Date();

    // Mark participant leave time (but keep joined status true for rejoining)
    if (userType === 'aspirant') {
      session.aspirantLeaveTime = now;
    } else if (userType === 'achiever') {
      session.achieverLeaveTime = now;
    }

    await session.save();

    res.json({
      success: true,
      message: `${userType} left session (can rejoin during session window)`,
      session: {
        id: session._id,
        status: session.status,
        canRejoin: true
      }
    });

  } catch (error) {
    console.error('Leave Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave session',
      error: error.message
    });
  }
});

// @route   PUT /api/sessions/:id/start
// @desc    Start session (legacy endpoint)
// @access  Private
router.put('/:id/start', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.status = 'ongoing';
    session.startTime = new Date();
    session.actualStartTime = session.actualStartTime || new Date();
    await session.save();

    res.json({
      success: true,
      message: 'Session started',
      session
    });

  } catch (error) {
    console.error('Start Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
});

// @route   PUT /api/sessions/:id/complete
// @desc    Complete session with review and payment distribution
// @access  Private
router.put('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { review, rating, completionReason } = req.body;
    const session = await Session.findById(req.params.id).populate('bookingId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Session already completed'
      });
    }

    const now = new Date();
    
    // Update session completion details
    session.status = 'completed';
    session.actualEndTime = now;
    session.endTime = now; // Legacy field
    session.achieverReview = review || '';
    session.achieverRating = rating || null;
    session.completionReason = completionReason || 'normal';
    session.attendanceMarked = true;

    // Calculate actual duration
    if (session.actualStartTime) {
      const duration = Math.floor((now - session.actualStartTime) / 60000);
      session.duration = duration;
    }

    await session.save();

    // Update booking status
    await Booking.findByIdAndUpdate(session.bookingId._id, {
      status: 'completed'
    });

    // Process payment distribution
    await processPaymentDistribution(session);

    res.json({
      success: true,
      message: 'Session completed successfully',
      session: {
        id: session._id,
        status: session.status,
        completionReason: session.completionReason,
        paymentDistributed: session.paymentDistributed
      }
    });

  } catch (error) {
    console.error('Complete Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
});

// @route   PUT /api/sessions/:id/end
// @desc    End session (legacy endpoint)
// @access  Private
router.put('/:id/end', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.status = 'completed';
    session.endTime = new Date();
    session.actualEndTime = session.actualEndTime || new Date();
    
    // Calculate duration in minutes
    if (session.startTime || session.actualStartTime) {
      const startTime = session.actualStartTime || session.startTime;
      const duration = Math.floor((session.endTime - startTime) / 60000);
      session.duration = duration;
    }

    session.attendanceMarked = true;
    await session.save();

    // Update booking status to completed
    await Booking.findByIdAndUpdate(session.bookingId, {
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Session ended',
      session
    });

  } catch (error) {
    console.error('End Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
});

// @route   GET /api/sessions/user/:userId
// @desc    Get user sessions
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { aspirantId: req.params.userId },
        { achieverId: req.params.userId }
      ]
    })
    .populate('bookingId')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions
    });

  } catch (error) {
    console.error('Get User Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
});

// @route   GET /api/sessions
// @desc    Get all sessions (Admin)
// @access  Private/Admin
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('bookingId')
      .populate('aspirantId', 'name email')
      .populate('achieverId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions
    });

  } catch (error) {
    console.error('Get All Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
});

// Helper function to process payment distribution
async function processPaymentDistribution(session) {
  try {
    if (session.paymentDistributed) {
      console.log('Payment already distributed for session:', session._id);
      return;
    }

    // Find the payment for this booking
    const payment = await Payment.findOne({ 
      bookingId: session.bookingId._id, 
      status: 'completed' 
    });

    if (!payment) {
      console.log('No completed payment found for session:', session._id);
      return;
    }

    const totalAmount = payment.amount;
    const adminFeePercentage = 0.10; // 10%
    const gatewayFeePercentage = 0.02; // 2% (approximate Razorpay fee)
    
    const adminFee = Math.round(totalAmount * adminFeePercentage);
    const gatewayFee = Math.round(totalAmount * gatewayFeePercentage);
    const mentorEarnings = totalAmount - adminFee - gatewayFee;

    // Update session with payment details
    session.adminFeeAmount = adminFee;
    session.mentorEarnings = mentorEarnings;
    session.paymentDistributed = true;
    await session.save();

    // Create or update wallets
    await createOrUpdateWallet(session.achieverId, 'achiever', mentorEarnings, 'session-payment', session);
    await createOrUpdateWallet('admin', 'admin', adminFee, 'admin-fee', session);

    // Create Razorpay transfers for transparency
    await createRazorpayTransfers(payment, adminFee, mentorEarnings, session);

    console.log(`Payment distributed for session ${session._id}: Admin: ₹${adminFee}, Mentor: ₹${mentorEarnings}`);

  } catch (error) {
    console.error('Payment distribution error:', error);
    throw error;
  }
}

// Helper function to create or update wallet
async function createOrUpdateWallet(userId, userType, amount, source, session) {
  try {
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = new Wallet({
        userId,
        userType,
        balance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        transactions: []
      });
    }

    // Add transaction
    const transaction = {
      type: 'credit',
      amount,
      source,
      description: `Earnings from session on ${new Date(session.scheduledStartTime).toLocaleDateString()}`,
      sessionId: session._id,
      bookingId: session.bookingId._id,
      timestamp: new Date()
    };

    wallet.transactions.push(transaction);
    wallet.balance += amount;
    wallet.totalEarnings += amount;

    await wallet.save();
    console.log(`Wallet updated for ${userType} ${userId}: +₹${amount}`);

  } catch (error) {
    console.error('Wallet update error:', error);
    throw error;
  }
}

// Helper function to create Razorpay transfers for transparency
async function createRazorpayTransfers(payment, adminFee, mentorEarnings, session) {
  try {
    // Note: In a real implementation, you would create actual Razorpay transfers
    // For now, we'll just log the transactions that would be created
    
    console.log('Razorpay transfers to be created:');
    console.log(`- Admin fee transfer: ₹${adminFee} for session ${session._id}`);
    console.log(`- Mentor earnings transfer: ₹${mentorEarnings} for session ${session._id}`);
    
    // Update payment record with distribution details
    payment.adminFee = adminFee;
    payment.mentorAmount = mentorEarnings;
    payment.payoutStatus = 'completed';
    payment.payoutDate = new Date();
    await payment.save();

  } catch (error) {
    console.error('Razorpay transfer creation error:', error);
    throw error;
  }
}

// @route   GET /api/sessions/:id/status
// @desc    Get session status and attendance info
// @access  Private
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const now = new Date();
    const sessionStart = new Date(session.scheduledStartTime);
    const sessionEnd = new Date(session.scheduledEndTime);
    const gracePeriodEnd = session.gracePeriodStarted ? 
      new Date(session.gracePeriodStarted.getTime() + 10 * 60 * 1000) : null;

    // Determine if user can join
    const canJoin = now >= sessionStart && now <= sessionEnd;
    const isGracePeriodActive = session.gracePeriodStarted && now <= gracePeriodEnd;
    const gracePeriodExpired = session.gracePeriodStarted && now > gracePeriodEnd;

    res.json({
      success: true,
      session: {
        id: session._id,
        status: session.status,
        scheduledStartTime: session.scheduledStartTime,
        scheduledEndTime: session.scheduledEndTime,
        aspirantJoined: session.aspirantJoined,
        achieverJoined: session.achieverJoined,
        attendancePattern: session.attendancePattern,
        canJoin,
        isGracePeriodActive,
        gracePeriodExpired,
        gracePeriodStarted: session.gracePeriodStarted,
        gracePeriodEnd,
        currentTime: now
      }
    });

  } catch (error) {
    console.error('Get Session Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session status',
      error: error.message
    });
  }
});

// @route   GET /api/sessions/:sessionId/token
// @desc    Generate ZegoCloud token for video calling
// @access  Private
router.get('/:sessionId/token', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id; // From auth middleware
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify user is part of this session
    if (session.aspirantId.toString() !== userId && session.achieverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this session'
      });
    }

    const { generateZegoTokenForVideoCall } = require('../services/zegoService');
    const tokenData = await generateZegoTokenForVideoCall(userId, session.roomId);

    res.json({
      success: true,
      ...tokenData
    });

  } catch (error) {
    console.error('Generate Token Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate token',
      error: error.message
    });
  }
});

// @route   GET /api/sessions/debug/:bookingId
// @desc    Debug session information
// @access  Private
router.get('/debug/:bookingId', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({ bookingId: req.params.bookingId });
    const booking = await Booking.findById(req.params.bookingId);
    
    const now = new Date();
    
    if (!session && !booking) {
      return res.json({
        success: false,
        message: 'Neither session nor booking found',
        bookingId: req.params.bookingId
      });
    }

    const debugInfo = {
      success: true,
      currentTime: now,
      booking: booking ? {
        id: booking._id,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        aspirantId: booking.aspirantId,
        achieverId: booking.achieverId
      } : null,
      session: session ? {
        id: session._id,
        status: session.status,
        scheduledStartTime: session.scheduledStartTime,
        scheduledEndTime: session.scheduledEndTime,
        aspirantJoined: session.aspirantJoined,
        achieverJoined: session.achieverJoined,
        attendancePattern: session.attendancePattern,
        gracePeriodStarted: session.gracePeriodStarted
      } : null
    };

    if (session) {
      const sessionStart = new Date(session.scheduledStartTime);
      const sessionEnd = new Date(session.scheduledEndTime);
      const joinWindowStart = new Date(sessionStart.getTime() - 15 * 60 * 1000);
      const joinWindowEnd = new Date(sessionEnd.getTime() + 30 * 60 * 1000);
      
      debugInfo.timeWindows = {
        canJoinNow: now >= joinWindowStart && now <= joinWindowEnd,
        joinWindowStart,
        joinWindowEnd,
        scheduledStart: sessionStart,
        scheduledEnd: sessionEnd,
        timeUntilJoinWindow: joinWindowStart > now ? Math.ceil((joinWindowStart - now) / 60000) : 0,
        timeUntilSessionStart: sessionStart > now ? Math.ceil((sessionStart - now) / 60000) : 0
      };
    }

    res.json(debugInfo);

  } catch (error) {
    console.error('Debug Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get debug info',
      error: error.message
    });
  }
});

// @route   POST /api/sessions/:sessionId/feedback
// @desc    Submit feedback for a session
// @access  Private
router.post('/:sessionId/feedback', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;
    
    console.log('📝 Feedback submission request:', { sessionId, userId, rating, review });
    
    // Determine user type based on session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    let userType;
    if (session.aspirantId.toString() === userId) {
      userType = 'aspirant';
    } else if (session.achieverId.toString() === userId) {
      userType = 'achiever';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this session'
      });
    }

    console.log('👤 User type determined:', userType);

    // Submit feedback directly (inline implementation)
    const feedbackData = {
      rating: rating,
      review: review || '',
      submittedAt: new Date()
    };

    if (userType === 'aspirant') {
      session.aspirantFeedback = feedbackData;
    } else {
      session.achieverFeedback = feedbackData;
      // Also update legacy fields for backward compatibility
      session.achieverRating = rating;
      session.achieverReview = review || '';
    }

    await session.save();
    console.log('💾 Session updated with feedback');

    // Check if both feedbacks are submitted
    const bothFeedbacksSubmitted = session.aspirantFeedback.rating && session.achieverFeedback.rating;
    
    console.log('🔍 Both feedbacks submitted:', bothFeedbacksSubmitted);

    const result = {
      success: true,
      message: 'Feedback submitted successfully',
      bothFeedbacksSubmitted,
      session: {
        id: session._id,
        status: session.status,
        aspirantFeedback: session.aspirantFeedback,
        achieverFeedback: session.achieverFeedback
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/sessions/:sessionId/complete-with-feedback
// @desc    Complete session with both feedbacks and process payment
// @access  Private
router.put('/:sessionId/complete-with-feedback', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await SessionCompletionService.completeSessionWithPayment(sessionId);

    res.json(result);

  } catch (error) {
    console.error('Complete Session with Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
});

// @route   PUT /api/sessions/:sessionId/force-complete
// @desc    Force complete session (admin or timeout)
// @access  Private
router.put('/:sessionId/force-complete', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    
    const result = await SessionCompletionService.forceCompleteSession(sessionId, reason);

    res.json(result);

  } catch (error) {
    console.error('Force Complete Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to force complete session',
      error: error.message
    });
  }
});

// @route   GET /api/sessions/:sessionId/attendance
// @desc    Get session attendance details
// @access  Private
router.get('/:sessionId/attendance', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Calculate attendance if session is ongoing or completed
    let attendance = null;
    if (session.status === 'ongoing' || session.status === 'completed') {
      attendance = SessionCompletionService.calculateAttendanceDuration(session);
    }

    res.json({
      success: true,
      session: {
        id: session._id,
        status: session.status,
        scheduledStartTime: session.scheduledStartTime,
        scheduledEndTime: session.scheduledEndTime,
        actualStartTime: session.actualStartTime,
        actualEndTime: session.actualEndTime,
        aspirantJoinTime: session.aspirantJoinTime,
        achieverJoinTime: session.achieverJoinTime,
        aspirantLeaveTime: session.aspirantLeaveTime,
        achieverLeaveTime: session.achieverLeaveTime,
        aspirantAttendanceDuration: session.aspirantAttendanceDuration,
        achieverAttendanceDuration: session.achieverAttendanceDuration,
        minimumAttendanceRequired: session.minimumAttendanceRequired,
        attendanceRequirementMet: session.attendanceRequirementMet,
        aspirantFeedback: session.aspirantFeedback,
        achieverFeedback: session.achieverFeedback
      },
      attendance
    });

  } catch (error) {
    console.error('Get Session Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session attendance',
      error: error.message
    });
  }
});

module.exports = router;