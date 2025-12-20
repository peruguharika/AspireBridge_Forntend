import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3, Target, Calendar, Award, CheckCircle, Clock, BookOpen } from 'lucide-react';

export function ProgressTracking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Progress</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor your learning journey with detailed analytics, performance insights, and personalized recommendations. 
            Stay motivated and achieve your government exam goals faster.
          </p>
        </div>

        {/* Progress Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Performance Analytics</h3>
            <p className="text-gray-600 mb-6">
              Detailed charts and graphs showing your improvement over time, session ratings, and learning patterns.
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Session completion rates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Learning time tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Performance trends
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Goal Setting & Tracking</h3>
            <p className="text-gray-600 mb-6">
              Set personalized study goals and track your progress towards achieving them with milestone celebrations.
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Custom study targets
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Weekly/monthly goals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Achievement badges
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Study Schedule Insights</h3>
            <p className="text-gray-600 mb-6">
              Analyze your study patterns and get recommendations for optimal learning schedules and session timing.
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Best study times
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Session frequency analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Productivity insights
              </li>
            </ul>
          </div>
        </div>

        {/* Sample Dashboard Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Your Progress Dashboard</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8" />
                <span className="text-2xl font-bold">24h</span>
              </div>
              <p className="text-blue-100">Total Study Time</p>
              <p className="text-sm text-blue-200">This month</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8" />
                <span className="text-2xl font-bold">12</span>
              </div>
              <p className="text-green-100">Sessions Completed</p>
              <p className="text-sm text-green-200">This month</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8" />
                <span className="text-2xl font-bold">4.8</span>
              </div>
              <p className="text-purple-100">Average Rating</p>
              <p className="text-sm text-purple-200">From mentors</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8" />
                <span className="text-2xl font-bold">85%</span>
              </div>
              <p className="text-orange-100">Goal Progress</p>
              <p className="text-sm text-orange-200">Monthly target</p>
            </div>
          </div>

          {/* Sample Chart Area */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Progress Chart</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 70, 90, 75].map((height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t w-8 transition-all duration-500"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Track Your Progress?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Stay Motivated</h3>
              <p className="text-purple-100 mb-4">
                Visualize your improvement and celebrate milestones to maintain motivation throughout your exam preparation journey.
              </p>
              <ul className="space-y-2 text-purple-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Achievement badges and rewards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Progress streaks and consistency tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Personalized encouragement messages
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Optimize Learning</h3>
              <p className="text-purple-100 mb-4">
                Identify your peak learning times, preferred study methods, and areas that need more attention for maximum efficiency.
              </p>
              <ul className="space-y-2 text-purple-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Personalized study recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Weak area identification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Optimal session timing suggestions
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Access */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">How to Access Progress Tracking</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account and complete your profile</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Learning</h3>
              <p className="text-gray-600">Book sessions and begin your learning journey</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Access your dashboard to monitor improvement</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Start Tracking Your Success Today</h2>
          <p className="text-xl text-gray-600 mb-8">Join MentorConnect and take control of your exam preparation</p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <button className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Get Started Now
              </button>
            </Link>
            <Link to="/browse">
              <button className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                Browse Mentors
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}