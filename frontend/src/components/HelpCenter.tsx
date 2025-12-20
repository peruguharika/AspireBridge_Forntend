import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, HelpCircle, Book, MessageSquare, 
  Phone, Mail, FileText, Video, DollarSign, Shield,
  ChevronRight, ExternalLink
} from 'lucide-react';

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of MentorConnect',
      color: 'blue',
      articles: 5
    },
    {
      icon: Video,
      title: 'Video Sessions',
      description: 'How to join and manage video calls',
      color: 'green',
      articles: 8
    },
    {
      icon: DollarSign,
      title: 'Payments & Refunds',
      description: 'Billing, payments, and refund policies',
      color: 'yellow',
      articles: 6
    },
    {
      icon: Shield,
      title: 'Account & Privacy',
      description: 'Security and privacy settings',
      color: 'purple',
      articles: 4
    }
  ];

  const popularArticles = [
    {
      title: 'How to book a mentorship session?',
      views: '2.5k views',
      category: 'Getting Started'
    },
    {
      title: 'What is the refund policy?',
      views: '1.8k views',
      category: 'Payments'
    },
    {
      title: 'How to reschedule a session?',
      views: '1.5k views',
      category: 'Video Sessions'
    },
    {
      title: 'How to become a mentor?',
      views: '1.2k views',
      category: 'Getting Started'
    },
    {
      title: 'Troubleshooting video call issues',
      views: '980 views',
      category: 'Video Sessions'
    }
  ];

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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl mb-8 text-blue-100">
            Search our knowledge base or browse categories below
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles..."
                className="w-full pl-14 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                yellow: 'bg-yellow-100 text-yellow-600',
                purple: 'bg-purple-100 text-purple-600'
              };

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer group"
                >
                  <div className={`w-14 h-14 ${colorClasses[category.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{category.articles} articles</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
            {popularArticles.map((article, index) => (
              <div
                key={index}
                className="p-6 hover:bg-gray-50 cursor-pointer group transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.views}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link to="/contact">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600">Get help from our support team</p>
            </div>
          </Link>

          <Link to="/faqs">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">FAQs</h3>
              <p className="text-sm text-gray-600">Quick answers to common questions</p>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
            <p className="text-sm text-gray-600">Detailed guides and tutorials</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-xl mb-6 text-blue-100">
            Our support team is here to assist you
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Support
              </button>
            </Link>
            <button className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}