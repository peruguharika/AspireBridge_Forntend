const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Session = require('../models/Session');
const MasterClass = require('../models/MasterClass');
const Resource = require('../models/Resource');
const MentorPost = require('../models/MentorPost');
const Feedback = require('../models/Feedback');
const Report = require('../models/Report');
const ExamPrice = require('../models/ExamPrice');
const Wallet = require('../models/Wallet');
const Availability = require('../models/Availability');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const LockedTransaction = require('../models/LockedTransaction');
const OTP = require('../models/OTP');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// Apply admin middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// @route   GET /api/admin/profile
// @desc    Get admin profile
// @access  Private/Admin
router.get('/profile', async (req, res) => {
  try {
    console.log('Admin profile request - user from token:', req.user);
    
    let adminUser = await User.findById(req.user.userId).select('-password');
    
    if (!adminUser) {
      console.log('Admin user not found by ID, searching by email...');
      // Try to find by email if not found by ID
      adminUser = await User.findOne({ 
        email: process.env.ADMIN_EMAIL, 
        userType: 'admin' 
      }).select('-password');
      
      if (!adminUser) {
        console.log('Creating admin user...');
        // Create admin user if doesn't exist
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        adminUser = new User({
          name: 'Platform Admin',
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          userType: 'admin',
          approved: true,
          approvalStatus: 'approved'
        });
        await adminUser.save();
        console.log('✅ Admin user created with ID:', adminUser._id);

        // Create admin wallet if doesn't exist
        const Wallet = require('../models/Wallet');
        const existingWallet = await Wallet.findOne({ userId: adminUser._id });
        if (!existingWallet) {
          const adminWallet = new Wallet({
            userId: adminUser._id,
            userType: 'admin',
            balance: 25, // Set some initial balance for testing
            totalEarnings: 25,
            totalWithdrawn: 0,
            transactions: [{
              type: 'credit',
              amount: 25,
              source: 'platform_fee',
              description: 'Platform fees from mentor sessions',
              timestamp: new Date()
            }]
          });
          await adminWallet.save();
          console.log('✅ Admin wallet created');
        }
      }
    }

    res.json({
      success: true,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        userType: adminUser.userType
      }
    });

  } catch (error) {
    console.error('Get Admin Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
      error: error.message
    });
  }
});

// ==================== DASHBOARD STATISTICS ====================

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalAspirants = await User.countDocuments({ userType: 'aspirant' });
    const totalAchievers = await User.countDocuments({ userType: 'achiever' });
    const pendingApprovals = await User.countDocuments({ 
      userType: 'achiever', 
      approvalStatus: 'pending' 
    });
    const approvedAchievers = await User.countDocuments({ 
      userType: 'achiever', 
      approvalStatus: 'approved' 
    });

    // Booking statistics
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Payment statistics
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const adminRevenue = payments.reduce((sum, p) => sum + p.adminFee, 0);
    const mentorEarnings = payments.reduce((sum, p) => sum + p.mentorAmount, 0);
    const pendingPayouts = await Payment.countDocuments({ payoutStatus: 'pending' });

    // Session statistics
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const ongoingSessions = await Session.countDocuments({ status: 'ongoing' });

    // Master Class statistics
    const totalMasterClasses = await MasterClass.countDocuments();
    const upcomingMasterClasses = await MasterClass.countDocuments({ status: 'upcoming' });

    // Resource statistics
    const totalResources = await Resource.countDocuments();

    // Report statistics
    const totalReports = await Report.countDocuments();
    const openReports = await Report.countDocuments({ status: 'open' });

    // Recent activity
    const recentUsers = await User.find()
      .select('name email userType createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find()
      .select('aspirantName mentorName date status')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          aspirants: totalAspirants,
          achievers: totalAchievers,
          pendingApprovals,
          approvedAchievers
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings
        },
        payments: {
          totalRevenue,
          adminRevenue,
          mentorEarnings,
          pendingPayouts,
          transactionCount: payments.length
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          ongoing: ongoingSessions
        },
        masterClasses: {
          total: totalMasterClasses,
          upcoming: upcomingMasterClasses
        },
        resources: {
          total: totalResources
        },
        reports: {
          total: totalReports,
          open: openReports
        }
      },
      recentActivity: {
        users: recentUsers,
        bookings: recentBookings
      }
    });

  } catch (error) {
    console.error('Get Admin Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// ==================== USER MANAGEMENT ====================

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { userType, approvalStatus, search } = req.query;
    
    let query = {};
    if (userType) query.userType = userType;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/pending-approval
// @desc    Get achievers pending approval
// @access  Private/Admin
router.get('/users/pending-approval', async (req, res) => {
  try {
    const users = await User.find({
      userType: 'achiever',
      approvalStatus: 'pending'
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get Pending Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve achiever
// @access  Private/Admin
router.put('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.approved = true;
    user.approvalStatus = 'approved';
    await user.save();

    // Send approval email
    await sendEmail({
      to: user.email,
      subject: 'Profile Approved - MentorConnect',
      html: `
        <h2>Congratulations! Your Profile is Approved</h2>
        <p>Dear ${user.name},</p>
        <p>Your mentor profile has been verified and approved by our admin team.</p>
        <p>Your profile is now visible to aspirants, and you can start accepting session requests.</p>
        <p>Next steps:</p>
        <ul>
          <li>Set your availability slots</li>
          <li>Complete your profile with bio and photo</li>
          <li>Start accepting mentorship requests</li>
        </ul>
        <br>
        <p>Thank you for being part of MentorConnect!</p>
        <p>Best regards,<br>MentorConnect Team</p>
      `
    });

    res.json({
      success: true,
      message: 'User approved successfully',
      user
    });

  } catch (error) {
    console.error('Approve User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/reject
// @desc    Reject achiever
// @access  Private/Admin
router.put('/users/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.approved = false;
    user.approvalStatus = 'rejected';
    await user.save();

    // Send rejection email
    await sendEmail({
      to: user.email,
      subject: 'Profile Status Update - MentorConnect',
      html: `
        <h2>Profile Review Update</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your interest in becoming a mentor on MentorConnect.</p>
        <p>After careful review, we are unable to approve your profile at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have any questions or would like to reapply, please contact our support team.</p>
        <br>
        <p>Best regards,<br>MentorConnect Team</p>
      `
    });

    res.json({
      success: true,
      message: 'User rejected',
      user
    });

  } catch (error) {
    console.error('Reject User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/price
// @desc    Update user hourly rate
// @access  Private/Admin
router.put('/users/:id/price', async (req, res) => {
  try {
    const { hourlyRate } = req.body;
    
    if (!hourlyRate || hourlyRate < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid hourly rate is required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRate = user.hourlyRate;
    user.hourlyRate = hourlyRate;
    user.updatedAt = new Date();
    await user.save();

    // Send email notification to user about price change
    if (user.userType === 'achiever') {
      await sendEmail({
        to: user.email,
        subject: 'Hourly Rate Updated - MentorConnect',
        html: `
          <h2>Your Hourly Rate Has Been Updated</h2>
          <p>Dear ${user.name},</p>
          <p>Your hourly rate has been updated by the admin team.</p>
          <p><strong>Previous Rate:</strong> ₹${oldRate}/hour</p>
          <p><strong>New Rate:</strong> ₹${hourlyRate}/hour</p>
          <p>This change is effective immediately and will be reflected in all future bookings.</p>
          <br>
          <p>If you have any questions about this change, please contact our support team.</p>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Hourly rate updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hourlyRate: user.hourlyRate,
        oldRate
      }
    });

  } catch (error) {
    console.error('Update Price Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hourly rate',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/scorecard
// @desc    Update user scorecard URL (for testing)
// @access  Private/Admin
router.put('/users/:id/scorecard', async (req, res) => {
  try {
    const { scorecardUrl } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.scorecardUrl = scorecardUrl || '';
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Scorecard updated successfully',
      user: {
        id: user._id,
        name: user.name,
        scorecardUrl: user.scorecardUrl
      }
    });

  } catch (error) {
    console.error('Update Scorecard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scorecard',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user with cascading deletion of all related data
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`Starting cascading deletion for user: ${user.name} (${user.email})`);

    // 1. Delete all bookings where user is aspirant or achiever
    const bookingDeleteResult = await Booking.deleteMany({
      $or: [
        { aspirantId: userId },
        { achieverId: userId }
      ]
    }).session(session);
    console.log(`Deleted ${bookingDeleteResult.deletedCount} bookings`);

    // 2. Delete all sessions where user is aspirant or achiever
    const sessionDeleteResult = await Session.deleteMany({
      $or: [
        { aspirantId: userId },
        { achieverId: userId }
      ]
    }).session(session);
    console.log(`Deleted ${sessionDeleteResult.deletedCount} sessions`);

    // 3. Delete all payments by the user
    const paymentDeleteResult = await Payment.deleteMany({
      userId: userId
    }).session(session);
    console.log(`Deleted ${paymentDeleteResult.deletedCount} payments`);

    // 4. Delete user's wallet
    const walletDeleteResult = await Wallet.deleteMany({
      userId: userId
    }).session(session);
    console.log(`Deleted ${walletDeleteResult.deletedCount} wallets`);

    // 5. Delete all mentor posts by the user
    const mentorPostDeleteResult = await MentorPost.deleteMany({
      mentorId: userId
    }).session(session);
    console.log(`Deleted ${mentorPostDeleteResult.deletedCount} mentor posts`);

    // 6. Delete user's availability
    const availabilityDeleteResult = await Availability.deleteMany({
      userId: userId
    }).session(session);
    console.log(`Deleted ${availabilityDeleteResult.deletedCount} availability records`);

    // 7. Delete all feedback from or to the user
    const feedbackDeleteResult = await Feedback.deleteMany({
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    }).session(session);
    console.log(`Deleted ${feedbackDeleteResult.deletedCount} feedback records`);

    // 8. Delete all reports by the user
    const reportDeleteResult = await Report.deleteMany({
      userId: userId
    }).session(session);
    console.log(`Deleted ${reportDeleteResult.deletedCount} reports`);

    // 9. Delete all withdrawal requests by the user
    const withdrawalDeleteResult = await WithdrawalRequest.deleteMany({
      userId: userId
    }).session(session);
    console.log(`Deleted ${withdrawalDeleteResult.deletedCount} withdrawal requests`);

    // 10. Delete all resources uploaded by the user
    const resourceDeleteResult = await Resource.deleteMany({
      uploadedBy: userId
    }).session(session);
    console.log(`Deleted ${resourceDeleteResult.deletedCount} resources`);

    // 11. Delete all master classes created by the user
    const masterClassDeleteResult = await MasterClass.deleteMany({
      achieverId: userId
    }).session(session);
    console.log(`Deleted ${masterClassDeleteResult.deletedCount} master classes`);

    // 12. Delete all locked transactions involving the user
    const lockedTransactionDeleteResult = await LockedTransaction.deleteMany({
      $or: [
        { aspirantId: userId },
        { achieverId: userId }
      ]
    }).session(session);
    console.log(`Deleted ${lockedTransactionDeleteResult.deletedCount} locked transactions`);

    // 13. Remove user from followers/following lists of other users
    const followersUpdateResult = await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    ).session(session);
    console.log(`Removed user from ${followersUpdateResult.modifiedCount} followers lists`);

    const followingUpdateResult = await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    ).session(session);
    console.log(`Removed user from ${followingUpdateResult.modifiedCount} following lists`);

    // 14. Remove user from mentor post likes and comments
    await MentorPost.updateMany(
      { likedBy: userId },
      { 
        $pull: { likedBy: userId },
        $inc: { likes: -1 }
      }
    ).session(session);

    await MentorPost.updateMany(
      { 'comments.userId': userId },
      { $pull: { comments: { userId: userId } } }
    ).session(session);

    // 15. Remove user from resource likes and downloads
    await Resource.updateMany(
      { likedBy: userId },
      { 
        $pull: { likedBy: userId },
        $inc: { likes: -1 }
      }
    ).session(session);

    await Resource.updateMany(
      { downloadedBy: userId },
      { 
        $pull: { downloadedBy: userId },
        $inc: { downloads: -1 }
      }
    ).session(session);

    // 16. Remove user from master class participants
    await MasterClass.updateMany(
      { currentParticipants: userId },
      { $pull: { currentParticipants: userId } }
    ).session(session);

    // 17. Delete OTP records for the user's email
    const otpDeleteResult = await OTP.deleteMany({
      email: user.email
    }).session(session);
    console.log(`Deleted ${otpDeleteResult.deletedCount} OTP records`);

    // 18. Finally, delete the user
    await User.findByIdAndDelete(userId).session(session);
    console.log(`Deleted user: ${user.name}`);

    // Commit the transaction
    await session.commitTransaction();

    res.json({
      success: true,
      message: `User ${user.name} and all related data deleted successfully`,
      deletedData: {
        bookings: bookingDeleteResult.deletedCount,
        sessions: sessionDeleteResult.deletedCount,
        payments: paymentDeleteResult.deletedCount,
        wallets: walletDeleteResult.deletedCount,
        mentorPosts: mentorPostDeleteResult.deletedCount,
        availability: availabilityDeleteResult.deletedCount,
        feedback: feedbackDeleteResult.deletedCount,
        reports: reportDeleteResult.deletedCount,
        withdrawalRequests: withdrawalDeleteResult.deletedCount,
        resources: resourceDeleteResult.deletedCount,
        masterClasses: masterClassDeleteResult.deletedCount,
        lockedTransactions: lockedTransactionDeleteResult.deletedCount,
        otpRecords: otpDeleteResult.deletedCount,
        followersUpdated: followersUpdateResult.modifiedCount,
        followingUpdated: followingUpdateResult.modifiedCount
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cascading Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user and related data',
      error: error.message
    });
  } finally {
    session.endSession();
  }
});

// ==================== BOOKING MANAGEMENT ====================

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('aspirantId', 'name email')
      .populate('achieverId', 'name email')
      .sort({ createdAt: -1 });

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

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete booking
// @access  Private/Admin
router.delete('/bookings/:id', async (req, res) => {
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

// ==================== PAYMENT MANAGEMENT ====================

// @route   GET /api/admin/payments/pending-payouts
// @desc    Get pending payouts
// @access  Private/Admin
router.get('/payments/pending-payouts', async (req, res) => {
  try {
    const payments = await Payment.find({ 
      status: 'completed',
      payoutStatus: 'pending' 
    })
    .populate('userId', 'name email')
    .populate('bookingId')
    .sort({ createdAt: -1 });

    // Group by mentor
    const payoutsByMentor = {};
    
    for (const payment of payments) {
      const booking = await Booking.findById(payment.bookingId);
      if (booking && booking.achieverId) {
        const mentorId = booking.achieverId.toString();
        
        if (!payoutsByMentor[mentorId]) {
          const mentor = await User.findById(mentorId).select('name email');
          payoutsByMentor[mentorId] = {
            mentor,
            totalAmount: 0,
            payments: []
          };
        }
        
        payoutsByMentor[mentorId].totalAmount += payment.mentorAmount;
        payoutsByMentor[mentorId].payments.push(payment);
      }
    }

    res.json({
      success: true,
      count: Object.keys(payoutsByMentor).length,
      payouts: Object.values(payoutsByMentor)
    });

  } catch (error) {
    console.error('Get Pending Payouts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payouts',
      error: error.message
    });
  }
});

// @route   POST /api/admin/payments/process-payout
// @desc    Process payout for mentor
// @access  Private/Admin
router.post('/payments/process-payout', async (req, res) => {
  try {
    const { mentorId, paymentIds, totalAmount } = req.body;

    // Update all payments
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
          <h2>Payout Processed Successfully!</h2>
          <p>Dear ${mentor.name},</p>
          <p>Your payout of <strong>₹${totalAmount}</strong> has been processed.</p>
          <p>The amount will be credited to your registered bank account within 2-3 business days.</p>
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li>Amount: ₹${totalAmount}</li>
            <li>Transactions: ${paymentIds.length}</li>
            <li>Date: ${new Date().toLocaleDateString()}</li>
          </ul>
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
    console.error('Process Payout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payout',
      error: error.message
    });
  }
});

// ==================== CONTENT MANAGEMENT ====================

// @route   GET /api/admin/posts
// @desc    Get all mentor posts
// @access  Private/Admin
router.get('/posts', async (req, res) => {
  try {
    const posts = await MentorPost.find()
      .populate('mentorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts
    });

  } catch (error) {
    console.error('Get Posts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/posts/:id
// @desc    Delete mentor post
// @access  Private/Admin
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await MentorPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

// @route   GET /api/admin/feedbacks
// @desc    Get all feedbacks
// @access  Private/Admin
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });

  } catch (error) {
    console.error('Get Feedbacks Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/feedbacks/:id
// @desc    Delete feedback
// @access  Private/Admin
router.delete('/feedbacks/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Delete Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
});

// ==================== EXAM PRICE MANAGEMENT ====================

// @route   GET /api/admin/exam-prices
// @desc    Get all exam prices
// @access  Private/Admin
router.get('/exam-prices', async (req, res) => {
  try {
    const examPrices = await ExamPrice.find({ isActive: true })
      .sort({ category: 1, subCategory: 1 });

    // Group by category
    const groupedPrices = {};
    examPrices.forEach(price => {
      if (!groupedPrices[price.category]) {
        groupedPrices[price.category] = [];
      }
      groupedPrices[price.category].push(price);
    });

    res.json({
      success: true,
      count: examPrices.length,
      examPrices,
      groupedPrices
    });

  } catch (error) {
    console.error('Get Exam Prices Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam prices',
      error: error.message
    });
  }
});

// @route   POST /api/admin/exam-prices
// @desc    Create new exam price
// @access  Private/Admin
router.post('/exam-prices', async (req, res) => {
  try {
    const { category, subCategory, hourlyRate, description } = req.body;

    if (!category || !subCategory || !hourlyRate) {
      return res.status(400).json({
        success: false,
        message: 'Category, subcategory, and hourly rate are required'
      });
    }

    // Check if exam price already exists
    const existingPrice = await ExamPrice.findOne({ subCategory });
    if (existingPrice) {
      return res.status(400).json({
        success: false,
        message: 'Price for this exam subcategory already exists'
      });
    }

    const examPrice = new ExamPrice({
      category,
      subCategory,
      hourlyRate,
      description: description || ''
    });

    await examPrice.save();

    res.status(201).json({
      success: true,
      message: 'Exam price created successfully',
      examPrice
    });

  } catch (error) {
    console.error('Create Exam Price Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam price',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/exam-prices/:id
// @desc    Update exam price
// @access  Private/Admin
router.put('/exam-prices/:id', async (req, res) => {
  try {
    const { hourlyRate, description } = req.body;

    if (!hourlyRate || hourlyRate < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid hourly rate is required'
      });
    }

    const examPrice = await ExamPrice.findById(req.params.id);
    if (!examPrice) {
      return res.status(404).json({
        success: false,
        message: 'Exam price not found'
      });
    }

    const oldRate = examPrice.hourlyRate;
    examPrice.hourlyRate = hourlyRate;
    examPrice.description = description || examPrice.description;
    examPrice.updatedAt = new Date();
    
    await examPrice.save();

    // Update all users with this exam subcategory
    await User.updateMany(
      { 
        userType: 'achiever',
        examSubCategory: examPrice.subCategory 
      },
      { 
        hourlyRate: hourlyRate,
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Exam price updated successfully',
      examPrice,
      oldRate,
      newRate: hourlyRate
    });

  } catch (error) {
    console.error('Update Exam Price Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam price',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/exam-prices/:id
// @desc    Delete exam price
// @access  Private/Admin
router.delete('/exam-prices/:id', async (req, res) => {
  try {
    const examPrice = await ExamPrice.findById(req.params.id);
    if (!examPrice) {
      return res.status(404).json({
        success: false,
        message: 'Exam price not found'
      });
    }

    examPrice.isActive = false;
    await examPrice.save();

    res.json({
      success: true,
      message: 'Exam price deleted successfully'
    });

  } catch (error) {
    console.error('Delete Exam Price Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam price',
      error: error.message
    });
  }
});

// ==================== REPORT MANAGEMENT ====================

// @route   GET /api/admin/reports
// @desc    Get all reports
// @access  Private/Admin
router.get('/reports', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });

  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/reports/:id/respond
// @desc    Respond to report
// @access  Private/Admin
router.put('/reports/:id/respond', async (req, res) => {
  try {
    const { response, status } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.adminResponse = response;
    report.status = status || 'resolved';
    report.respondedAt = new Date();
    await report.save();

    // Send email to user
    const user = await User.findById(report.userId);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Report Update - MentorConnect',
        html: `
          <h2>Your Report Has Been Updated</h2>
          <p>Dear ${user.name},</p>
          <p><strong>Subject:</strong> ${report.subject}</p>
          <p><strong>Status:</strong> ${report.status}</p>
          <p><strong>Admin Response:</strong></p>
          <p>${response}</p>
          <br>
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Response sent successfully',
      report
    });

  } catch (error) {
    console.error('Respond to Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to report',
      error: error.message
    });
  }
});

// ==================== WALLET MANAGEMENT ====================

// @route   GET /api/admin/wallets
// @desc    Get all user wallets
// @access  Private/Admin
router.get('/wallets', async (req, res) => {
  try {
    const Wallet = require('../models/Wallet');
    
    const wallets = await Wallet.find()
      .populate('userId', 'name email userType')
      .sort({ totalEarnings: -1 });

    res.json({
      success: true,
      count: wallets.length,
      wallets
    });

  } catch (error) {
    console.error('Get All Wallets Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallets',
      error: error.message
    });
  }
});

// @route   GET /api/admin/withdrawals
// @desc    Get all withdrawal requests
// @access  Private/Admin
router.get('/withdrawals', async (req, res) => {
  try {
    const WithdrawalRequest = require('../models/WithdrawalRequest');
    
    const withdrawals = await WithdrawalRequest.find()
      .populate('userId', 'name email userType')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: withdrawals.length,
      withdrawals
    });

  } catch (error) {
    console.error('Get All Withdrawals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawals',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/withdrawals/:id/approve
// @desc    Approve withdrawal request
// @access  Private/Admin
router.put('/withdrawals/:id/approve', async (req, res) => {
  try {
    const WithdrawalRequest = require('../models/WithdrawalRequest');
    const Wallet = require('../models/Wallet');
    const Razorpay = require('razorpay');
    
    const { adminNotes } = req.body;
    const withdrawalId = req.params.id;
    const adminUserId = req.user.userId;

    const withdrawal = await WithdrawalRequest.findById(withdrawalId).populate('userId', 'name email');
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal request is not pending'
      });
    }

    // Get wallet and check balance
    const wallet = await Wallet.findById(withdrawal.walletId);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.balance < withdrawal.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Update withdrawal status to approved
    withdrawal.status = 'approved';
    withdrawal.approvedBy = adminUserId;
    withdrawal.approvedAt = new Date();
    withdrawal.adminNotes = adminNotes || withdrawal.adminNotes;
    
    // Deduct amount from wallet now that it's approved
    wallet.balance -= withdrawal.amount;
    wallet.totalWithdrawn += withdrawal.amount;
    
    // Add transaction record
    wallet.transactions.push({
      type: 'debit',
      amount: withdrawal.amount,
      source: 'withdrawal',
      description: `Withdrawal approved - ${withdrawal.bankDetails.accountHolderName} (${withdrawal.bankDetails.accountNumber})`,
      timestamp: new Date()
    });

    await wallet.save();

    // Now process through Razorpay
    try {
      console.log(`🏦 Processing approved withdrawal through Razorpay: ${withdrawal._id}`);
      
      // Decrypt bank details for Razorpay processing
      const { decryptBankDetails } = require('../utils/encryption');
      const decryptedBankDetails = decryptBankDetails(withdrawal.bankDetails);
      
      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      // Check if we're in test mode
      const isTestMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_');
      
      if (isTestMode) {
        // Simulate Razorpay payout for testing
        const mockPayoutId = `pout_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        withdrawal.razorpayPayoutId = mockPayoutId;
        withdrawal.status = 'processing';
        withdrawal.processedAt = new Date();
        
        console.log(`✅ Mock Razorpay payout created: ${mockPayoutId}`);
        console.log(`🏦 Bank: ${decryptedBankDetails.accountHolderName} - ${decryptedBankDetails.accountNumber}`);
        
        // Auto-complete after 30 seconds for demo
        setTimeout(async () => {
          try {
            withdrawal.status = 'completed';
            withdrawal.completedAt = new Date();
            await withdrawal.save();
            console.log(`✅ Mock payout completed: ${mockPayoutId}`);
          } catch (error) {
            console.error('Error completing mock payout:', error);
          }
        }, 30000);
        
      } else {
        // Real Razorpay integration with decrypted bank details
        const fundAccount = await razorpay.fundAccount.create({
          account_type: 'bank_account',
          bank_account: {
            name: decryptedBankDetails.accountHolderName,
            account_number: decryptedBankDetails.accountNumber,
            ifsc: decryptedBankDetails.ifscCode
          }
        });

        const payout = await razorpay.payouts.create({
          account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
          fund_account_id: fundAccount.id,
          amount: withdrawal.netAmount * 100,
          currency: 'INR',
          mode: 'IMPS',
          purpose: 'payout',
          notes: {
            withdrawal_request_id: withdrawal._id.toString(),
            user_id: withdrawal.userId.toString(),
            platform: 'MentorConnect',
            type: 'mentor_earnings_withdrawal'
          }
        });

        withdrawal.razorpayPayoutId = payout.id;
        withdrawal.status = 'processing';
        withdrawal.processedAt = new Date();
      }
      
    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      withdrawal.status = 'approved'; // Keep as approved, manual processing needed
      withdrawal.failureReason = razorpayError.message;
    }

    await withdrawal.save();

    // Send approval email to user
    if (withdrawal.userId) {
      await sendEmail({
        to: withdrawal.userId.email,
        subject: 'Withdrawal Request Approved - MentorConnect',
        html: `
          <h2>✅ Withdrawal Request Approved!</h2>
          <p>Dear ${withdrawal.userId.name},</p>
          <p>Great news! Your withdrawal request has been approved by our admin team.</p>
          <p><strong>Approved Request Details:</strong></p>
          <ul>
            <li>Amount: ₹${withdrawal.amount}</li>
            <li>Processing Fee: ₹${withdrawal.processingFee}</li>
            <li>Net Amount: ₹${withdrawal.netAmount}</li>
            <li>Bank Account: ${withdrawal.bankDetails.accountHolderName}</li>
            <li>Account Number: ${withdrawal.bankDetails.accountNumber}</li>
            <li>Status: ${withdrawal.status === 'processing' ? 'Processing Payment' : 'Approved'}</li>
          </ul>
          ${withdrawal.razorpayPayoutId ? `<p><strong>Razorpay Payout ID:</strong> ${withdrawal.razorpayPayoutId}</p>` : ''}
          <p>The payment is now being processed and will be credited to your bank account within 1-3 business days.</p>
          ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
          <br>
          <p>Thank you for being a valued mentor!</p>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Withdrawal request approved successfully',
      withdrawal
    });

  } catch (error) {
    console.error('Approve Withdrawal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve withdrawal request',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/withdrawals/:id/reject
// @desc    Reject withdrawal request
// @access  Private/Admin
router.put('/withdrawals/:id/reject', async (req, res) => {
  try {
    const WithdrawalRequest = require('../models/WithdrawalRequest');
    
    const { rejectionReason, adminNotes } = req.body;
    const withdrawalId = req.params.id;
    const adminUserId = req.user.userId;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const withdrawal = await WithdrawalRequest.findById(withdrawalId).populate('userId', 'name email');
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal request is not pending'
      });
    }

    // Update withdrawal status to rejected
    withdrawal.status = 'rejected';
    withdrawal.rejectedBy = adminUserId;
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.adminNotes = adminNotes || withdrawal.adminNotes;

    await withdrawal.save();

    // Send rejection email to user
    if (withdrawal.userId) {
      await sendEmail({
        to: withdrawal.userId.email,
        subject: 'Withdrawal Request Update - MentorConnect',
        html: `
          <h2>❌ Withdrawal Request Update</h2>
          <p>Dear ${withdrawal.userId.name},</p>
          <p>We regret to inform you that your withdrawal request has been declined.</p>
          <p><strong>Request Details:</strong></p>
          <ul>
            <li>Amount: ₹${withdrawal.amount}</li>
            <li>Bank Account: ${withdrawal.bankDetails.accountHolderName}</li>
            <li>Account Number: ${withdrawal.bankDetails.accountNumber}</li>
            <li>Status: Rejected</li>
          </ul>
          <p><strong>Reason for Rejection:</strong> ${rejectionReason}</p>
          ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
          <p>Your wallet balance remains unchanged. If you have any questions or would like to submit a new withdrawal request, please contact our support team.</p>
          <br>
          <p>Best regards,<br>MentorConnect Team</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Withdrawal request rejected',
      withdrawal
    });

  } catch (error) {
    console.error('Reject Withdrawal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject withdrawal request',
      error: error.message
    });
  }
});

module.exports = router;