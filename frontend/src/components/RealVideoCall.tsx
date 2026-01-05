import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  PhoneOff, MessageSquare, Send
} from 'lucide-react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io, Socket } from 'socket.io-client';
import { SessionFeedbackModal } from './SessionFeedbackModal';

interface ChatMessage {
  id: string;
  sender: string;
  senderType: string;
  message: string;
  timestamp: string;
}

export function RealVideoCall() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, userType } = location.state || {};
  
  // Debug logging
  console.log('🎥 RealVideoCall initialized with:', { bookingId, userType });
  console.log('🎥 Location state:', location.state);
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  const zegoContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const zegoInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Initialize ZegoCloud first, then chat
    initializeZegoCloud();

    return () => {
      cleanup();
    };
  }, []);

  const initializeChat = (currentSessionId: string) => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:5000');
    
    // Join the session room for chat
    if (currentSessionId) {
      socketRef.current.emit('join-session', { sessionId: currentSessionId, userType, userId: localStorage.getItem('userId') });
      console.log('🔗 Joined chat room for session:', currentSessionId);
    }

    // Listen for incoming messages
    socketRef.current.on('new-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Listen for user join/leave events
    socketRef.current.on('user-joined', (data) => {
      setConnectionStatus(`${data.userType} joined the session`);
    });

    socketRef.current.on('user-left', (data) => {
      setConnectionStatus(`${data.userType} left the session`);
    });
  };

  const initializeZegoCloud = async () => {
    try {
      // Validate required data
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      
      if (!userType) {
        throw new Error('User type is required');
      }
      
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      if (!authToken) {
        throw new Error('Authentication required');
      }
      
      setConnectionStatus('Getting session details...');
      
      // Get session details
      const sessionResponse = await fetch(`http://localhost:5000/api/sessions/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        throw new Error(`Failed to get session details: ${sessionResponse.status} ${errorText}`);
      }

      const sessionData = await sessionResponse.json();
      const session = sessionData.session;
      const currentUserId = localStorage.getItem('userId') || `user_${Date.now()}`;
      const userName = userType === 'achiever' ? 'Mentor' : 'Student';
      
      // Set session data
      setRoomId(session.roomId);
      setSessionId(session._id);
      
      console.log('📋 Session data loaded:', { 
        sessionId: session._id, 
        roomId: session.roomId, 
        bookingId: session.bookingId 
      });

      // Initialize chat with the session ID
      initializeChat(session._id);

      setConnectionStatus('Initializing ZegoCloud UIKit...');

      // ZegoCloud configuration - using hardcoded values for now
      const appID = 1580311335;
      const serverSecret = 'fc5348369ada20771aa582a01213161f';

      // Generate Kit Token for ZegoCloud UIKit v2.x
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        session.roomId,
        currentUserId,
        userName
      );

      setConnectionStatus('Joining video room...');

      // Create ZegoCloud instance with v2.x API
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoInstanceRef.current = zp;

      // Join the room with v2.x configuration
      if (zegoContainerRef.current) {
        zp.joinRoom({
          container: zegoContainerRef.current,
          sharedLinks: [
            {
              name: 'Personal link',
              url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + session.roomId,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference, // Use VideoConference for better 1-on-1 experience
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: false, // We have custom chat
          showUserList: true,
          maxUsers: 2, // Limit to 2 users for 1-on-1 session
          layout: "Auto", // Auto layout for best experience
          showLayoutButton: false,
          onJoinRoom: () => {
            console.log('✅ Joined ZegoCloud room successfully');
            setIsConnected(true);
            setConnectionStatus('Connected! Waiting for other participant...');
            
            // Mark user as joined in the session
            if (session._id) {
              fetch(`http://localhost:5000/api/sessions/${session._id}/join`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userType })
              }).catch(error => console.error('Error marking join:', error));
            }
          },
          onLeaveRoom: () => {
            console.log('👋 Left ZegoCloud room');
            // Don't navigate immediately, let endCall handle it
          },
          onUserJoin: (users: any[]) => {
            console.log('👤 Users joined:', users);
            if (users.length > 0) {
              setConnectionStatus(`${users[0].userName || 'Participant'} joined the call!`);
            }
          },
          onUserLeave: (users: any[]) => {
            console.log('👋 Users left:', users);
            if (users.length > 0) {
              setConnectionStatus(`${users[0].userName || 'Participant'} left the call`);
            }
          }
        });
      }

    } catch (error: any) {
      console.error('❌ Error initializing ZegoCloud:', error);
      setConnectionStatus(`Error: ${error.message}`);
      
      // Show error to user
      alert(`Failed to initialize video call: ${error.message}\n\nPlease check your internet connection and try again.`);
    }
  };





  const cleanup = async () => {
    console.log('🧹 Cleaning up ZegoCloud video call...');
    
    // Cleanup ZegoCloud instance
    if (zegoInstanceRef.current) {
      try {
        // For v2.x, use destroy method if available
        if (typeof zegoInstanceRef.current.destroy === 'function') {
          await zegoInstanceRef.current.destroy();
        }
        zegoInstanceRef.current = null;
        console.log('✅ ZegoCloud instance destroyed');
      } catch (error: any) {
        console.error('❌ Error destroying ZegoCloud instance:', error);
      }
    }

    // Cleanup Socket.IO
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log('✅ Socket.IO disconnected');
    }
  };



  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: userType === 'achiever' ? 'Mentor' : 'Student',
      senderType: userType,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    // Send message via Socket.IO
    socketRef.current.emit('send-message', { sessionId, message });
    
    // Add to local messages immediately
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const endCall = async () => {
    console.log('🔚 Ending call, sessionId:', sessionId);
    
    // Notify other users that we're leaving
    if (socketRef.current && sessionId) {
      socketRef.current.emit('leave-session', { sessionId, userType });
    }

    // Mark session as left
    if (sessionId) {
      try {
        await fetch(`http://localhost:5000/api/sessions/${sessionId}/leave`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userType: userType
          })
        });
      } catch (error) {
        console.error('Error leaving session:', error);
      }
    }

    await cleanup();
    
    // Show feedback modal instead of immediately navigating
    if (!feedbackSubmitted && !sessionCompleted && sessionId) {
      console.log('🎯 Showing feedback modal for session:', sessionId);
      setShowFeedbackModal(true);
    } else {
      console.log('⏭️ Navigating to dashboard (no feedback needed)');
      navigate(userType === 'achiever' ? '/dashboard/achiever' : '/dashboard/aspirant');
    }
  };

  const submitFeedback = async (feedback: { rating: number; review: string }) => {
    console.log('🔄 Submitting feedback:', { sessionId, bookingId, feedback, userType });
    
    if (!sessionId) {
      console.error('❌ No sessionId available');
      alert('Error: Session ID not found. Please refresh and try again.');
      return;
    }

    setFeedbackLoading(true);
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      const userId = localStorage.getItem('userId');
      
      console.log('🔑 Auth token available:', !!authToken);
      console.log('👤 User ID:', userId);
      console.log('🎯 Session ID:', sessionId);
      console.log('📝 Feedback data:', feedback);
      
      const requestBody = {
        rating: feedback.rating,
        review: feedback.review || ''
      };
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📡 Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid response format: ${responseText}`);
      }
      
      console.log('📡 Parsed response data:', data);

      if (response.ok && data.success) {
        setFeedbackSubmitted(true);
        setShowFeedbackModal(false);
        
        // Show success message
        alert('Thank you for your feedback! ' + 
              (data.bothFeedbacksSubmitted 
                ? (data.paymentReleased 
                    ? 'Session completed and payment processed successfully!' 
                    : 'Both feedbacks submitted. Payment processing may require admin review.')
                : 'Waiting for the other participant to submit feedback before payment can be released.'));
        
        if (data.bothFeedbacksSubmitted) {
          setSessionCompleted(true);
        }
        
        // Navigate to dashboard using window.location for reliability
        const dashboardUrl = userType === 'achiever' ? '/dashboard/achiever' : '/dashboard/aspirant';
        window.location.href = dashboardUrl;
      } else {
        const errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ API Error:', errorMessage);
        alert('Failed to submit feedback: ' + errorMessage);
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again. Error: ' + (error as Error).message);
    } finally {
      setFeedbackLoading(false);
    }
  };



  return (
    <div className="h-screen bg-gray-900 flex">
      {/* ZegoCloud Video Container */}
      <div className="flex-1 relative">
        {/* Connection Status Overlay */}
        {!isConnected && (
          <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white px-6 py-3 z-50">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">{connectionStatus}</span>
            </div>
          </div>
        )}

        {/* ZegoCloud UIKit Container */}
        <div 
          ref={zegoContainerRef}
          className="w-full h-full"
          style={{ minHeight: '100vh' }}
        />

        {/* Session Info Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-40">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">
              {userType === 'achiever' ? 'Mentor' : 'Student'} • Room: {roomId.slice(-8)}
            </span>
          </div>
        </div>

        {/* End Call Button */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="font-medium">End Call & Give Feedback</span>
          </button>
        </div>

      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-white shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Session Chat
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-gray-900">🎥 ZegoCloud video session started!</p>
              <span className="text-xs text-gray-600">{new Date().toLocaleTimeString()}</span>
            </div>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderType === userType ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-lg shadow-sm ${
                  msg.senderType === userType 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
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
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <SessionFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          navigate(userType === 'achiever' ? '/dashboard/achiever' : '/dashboard/aspirant');
        }}
        onSubmit={submitFeedback}
        userType={userType as 'aspirant' | 'achiever'}
        sessionId={sessionId || ''}
        loading={feedbackLoading}
      />
    </div>
  );
}