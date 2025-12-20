import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Users, CreditCard, Shield, AlertTriangle } from 'lucide-react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using MentorConnect platform.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: December 20, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                By accessing and using MentorConnect ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of our website and services provided by MentorConnect ("we," "us," or "our").
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              2. User Accounts and Responsibilities
            </h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">Account Registration</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 18 years old to use our services</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">User Conduct</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform respectfully and professionally</li>
                <li>Do not share inappropriate, offensive, or harmful content</li>
                <li>Respect intellectual property rights</li>
                <li>Do not attempt to circumvent platform security measures</li>
                <li>Report any violations or suspicious activity</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Mentorship Services</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">For Aspirants</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Book sessions with verified mentors</li>
                <li>Attend scheduled sessions punctually</li>
                <li>Provide honest feedback after sessions</li>
                <li>Respect mentor's time and expertise</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">For Achievers (Mentors)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information about your qualifications</li>
                <li>Deliver quality mentorship services</li>
                <li>Maintain professional conduct during sessions</li>
                <li>Honor scheduled appointments or provide adequate notice for cancellations</li>
                <li>Comply with platform guidelines and policies</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-purple-600" />
              4. Payment Terms
            </h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">Pricing and Payments</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Session fees are set by individual mentors and displayed clearly</li>
                <li>Payment is required at the time of booking</li>
                <li>We use secure payment processing through Razorpay</li>
                <li>Platform fee of 10% is deducted from mentor earnings</li>
                <li>Payment gateway charges (2%) apply to all transactions</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">Refund Policy</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full refund for cancellations 24+ hours before session</li>
                <li>50% refund for cancellations within 24 hours</li>
                <li>No refund for cancellations within 2 hours or no-shows</li>
                <li>Refunds processed within 5-7 business days</li>
                <li>Mentor rejections result in full refund</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              5. Platform Policies
            </h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">Content and Intellectual Property</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users retain ownership of their original content</li>
                <li>By posting content, you grant us license to use it on the platform</li>
                <li>Respect copyrights and intellectual property of others</li>
                <li>We may remove content that violates our policies</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">Privacy and Data Protection</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>We collect and use data as described in our Privacy Policy</li>
                <li>Session recordings may be stored for quality assurance</li>
                <li>Personal information is protected and not sold to third parties</li>
                <li>You can request data deletion at any time</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
            <div className="space-y-4 text-gray-700">
              <p>The following activities are strictly prohibited:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Harassment, abuse, or discrimination of any kind</li>
                <li>Sharing false or misleading information</li>
                <li>Attempting to bypass payment systems</li>
                <li>Using the platform for illegal activities</li>
                <li>Spamming or unsolicited marketing</li>
                <li>Impersonating others or creating fake profiles</li>
                <li>Sharing contact information to conduct business outside the platform</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              7. Disclaimers and Limitations
            </h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">Service Availability</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Maintenance and updates may temporarily affect availability</li>
                <li>We are not responsible for internet connectivity issues</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">Limitation of Liability</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>We facilitate connections between mentors and aspirants</li>
                <li>We do not guarantee specific outcomes or results</li>
                <li>Our liability is limited to the amount paid for services</li>
                <li>We are not responsible for mentor-aspirant disputes</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>We reserve the right to terminate or suspend accounts that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or harmful activities</li>
                <li>Receive multiple complaints from other users</li>
                <li>Remain inactive for extended periods</li>
              </ul>
              <p className="mt-4">
                You may terminate your account at any time by contacting our support team. 
                Upon termination, you remain liable for any outstanding payments.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>For questions about these Terms of Service, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@mentorconnect.com</p>
                <p><strong>Address:</strong> 123 Education Street, New Delhi, 110001, India</p>
                <p><strong>Phone:</strong> +91 123 456 7890</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/">
            <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}