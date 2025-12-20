import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Video, TrendingUp, BookOpen, Award, ArrowRight, CheckCircle, Star, Briefcase, FileText, MessageSquare, AlertCircle } from 'lucide-react';

interface LandingPageProps {
  userType: string | null;
  userId: string | null;
  onLogout: () => void;
}

export function LandingPage({ userType, userId, onLogout }: LandingPageProps) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (userId) {
      if (userType === 'aspirant') {
        navigate('/dashboard/aspirant');
      } else if (userType === 'achiever') {
        navigate('/dashboard/achiever');
      }
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">MentorConnect</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/browse" className="text-gray-700 hover:text-blue-600 transition-colors">
                Find Mentors
              </Link>
              <Link to="/success-stories" className="text-gray-700 hover:text-blue-600 transition-colors">
                Success Stories
              </Link>
              <Link to="/jobs-explorer" className="text-gray-700 hover:text-blue-600 transition-colors">
                Jobs
              </Link>
              <Link to="/resources" className="text-gray-700 hover:text-blue-600 transition-colors">
                Resources
              </Link>
              <Link to="/master-class" className="text-gray-700 hover:text-blue-600 transition-colors">
                Master Classes
              </Link>
              <Link to="/help" className="text-gray-700 hover:text-blue-600 transition-colors">
                Help
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {userId ? (
                <>
                  <button
                    onClick={() => navigate(userType === 'aspirant' ? '/dashboard/aspirant' : '/dashboard/achiever')}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Connect with <span className="text-blue-600">Toppers</span> for Your Government Exam Journey
            </h1>
            <p className="text-xl text-gray-600">
              Get personalized mentorship from achievers who've cracked UPSC, SSC, Banking, and other government exams
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg font-semibold"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <Link to="/browse">
                <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold">
                  Browse Mentors
                </button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Expert Mentors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">10k+</div>
                <div className="text-gray-600">Success Stories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">50k+</div>
                <div className="text-gray-600">Sessions</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-slide-up">
            <img 
              src="/images/students-studying.jpg" 
              alt="Students studying" 
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">98% Success Rate</div>
                  <div className="text-sm text-gray-600">Verified Achievers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MentorConnect?</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed in government exams</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/browse" className="block">
              <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Mentors</h3>
                <p className="text-gray-600">
                  Connect with achievers who've successfully cleared government exams
                </p>
              </div>
            </Link>

            <Link to="/video-sessions" className="block">
              <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-300 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Video Sessions</h3>
                <p className="text-gray-600">
                  One-on-one and group sessions with HD video calling
                </p>
              </div>
            </Link>

            <Link to="/progress-tracking" className="block">
              <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your improvement with detailed analytics
                </p>
              </div>
            </Link>

            <Link to="/resources" className="block">
              <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg hover:border-yellow-300 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Resources Hub</h3>
                <p className="text-gray-600">
                  Access study materials, notes, and previous year papers
                </p>
              </div>
            </Link>

            <Link to="/master-class" className="block">
              <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg hover:border-red-300 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Master Classes</h3>
                <p className="text-gray-600">
                  Join group learning sessions with expert mentors
                </p>
              </div>
            </Link>

            <Link to="/jobs-explorer" className="block">
              <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Jobs Explorer</h3>
                <p className="text-gray-600">
                  Stay updated with latest government job notifications
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Success Journey Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Success Journey</h2>
            <p className="text-xl text-gray-600">From aspiration to achievement - we guide you every step</p>
          </div>

          {/* Journey Steps with Images */}
          <div className="space-y-16">
            {/* Step 1: The Aspiration */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">THE ASPIRATION</h3>
                </div>
                <h4 className="text-xl font-semibold text-blue-600">Bridging the Gap in Rural Education</h4>
                <p className="text-gray-600 text-lg">
                  Every dream starts with a vision. In rural areas where quality education is scarce, 
                  aspirants like you dream of clearing government exams. MentorConnect brings expert 
                  guidance directly to your doorstep through technology.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Access to quality mentorship from anywhere
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Study materials and resources at your fingertips
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Personalized guidance for your exam preparation
                  </li>
                </ul>
              </div>
              <div className="relative">
                <img 
                  src="/images/aspiration.jpg" 
                  alt="Student studying with determination" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image not found
                    (e.target as HTMLImageElement).src = "/images/aspiration.jpg";
                  }}
                />
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">Dream Big</div>
                    <div className="text-sm text-gray-600">Your journey starts here</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: The Maze */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative md:order-1">
                <img 
                  src="/images/maze.jpg" 
                  alt="Student overwhelmed with resources" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/maze.jpg";
                  }}
                />
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">The Maze</div>
                    <div className="text-sm text-gray-600">Too many resources, no clarity</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 md:order-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">THE MAZE</h3>
                </div>
                <h4 className="text-xl font-semibold text-orange-600">Drowning in Resources</h4>
                <p className="text-gray-600 text-lg">
                  The internet is flooded with study materials, YouTube videos, and coaching content. 
                  But without proper guidance, aspirants often feel lost and overwhelmed. 
                  Which book to read? Which strategy to follow? The confusion is real.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Information overload without direction
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Lack of personalized study plans
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    No one to clear doubts and provide motivation
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3: The Mentorship */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">THE MENTORSHIP</h3>
                </div>
                <h4 className="text-xl font-semibold text-green-600">Clarity & Speed</h4>
                <p className="text-gray-600 text-lg">
                  This is where MentorConnect transforms your journey. Connect with achievers who've 
                  walked the same path. Get personalized guidance, clear your doubts instantly, 
                  and follow proven strategies that actually work.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    One-on-one video sessions with toppers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Personalized study plans and strategies
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Real-time doubt clearing and motivation
                  </li>
                </ul>
              </div>
              <div className="relative">
                <img 
                  src="/images/mentorship.jpg" 
                  alt="Video call mentorship session" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/mentorship.jpg";
                  }}
                />
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">Mentorship</div>
                    <div className="text-sm text-gray-600">Clarity & Speed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: The Achievement */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative md:order-1">
                <img 
                  src="/images/achievement.jpg" 
                  alt="Success celebration and achievement" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/achievement.jpg";
                  }}
                />
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Achievement</div>
                    <div className="text-sm text-gray-600">Real Connections, Real Results</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 md:order-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    4
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">THE ACHIEVEMENT</h3>
                </div>
                <h4 className="text-xl font-semibold text-purple-600">Real Connections, Real Results</h4>
                <p className="text-gray-600 text-lg">
                  With the right guidance and consistent effort, success becomes inevitable. 
                  Our mentors don't just teach - they inspire, motivate, and celebrate your victories. 
                  Join the ranks of thousands who've achieved their government job dreams.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Proven track record of success
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Continuous support until you succeed
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Join our community of achievers
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start your mentorship journey</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account as aspirant or achiever</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Find Mentor</h3>
              <p className="text-gray-600">Browse and select the perfect mentor</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Book Session</h3>
              <p className="text-gray-600">Schedule and pay for your session</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Learning</h3>
              <p className="text-gray-600">Join video call and learn from experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Success stories from our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "MentorConnect helped me clear UPSC with AIR 45. The personalized guidance was invaluable!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">RK</span>
                </div>
                <div>
                  <div className="font-semibold">Rahul Kumar</div>
                  <div className="text-sm text-gray-600">UPSC CSE 2023</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Best platform for SSC preparation. My mentor guided me through every step of the journey."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">PS</span>
                </div>
                <div>
                  <div className="font-semibold">Priya Sharma</div>
                  <div className="text-sm text-gray-600">SSC CGL 2023</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The video sessions and resources helped me crack IBPS PO. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">AM</span>
                </div>
                <div>
                  <div className="font-semibold">Amit Mehta</div>
                  <div className="text-sm text-gray-600">IBPS PO 2023</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Success Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of aspirants who've achieved their dreams with MentorConnect
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold inline-flex items-center gap-2"
          >
            Get Started Today <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-8 h-8" />
                <span className="text-xl font-bold">MentorConnect</span>
              </div>
              <p className="text-gray-400">
                Empowering aspirants to achieve their government exam dreams
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/browse" className="hover:text-white">Find Mentors</Link></li>
                <li><Link to="/success-stories" className="hover:text-white">Success Stories</Link></li>
                <li><Link to="/jobs-explorer" className="hover:text-white">Jobs</Link></li>
                <li><Link to="/resources" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/faqs" className="hover:text-white">FAQs</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MentorConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}