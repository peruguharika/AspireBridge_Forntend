import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Clock, CreditCard, CheckCircle, XCircle } from 'lucide-react';

export function RefundPolicy() {
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
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-xl text-gray-600">
            Our fair and transparent refund policy for mentorship sessions and services.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: December 20, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                At MentorConnect, we understand that sometimes plans change. Our refund policy is designed to be fair to both 
                aspirants and mentors while ensuring the quality and reliability of our platform.
              </p>
              <p>
                This policy applies to all mentorship sessions, master classes, and other paid services on our platform.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              Session Cancellation Policy
            </h2>
            <div className="space-y-6 text-gray-700">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">24+ Hours Before</h3>
                  <p className="text-green-700 font-bold text-2xl mb-2">100% Refund</p>
                  <p className="text-sm text-green-600">Full refund processed within 5-7 business days</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">2-24 Hours Before</h3>
                  <p className="text-yellow-700 font-bold text-2xl mb-2">50% Refund</p>
                  <p className="text-sm text-yellow-600">Partial refund to cover mentor preparation time</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Less than 2 Hours</h3>
                  <p className="text-red-700 font-bold text-2xl mb-2">No Refund</p>
                  <p className="text-sm text-red-600">Too late to notify mentor and reschedule</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Special Circumstances</h3>
                <ul className="list-disc pl-6 space-y-2 text-blue-700">
                  <li><strong>Medical Emergencies:</strong> Full refund with valid documentation</li>
                  <li><strong>Technical Issues:</strong> Full refund if platform failure prevents session</li>
                  <li><strong>Mentor Cancellation:</strong> Full refund processed immediately</li>
                  <li><strong>No-Show by Mentor:</strong> Full refund plus compensation credit</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentor Rejection Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                If a mentor rejects your booking request, you will receive a <strong>full refund (100%)</strong> 
                within 5-7 business days. This ensures you're never charged for sessions that don't take place.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Common Reasons for Mentor Rejection:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Schedule conflicts or unavailability</li>
                  <li>Mismatch in expertise area</li>
                  <li>Technical requirements not met</li>
                  <li>Mentor capacity limitations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Master Classes Refund Policy</h2>
            <div className="space-y-4 text-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Before Class Starts</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>48+ hours:</strong> 100% refund</li>
                    <li><strong>24-48 hours:</strong> 75% refund</li>
                    <li><strong>Less than 24 hours:</strong> 50% refund</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">After Class Starts</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Within 15 minutes:</strong> 25% refund</li>
                    <li><strong>After 15 minutes:</strong> No refund</li>
                    <li><strong>Technical issues:</strong> Full refund</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-green-600" />
              Refund Process
            </h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">How to Request a Refund</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Go to your dashboard and find the session</li>
                <li>Click "Cancel Session" or "Request Refund"</li>
                <li>Select the reason for cancellation</li>
                <li>Submit the refund request</li>
                <li>Receive confirmation email with refund details</li>
              </ol>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">Processing Timeline</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                  <li><strong>UPI/Wallets:</strong> 3-5 business days</li>
                  <li><strong>Net Banking:</strong> 5-10 business days</li>
                  <li><strong>Platform Credits:</strong> Instant (can be used immediately)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  <strong>Note:</strong> Refund processing times depend on your bank and payment method. 
                  We initiate refunds immediately upon approval.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Refundable Situations</h2>
            <div className="space-y-4 text-gray-700">
              <p>Refunds will not be provided in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>No-Show by Aspirant:</strong> Failing to attend without prior cancellation</li>
                <li><strong>Late Cancellation:</strong> Cancelling less than 2 hours before session</li>
                <li><strong>Completed Sessions:</strong> Sessions that have been successfully completed</li>
                <li><strong>Violation of Terms:</strong> If you violate our Terms of Service</li>
                <li><strong>Fraudulent Activity:</strong> Any attempt to abuse the refund system</li>
                <li><strong>Platform Credits:</strong> Credits earned through referrals or promotions</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                If you're not satisfied with a session or have concerns about a refund decision, 
                we're here to help resolve the issue fairly.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Steps to Resolve Disputes:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our support team within 48 hours of the session</li>
                <li>Provide detailed information about the issue</li>
                <li>Our team will investigate and respond within 24-48 hours</li>
                <li>If needed, we may mediate between you and the mentor</li>
                <li>Final decisions will be communicated with clear reasoning</li>
              </ol>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Quality Guarantee:</strong> If a session doesn't meet our quality standards, 
                  we may offer a full refund or free replacement session, even outside normal refund windows.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Support</h2>
            <div className="space-y-4 text-gray-700">
              <p>For refund requests or questions about this policy, please contact our support team:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> refunds@mentorconnect.com</p>
                <p><strong>Support Portal:</strong> <Link to="/help" className="text-blue-600 hover:underline">Help Center</Link></p>
                <p><strong>Phone:</strong> +91 123 456 7890 (Mon-Fri, 9 AM - 6 PM)</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/">
            <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}