# MentorConnect Backend

## 🚀 Production-Ready System

This backend system provides a complete mentoring platform with video sessions, payments, and settlements.

## 📁 Key Files

### Core Application
- `server.js` - Main application server
- `.env` - Environment configuration
- `package.json` - Dependencies and scripts

### Documentation
- `FINANCIAL_FLOW_SYSTEM.md` - Complete system documentation

### Utilities
- `checkNetwork.js` - Network connectivity diagnostic tool
- `seedExamPrices.js` - Database seeding utility
- `testCompleteFlow.js` - Comprehensive end-to-end system test

### Directories
- `config/` - Database and configuration files
- `middleware/` - Authentication and security middleware
- `models/` - MongoDB data models
- `routes/` - API endpoint definitions
- `services/` - Business logic services
- `utils/` - Utility functions and helpers

## 🧪 Testing

Run the complete system test:
```bash
node testCompleteFlow.js
```

Check network connectivity:
```bash
node checkNetwork.js
```

## 🌐 Network Issues

If you experience MongoDB connection issues:
1. Run `node checkNetwork.js` to diagnose
2. Switch to mobile hotspot if ethernet fails
3. Ensure IP is whitelisted in MongoDB Atlas

## 🚀 Starting the Server

```bash
npm start
```

Server runs on port 5000 with the following endpoints:
- Health check: `GET /api/health`
- Authentication: `/api/auth`
- Sessions: `/api/sessions`
- Payments: `/api/payments`
- Wallets: `/api/wallets`
- Admin: `/api/admin`

## ✅ System Status

All core features are implemented and tested:
- ✅ User authentication and management
- ✅ Session booking and scheduling
- ✅ ZegoCloud video integration
- ✅ Real Razorpay payment processing
- ✅ **Real Email System** (Gmail SMTP)
- ✅ **Session Reminder Emails** (10 minutes before session)
- ✅ Booking confirmation emails
- ✅ Automatic session monitoring
- ✅ Payment distribution system
- ✅ Achiever withdrawal processing
- ✅ Admin auto-settlement system
- ✅ Complete audit trail

## 📧 Email Features

### **Real Email Integration**
- ✅ Gmail SMTP configuration
- ✅ Real email sending (not mock)
- ✅ Professional email templates
- ✅ Automatic email notifications

### **Email Types**
- 🔔 **Session Reminders** (10 minutes before session)
  - Aspirant: "Meeting scheduled with [Achiever Name]"
  - Achiever: "Meeting scheduled with [Aspirant Name]"
- 📧 **Booking Confirmations** (when session is created)
- 🎉 **Welcome Emails** (user registration)
- 🔐 **OTP Verification** (email verification)
- 💰 **Payment Notifications** (withdrawals, approvals)

### **Email Testing**
```bash
# Test email system
node testEmailSystem.js

# Test session reminders
node testSessionReminders.js
```

The system is production-ready and fully functional with real email integration.