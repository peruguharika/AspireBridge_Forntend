import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Home, Calendar, BookOpen, Video, 
  User, LogOut, Bell, DollarSign, Users, Clock, 
  CheckCircle, HelpCircle, MessageSquare
} from 'lucide-react';
import { bookingAPI, sessionAPI, userAPI, paymentAPI } from '../utils/api';
import { SimpleAvailabilityManager } from './SimpleAvailabilityManager';
import { SlotManager } from './SlotManager';
import { WalletDashboard } from './WalletDashboard';
import { MentorPosts } from './MentorPosts';
import { FollowersFollowing } from './FollowersFollowing';

interface AchieverDashboardProps {
  userId: string;
  onLogout: () => void;
}

export function AchieverDashboard({ userId, onLogout }: AchieverDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch user data
      console.log('🔍 Fetching user data for userId:', userId);
      console.log('🔍 userId type:', typeof userId);
      console.log('🔍 userId length:', userId?.length);
      
      const userResponse = await userAPI.getUser(userId);
      console.log('📡 User API response:', userResponse);
      if (userResponse.success) {
        console.log('✅ User data received:', userResponse.user);
        console.log('✅ User name:', userResponse.user.name);
        setUserData(userResponse.user);
      } else {
        console.error('❌ Failed to fetch user data:', userResponse.message);
      }

      // Fetch bookings
      const bookingsResponse = await bookingAPI.getUserBookings(userId, 'achiever');
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.bookings || []);
      }

      // Fetch sessions
      const sessionsResponse = await sessionAPI.getUserSessions(userId);
      if (sessionsResponse.success) {
        setSessions(sessionsResponse.sessions || []);
      }

      // Fetch earnings
      const earningsResponse = await paymentAPI.getMentorEarnings(userId);
      if (earningsResponse.success) {
        setEarnings(earningsResponse.earnings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      console.log('Approving booking:', bookingId);
      const response = await bookingAPI.updateBookingStatus(bookingId, 'confirmed');
      console.log('Approve response:', response);
      
      if (response.success) {
        alert('Booking approved successfully!');
        fetchData(); // Refresh data
      } else {
        alert('Failed to approve booking: ' + response.message);
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Error approving booking. Please try again.');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      // Ask for rejection reason
      const reason = prompt('Please provide a reason for rejection (this will be shown to the student):');
      if (!reason || reason.trim() === '') {
        alert('Rejection reason is required');
        return;
      }

      console.log('Rejecting booking:', bookingId, 'Reason:', reason);
      
      // Call the new reject with refund API
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rejectionReason: reason.trim(),
          rejectedBy: userId
        })
      });

      const data = await response.json();
      console.log('Reject response:', data);
      
      if (data.success) {
        alert('Booking rejected successfully! Full refund has been initiated and will be processed within 5-7 business days.');
        fetchData(); // Refresh data
      } else {
        alert('Failed to reject booking: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Error rejecting booking. Please try again.');
    }
  };

  const getPendingBookings = () => {
    return bookings.filter(b => b.status === 'pending');
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
      <aside className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
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
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Booking Requests</span>
              {getPendingBookings().length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {getPendingBookings().length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'sessions' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Video className="w-5 h-5" />
              <span className="font-medium">Sessions</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'wallet' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Wallet & Earnings</span>
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'availability' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Availability</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'posts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Success Stories</span>
            </button>

            <button
              onClick={() => setActiveTab('connections')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'connections' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Connections</span>
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
                Welcome back, {userData?.name || 'Mentor'}! 🎓
              </h1>
              <p className="text-gray-600 mt-1">Manage your mentorship sessions</p>
            </div>
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6" />
              {getPendingBookings().length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Approval Status Card */}
            {userData && (
              <div className={`p-6 rounded-xl border-2 ${
                userData.approved === true || userData.approvalStatus === 'approved'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    userData.approved === true || userData.approvalStatus === 'approved'
                      ? 'bg-green-100'
                      : 'bg-yellow-100'
                  }`}>
                    {userData.approved === true || userData.approvalStatus === 'approved' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      userData.approved === true || userData.approvalStatus === 'approved'
                        ? 'text-green-800'
                        : 'text-yellow-800'
                    }`}>
                      {userData.approved === true || userData.approvalStatus === 'approved'
                        ? '✅ Profile Verified'
                        : '⏳ Pending - Waiting for Admin Approval'
                      }
                    </h3>
                    <p className={`text-sm ${
                      userData.approved === true || userData.approvalStatus === 'approved'
                        ? 'text-green-700'
                        : 'text-yellow-700'
                    }`}>
                      {userData.approved === true || userData.approvalStatus === 'approved'
                        ? 'Your profile is verified and visible to aspirants. You can now accept booking requests and manage sessions.'
                        : 'Your profile is under review by our admin team. We will notify you via email once approved.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
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

              <div 
                className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-200"
                onClick={() => setActiveTab('wallet')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Click to withdraw</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ₹{earnings?.totalEarnings || 0}
                </div>
                <div className="text-gray-600 mt-1">Total Earnings</div>
              </div>
            </div>

            {/* Pending Booking Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Booking Requests</h2>
              {getPendingBookings().length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getPendingBookings().map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.studentName}</h3>
                          <p className="text-sm text-gray-600">
                            {booking.date ? (
                              <>
                                {new Date(booking.date).toLocaleDateString()} at {booking.time}
                              </>
                            ) : (
                              'Date not available'
                            )}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Duration: {booking.duration} mins</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApproveBooking(booking._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
              {getUpcomingSessions().length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getUpcomingSessions().map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{booking.studentName}</h3>
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
                            Start Session
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Requests</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No booking requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.studentName}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.date ? (
                            <>
                              {new Date(booking.date).toLocaleDateString()} at {booking.time}
                            </>
                          ) : (
                            'Date not available'
                          )}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveBooking(booking._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.studentName}</h3>
                        <p className="text-sm text-gray-600">
                          {session.startTime ? (
                            new Date(session.startTime).toLocaleString()
                          ) : (
                            'Date not available'
                          )}
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

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Wallet & Earnings</h2>
            <WalletDashboard userId={userId} userType="achiever" />
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Availability</h2>
              {userData && (userData.approved !== true && userData.approvalStatus !== 'approved') && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Available after approval
                </div>
              )}
            </div>
            
            {userData && (userData.approved === true || userData.approvalStatus === 'approved') ? (
              <div className="space-y-6">
                <SimpleAvailabilityManager userId={userId} />
                <SlotManager userId={userId} />
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Availability Management</h3>
                <p className="text-gray-600 mb-4">
                  You can manage your availability and set your mentoring schedule once your profile is approved by our admin team.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm">
                    <strong>After approval, you'll be able to:</strong>
                  </p>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• Set your weekly availability</li>
                    <li>• Manage time slots for sessions</li>
                    <li>• Accept or decline booking requests</li>
                    <li>• Set your hourly rates</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Success Stories & Posts</h2>
              {userData && (userData.approved !== true && userData.approvalStatus !== 'approved') && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Available after approval
                </div>
              )}
            </div>
            
            {userData && (userData.approved === true || userData.approvalStatus === 'approved') ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📝 Share Your Success Story</h3>
                  <p className="text-blue-700 text-sm">
                    Inspire and motivate aspirants by sharing your journey, tips, strategies, and achievements. 
                    Your posts help build a supportive community and establish your expertise as a mentor.
                  </p>
                </div>
                {userData && userData.name ? (
                  <MentorPosts userId={userId} userType="achiever" userName={userData.name} />
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user data...</p>
                  </div>
                )}
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
                    <strong>Debug Info:</strong>
                    <br />userId: {userId}
                    <br />userData?.name: {userData?.name}
                    <br />userData loaded: {userData ? 'Yes' : 'No'}
                    <br />Full userData: {JSON.stringify(userData, null, 2)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Success Stories & Posts</h3>
                <p className="text-gray-600 mb-4">
                  Share your journey and inspire aspirants once your profile is approved by our admin team.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm">
                    <strong>After approval, you'll be able to:</strong>
                  </p>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• Share your success story and journey</li>
                    <li>• Post tips and strategies for exam preparation</li>
                    <li>• Upload motivational content with images/videos</li>
                    <li>• Engage with the aspirant community</li>
                    <li>• Build your reputation as a mentor</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Followers & Following</h2>
            <FollowersFollowing userId={userId} userType="achiever" />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
            <div className="max-w-2xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {userData?.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{userData?.name}</h3>
                  <p className="text-gray-600">{userData?.email}</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mt-2">
                    Achiever - Verified
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Cleared</label>
                    <input
                      type="text"
                      value={userData?.examCleared || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rank/Score</label>
                    <input
                      type="text"
                      value={userData?.rank || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="text"
                      value={userData?.year || ''}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                  <input
                    type="text"
                    value={`₹${userData?.hourlyRate || 500}`}
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