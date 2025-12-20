# Design Document

## Overview

The Booking Rejection with Automatic Refund System is a critical component of the MentorConnect platform that handles the graceful rejection of booking requests while ensuring automatic financial compensation through Razorpay integration. The system maintains data integrity, provides transparent communication, and handles edge cases to ensure reliable operation.

## Architecture

The system follows a layered architecture pattern:

```
Frontend (React/TypeScript)
├── AchieverDashboard (rejection interface)
├── AspirantDashboard (status display)
└── API Client (HTTP requests)

Backend (Node.js/Express)
├── Routes Layer (booking rejection endpoint)
├── Business Logic Layer (refund processing)
├── Data Access Layer (MongoDB operations)
└── External Services (Razorpay, Email)

External Services
├── Razorpay API (refund processing)
├── Email Service (notifications)
└── MongoDB Atlas (data persistence)
```

## Components and Interfaces

### Frontend Components

**AchieverDashboard**
- Displays pending booking requests
- Provides rejection interface with reason input
- Handles API calls to rejection endpoint
- Shows success/error feedback

**AspirantDashboard**
- Displays booking status with rejection details
- Shows refund status with visual indicators
- Provides refund amount and timeline information
- Updates in real-time when status changes

### Backend Components

**Booking Rejection Route (`PUT /api/bookings/:id/reject`)**
- Validates rejection request parameters
- Updates booking status and metadata
- Initiates refund processing
- Sends email notifications
- Returns updated booking information

**Refund Processing Service**
- Integrates with Razorpay API
- Handles refund creation and status tracking
- Updates payment records
- Manages error scenarios

**Email Notification Service**
- Sends rejection notifications to aspirants
- Includes rejection reason and refund details
- Provides refund timeline information

## Data Models

### Enhanced Booking Model
```javascript
{
  // Existing fields...
  status: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
  refundStatus: ['none', 'processing', 'completed', 'failed'],
  refundAmount: Number,
  rejectionReason: String,
  rejectedBy: ObjectId,
  rejectedAt: Date
}
```

### Enhanced Payment Model
```javascript
{
  // Existing fields...
  status: ['created', 'pending', 'completed', 'failed', 'refunded'],
  refundId: String,
  refundAmount: Number,
  refundReason: String
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Rejection reason storage
*For any* booking rejection, the system should store the rejection reason, timestamp, and rejecting achiever ID
**Validates: Requirements 1.2, 1.3, 1.4**

Property 2: Status immutability after rejection
*For any* booking that has been rejected, attempting to change its status should be prevented
**Validates: Requirements 1.5**

Property 3: Refund initiation on rejection
*For any* paid booking that is rejected, a refund should be automatically initiated through Razorpay
**Validates: Requirements 2.1**

Property 4: Refund amount accuracy
*For any* refund processed, the refund amount should equal the original payment amount
**Validates: Requirements 2.2**

Property 5: Refund status transitions
*For any* refund, the status should progress from processing to either completed or failed
**Validates: Requirements 2.3, 2.4, 2.5**

Property 6: Rejection display completeness
*For any* rejected booking displayed to aspirants, it should include rejection reason and refund status
**Validates: Requirements 3.1, 3.2, 3.3**

Property 7: Email notification consistency
*For any* booking rejection, an email should be sent to the aspirant containing rejection reason and refund information
**Validates: Requirements 4.1, 4.2, 4.3**

Property 8: Audit logging completeness
*For any* refund operation, all Razorpay API interactions and status changes should be logged with accurate timestamps
**Validates: Requirements 5.1, 5.2, 5.5**

Property 9: Duplicate rejection prevention
*For any* booking, multiple rejection attempts should result in only one rejection being processed
**Validates: Requirements 6.3**

Property 10: Invalid state transition prevention
*For any* booking that is completed, cancelled, or already rejected, rejection attempts should be prevented
**Validates: Requirements 6.4**

Property 11: Duplicate refund prevention
*For any* payment that is already refunded, additional refund attempts should be prevented
**Validates: Requirements 6.5**

## Error Handling

The system implements comprehensive error handling:

**API Level Errors**
- Invalid booking ID: Return 404 with clear message
- Missing rejection reason: Return 400 with validation error
- Unauthorized access: Return 401 with authentication error

**Business Logic Errors**
- Booking already processed: Return 400 with state conflict message
- No associated payment: Process rejection without refund
- Razorpay API failures: Mark refund as failed and log details

**Data Integrity Errors**
- Database connection failures: Return 500 with retry guidance
- Concurrent modification: Use optimistic locking to prevent conflicts
- Invalid data states: Validate before processing and reject invalid operations

## Testing Strategy

**Dual testing approach requirements**:

The system requires both unit testing and property-based testing approaches:
- Unit tests verify specific examples, edge cases, and error conditions
- Property tests verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

**Unit testing requirements**:
- Test specific rejection scenarios with known inputs
- Test error conditions like missing payments or API failures
- Test integration points between components
- Verify email content and formatting

**Property-based testing requirements**:
- Use Jest with fast-check library for property-based testing in JavaScript/TypeScript
- Configure each property-based test to run a minimum of 100 iterations
- Tag each property-based test with format: '**Feature: booking-rejection-refund, Property {number}: {property_text}**'
- Each correctness property must be implemented by a single property-based test
- Generate random bookings, rejection reasons, and payment amounts for comprehensive testing
