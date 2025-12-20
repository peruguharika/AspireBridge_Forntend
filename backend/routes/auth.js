const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const ExamPrice = require('../models/ExamPrice');
const { sendOTPEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType, examType, examCategory, examSubCategory, examCleared, rank, year, bio, scorecardUrl } = req.body;

    // Validation
    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Get hourly rate for achievers based on exam subcategory
    let hourlyRate = 500; // default rate
    if (userType === 'achiever' && examSubCategory) {
      const examPrice = await ExamPrice.findOne({ 
        subCategory: examSubCategory,
        isActive: true 
      });
      if (examPrice) {
        hourlyRate = examPrice.hourlyRate;
      }
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      userType,
      examType: examType || '',
      examCategory: examCategory || '',
      examSubCategory: examSubCategory || '',
      examCleared: examCleared || '',
      rank: rank || '',
      year: year || '',
      bio: bio || '',
      scorecardUrl: scorecardUrl || '',
      hourlyRate: hourlyRate,
      approved: userType === 'aspirant' ? true : false,
      approvalStatus: userType === 'aspirant' ? 'approved' : 'pending',
      otpVerified: false
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        examType: user.examType,
        rank: user.rank,
        approved: user.approved,
        approvalStatus: user.approvalStatus
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        examType: user.examType,
        rank: user.rank,
        approved: user.approved,
        approvalStatus: user.approvalStatus
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp,
      purpose: purpose || 'signup'
    });

    await otpDoc.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find OTP
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark as verified
    otpDoc.verified = true;
    await otpDoc.save();

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// @route   POST /api/auth/admin-login
// @desc    Admin login
// @access  Public
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug logging
    console.log('Admin login attempt:');
    console.log('Received email:', email);
    console.log('Received password:', password);
    console.log('Expected email:', process.env.ADMIN_EMAIL);
    console.log('Expected password:', process.env.ADMIN_PASSWORD);
    console.log('Email match:', email === process.env.ADMIN_EMAIL);
    console.log('Password match:', password === process.env.ADMIN_PASSWORD);

    // Check against environment variables
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Find or create admin user
      let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL, userType: 'admin' });
      
      if (!adminUser) {
        // Create admin user if doesn't exist
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
        console.log('✅ Admin user created');

        // Create admin wallet if doesn't exist
        const Wallet = require('../models/Wallet');
        const existingWallet = await Wallet.findOne({ userId: adminUser._id });
        if (!existingWallet) {
          const adminWallet = new Wallet({
            userId: adminUser._id,
            userType: 'admin',
            balance: 0,
            totalEarnings: 0,
            totalWithdrawn: 0,
            transactions: []
          });
          await adminWallet.save();
          console.log('✅ Admin wallet created');
        }
      }

      const token = jwt.sign(
        { userId: adminUser._id, email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        userId: adminUser._id,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          userType: adminUser.userType
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;