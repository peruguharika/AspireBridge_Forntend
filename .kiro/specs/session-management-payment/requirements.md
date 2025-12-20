# Requirements Document

## Introduction

The Session Management and Payment Distribution System provides comprehensive session monitoring, automatic refund processing, and payment distribution for mentorship sessions. The system monitors session attendance, handles no-show scenarios, processes payments to admin and mentor wallets, and enables withdrawal functionality through bank details.

## Glossary

- **Session Window**: The scheduled time period during which participants can join and leave the session
- **Grace Period**: 10-minute waiting period for participants to join before session is considered abandoned
- **Session Monitor**: Automated system that tracks participant attendance and session completion
- **Payment Distribution**: Process of splitting payments between admin (10%), gateway fees, and mentor (remaining amount)
- **Wallet System**: Digital wallet for storing earnings that can be withdrawn to bank accounts
- **Withdrawal Request**: Process for transferring wallet funds to user's bank account
- **Razorpay Dashboard**: External payment gateway interface showing all transactions and refunds

## Requirements

### Requirement 1

**User Story:** As an aspirant, I want to join and leave sessions freely during the scheduled time window, so that I have flexibility in my learning experience.

#### Acceptance Criteria

1. WHEN the session time window is active THEN the MentorConnect System SHALL allow aspirants to join and rejoin the session
2. WHEN an aspirant leaves the session THEN the MentorConnect System SHALL maintain their ability to rejoin within the time window
3. WHEN the session time window expires THEN the MentorConnect System SHALL disable join functionality for aspirants
4. WHEN an aspirant tries to join outside the time window THEN the MentorConnect System SHALL display appropriate time-based messaging
5. WHEN the session is active THEN the MentorConnect System SHALL show "Join and wait for 10 min until achiever joins" message

### Requirement 2

**User Story:** As an achiever, I want to join sessions during the scheduled time and complete them properly, so that I can provide mentorship and receive payment.

#### Acceptance Criteria

1. WHEN the session time window is active THEN the MentorConnect System SHALL allow achievers to join the session
2. WHEN an achiever joins and waits 10 minutes without aspirant joining THEN the MentorConnect System SHALL allow session completion
3. WHEN an achiever completes a session THEN the MentorConnect System SHALL prompt for session review
4. WHEN session review is submitted THEN the MentorConnect System SHALL process payment distribution
5. WHEN the session time window expires THEN the MentorConnect System SHALL disable join functionality for achievers

### Requirement 3

**User Story:** As a system administrator, I want automatic monitoring of session attendance, so that appropriate refunds and payments are processed without manual intervention.

#### Acceptance Criteria

1. WHEN neither participant joins within the grace period THEN the MentorConnect System SHALL process full refund to aspirant
2. WHEN only aspirant joins and achiever doesn't join within grace period THEN the MentorConnect System SHALL process full refund to aspirant
3. WHEN only achiever joins and aspirant doesn't join within grace period THEN the MentorConnect System SHALL allow achiever to complete session and receive payment
4. WHEN both participants join the session THEN the MentorConnect System SHALL enable normal session completion flow
5. WHEN session monitoring detects attendance patterns THEN the MentorConnect System SHALL log all events for audit purposes

### Requirement 4

**User Story:** As an achiever, I want to receive my earnings in my wallet after session completion, so that I can accumulate and withdraw my mentorship income.

#### Acceptance Criteria

1. WHEN a session is completed THEN the MentorConnect System SHALL transfer 10% to admin wallet
2. WHEN payment distribution occurs THEN the MentorConnect System SHALL deduct Razorpay gateway charges
3. WHEN payment calculations are complete THEN the MentorConnect System SHALL transfer remaining amount to achiever wallet
4. WHEN wallet balance is updated THEN the MentorConnect System SHALL reflect changes in achiever dashboard
5. WHEN payment distribution is processed THEN the MentorConnect System SHALL create transaction records in Razorpay dashboard

### Requirement 5

**User Story:** As a user with wallet balance, I want to withdraw money to my bank account, so that I can access my earnings.

#### Acceptance Criteria

1. WHEN a user requests withdrawal THEN the MentorConnect System SHALL prompt for bank account details
2. WHEN bank details are provided THEN the MentorConnect System SHALL validate account name, number, and IFSC code format
3. WHEN withdrawal is processed THEN the MentorConnect System SHALL deduct amount from user wallet
4. WHEN withdrawal is initiated THEN the MentorConnect System SHALL create withdrawal transaction in Razorpay
5. WHEN withdrawal is completed THEN the MentorConnect System SHALL update transaction status and notify user

### Requirement 6

**User Story:** As a system administrator, I want all transactions visible in Razorpay dashboard, so that I can monitor and reconcile all financial activities.

#### Acceptance Criteria

1. WHEN refunds are processed THEN the MentorConnect System SHALL create refund entries in Razorpay dashboard
2. WHEN payment distributions occur THEN the MentorConnect System SHALL create transfer entries in Razorpay dashboard
3. WHEN withdrawals are processed THEN the MentorConnect System SHALL create payout entries in Razorpay dashboard
4. WHEN transactions are created THEN the MentorConnect System SHALL include detailed metadata and references
5. WHEN financial operations complete THEN the MentorConnect System SHALL ensure all amounts are reconcilable in Razorpay dashboard