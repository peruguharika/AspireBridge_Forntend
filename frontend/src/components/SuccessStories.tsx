import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Star, TrendingUp, Users } from 'lucide-react';
import { MentorPosts } from './MentorPosts';

export function SuccessStories() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when component mounts (useful after logout)
  useEffect(() => {
    console.log('🔄 SuccessStories component mounted/refreshed');
    setRefreshKey(prev => prev + 1);
  }, []);

  const categories = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'State PSC', 'Defense', 'Insurance', 'Teaching', 'Police', 'Technical'];

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from aspirants who achieved their dreams with MentorConnect
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900">10,000+</div>
            <div className="text-gray-600 mt-2">Success Stories</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600 mt-2">Top 100 Ranks</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900">4.9/5</div>
            <div className="text-gray-600 mt-2">Average Rating</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900">85%</div>
            <div className="text-gray-600 mt-2">Success Rate</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success Stories from Our Mentors</h2>
            <p className="text-gray-600">Real experiences and insights shared by successful achievers</p>
          </div>
          <MentorPosts 
            key={`success-stories-${selectedCategory}-${refreshKey}`} 
            userId="" 
            userType="public" 
            category={selectedCategory} 
          />
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of aspirants who've achieved their dreams with MentorConnect
          </p>
          <Link to="/signup">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold">
              Start Your Journey Today
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}