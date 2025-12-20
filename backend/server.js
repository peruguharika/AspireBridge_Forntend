const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);

// ==================== MIDDLEWARE ====================
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Special middleware for Razorpay webhooks (needs raw body)
app.use('/api/payments/webhook', bodyParser.raw({ type: 'application/json' }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());

// ==================== DATABASE CONNECTION ====================
const connectDB = require('./config/database');
const NetworkChecker = require('./utils/networkChecker');

// Initialize database connection with enhanced error handling
const initializeDatabase = async () => {
  try {
    // Run network diagnostics first
    console.log('🔍 Running network diagnostics...');
    const diagnostics = await NetworkChecker.runDiagnostics();
    
    if (diagnostics && diagnostics.recommendations === 'switch_network') {
      console.log('⚠️  Network connectivity issues detected');
      console.log('💡 Consider switching to mobile hotspot if using ethernet');
    }

    // Attempt database connection
    await connectDB();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // Provide specific guidance based on error
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n🚨 IP WHITELIST ISSUE DETECTED!');
      console.log('📋 IMMEDIATE SOLUTIONS:');
      console.log('   1. Switch to mobile hotspot (if ethernet fails)');
      console.log('   2. Add 0.0.0.0/0 to MongoDB Atlas Network Access');
      console.log('   3. Check MongoDB Atlas cluster status');
      console.log('   4. Verify your current IP in Atlas dashboard');
    }
    
    // In development, continue without database
    if (process.env.NODE_ENV === 'development') {
      console.log('\n⚠️  Continuing in development mode without database');
      console.log('🔄 Switch networks and restart server when ready');
    } else {
      process.exit(1);
    }
  }
};

// Initialize database
initializeDatabase();

// ==================== ROUTES ====================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const sessionRoutes = require('./routes/sessions');
const paymentRoutes = require('./routes/payments');
const emailRoutes = require('./routes/email');
const adminRoutes = require('./routes/admin');
const resourceRoutes = require('./routes/resources');
const masterClassRoutes = require('./routes/masterclass');
const mentorPostRoutes = require('./routes/mentorposts');
const followRoutes = require('./routes/follow');
const feedbackRoutes = require('./routes/feedback');
const reportRoutes = require('./routes/reports');
const availabilityRoutes = require('./routes/availability');
const walletRoutes = require('./routes/wallets');
const settlementRoutes = require('./routes/settlements');
const sessionMonitor = require('./services/sessionMonitor');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/session-completion', require('./routes/sessionCompletion'));
app.use('/api/payments', paymentRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/masterclass', masterClassRoutes);
app.use('/api/mentorposts', mentorPostRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/settlements', settlementRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV
  });
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({
    message: 'MentorConnect API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      bookings: '/api/bookings',
      sessions: '/api/sessions',
      payments: '/api/payments',
      email: '/api/email',
      admin: '/api/admin',
      resources: '/api/resources',
      masterclass: '/api/masterclass',
      mentorposts: '/api/mentorposts',
      feedback: '/api/feedback',
      reports: '/api/reports'
    }
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ==================== SOCKET.IO SETUP ====================
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ],
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join session room
  socket.on('join-session', (data) => {
    const { sessionId, userType, userId } = data;
    socket.join(sessionId);
    socket.sessionId = sessionId;
    socket.userType = userType;
    socket.userId = userId;
    
    console.log(`👤 ${userType} joined session ${sessionId}`);
    
    // Notify others in the room
    socket.to(sessionId).emit('user-joined', { userType, userId });
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const { sessionId, message } = data;
    console.log(`💬 Message in session ${sessionId}: ${message.message}`);
    
    // Broadcast message to all users in the session except sender
    socket.to(sessionId).emit('new-message', message);
  });

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    console.log(`📹 WebRTC offer in session ${data.sessionId}`);
    socket.to(data.sessionId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    console.log(`📹 WebRTC answer in session ${data.sessionId}`);
    socket.to(data.sessionId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    console.log(`🧊 ICE candidate in session ${data.sessionId}`);
    socket.to(data.sessionId).emit('ice-candidate', data);
  });

  // Handle user leaving session
  socket.on('leave-session', (data) => {
    const { sessionId, userType } = data;
    console.log(`👋 ${userType} left session ${sessionId}`);
    
    // Notify others in the room
    socket.to(sessionId).emit('user-left', { userType });
    socket.leave(sessionId);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    
    if (socket.sessionId && socket.userType) {
      // Notify others in the room
      socket.to(socket.sessionId).emit('user-left', { userType: socket.userType });
    }
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 API URL: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO enabled for real-time chat`);
  console.log('🚀 ================================');
  
  // Start session monitoring service
  sessionMonitor.startMonitoring();
  
  // Start session reminder service
  const sessionReminderService = require('./services/sessionReminderService');
  sessionReminderService.start();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});