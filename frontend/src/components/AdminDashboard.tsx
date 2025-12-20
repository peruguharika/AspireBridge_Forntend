import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, DollarSign, CheckCircle, 
  XCircle, Shield, FileText, MessageSquare,
  AlertCircle, Award, Home, LogOut, BarChart3, Plus, Trash2
} from 'lucide-react';
import { adminAPI, authAPI } from '../utils/api';
import { WalletDashboard } from './WalletDashboard';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [examPrices, setExamPrices] = useState<any[]>([]);
  const [groupedPrices, setGroupedPrices] = useState<any>({});
  const [showAddExamPrice, setShowAddExamPrice] = useState(false);
  const [newExamPrice, setNewExamPrice] = useState({
    category: '',
    subCategory: '',
    hourlyRate: 500,
    description: ''
  });
  const [wallets, setWallets] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [settlementsInfo, setSettlementsInfo] = useState<any>(null);
  const [showAdminWallet, setShowAdminWallet] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAuthenticated(true);
      // Try to get admin user ID from token or make a request
      fetchAdminProfile();
      fetchDashboardData();
    }
  }, []);

  const fetchAdminProfile = async () => {
    try {
      // We can decode the token or make a simple API call to get admin info
      const token = localStorage.getItem('adminToken');
      if (token) {
        console.log('Fetching admin profile...');
        const response = await fetch('http://localhost:5000/api/admin/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Admin profile response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Admin profile data:', data);
          if (data.success && data.user) {
            const userId = data.user.id || data.user._id;
            console.log('Setting admin user ID:', userId);
            setAdminUserId(userId);
          }
        } else {
          console.error('Admin profile request failed:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    }
  };

  const fetchSettlementsInfo = async () => {
    try {
      setLoading(true);
      
      // Sync settlements from Razorpay
      const syncResponse = await fetch('http://localhost:5000/api/settlements/sync', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        if (syncData.success) {
          alert(`✅ Settlements synced successfully! ${syncData.syncedCount} settlements processed.`);
        }
      }
      
      // Refresh wallet data after sync
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error syncing settlements:', error);
      alert('❌ Failed to sync settlements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.adminLogin(loginData);
      
      if (response.success) {
        localStorage.setItem('adminToken', response.token);
        setIsAuthenticated(true);
        setAdminUserId(response.user?.id || response.userId);
        console.log('Admin login successful, userId:', response.user?.id || response.userId);
        fetchDashboardData();
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching admin dashboard data...');
      
      // Fetch stats
      const statsResponse = await adminAPI.getStats();
      console.log('Stats response:', statsResponse);
      if (statsResponse.success) {
        setStats(statsResponse.statistics);
        setRecentActivity(statsResponse.recentActivity);
        console.log('Stats set successfully:', statsResponse.statistics);
      } else {
        console.error('Failed to fetch stats:', statsResponse.message);
      }

      // Fetch users
      const usersResponse = await adminAPI.getAllUsers();
      if (usersResponse.success) {
        setUsers(usersResponse.users || []);
      }

      // Fetch bookings
      const bookingsResponse = await adminAPI.getAllBookings();
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.bookings || []);
      }

      // Fetch pending approvals
      const approvalsResponse = await adminAPI.getPendingApprovals();
      if (approvalsResponse.success) {
        setPendingApprovals(approvalsResponse.users || []);
      }

      // Fetch reports
      const reportsResponse = await adminAPI.getAllReports();
      if (reportsResponse.success) {
        setReports(reportsResponse.reports || []);
      }

      // Fetch all posts for moderation
      const postsResponse = await fetch('http://localhost:5000/api/mentorposts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        if (postsData.success) {
          setPosts(postsData.posts || []);
        }
      }

      // Fetch exam prices
      const examPricesResponse = await adminAPI.getExamPrices();
      if (examPricesResponse.success) {
        setExamPrices(examPricesResponse.examPrices || []);
        setGroupedPrices(examPricesResponse.groupedPrices || {});
      }

      // Fetch wallet data
      try {
        const walletsResponse = await fetch('http://localhost:5000/api/wallets/admin/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        if (walletsResponse.ok) {
          const walletsData = await walletsResponse.json();
          if (walletsData.success) {
            setSettlementsInfo(walletsData.overview);
          }
        }

        // Fetch all wallets
        const allWalletsResponse = await fetch('http://localhost:5000/api/admin/wallets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        if (allWalletsResponse.ok) {
          const allWalletsData = await allWalletsResponse.json();
          if (allWalletsData.success) {
            setWallets(allWalletsData.wallets || []);
            
            // If we don't have admin user ID yet, try to get it from admin wallet
            if (!adminUserId) {
              const adminWallet = allWalletsData.wallets.find((w: any) => w.userType === 'admin');
              if (adminWallet && adminWallet.userId) {
                setAdminUserId(adminWallet.userId._id || adminWallet.userId);
                console.log('Admin user ID found from wallet:', adminWallet.userId._id || adminWallet.userId);
              }
            }
          }
        }

        // Fetch all withdrawal requests
        const withdrawalsResponse = await fetch('http://localhost:5000/api/admin/withdrawals', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        if (withdrawalsResponse.ok) {
          const withdrawalsData = await withdrawalsResponse.json();
          if (withdrawalsData.success) {
            setWithdrawalRequests(withdrawalsData.withdrawals || []);
          }
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await adminAPI.approveUser(userId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await adminAPI.rejectUser(userId, 'Does not meet requirements');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Filter users based on selected filter
  const filteredUsers = users.filter(user => {
    if (userFilter === 'all') return true;
    return user.userType === userFilter;
  });



  const startEditingPrice = (userId: string, currentPrice: number) => {
    setEditingPrice(userId);
    setNewPrice(currentPrice);
  };

  const cancelEditingPrice = () => {
    setEditingPrice(null);
    setNewPrice(0);
  };

  const handleCreateExamPrice = async () => {
    try {
      await adminAPI.createExamPrice(newExamPrice);
      setShowAddExamPrice(false);
      setNewExamPrice({ category: '', subCategory: '', hourlyRate: 500, description: '' });
      fetchDashboardData();
      alert('Exam price created successfully!');
    } catch (error) {
      console.error('Error creating exam price:', error);
      alert('Failed to create exam price');
    }
  };

  const handleUpdateExamPrice = async (examPriceId: string, hourlyRate: number) => {
    try {
      await adminAPI.updateExamPrice(examPriceId, { hourlyRate });
      setEditingPrice(null);
      fetchDashboardData();
      alert('Exam price updated successfully! All mentors with this exam will be updated.');
    } catch (error) {
      console.error('Error updating exam price:', error);
      alert('Failed to update exam price');
    }
  };

  const handleDeleteExamPrice = async (examPriceId: string) => {
    if (window.confirm('Are you sure you want to delete this exam price?')) {
      try {
        await adminAPI.deleteExamPrice(examPriceId);
        fetchDashboardData();
        alert('Exam price deleted successfully!');
      } catch (error) {
        console.error('Error deleting exam price:', error);
        alert('Failed to delete exam price');
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone and will remove the post from all locations.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/mentorposts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Post deleted successfully');
          fetchDashboardData(); // Refresh data
        } else {
          alert('Failed to delete post: ' + data.message);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      }
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    const adminNotes = prompt('Optional admin notes for this approval:');
    
    if (window.confirm('Are you sure you want to approve this withdrawal request? This will process the payment through Razorpay.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/withdrawals/${withdrawalId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            adminNotes: adminNotes || ''
          })
        });

        const data = await response.json();
        if (data.success) {
          alert('✅ Withdrawal request approved successfully! Payment is being processed through Razorpay.');
          fetchDashboardData(); // Refresh data
        } else {
          alert('Failed to approve withdrawal: ' + data.message);
        }
      } catch (error) {
        console.error('Error approving withdrawal:', error);
        alert('Error approving withdrawal. Please try again.');
      }
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const rejectionReason = prompt('Please provide a reason for rejecting this withdrawal request:');
    
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    const adminNotes = prompt('Optional additional admin notes:');
    
    if (window.confirm('Are you sure you want to reject this withdrawal request?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/withdrawals/${withdrawalId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
            adminNotes: adminNotes || ''
          })
        });

        const data = await response.json();
        if (data.success) {
          alert('❌ Withdrawal request rejected. The user has been notified via email.');
          fetchDashboardData(); // Refresh data
        } else {
          alert('Failed to reject withdrawal: ' + data.message);
        }
      } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        alert('Error rejecting withdrawal. Please try again.');
      }
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Admin Portal</h2>
            <p className="text-center text-gray-600 mb-8">Secure access for administrators only</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="admin@mentorconnect.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login as Admin'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              <button onClick={() => navigate('/')} className="text-slate-700 hover:text-slate-900">
                ← Back to Home
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white shadow-lg fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'approvals' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Pending Approvals</span>
              {pendingApprovals.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'bookings' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Bookings</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'reports' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Reports</span>
              {reports.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {reports.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'posts' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Posts Management</span>
            </button>

            <button
              onClick={() => setActiveTab('wallets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'wallets' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Wallet Management</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'pricing' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <Award className="w-5 h-5" />
              <span>Price Management</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your platform</p>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <strong>Debug Info:</strong> Stats loaded: {stats ? 'Yes' : 'No'} | 
                Users: {stats?.users?.total || 'N/A'} | 
                Achievers: {stats?.users?.achievers || 'N/A'} | 
                Bookings: {stats?.bookings?.total || 'N/A'} | 
                Revenue: {stats?.payments?.totalRevenue || 'N/A'}
              </div>
            )}
            
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</div>
                <div className="text-gray-600 mt-1">Total Users</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats?.users?.achievers || 0}</div>
                <div className="text-gray-600 mt-1">Active Mentors</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats?.bookings?.total || 0}</div>
                <div className="text-gray-600 mt-1">Total Bookings</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">₹{stats?.payments?.totalRevenue || 0}</div>
                <div className="text-gray-600 mt-1">Total Revenue</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {/* Recent Users */}
                {recentActivity?.users?.map((user: any) => (
                  <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">
                      New {user.userType} registration: {user.name}
                    </span>
                    <span className="ml-auto text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                
                {/* Recent Bookings */}
                {recentActivity?.bookings?.map((booking: any) => (
                  <div key={booking._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">
                      New booking: {booking.aspirantName} → {booking.mentorName}
                    </span>
                    <span className="ml-auto text-sm text-gray-500">
                      {booking.date ? new Date(booking.date).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                ))}
                
                {/* Fallback if no recent activity */}
                {(!recentActivity?.users?.length && !recentActivity?.bookings?.length) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Users ({users.length})
                  </button>
                  <button
                    onClick={() => setUserFilter('achiever')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userFilter === 'achiever' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Achievers ({users.filter(u => u.userType === 'achiever').length})
                  </button>
                  <button
                    onClick={() => setUserFilter('aspirant')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userFilter === 'aspirant' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Aspirants ({users.filter(u => u.userType === 'aspirant').length})
                  </button>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid gap-6">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="grid md:grid-cols-4 gap-6">
                      {/* User Info */}
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.userType === 'achiever' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {user.userType}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {user.approved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Achiever Details */}
                        {user.userType === 'achiever' && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Exam Information</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Category:</span>
                                <span className="ml-2 text-gray-900">{user.examCategory || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Exam:</span>
                                <span className="ml-2 text-gray-900">{user.examCleared || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Rank:</span>
                                <span className="ml-2 text-gray-900">{user.rank || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Year:</span>
                                <span className="ml-2 text-gray-900">{user.year || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Rate:</span>
                                <span className="ml-2 text-gray-900">₹{user.hourlyRate || 500}/hr</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Sessions:</span>
                                <span className="ml-2 text-gray-900">{user.sessionsCompleted || 0}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scorecard (for achievers) */}
                      {user.userType === 'achiever' && (
                        <div className="md:col-span-1">
                          <h4 className="font-medium text-gray-900 mb-2">Scorecard</h4>
                          {user.scorecardUrl ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                              <img
                                src={user.scorecardUrl}
                                alt="Scorecard"
                                className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(user.scorecardUrl, '_blank')}
                              />
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                              <p className="text-gray-500 text-xs">No scorecard</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="md:col-span-1 flex flex-col gap-2">
                        <div className="text-xs text-gray-500 mb-2">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        
                        {user.userType === 'achiever' && !user.approved && (
                          <div className="space-y-2">
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectUser(user._id)}
                              className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        
                        <button
                          onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                          className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                        >
                          Contact
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="w-full px-3 py-2 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Approvals</h2>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingApprovals.map((user) => (
                  <div key={user._id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* User Information */}
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Phone: {user.phone || 'Not provided'}
                            </p>
                          </div>
                        </div>

                        {/* Exam Details */}
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Exam Details</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Exam Category</label>
                              <p className="text-gray-900">{user.examCategory || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Exam Sub-Category</label>
                              <p className="text-gray-900">{user.examSubCategory || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Exam Cleared</label>
                              <p className="text-gray-900">{user.examCleared || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Rank/Score</label>
                              <p className="text-gray-900">{user.rank || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Year</label>
                              <p className="text-gray-900">{user.year || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                              <p className="text-gray-900">₹{user.hourlyRate || 500}</p>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                          <div className="bg-white rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                            <p className="text-gray-700">{user.bio}</p>
                          </div>
                        )}

                        {/* Registration Date */}
                        <div className="text-sm text-gray-500">
                          <p>Registered: {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>

                      {/* Scorecard Image */}
                      <div className="md:col-span-1">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Scorecard Verification</h4>
                          {process.env.NODE_ENV === 'development' && (
                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <strong>Debug:</strong> ScorecardUrl: {user.scorecardUrl || 'None'}
                            </div>
                          )}
                          {user.scorecardUrl ? (
                            <div className="space-y-3">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                                <img
                                  src={user.scorecardUrl}
                                  alt="Scorecard"
                                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(user.scorecardUrl, '_blank')}
                                  onError={(e) => {
                                    console.error('Failed to load scorecard image:', user.scorecardUrl);
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden text-center p-4">
                                  <FileText className="w-12 h-12 text-red-400 mx-auto mb-2" />
                                  <p className="text-red-500 text-sm">Failed to load scorecard image</p>
                                  <p className="text-xs text-gray-500 mt-1">URL: {user.scorecardUrl}</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 text-center">
                                Click image to view full size
                              </p>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No scorecard uploaded</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 space-y-3">
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Approve Mentor
                          </button>
                          <button
                            onClick={() => handleRejectUser(user._id)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject Application
                          </button>
                          <button
                            onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Contact Applicant
                          </button>
                        </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.mentorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(booking.sessionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">₹{booking.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Reports</h2>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No reports</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.subject}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Reported by: {report.reportedBy} • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        report.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Management Tab */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts Management</h2>
            <p className="text-gray-600 mb-6">Monitor and moderate all success stories and mentor posts for inappropriate content.</p>
            
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No posts found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post._id} className="border border-gray-200 rounded-lg p-6">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {post.mentorName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{post.mentorName}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
                          </p>
                          {post.mentorId && (
                            <p className="text-xs text-gray-500">
                              {post.mentorId.examCategory} • {post.mentorId.examSubCategory}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete Post
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Post Media */}
                    {post.mediaUrl && (
                      <div className="mb-4">
                        {post.mediaType === 'photo' && (
                          <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full max-w-md max-h-64 object-cover rounded-lg border"
                          />
                        )}
                        {post.mediaType === 'video' && (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="w-full max-w-md max-h-64 rounded-lg border"
                          />
                        )}
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
                      <span>❤️ {post.likes || 0} likes</span>
                      <span>💬 {post.comments || 0} comments</span>
                      <span>📅 Posted {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Management Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Exam Price Management</h2>
                  <p className="text-gray-600">Set hourly rates for different exam categories. New mentors will automatically get these rates.</p>
                </div>
                <button
                  onClick={() => setShowAddExamPrice(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Exam Price
                </button>
              </div>

              {/* Add New Exam Price Modal */}
              {showAddExamPrice && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Add New Exam Price</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newExamPrice.category}
                        onChange={(e) => setNewExamPrice({ ...newExamPrice, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        <option value="SSC">SSC</option>
                        <option value="UPSC">UPSC</option>
                        <option value="Banking">Banking</option>
                        <option value="Railways">Railways</option>
                        <option value="State PSC">State PSC</option>
                        <option value="Defense">Defense</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Teaching">Teaching</option>
                        <option value="Police">Police</option>
                        <option value="Technical">Technical</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                      <input
                        type="text"
                        value={newExamPrice.subCategory}
                        onChange={(e) => setNewExamPrice({ ...newExamPrice, subCategory: e.target.value })}
                        placeholder="e.g., SSC CGL, SSC CHSL, IBPS PO"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₹)</label>
                      <input
                        type="number"
                        value={newExamPrice.hourlyRate}
                        onChange={(e) => setNewExamPrice({ ...newExamPrice, hourlyRate: Number(e.target.value) })}
                        min="0"
                        step="50"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                      <input
                        type="text"
                        value={newExamPrice.description}
                        onChange={(e) => setNewExamPrice({ ...newExamPrice, description: e.target.value })}
                        placeholder="Brief description"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleCreateExamPrice}
                      disabled={!newExamPrice.category || !newExamPrice.subCategory || !newExamPrice.hourlyRate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Price
                    </button>
                    <button
                      onClick={() => setShowAddExamPrice(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Exam Prices by Category */}
              {Object.keys(groupedPrices).map((category) => (
                <div key={category} className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-blue-600" />
                    {category}
                  </h3>
                  <div className="grid gap-4">
                    {groupedPrices[category].map((examPrice: any) => (
                      <div key={examPrice._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">{examPrice.subCategory}</h4>
                            {examPrice.description && (
                              <p className="text-sm text-gray-600 mt-1">{examPrice.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>Created: {new Date(examPrice.createdAt).toLocaleDateString()}</span>
                              <span>Updated: {new Date(examPrice.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {editingPrice === examPrice._id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-medium text-gray-900">₹</span>
                                <input
                                  type="number"
                                  value={newPrice}
                                  onChange={(e) => setNewPrice(Number(e.target.value))}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                                  min="0"
                                  step="50"
                                />
                                <span className="text-sm text-gray-600">/hr</span>
                              </div>
                            ) : (
                              <div className="text-2xl font-bold text-gray-900">₹{examPrice.hourlyRate}/hr</div>
                            )}
                            
                            <div className="flex gap-2">
                              {editingPrice === examPrice._id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateExamPrice(examPrice._id, newPrice)}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditingPrice}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditingPrice(examPrice._id, examPrice.hourlyRate)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExamPrice(examPrice._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(groupedPrices).length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No exam prices configured</p>
                  <p className="text-gray-500">Add exam prices to automatically set rates for new mentors</p>
                </div>
              )}
            </div>

            {/* Price Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Statistics</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Total Exam Types</h4>
                  <div className="text-2xl font-bold text-blue-700">{examPrices.length}</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Average Rate</h4>
                  <div className="text-2xl font-bold text-green-700">
                    ₹{examPrices.length > 0 
                      ? Math.round(examPrices.reduce((sum, p) => sum + p.hourlyRate, 0) / examPrices.length)
                      : 0}/hr
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Highest Rate</h4>
                  <div className="text-2xl font-bold text-purple-700">
                    ₹{examPrices.length > 0 
                      ? Math.max(...examPrices.map(p => p.hourlyRate))
                      : 0}/hr
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Lowest Rate</h4>
                  <div className="text-2xl font-bold text-orange-700">
                    ₹{examPrices.length > 0 
                      ? Math.min(...examPrices.map(p => p.hourlyRate))
                      : 0}/hr
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Management Tab */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            {/* Wallet Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Wallet Management</h2>
              
              {/* Overview Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-xs text-green-600 font-medium">Auto-Settlement</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{settlementsInfo?.adminWallet?.balance || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Admin Wallet Balance</div>
                  <div className="text-xs text-green-600 mt-2">Settles automatically to bank</div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{settlementsInfo?.totalAdminFees || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Total Platform Fees</div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {settlementsInfo?.pendingWithdrawals?.count || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Pending Withdrawals</div>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {settlementsInfo?.processingWithdrawals?.count || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Processing Withdrawals</div>
                </div>
              </div>

              {/* Razorpay Settlements Link */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Razorpay Settlements Dashboard</h3>
                    <p className="text-blue-700 text-sm">View all withdrawal transactions and payouts</p>
                  </div>
                  <a
                    href="https://dashboard.razorpay.com/app/settlements"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Open Razorpay Dashboard
                  </a>
                </div>
              </div>
            </div>

            {/* All Wallets */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">All User Wallets</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Withdrawn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wallets.map((wallet) => (
                      <tr key={wallet._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {wallet.userId?.name || wallet.userId?.toString().slice(-6) || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {wallet.userId?.email || 'No email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            wallet.userType === 'admin' ? 'bg-red-100 text-red-700' :
                            wallet.userType === 'achiever' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {wallet.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{wallet.balance}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{wallet.totalEarnings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{wallet.totalWithdrawn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {wallet.transactions?.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {wallets.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No wallets found</p>
                </div>
              )}
            </div>

            {/* Withdrawal Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Withdrawal Requests</h3>
              <div className="space-y-4">
                {withdrawalRequests.map((withdrawal) => (
                  <div key={withdrawal._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            withdrawal.status === 'completed' ? 'bg-green-100' :
                            withdrawal.status === 'approved' ? 'bg-blue-100' :
                            withdrawal.status === 'processing' ? 'bg-yellow-100' :
                            withdrawal.status === 'rejected' ? 'bg-red-100' :
                            withdrawal.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            {withdrawal.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : withdrawal.status === 'approved' ? (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            ) : withdrawal.status === 'processing' ? (
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                            ) : withdrawal.status === 'rejected' || withdrawal.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              ₹{withdrawal.amount} to {withdrawal.bankDetails.accountHolderName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Account: {withdrawal.bankDetails.accountNumber} • IFSC: {withdrawal.bankDetails.ifscCode}
                            </p>
                            <p className="text-sm text-gray-500">
                              User: {withdrawal.userId?.name || 'Unknown'} ({withdrawal.userId?.email || 'No email'})
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Requested:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(withdrawal.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Processing Fee:</span>
                            <span className="ml-2 text-gray-900">₹{withdrawal.processingFee}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Net Amount:</span>
                            <span className="ml-2 text-gray-900">₹{withdrawal.netAmount}</span>
                          </div>
                        </div>

                        {withdrawal.razorpayPayoutId && (
                          <div className="mb-2 text-sm">
                            <span className="text-gray-600">Razorpay Payout ID:</span>
                            <span className="ml-2 text-blue-600 font-mono">{withdrawal.razorpayPayoutId}</span>
                          </div>
                        )}

                        {withdrawal.rejectionReason && (
                          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Rejection Reason:</strong> {withdrawal.rejectionReason}
                          </div>
                        )}

                        {withdrawal.failureReason && (
                          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Failure Reason:</strong> {withdrawal.failureReason}
                          </div>
                        )}

                        {withdrawal.adminNotes && (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                            <strong>Admin Notes:</strong> {withdrawal.adminNotes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' :
                          withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          withdrawal.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          withdrawal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          withdrawal.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {withdrawal.status}
                        </span>

                        {/* Action Buttons for Pending Requests */}
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleApproveWithdrawal(withdrawal._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(withdrawal._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {withdrawalRequests.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No withdrawal requests</p>
                </div>
              )}
            </div>

            {/* Razorpay Settlements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Razorpay Auto-Settlements</h3>
                <button
                  onClick={fetchSettlementsInfo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Sync Settlements
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-900">Automatic Settlement Process</h4>
                    <p className="text-sm text-green-700">Your platform fees are automatically settled to your bank account</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2">🏦 How it works:</h5>
                    <ol className="text-sm text-green-800 space-y-1">
                      <li>1. <strong>Session Completed</strong> → Platform fee credited to admin wallet</li>
                      <li>2. <strong>Razorpay Auto-Settlement</strong> → Runs daily/weekly automatically</li>
                      <li>3. <strong>Money Reaches Bank</strong> → Direct transfer to your bank account</li>
                      <li>4. <strong>Settlement Webhook</strong> → Updates records automatically</li>
                    </ol>
                  </div>
                  
                  <div className="bg-white/50 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2">📊 Settlement Schedule:</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• <strong>Frequency:</strong> Daily (T+1 to T+7 days)</li>
                      <li>• <strong>Minimum Amount:</strong> ₹100</li>
                      <li>• <strong>Settlement Fees:</strong> As per Razorpay pricing</li>
                      <li>• <strong>Bank Transfer:</strong> NEFT/IMPS/UPI</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-green-200">
                  <div className="text-sm text-green-700">
                    <p><strong>Status:</strong> Active & Automated</p>
                    <p><strong>Next Settlement:</strong> Within 24-48 hours</p>
                  </div>
                  <a
                    href="https://dashboard.razorpay.com/app/settlements"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    View in Razorpay Dashboard
                  </a>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg">Settlement history will appear here</p>
                <p className="text-sm">Settlements are processed automatically by Razorpay</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Wallet Modal */}
        {showAdminWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Admin Wallet - Platform Fee Withdrawals</h3>
                <button
                  onClick={() => setShowAdminWallet(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">💰 Admin Platform Earnings</h4>
                  <p className="text-blue-800 text-sm">
                    This wallet contains platform fees earned from mentor sessions. You can withdraw these earnings to your bank account.
                  </p>
                </div>
                {adminUserId ? (
                  <WalletDashboard userId={adminUserId} userType="admin" />
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin wallet...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h2>
            <p className="text-gray-600">Detailed analytics coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}