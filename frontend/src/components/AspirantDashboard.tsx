import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Home, Calendar, BookOpen, Video, 
  User, LogOut, Bell, Search, Clock, CheckCircle, 
  TrendingUp, Briefcase, HelpCircle, Users, CreditCard
} from 'lucide-react';
import { bookingAPI, sessionAPI, userAPI } from '../utils/api';
import { AspirantWallet } from './AspirantWallet';

interface AspirantDashboardProps {
  userId: string;
  onLogout: () => void;
}

export function AspirantDashboard({ userId, onLogout }: AspirantDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch user data
      const userResponse = await userAPI.getUser(userId);
      if (userResponse.success) {
        setUserData(userResponse.user);
      }

      // Fetch bookings
      const bookingsResponse = await bookingAPI.getUserBookings(userId, 'aspirant');
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.bookings || []);
      }

      // Fetch sessions
      const sessionsResponse = await sessionAPI.getUserSessions(userId);
      if (sessionsResponse.success) {
        setSessions(sessionsResponse.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingSessions = () => {
    return bookings.filter(b => 
      b.status === 'confirmed' && 
      new Date(`${b.date} ${b.time}`) > new Date()
    );
  };

  const getCompletedSessions = () => {
    return sessions.filter(s => s.status === 'completed');
  };

  const getPendingBookings = () => {
    return bookings.filter(b => b.status === 'pending');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">MentorConnect</span>
          </Link>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'sessions' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Video className="w-5 h-5" />
              <span className="font-medium">My Sessions</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Bookings</span>
            </button>

            <button
              onClick={() => navigate('/browse')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Find Mentors</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'wallet' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">My Wallet</span>
            </button>

            <button
              onClick={() => navigate('/resources')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Resources</span>
            </button>

            <button
              onClick={() => navigate('/master-class')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Master Classes</span>
            </button>

            <button
              onClick={() => navigate('/jobs-explorer')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Jobs</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={() => navigate('/help')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help & Support</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userData?.name || 'Aspirant'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Track your learning journey</p>
            </div>
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{getUpcomingSessions().length}</div>
                <div className="text-gray-600 mt-1">Upcoming Sessions</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{getCompletedSessions().length}</div>
                <div className="text-gray-600 mt-1">Completed Sessions</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{getPendingBookings().length}</div>
                <div className="text-gray-600 mt-1">Pending Requests</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{userData?.totalHours || 0}</div>
                <div className="text-gray-600 mt-1">Total Hours</div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
              {getUpcomingSessions().length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming sessions</p>
                  <button
                    onClick={() => navigate('/browse')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Book a Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getUpcomingSessions().map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{booking.mentorName}</h3>
                            <p className="text-sm text-gray-600">
                              {booking.date ? (
                                <>
                                  {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                </>
                              ) : (
                                'Date not available'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/session/${booking._id}`)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => navigate('/video-call', { state: { bookingId: booking._id } })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Join Session
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/browse')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Find Mentors</h3>
                <p className="text-sm text-gray-600">Browse and connect with expert mentors</p>
              </button>

              <button
                onClick={() => navigate('/resources')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Study Resources</h3>
                <p className="text-sm text-gray-600">Access study materials and notes</p>
              </button>

              <button
                onClick={() => navigate('/master-class')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Master Classes</h3>
                <p className="text-sm text-gray-600">Join group learning sessions</p>
              </button>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Sessions</h2>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No sessions yet</p>
                <p className="text-gray-500 mt-2">Book your first session to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.mentorName}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(session.startTime).toLocaleString()}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                          session.status === 'completed' ? 'bg-green-100 text-green-700' :
                          session.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Duration</div>
                        <div className="font-semibold">{session.duration || '60'} mins</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No bookings yet</p>
                <button
                  onClick={() => navigate('/browse')}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Find a Mentor
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.mentorName}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.date ? (
                            <>
                              {new Date(booking.date).toLocaleDateString()} at {booking.time}
                            </>
                          ) : (
                            'Date not available'
                          )}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            booking.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {booking.status === 'confirmed' ? 'Approved' : 
                             booking.status === 'rejected' ? 'Rejected' :
                             booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          
                          {/* Refund Status */}
                          {booking.status === 'rejected' && booking.refundStatus && (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              booking.refundStatus === 'completed' ? 'bg-green-100 text-green-700' :
                              booking.refundStatus === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              booking.refundStatus === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              Refund: {booking.refundStatus === 'completed' ? 'Completed' : 
                                      booking.refundStatus === 'processing' ? 'Processing' :
                                      booking.refundStatus === 'failed' ? 'Failed' : 'Pending'}
                            </span>
                          )}
                        </div>

                        {/* Rejection Reason */}
                        {booking.status === 'rejected' && booking.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Rejection Reason:</strong> {booking.rejectionReason}
                            </p>
                            {booking.refundAmount && (
                              <p className="text-sm text-red-700 mt-1">
                                <strong>Refund Amount:</strong> ₹{booking.refundAmount} 
                                {booking.refundStatus === 'completed' ? ' (Refunded)' : 
                                 booking.refundStatus === 'processing' ? ' (Processing - 5-7 business days)' :
                                 ' (Refund Initiated)'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">₹{booking.amount}</div>
                          <div className="text-sm text-gray-600">{booking.duration || 30} mins</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/session/${booking._id}`)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                          >
                            View Details
                          </button>
                          {booking.status === 'confirmed' && new Date(`${booking.date} ${booking.time}`) > new Date() && (
                            <button
                              onClick={() => navigate('/video-call', { state: { bookingId: booking._id } })}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <AspirantWallet userId={userId} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
            <div className="max-w-2xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {userData?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{userData?.name}</h3>
                  <p className="text-gray-600">{userData?.email}</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-2">
                    Aspirant
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={userData?.phone || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Category</label>
                  <input
                    type="text"
                    value={userData?.examCategory || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <input
                    type="text"
                    value={userData?.currentStatus || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}