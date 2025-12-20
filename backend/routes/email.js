const express = require('express');
const router = express.Router();
const { sendEmail, sendOTPEmail } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/email/send
// @desc    Send email
// @access  Private/Admin
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    await sendEmail({ to, subject, html, text });

    res.json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Send Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// @route   POST /api/email/send-bulk
// @desc    Send bulk emails
// @access  Private/Admin
router.post('/send-bulk', authenticateToken, async (req, res) => {
  try {
    const { recipients, subject, html } = req.body;

    const results = [];
    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient,
          subject,
          html
        });
        results.push({ email: recipient, success: true });
      } catch (error) {
        results.push({ email: recipient, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk emails sent',
      results
    });

  } catch (error) {
    console.error('Send Bulk Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk emails',
      error: error.message
    });
  }
});

// @route   POST /api/email/test
// @desc    Test email functionality
// @access  Private
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { to } = req.body;
    const testEmail = to || req.user.email;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const result = await sendEmail({
      to: testEmail,
      subject: 'MentorConnect - Email Test',
      html: `
        <h2>Email Test Successful! ✅</h2>
        <p>This is a test email from MentorConnect.</p>
        <p>If you received this email, the email system is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
        <p>Best regards,<br>MentorConnect Team</p>
      `
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      to: testEmail,
      result
    });

  } catch (error) {
    console.error('Test Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// @route   POST /api/email/test-session-reminder
// @desc    Test session reminder emails
// @access  Private/Admin
router.post('/test-session-reminder', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const sessionReminderService = require('../services/sessionReminderService');
    const result = await sessionReminderService.sendManualReminder(sessionId);

    res.json(result);

  } catch (error) {
    console.error('Test Session Reminder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send session reminder',
      error: error.message
    });
  }
});

// @route   GET /api/email/status
// @desc    Get email service status
// @access  Private
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { isRealEmailMode } = require('../services/emailService');
    const sessionReminderService = require('../services/sessionReminderService');

    res.json({
      success: true,
      emailService: {
        isRealEmailMode: isRealEmailMode(),
        configured: process.env.EMAIL_USER && process.env.EMAIL_PASSWORD,
        host: process.env.EMAIL_HOST,
        user: process.env.EMAIL_USER
      },
      sessionReminderService: sessionReminderService.getStatus()
    });

  } catch (error) {
    console.error('Email Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email status',
      error: error.message
    });
  }
});

module.exports = router;
