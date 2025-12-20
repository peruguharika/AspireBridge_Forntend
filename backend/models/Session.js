const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  aspirantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achieverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'no-show', 'partial-attendance'],
    default: 'scheduled'
  },
  // Session timing
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  
  // Attendance tracking
  aspirantJoinTime: {
    type: Date
  },
  achieverJoinTime: {
    type: Date
  },
  aspirantLeaveTime: {
    type: Date
  },
  achieverLeaveTime: {
    type: Date
  },
  aspirantJoined: {
    type: Boolean,
    default: false
  },
  achieverJoined: {
    type: Boolean,
    default: false
  },
  
  // Session completion
  attendancePattern: {
    type: String,
    enum: ['both-joined', 'aspirant-only', 'achiever-only', 'neither-joined'],
    default: 'neither-joined'
  },
  completionReason: {
    type: String,
    enum: ['normal', 'achiever-waited', 'no-attendance', 'time-expired', 'insufficient-attendance'],
    default: 'normal'
  },
  
  // Feedback from both users
  aspirantFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date
    }
  },
  achieverFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date
    }
  },
  
  // Legacy fields for backward compatibility
  achieverReview: {
    type: String,
    default: ''
  },
  achieverRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Attendance duration tracking (in minutes)
  aspirantAttendanceDuration: {
    type: Number,
    default: 0
  },
  achieverAttendanceDuration: {
    type: Number,
    default: 0
  },
  minimumAttendanceRequired: {
    type: Number,
    default: 30 // 50% of 60-minute session
  },
  attendanceRequirementMet: {
    type: Boolean,
    default: false
  },
  
  // Payment and refund tracking
  paymentDistributed: {
    type: Boolean,
    default: false
  },
  refundProcessed: {
    type: Boolean,
    default: false
  },
  adminFeeAmount: {
    type: Number,
    default: 0
  },
  mentorEarnings: {
    type: Number,
    default: 0
  },
  
  // Grace period tracking
  gracePeriodStarted: {
    type: Date
  },
  gracePeriodExpired: {
    type: Boolean,
    default: false
  },
  
  // Legacy fields
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  attendanceMarked: {
    type: Boolean,
    default: false
  },
  zegoCloudData: {
    appId: String,
    serverSecret: String,
    roomId: String,
    token: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', SessionSchema);