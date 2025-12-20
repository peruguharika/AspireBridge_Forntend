# Design Document

## Overview

The Session Management and Payment Distribution System is a comprehensive solution that monitors session attendance, handles various attendance scenarios, processes automatic refunds, distributes payments to appropriate wallets, and enables withdrawal functionality. The system integrates deeply with Razorpay for all financial operations and provides real-time session monitoring.

## Architecture

The system follows an event-driven architecture with real-time monitoring:

```
Frontend (React/TypeScript)
├── SessionDetails (enhanced with time-based logic)
├── WalletDashboard (earnings and withdrawal interface)
├── SessionMonitor (real-time attendance tracking)
└── WithdrawalForm (bank details and withdrawal requests)

Backend (Node.js/Express)
├── Session Management Service (attendance monitoring)
├── Payment Distribution Service (wallet transfers)
├── Withdrawal Processing Service (bank transfers)
├── Session Monitor (automated attendance checking)
└── Razorpay Integration (all financial operations)

External Services
├── Razorpay API (payments, refunds, transfers, payouts)
├── Session Monitoring Scheduler (cron jobs)
└── Real-time WebSocket (session status updates)
```

## Components and Interfaces

### Frontend Components

**Enhanced SessionDetails**
- Time-based join/leave functionality
- Real-time session status updates
- Grace period countdown display
- Session completion interface for achievers

**WalletDashboard**
- Display current wallet balance
- Transaction history
- Withdrawal request interface
- Bank account management

**SessionMonitor**
- Real-time attendance tracking
- Automatic status updates
- Grace period monitoring
- Session completion detection

### Backend Components

**Session Management Service**
- Tracks participant join/leave events
- Monitors session time windows
- Handles grace period logic
- Processes session completion

**Payment Distribution Service**
- Calculates payment splits (10% admin, gateway fees, remainder to mentor)
- Creates wallet transactions
- Integrates with Razorpay for transfers
- Updates wallet balances

**Withdrawal Processing Service**
- Validates bank account details
- Processes withdrawal requests
- Creates Razorpay payouts
- Updates withdrawal status

## Data Models

### Enhanced Session Model
```javascript
{
  bookingId: ObjectId,
  aspirantId: ObjectId,
  achieverId: ObjectId,
  scheduledStartTime: Date,
  scheduledEndTime: Date,
  actualStartTime: Date,
  actualEndTime: Date,
  aspirantJoinTime: Date,
  achieverJoinTime: Date,
  aspirantLeaveTime: Date,
  achieverLeaveTime: Date,
  status: ['scheduled', 'in-progress', 'completed', 'no-show', 'partial-attendance'],
  attendancePattern: ['both-joined', 'aspirant-only', 'achiever-only', 'neither-joined'],
  completionReason: ['normal', 'achiever-waited', 'no-attendance', 'time-expired'],
  achieverReview: String,
  paymentDistributed: Boolean,
  refundProcessed: Boolean
}
```

### Wallet Model
```javascript
{
  userId: ObjectId,
  userType: ['aspirant', 'achiever', 'admin'],
  balance: Number,
  totalEarnings: Number,
  totalWithdrawn: Number,
  transactions: [{
    type: ['credit', 'debit'],
    amount: Number,
    source: ['session-payment', 'refund', 'withdrawal'],
    sessionId: ObjectId,
    razorpayTransactionId: String,
    timestamp: Date
  }]
}
```

### Withdrawal Request Model
```javascript
{
  userId: ObjectId,
  amount: Number,
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  status: ['pending', 'processing', 'completed', 'failed'],
  razorpayPayoutId: String,
  requestedAt: Date,
  processedAt: Date,
  failureReason: String
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Time-based session access control
*For any* session with defined time windows, join functionality should be enabled only during the active window and disabled outside it
**Validates: Requirements 1.1, 1.3, 2.1, 2.5**

Property 2: Session rejoin capability
*For any* participant who leaves during an active session window, they should be able to rejoin until the window expires
**Validates: Requirements 1.2**

Property 3: Grace period session completion
*For any* session where only the achiever joins and waits 10 minutes without the aspirant, the achiever should be able to complete the session and receive payment
**Validates: Requirements 2.2, 3.3**

Property 4: Automatic refund processing
*For any* session where neither participant joins or only the aspirant joins within the grace period, a full refund should be automatically processed
**Validates: Requirements 3.1, 3.2**

Property 5: Payment distribution accuracy
*For any* completed session, the payment should be split with exactly 10% to admin wallet, gateway fees deducted, and remainder to achiever wallet
**Validates: Requirements 4.1, 4.2, 4.3**

Property 6: Wallet balance consistency
*For any* wallet operation (credit or debit), the wallet balance should accurately reflect all transactions and be consistent across all interfaces
**Validates: Requirements 4.4**

Property 7: Bank detail validation
*For any* withdrawal request, bank account details should be validated for proper format before processing
**Validates: Requirements 5.2**

Property 8: Withdrawal processing integrity
*For any* withdrawal request, the amount should be deducted from wallet, transaction created in Razorpay, and status updated correctly
**Validates: Requirements 5.3, 5.4, 5.5**

Property 9: Razorpay transaction completeness
*For any* financial operation (refund, transfer, payout), corresponding entries should be created in Razorpay dashboard with complete metadata
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

Property 10: Financial reconciliation
*For any* completed financial operation, all amounts should be traceable and reconcilable in the Razorpay dashboard
**Validates: Requirements 6.5**

## Error Handling

The system implements comprehensive error handling for all scenarios:

**Session Management Errors**
- Network disconnections during sessions: Maintain session state and allow reconnection
- Time synchronization issues: Use server time for all time-based decisions
- Concurrent join attempts: Handle race conditions with proper locking

**Payment Processing Errors**
- Razorpay API failures: Retry with exponential backoff and manual fallback
- Insufficient wallet balance: Validate before processing and provide clear error messages
- Payment distribution failures: Rollback partial operations and maintain consistency

**Withdrawal Processing Errors**
- Invalid bank details: Validate format and provide specific error messages
- Razorpay payout failures: Update status and provide retry mechanism
- Network timeouts: Implement proper timeout handling and status tracking

## Testing Strategy

**Dual testing approach requirements**:

The system requires both unit testing and property-based testing approaches:
- Unit tests verify specific scenarios, edge cases, and error conditions
- Property tests verify universal properties that should hold across all inputs
- Integration tests verify end-to-end workflows and external API interactions

**Unit testing requirements**:
- Test specific session attendance scenarios
- Test payment calculation edge cases
- Test bank detail validation formats
- Test error handling and recovery mechanisms

**Property-based testing requirements**:
- Use Jest with fast-check library for property-based testing in JavaScript/TypeScript
- Configure each property-based test to run a minimum of 100 iterations
- Tag each property-based test with format: '**Feature: session-management-payment, Property {number}: {property_text}**'
- Each correctness property must be implemented by a single property-based test
- Generate random session times, payment amounts, and user scenarios for comprehensive testing

## Implementation Phases

**Phase 1: Session Time Management**
- Implement time-based join/leave functionality
- Add grace period monitoring
- Create session status tracking

**Phase 2: Attendance Monitoring**
- Build automated session monitoring
- Implement attendance pattern detection
- Add automatic refund processing

**Phase 3: Payment Distribution**
- Create wallet system
- Implement payment splitting logic
- Add Razorpay integration for transfers

**Phase 4: Withdrawal System**
- Build bank detail management
- Implement withdrawal processing
- Add Razorpay payout integration

**Phase 5: Dashboard Integration**
- Update all dashboards with new functionality
- Add real-time status updates
- Implement comprehensive transaction history