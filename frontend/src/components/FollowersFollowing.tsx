import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { followAPI } from '../utils/api';

interface FollowersFollowingProps {
  userId: string;
  userType: string;
}

export function FollowersFollowing({ userId, userType }: FollowersFollowingProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFollowersAndFollowing();
  }, [userId]);

  const fetchFollowersAndFollowing = async () => {
    try {
      // Fetch followers
      const followersResponse = await followAPI.getFollowers(userId);
      if (followersResponse.success) {
        const followersWithStatus = followersResponse.followers.map((follower: any) => ({
          id: follower._id,
          name: follower.name,
          avatar: follower.name.charAt(0).toUpperCase(),
          examCategory: follower.examCleared || follower.examCategory || 'N/A',
          rank: follower.rank,
          isFollowing: false // Will be updated by checking follow status
        }));
        setFollowers(followersWithStatus);
      }

      // Fetch following
      const followingResponse = await followAPI.getFollowing(userId);
      if (followingResponse.success) {
        const followingWithStatus = followingResponse.following.map((user: any) => ({
          id: user._id,
          name: user.name,
          avatar: user.name.charAt(0).toUpperCase(),
          examCategory: user.examCleared || user.examCategory || 'N/A',
          rank: user.rank
        }));
        setFollowing(followingWithStatus);
      }
    } catch (error) {
      console.error('Error fetching followers/following:', error);
      // Fallback to empty arrays
      setFollowers([]);
      setFollowing([]);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    try {
      const response = await followAPI.follow(targetUserId);
      if (response.success) {
        // Update local state
        setFollowers(prev => prev.map(f => 
          f.id === targetUserId ? { ...f, isFollowing: true } : f
        ));
      }
    } catch (error) {
      console.error('Error following user:', error);
      alert('Failed to follow user. Please try again.');
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      const response = await followAPI.unfollow(targetUserId);
      if (response.success) {
        if (activeTab === 'followers') {
          // Update local state for followers
          setFollowers(prev => prev.map(f => 
            f.id === targetUserId ? { ...f, isFollowing: false } : f
          ));
        } else {
          // Remove from following list
          setFollowing(prev => prev.filter(f => f.id !== targetUserId));
        }
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Failed to unfollow user. Please try again.');
    }
  };

  const filteredUsers = activeTab === 'followers' 
    ? followers.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : following.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Connections</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('followers')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'followers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Followers ({followers.length})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'following'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Following ({following.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.avatar}
              </div>
              <div>
                <h3 
                  className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                  onClick={() => navigate(`/mentor/${user.id}`)}
                >
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {user.examCategory} {user.rank && `• ${user.rank}`}
                </p>
              </div>
            </div>

            <div>
              {activeTab === 'followers' ? (
                user.isFollowing ? (
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Following
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(user.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Follow Back
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleUnfollow(user.id)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Unfollow
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'No users found' : `No ${activeTab} yet`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
