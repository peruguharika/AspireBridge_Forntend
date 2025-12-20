import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Video, MessageSquare, User, Calendar,
  CheckCircle, AlertCircle, Phone, Settings, Mic, MicOff,
  VideoIcon, VideoOff, Users, Share2
} from 'lucide-react';
import { bookingAPI, sessionAPI } from '../utils/api';

interface SessionDetailsProps {
  userType: string | null;
  userId: string | null;
}

export function SessionDetails({ userType, userId }: SessionDetailsProps) {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilSession, setTimeUntilSession] = useState<string>('');
  const [canJoinCall, setCanJoinCall] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [gracePeriodTimeLeft, setGracePeriodTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchSessionDetails();
  }, [bookingId]);

  useEffect(() => {
    const timer = setInterval(() => {
      updateCountdown();
      updateSessionStatus();
    }, 1000);

    return () => clearInterval(timer);
  }, [booking, session]);

  const fetchSessionDetails = async () => {
    try {
      if (!bookingId) {
        console.error('No booking ID provided');
        return;
      }

      console.log('Fetching booking details for ID:', bookingId);

      // Fetch booking details
      const bookingResponse = await bookingAPI.getBooking(bookingId);
      if (bookingResponse.success) {
        console.log('Booking found:', bookingResponse.booking);
        setBooking(bookingResponse.booking);
      } else {
        console.error('Booking not found:', bookingResponse.message);
      }

      // Fetch session details if exists
      try {
        const sessionResponse = await sessionAPI.getSessionByBooking(bookingId);
        if (sessionResponse.success) {
          console.log('Session found:', sessionResponse.session);
          setSession(sessionResponse.session);
        }
      } catch (error) {
        // Session might not exist yet, that's okay
        console.log('No session found yet, will create when needed');
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!booking) return;

    // Create proper date-time string
    const sessionDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const now = new Date();
    const timeDiff = sessionDateTime.getTime() - now.getTime();

    if (timeDiff <= 0) {
      setTimeUntilSession('00:00:00');
      setCanJoinCall(true); // Allow joining during session window
      return;
    }

    // Allow joining 10 minutes before session
    const tenMinutesInMs = 10 * 60 * 1000;
    setCanJoinCall(timeDiff <= tenMinutesInMs);

    // Calculate time remaining
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    setTimeUntilSession(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const updateSessionStatus = async () => {
    if (!session) return;

    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${session._id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessionStatus(data.session);
          
          // Update grace period countdown
          if (data.session.isGracePeriodActive && data.session.gracePeriodEnd) {
            const now = new Date();
            const gracePeriodEnd = new Date(data.session.gracePeriodEnd);
            const timeDiff = gracePeriodEnd.getTime() - now.getTime();
            
            if (timeDiff > 0) {
              const minutes = Math.floor(timeDiff / (1000 * 60));
              const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
              setGracePeriodTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            } else {
              setGracePeriodTimeLeft('00:00');
            }
          } else {
            setGracePeriodTimeLeft('');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching session status:', error);
    }
  };

  const handleJoinCall = async () => {
    try {
      let currentSession = session;
      
      if (!currentSession) {
        // Create session if it doesn't exist
        const sessionResponse = await sessionAPI.createSession({
          bookingId: bookingId,
          aspirantId: booking.aspirantId,
          achieverId: booking.achieverId
        });
        
        if (sessionResponse.success) {
          currentSession = sessionResponse.session;
          setSession(currentSession);
        }
      }

      // Mark participant as joined
      if (currentSession) {
        try {
          const joinResponse = await fetch(`http://localhost:5000/api/sessions/${currentSession._id}/join`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userType: userType
            })
          });

          const joinData = await joinResponse.json();
          if (joinData.success) {
            console.log('Participant joined successfully:', joinData);
          } else {
            console.error('Failed to join session:', joinData.message);
            alert(`Failed to join session: ${joinData.message}`);
            return; // Don't navigate if join failed
          }
        } catch (joinError) {
          console.error('Error marking participant as joined:', joinError);
          alert('Network error while joining session. Please try again.');
          return; // Don't navigate if join failed
        }
      }

      // Navigate to video call component
      navigate('/video-call', { 
        state: { 
          bookingId: bookingId,
          sessionId: currentSession?._id,
          userType: userType,
          isHost: userType === 'achiever',
          roomId: currentSession?.roomId,
          userId: userId
        } 
      });
    } catch (error) {
      console.error('Error joining call:', error);
      alert('Failed to join call. Please try again.');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: userType === 'achiever' ? booking?.mentorName : booking?.aspirantName,
      senderType: userType,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const handleCompleteSession = async () => {
    if (!session || userType !== 'achiever') return;

    const review = prompt('Please provide a brief review of the session (optional):');
    const rating = prompt('Please rate the session from 1-5 (optional):');

    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${session._id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          review: review || '',
          rating: rating ? parseInt(rating) : null,
          completionReason: sessionStatus?.attendancePattern === 'achiever-only' ? 'achiever-waited' : 'normal'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Session completed successfully! Payment has been processed to your wallet.');
        navigate('/dashboard/achiever');
      } else {
        alert('Failed to complete session: ' + data.message);
      }
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Error completing session. Please try again.');
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const sessionDate = new Date(`${date}T${time}:00`);
    return sessionDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session not found</h2>
          <p className="text-gray-600 mb-6">
            The session you're looking for doesn't exist or the link may be incorrect.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(userType === 'achiever' ? '/dashboard/achiever' : '/dashboard/aspirant')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Go Back
            </button>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Make sure you're using the correct session link from your dashboard or email notification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Session Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Session Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Session with {userType === 'achiever' ? booking.aspirantName : booking.mentorName}
                  </h2>
                  <p className="text-gray-600">
                    {formatDateTime(booking.date, booking.time)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {booking.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                  {booking.status === 'pending' && <Clock className="w-4 h-4" />}
                  {booking.status === 'cancelled' && <AlertCircle className="w-4 h-4" />}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>

              {/* Countdown Timer */}
              {booking.status === 'confirmed' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      {timeUntilSession === '00:00:00' ? 'Session Time!' : canJoinCall ? 'Session Starting Soon!' : 'Session Starts In'}
                    </h3>
                    <div className="text-5xl font-bold text-blue-600 mb-4 font-mono tracking-wider">
                      {timeUntilSession}
                    </div>
                    
                    {/* Call and Chat Options */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      {/* Video Call Button */}
                      <div className="text-center">
                        <button
                          onClick={handleJoinCall}
                          disabled={!canJoinCall}
                          className={`w-full px-6 py-4 rounded-lg flex items-center justify-center gap-3 font-medium transition-all ${
                            canJoinCall 
                              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Video className="w-6 h-6" />
                          {canJoinCall ? 'Join Video Call' : 'Video Call (10 min before)'}
                        </button>
                        <p className="text-xs text-gray-600 mt-2">
                          {canJoinCall ? 'Available now' : 'Available 10 minutes before session'}
                        </p>
                      </div>

                      {/* Chat Button */}
                      <div className="text-center">
                        <button
                          onClick={() => {
                            // Focus on chat input
                            const chatInput = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
                            if (chatInput) chatInput.focus();
                          }}
                          className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-3 font-medium transition-all shadow-lg hover:shadow-xl"
                        >
                          <MessageSquare className="w-6 h-6" />
                          Open Chat
                        </button>
                        <p className="text-xs text-gray-600 mt-2">
                          Always available
                        </p>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <p className="text-blue-700 text-sm">
                        {timeUntilSession === '00:00:00' 
                          ? '🎉 Your session is ready! Join the video call and start chatting.'
                          : canJoinCall 
                            ? '⏰ You can join the video call now. Chat is always available for sharing notes and queries.'
                            : '📅 Video call will be enabled 10 minutes before session time. Use chat for any pre-session questions.'
                        }
                      </p>
                      
                      {/* Grace Period Status */}
                      {sessionStatus?.isGracePeriodActive && (
                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                          <p className="text-yellow-800 text-sm font-medium">
                            ⏳ Grace Period Active - Time remaining: {gracePeriodTimeLeft}
                          </p>
                          <p className="text-yellow-700 text-xs mt-1">
                            {userType === 'achiever' 
                              ? 'Waiting for student to join. You can complete the session after the grace period if they don\'t join.'
                              : 'Please join soon! The mentor is waiting for you.'
                            }
                          </p>
                        </div>
                      )}

                      {/* Attendance Status */}
                      {sessionStatus && (
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <div className={`flex items-center gap-1 ${sessionStatus.aspirantJoined ? 'text-green-600' : 'text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${sessionStatus.aspirantJoined ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Student {sessionStatus.aspirantJoined ? 'Joined' : 'Not Joined'}
                          </div>
                          <div className={`flex items-center gap-1 ${sessionStatus.achieverJoined ? 'text-green-600' : 'text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${sessionStatus.achieverJoined ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Mentor {sessionStatus.achieverJoined ? 'Joined' : 'Not Joined'}
                          </div>
                        </div>
                      )}

                      {/* Session Completion for Achiever */}
                      {userType === 'achiever' && sessionStatus?.gracePeriodExpired && 
                       sessionStatus?.attendancePattern === 'achiever-only' && (
                        <div className="mt-3">
                          <button
                            onClick={handleCompleteSession}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Complete Session & Receive Payment
                          </button>
                          <p className="text-xs text-green-700 mt-1 text-center">
                            Student didn't join. You can complete the session and receive payment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Session Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Session Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{booking.duration || 60} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{booking.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium ${
                        booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {userType === 'achiever' ? 'Student' : 'Mentor'} Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {userType === 'achiever' ? booking.aspirantName : booking.mentorName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">
                        {userType === 'achiever' ? booking.aspirantEmail : 'mentor@example.com'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              {booking.message && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Session Notes</h4>
                  <p className="text-gray-700 text-sm">{booking.message}</p>
                </div>
              )}
            </div>

            {/* Session Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Instructions</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Video className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Video Call Access</h4>
                    <p className="text-sm text-blue-700">
                      The video call button will be enabled 10 minutes before your scheduled session time. 
                      Click "Join Video Call" when it becomes available.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Chat Feature</h4>
                    <p className="text-sm text-green-700">
                      Use the chat on the right to share notes, ask questions, or communicate before and during the session. 
                      Chat is always available.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Session Timing</h4>
                    <p className="text-sm text-yellow-700">
                      Please join on time. The countdown timer shows exactly when your session starts. 
                      Both participants will receive notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 h-[700px] flex flex-col sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Session Chat
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Always Available
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 bg-gray-50 rounded-lg p-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">No messages yet</p>
                    <p className="text-gray-500 text-xs mt-1">Start the conversation!</p>
                    <div className="mt-4 text-xs text-gray-500">
                      💡 Use this chat to:
                      <ul className="mt-2 space-y-1 text-left">
                        <li>• Share study materials</li>
                        <li>• Ask questions</li>
                        <li>• Exchange notes</li>
                        <li>• Coordinate session details</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderType === userType ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                        msg.senderType === userType 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <div className={`text-xs mb-1 ${msg.senderType === userType ? 'text-blue-100' : 'text-gray-500'}`}>
                          {msg.sender}
                        </div>
                        <div className="text-sm">{msg.message}</div>
                        <div className={`text-xs mt-1 ${msg.senderType === userType ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send • Chat is available before, during, and after the session
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}