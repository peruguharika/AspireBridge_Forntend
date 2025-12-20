import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail } from 'lucide-react';

export function PrivacyPolicy() {
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: December 20, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Profile information including exam preferences and status</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Communication preferences and feedback</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Session attendance and participation data</li>
                <li>Platform usage patterns and preferences</li>
                <li>Device information and IP addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-green-600" />
              How We Use Your Information
            </h2>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Delivery:</strong> To provide mentorship sessions, process payments, and manage your account</li>
                <li><strong>Communication:</strong> To send important updates, session reminders, and support messages</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our platform</li>
                <li><strong>Safety:</strong> To ensure platform security and prevent fraud</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-purple-600" />
              Information Sharing
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With Mentors:</strong> Basic profile information to facilitate mentorship sessions</li>
                <li><strong>Service Providers:</strong> Trusted partners who help us operate our platform (payment processors, email services)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <div className="space-y-4 text-gray-700">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and employee training</li>
                <li>Data backup and recovery procedures</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your login status and preferences</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
              <p className="mt-4">You can control cookie settings through your browser preferences.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600" />
              Contact Us
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have questions about this Privacy Policy or your personal information, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@mentorconnect.com</p>
                <p><strong>Address:</strong> 123 Education Street, New Delhi, 110001, India</p>
                <p><strong>Phone:</strong> +91 123 456 7890</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}