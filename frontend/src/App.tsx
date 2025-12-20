import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Main Components
import { LandingPage } from './components/LandingPage';
import { BrowseMentors } from './components/BrowseMentors';
import { MentorProfile } from './components/MentorProfile';
import { SignUp } from './components/SignUp';
import { Login } from './components/Login';

// Dashboard Components
import { AspirantDashboard } from './components/AspirantDashboard';
import { AchieverDashboard } from './components/AchieverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';

// Feature Components
import { JobsExplorer } from './components/JobsExplorer';
import { PaymentScreen } from './components/PaymentScreen';
import { PaymentSuccess } from './components/PaymentSuccess';
import { SuccessStories } from './components/SuccessStories';
import { ResourcesHub } from './components/ResourcesHub';
import { MasterClass } from './components/MasterClass';
import { RealVideoCall } from './components/RealVideoCall';
import { SessionDetails } from './components/SessionDetails';

// Support Components
import { HelpCenter } from './components/HelpCenter';
import { ContactUs } from './components/ContactUs';
import { FAQs } from './components/FAQs';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { RefundPolicy } from './components/RefundPolicy';

// Advanced Components
import { MentorPosts } from './components/MentorPosts';
import { AvailabilityManager } from './components/AvailabilityManager';
import { FollowersFollowing } from './components/FollowersFollowing';
import { MentorWallet } from './components/MentorWallet';
import { MyReports } from './components/MyReports';

// Config
import { removeAuthToken } from './config';

// Test Component
import { TestPage } from './components/TestPage';

// Info Pages
import { VideoSessionsInfo } from './components/VideoSessionsInfo';
import { ProgressTracking } from './components/ProgressTracking';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Load user session from localStorage on app mount
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id || user._id || user.email || user.username);
        setUserType(user.userType || user.user_type);
        setUserName(user.name);
        console.log('User session restored:', user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const handleLogin = (user: any) => {
    console.log('App - Login successful:', user);
    
    const uid = user.id || user._id || user.email || user.username;
    const utype = user.userType || user.user_type;
    const uname = user.name;
    
    setUserId(uid);
    setUserType(utype);
    setUserName(uname);
    
    // 3-place save strategy
    // 1. Session Storage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // 2. Local Storage
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userEmail', user.email || '');
    localStorage.setItem('userId', uid);
    localStorage.setItem('userType', utype);
    localStorage.setItem('userName', uname || '');
    
    console.log('User data saved to storage');
  };

  const handleLogout = () => {
    console.log('Logging out user...');
    
    // Clear all state
    setUserId(null);
    setUserType(null);
    setUserName(null);
    
    // Clear all storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('currentUser');
    
    // Remove auth token
    removeAuthToken();
    
    // Force a hard refresh to clear any cached data
    console.log('🔄 Forcing page refresh after logout');
    window.location.href = '/';
  };

  return (
    <Router>
      <Routes>
        {/* ============================================ */}
        {/* PUBLIC ROUTES */}
        {/* ============================================ */}
        
        {/* Home */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              userType={userType} 
              userId={userId} 
              onLogout={handleLogout} 
            />
          } 
        />
        
        {/* Browse Mentors */}
        <Route 
          path="/browse" 
          element={
            <BrowseMentors 
              userType={userType} 
              userId={userId} 
              onLogout={handleLogout} 
            />
          } 
        />
        
        {/* Mentor Profile */}
        <Route 
          path="/mentor/:id" 
          element={
            <MentorProfile 
              userType={userType} 
              userId={userId} 
              onLogout={handleLogout} 
            />
          } 
        />
        
        {/* Authentication */}
        <Route 
          path="/signup" 
          element={
            userId ? (
              <Navigate to={userType === 'aspirant' ? '/dashboard/aspirant' : '/dashboard/achiever'} />
            ) : (
              <SignUp onLogin={handleLogin} />
            )
          } 
        />
        
        <Route 
          path="/login" 
          element={
            userId ? (
              <Navigate to={userType === 'aspirant' ? '/dashboard/aspirant' : '/dashboard/achiever'} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        
        {/* Jobs Explorer */}
        <Route path="/jobs-explorer" element={<JobsExplorer />} />
        <Route path="/jobs" element={<Navigate to="/jobs-explorer" />} />
        
        {/* Success Stories */}
        <Route path="/success-stories" element={<SuccessStories />} />
        
        {/* Test Route */}
        <Route path="/test" element={<TestPage />} />
        
        {/* Info Pages */}
        <Route path="/video-sessions" element={<VideoSessionsInfo />} />
        <Route path="/progress-tracking" element={<ProgressTracking />} />
        
        {/* Support Pages */}
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/help-center" element={<Navigate to="/help" />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/contact-us" element={<Navigate to="/contact" />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/faq" element={<Navigate to="/faqs" />} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/terms" element={<Navigate to="/terms-of-service" />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/refunds" element={<Navigate to="/refund-policy" />} />
        
        {/* ============================================ */}
        {/* PROTECTED ROUTES - REQUIRE LOGIN */}
        {/* ============================================ */}
        
        {/* Resources Hub */}
        <Route 
          path="/resources" 
          element={
            userId ? (
              <ResourcesHub 
                userId={userId} 
                userType={userType || 'aspirant'} 
              />
            ) : (
              <Navigate to="/login" state={{ from: '/resources' }} />
            )
          } 
        />
        
        {/* Master Class */}
        <Route 
          path="/master-class" 
          element={
            <MasterClass 
              userId={userId || ''} 
              userType={userType || 'public'} 
            />
          } 
        />
        
        <Route path="/masterclass" element={<Navigate to="/master-class" />} />
        
        {/* Payment Flow */}
        <Route 
          path="/payment" 
          element={
            userId ? (
              <PaymentScreen />
            ) : (
              <Navigate to="/login" state={{ from: '/payment' }} />
            )
          } 
        />
        
        <Route 
          path="/payment-success" 
          element={
            userId ? (
              <PaymentSuccess />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Video Call */}
        <Route 
          path="/video-call" 
          element={
            userId ? (
              <RealVideoCall />
            ) : (
              <Navigate to="/login" state={{ from: '/video-call' }} />
            )
          } 
        />
        
        {/* Session Details */}
        <Route 
          path="/session/:id" 
          element={
            userId ? (
              <SessionDetails 
                userId={userId} 
                userType={userType || 'aspirant'} 
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* ============================================ */}
        {/* ASPIRANT DASHBOARD */}
        {/* ============================================ */}
        
        <Route 
          path="/dashboard/aspirant" 
          element={
            userId && userType === 'aspirant' ? (
              <AspirantDashboard 
                userId={userId} 
                onLogout={handleLogout} 
              />
            ) : userId ? (
              <Navigate to={`/dashboard/${userType}`} />
            ) : (
              <Navigate to="/login" state={{ from: '/dashboard/aspirant' }} />
            )
          } 
        />
        
        {/* ============================================ */}
        {/* ACHIEVER DASHBOARD */}
        {/* ============================================ */}
        
        <Route 
          path="/dashboard/achiever" 
          element={
            userId && userType === 'achiever' ? (
              <AchieverDashboard 
                userId={userId} 
                onLogout={handleLogout} 
              />
            ) : userId ? (
              <Navigate to={`/dashboard/${userType}`} />
            ) : (
              <Navigate to="/login" state={{ from: '/dashboard/achiever' }} />
            )
          } 
        />
        
        {/* ============================================ */}
        {/* ADMIN ROUTES */}
        {/* ============================================ */}
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-login" element={<Navigate to="/admin/login" />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* ============================================ */}
        {/* FEATURE COMPONENTS (Can be embedded) */}
        {/* ============================================ */}
        
        {/* These are typically used as embedded components, */}
        {/* but we can create standalone routes if needed */}
        
        <Route 
          path="/posts/:mentorId?" 
          element={
            userId ? (
              <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <MentorPosts 
                    userId={userId} 
                    userType={userType || 'aspirant'} 
                    userName={userName || undefined}
                  />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/availability" 
          element={
            userId && userType === 'achiever' ? (
              <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <AvailabilityManager userId={userId} />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/followers" 
          element={
            userId ? (
              <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <FollowersFollowing 
                    userId={userId} 
                    userType={userType || 'aspirant'} 
                  />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/wallet" 
          element={
            userId && userType === 'achiever' ? (
              <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                  <MentorWallet userId={userId} />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/my-reports" 
          element={
            userId ? (
              <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                  <MyReports userId={userId} />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/reports" 
          element={<Navigate to="/my-reports" />} 
        />
        
        {/* ============================================ */}
        {/* LEGACY/ALTERNATE ROUTES */}
        {/* ============================================ */}
        
        {/* Dashboard redirect based on user type */}
        <Route 
          path="/dashboard" 
          element={
            userId ? (
              <Navigate to={`/dashboard/${userType}`} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* ============================================ */}
        {/* 404 FALLBACK */}
        {/* ============================================ */}
        
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                <a 
                  href="/" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Go to Home
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;