import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Users, Clock, CheckCircle, Star, Play, Calendar, MessageSquare } from 'lucide-react';

export function VideoSessionsInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Video Sessions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect face-to-face with expert mentors through high-quality video calls. 
            Get personalized guidance, clear your doubts instantly, and accelerate your exam preparation.
          </p>
        </div>

        {/* Session Types */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* One-on-One Sessions */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-64">
              <img 
                src="/images/one-on-one.jpg" 
                alt="One-on-one mentoring session"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load one-on-one image');
                  (e.target as HTMLImageElement).src = "/images/mentorship.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold mb-2">One-on-One Sessions</h3>
                <p className="text-blue-100">Personalized mentorship tailored to your needs</p>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Dedicated 1-hour sessions with expert mentors</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Customized study plans and strategies</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Real-time doubt clearing and Q&A</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Screen sharing for document review</span>
                </li>
              </ul>
              <Link to="/browse">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Book One-on-One Session
                </button>
              </Link>
            </div>
          </div>

          {/* Group Sessions */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-64">
              <img 
                src="/images/students-studying.jpg" 
                alt="Group learning session"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load students-studying image');
                  (e.target as HTMLImageElement).src = "/images/mentorship.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold mb-2">Master Classes</h3>
                <p className="text-blue-100">Learn with peers in interactive group sessions</p>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Group sessions with up to 20 participants</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Topic-specific deep-dive sessions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Interactive discussions and peer learning</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Recorded sessions for later review</span>
                </li>
              </ul>
              <Link to="/master-class">
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Join Master Classes
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Video Session Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">HD Video Quality</h3>
              <p className="text-gray-600">Crystal clear video and audio for the best learning experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Chat</h3>
              <p className="text-gray-600">Real-time messaging during sessions for quick questions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Book sessions at your convenience with easy rescheduling</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-12">How Video Sessions Work</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Mentor</h3>
              <p className="text-gray-600">Browse and select from verified expert mentors</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Book Session</h3>
              <p className="text-gray-600">Select time slot and make secure payment</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Join Video Call</h3>
              <p className="text-gray-600">Click join button at scheduled time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Learn & Grow</h3>
              <p className="text-gray-600">Get personalized guidance and feedback</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Students Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The video sessions were incredibly helpful. My mentor explained complex topics so clearly, 
                and I could ask questions in real-time. It felt like having a personal tutor!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">AK</span>
                </div>
                <div>
                  <div className="font-semibold">Ankit Kumar</div>
                  <div className="text-sm text-gray-600">UPSC Aspirant</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Master classes are amazing! Learning with other students and getting expert guidance 
                in a group setting really boosted my confidence and knowledge."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">PS</span>
                </div>
                <div>
                  <div className="font-semibold">Priya Singh</div>
                  <div className="text-sm text-gray-600">SSC CGL Aspirant</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of successful students who've achieved their goals</p>
          <div className="flex gap-4 justify-center">
            <Link to="/browse">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Book One-on-One Session
              </button>
            </Link>
            <Link to="/master-class">
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Join Master Classes
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}