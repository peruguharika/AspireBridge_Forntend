import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Award, CheckCircle, Heart, Share2
} from 'lucide-react';
import { userAPI, followAPI } from '../utils/api';
import { AvailabilityViewer } from './AvailabilityViewer';
import { MentorPosts } from './MentorPosts';

interface MentorProfileProps {
  userType: string | null;
  userId: string | null;
  onLogout: () => void;
}

export function MentorProfile({ userType, userId, onLogout }: MentorProfileProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchMentorProfile();
    if (userId && id) {
      checkFollowStatus();
    }
  }, [id, userId]);

  const checkFollowStatus = async () => {
    if (!userId || !id) return;
    
    try {
      const response = await followAPI.checkFollowStatus(userId, id);
      if (response.success) {
        setIsFollowing(response.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchMentorProfile = async () => {
    try {
      const response = await userAPI.getUser(id!);
      if (response.success) {
        setMentor(response.user);
      }
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!userId || !id) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        const response = await followAPI.unfollow(id);
        if (response.success) {
          setIsFollowing(false);
        }
      } else {
        const response = await followAPI.follow(id);
        if (response.success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status. Please try again.');
    }
  };

  const handleBookSlot = async (slot: any) => {
    if (!userId) {
      navigate('/login');
      return;
    }

    // Calculate duration and amount based on the selected slot
    const duration = slot.duration || 60; // Default to 60 minutes if not specified
    const hourlyRate = mentor?.hourlyRate || 500;
    const amount = (hourlyRate / 60) * duration;

    // Check wallet balance first (for aspirants)
    if (userType === 'aspirant') {
      try {
        const walletResponse = await fetch(`http://localhost:5000/api/wallets/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          const walletBalance = walletData.wallet?.balance || 0;

          if (walletBalance >= amount) {
            // Sufficient balance - proceed with wallet payment
            handleWalletBooking(slot, amount, duration);
            return;
          } else {
            // Insufficient balance - show options
            const addAmount = amount - walletBalance;
            const choice = confirm(
              `Insufficient wallet balance!\n\n` +
              `Required: ₹${amount.toFixed(2)}\n` +
              `Available: ₹${walletBalance.toFixed(2)}\n` +
              `Need to add: ₹${addAmount.toFixed(2)}\n\n` +
              `Click OK to add money to wallet, or Cancel to pay directly via Razorpay`
            );

            if (choice) {
              // Redirect to wallet to add money
              alert('Please add money to your wallet first, then try booking again.');
              navigate('/dashboard/aspirant');
              return;
            } else {
              // Proceed with direct Razorpay payment
              navigate('/payment', {
                state: {
                  mentorId: id,
                  mentorName: mentor?.name,
                  duration: duration,
                  amount: amount,
                  selectedSlot: slot
                }
              });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error checking wallet balance:', error);
        // Fallback to direct payment
        navigate('/payment', {
          state: {
            mentorId: id,
            mentorName: mentor?.name,
            duration: duration,
            amount: amount,
            selectedSlot: slot
          }
        });
        return;
      }
    }

    // For non-aspirants or fallback, use direct payment
    navigate('/payment', {
      state: {
        mentorId: id,
        mentorName: mentor?.name,
        duration: duration,
        amount: amount,
        selectedSlot: slot
      }
    });
  };

  const handleWalletBooking = async (slot: any, amount: number, duration: number) => {
    try {
      // Create booking directly using wallet balance
      const bookingResponse = await fetch('http://localhost:5000/api/bookings/wallet-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          mentorId: id,
          mentorName: mentor?.name,
          date: slot.date,
          time: slot.startTime,
          duration: duration,
          amount: amount,
          message: 'Booked via wallet'
        })
      });

      const result = await bookingResponse.json();

      if (result.success) {
        alert('Session booked successfully using wallet balance!');
        navigate('/dashboard/aspirant');
      } else {
        alert('Booking failed: ' + result.message);
      }
    } catch (error) {
      console.error('Wallet booking error:', error);
      alert('Booking failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentor not found</h2>
          <button
            onClick={() => navigate('/browse')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/browse" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Browse</span>
            </Link>

            <div className="flex items-center gap-3">
              {userId ? (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login">
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">Login</button>
                  </Link>
                  <Link to="/signup">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
                  {mentor.name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-5 h-5 fill-current" />
                          ))}
                          <span className="text-gray-700 ml-2 font-medium">
                            {mentor.rating || '4.9'} ({mentor.reviewsCount || '127'} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {userId && userId !== id && (
                        <button
                          onClick={handleFollowToggle}
                          className={`p-2 rounded-lg transition-colors ${
                            isFollowing ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Heart className={`w-6 h-6 ${isFollowing ? 'fill-current' : ''}`} />
                        </button>
                      )}
                      <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">{mentor.examCleared}</span>
                    <span className="text-gray-600">• Rank: {mentor.rank} • {mentor.year}</span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{mentor.sessionsCompleted || 0}</div>
                      <div className="text-sm text-gray-600">Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{mentor.studentsHelped || 0}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{mentor.experience || '2'}+</div>
                      <div className="text-sm text-gray-600">Years Exp</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
              <p className="text-gray-700 leading-relaxed">
                {mentor.bio || `I am a ${mentor.examCleared} achiever with rank ${mentor.rank} (${mentor.year}). I specialize in helping aspirants navigate through the challenging journey of government exam preparation. With my experience and insights, I can guide you through effective study strategies, time management, and exam techniques.`}
              </p>
            </div>

            {/* Expertise */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {mentor.examCategory}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                  Strategy Planning
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                  Mock Interviews
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                  Study Materials
                </span>
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
                  Time Management
                </span>
              </div>
            </div>

            {/* Success Stories & Posts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Success Stories & Posts</h2>
              <MentorPosts userId={userId || ''} userType={userType || 'public'} mentorId={id} />
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Student Reviews</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((review) => (
                  <div key={review} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-gray-700">A</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Anonymous Student</div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Excellent mentor! Very helpful and provided great insights for exam preparation.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Availability Sidebar */}
          <div className="lg:col-span-1">
            {/* Pricing Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-24">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Hourly Rate</div>
                <div className="text-4xl font-bold text-gray-900">₹{mentor.hourlyRate || 500}</div>
                <div className="text-gray-600">/hour</div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>HD video quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Study materials included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Free rescheduling</span>
                </div>
              </div>
            </div>

            {/* Availability Viewer */}
            <AvailabilityViewer
              mentorId={id!}
              mentorName={mentor.name}
              currentUserType={userType}
              showBookingButton={userType === 'aspirant'}
              onBookSlot={handleBookSlot}
            />
          </div>
        </div>
      </div>
    </div>
  );
}