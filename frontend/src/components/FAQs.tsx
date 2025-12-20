import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Search } from 'lucide-react';

export function FAQs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Getting Started', 'Payments', 'Sessions', 'Account'];

  const faqs = [
    {
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'Click on the "Sign Up" button in the top right corner. Choose whether you\'re an aspirant or achiever, fill in your details, verify your email with the OTP sent, and you\'re all set!'
    },
    {
      category: 'Getting Started',
      question: 'What is the difference between aspirant and achiever?',
      answer: 'Aspirants are students preparing for government exams who seek mentorship. Achievers are those who have successfully cleared government exams and want to mentor others. Achievers need admin approval before they can start mentoring.'
    },
    {
      category: 'Sessions',
      question: 'How do I book a mentorship session?',
      answer: 'Browse through our mentor profiles, select a mentor that matches your requirements, choose your preferred session duration, select a convenient date and time, and proceed to payment. Once payment is confirmed, your booking will be sent to the mentor for approval.'
    },
    {
      category: 'Sessions',
      question: 'Can I reschedule a booked session?',
      answer: 'Yes! You can reschedule a session up to 24 hours before the scheduled time. Go to your dashboard, find the booking, and click on "Reschedule". Please note that rescheduling within 24 hours may incur a cancellation fee.'
    },
    {
      category: 'Sessions',
      question: 'What happens if the mentor rejects my booking?',
      answer: 'If a mentor rejects your booking request, you will receive a full refund within 5-7 business days. The mentor may provide a reason for rejection, and you\'re free to book with another mentor.'
    },
    {
      category: 'Sessions',
      question: 'How do I join a video session?',
      answer: 'On the day of your session, go to your dashboard where you\'ll see an active "Join Session" button 15 minutes before the scheduled time. Click it to enter the video call room. Make sure you have a stable internet connection and camera/microphone permissions enabled.'
    },
    {
      category: 'Payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major payment methods through Razorpay including Credit Cards, Debit Cards, Net Banking, UPI, and popular wallets like Paytm, PhonePe, and Google Pay.'
    },
    {
      category: 'Payments',
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use Razorpay, a PCI DSS compliant payment gateway. We never store your card details on our servers. All transactions are encrypted and secure.'
    },
    {
      category: 'Payments',
      question: 'What is the refund policy?',
      answer: 'Full refund if you cancel 24+ hours before the session. 50% refund if cancelled within 24 hours. No refund if cancelled less than 2 hours before or if you don\'t show up. Refunds are processed within 5-7 business days.'
    },
    {
      category: 'Payments',
      question: 'How do mentors receive their payments?',
      answer: 'Mentors receive 88% of the session fee (after 10% platform fee and 2% payment gateway charges) within 48 hours after successful session completion. Payments are transferred directly to their registered bank account.'
    },
    {
      category: 'Account',
      question: 'How do I become a verified mentor?',
      answer: 'Sign up as an achiever, provide details of the exam you cleared including rank and year, upload supporting documents if required. Our admin team will review your application within 2-3 business days. Once approved, you can start accepting bookings.'
    },
    {
      category: 'Account',
      question: 'Can I update my profile information?',
      answer: 'Yes, you can update most of your profile information from your dashboard. However, changes to exam credentials (for achievers) will require admin re-approval.'
    },
    {
      category: 'Account',
      question: 'How do I delete my account?',
      answer: 'You can request account deletion from your account settings. Please note that you must complete or cancel all pending sessions before deletion. Your data will be permanently deleted within 30 days.'
    },
    {
      category: 'Sessions',
      question: 'What are Master Classes?',
      answer: 'Master Classes are group sessions where one mentor teaches up to 5 students simultaneously. They\'re more affordable than one-on-one sessions and great for learning from peers. Only achievers who have completed 5+ individual sessions can host master classes.'
    },
    {
      category: 'Getting Started',
      question: 'What is the Resources Hub?',
      answer: 'Resources Hub is a repository of study materials, PDFs, notes, and tips shared by mentors. Aspirants can access and download these resources to aid their preparation. Some resources may be free while others may require a small fee.'
    },
    {
      category: 'Account',
      question: 'How do I report an issue?',
      answer: 'You can report issues from your dashboard or the Help Center. Provide detailed information about the issue, and our support team will investigate and respond within 24-48 hours.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find quick answers to common questions about MentorConnect
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4 text-left flex-1">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex-shrink-0 mt-1">
                    {faq.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-lg">{faq.question}</h3>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-700 leading-relaxed pl-20">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No FAQs found matching your search.</p>
          </div>
        )}

        {/* Still Have Questions */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-blue-100 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link to="/contact">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
