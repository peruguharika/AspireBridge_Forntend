import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Video, Award, GraduationCap, MapPin, ArrowLeft } from 'lucide-react';
import { userAPI } from '../utils/api';

interface BrowseMentorsProps {
  userType: string | null;
  userId: string | null;
  onLogout: () => void;
}

export function BrowseMentors({ userType, userId, onLogout }: BrowseMentorsProps) {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Exams');
  const [selectedExperience, setSelectedExperience] = useState('All');

  const examCategories = [
    'All Exams',
    'SSC',
    'UPSC',
    'Banking',
    'Railway',
    'IBPS',
    'State PSC',
    'Defense',
    'Insurance',
    'Teaching',
    'Police',
    'Technical',
    'Others'
  ];

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [searchQuery, selectedCategory, selectedExperience, mentors]);

  const fetchMentors = async () => {
    try {
      console.log('Fetching mentors...');
      const response = await userAPI.getAllUsers({ userType: 'achiever', approved: true });
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('All users from API:', response.users);
        // Only show approved achievers
        const approvedMentors = (response.users || []).filter(mentor => {
          const isApproved = mentor.approved === true || mentor.approvalStatus === 'approved';
          console.log(`Mentor ${mentor.name}: approved=${mentor.approved}, approvalStatus=${mentor.approvalStatus}, isApproved=${isApproved}`);
          return isApproved;
        });
        console.log('Approved mentors after filtering:', approvedMentors);
        setMentors(approvedMentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMentors = () => {
    console.log('Filtering mentors. Total mentors:', mentors.length);
    console.log('Selected category:', selectedCategory);
    console.log('Search query:', searchQuery);
    
    let filtered = [...mentors];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(mentor =>
        mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.examCleared?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.examCategory?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    // Category filter - map subcategories to main categories
    if (selectedCategory !== 'All Exams') {
      filtered = filtered.filter(mentor => {
        const mentorCategory = mentor.examCategory;
        const mentorSubCategory = mentor.examSubCategory;
        
        console.log(`Checking mentor ${mentor.name}: category=${mentorCategory}, subCategory=${mentorSubCategory}`);
        
        // Map subcategories to main categories
        if (selectedCategory === 'SSC' && (mentorCategory === 'SSC' || mentorSubCategory?.includes('SSC'))) return true;
        if (selectedCategory === 'UPSC' && (mentorCategory === 'UPSC' || mentorSubCategory?.includes('UPSC'))) return true;
        if (selectedCategory === 'Banking' && (mentorCategory === 'Banking' || mentorSubCategory?.includes('Banking'))) return true;
        if (selectedCategory === 'Railway' && (mentorCategory === 'Railways' || mentorSubCategory?.includes('RRB'))) return true;
        if (selectedCategory === 'IBPS' && (mentorCategory === 'Banking' || mentorSubCategory?.includes('IBPS'))) return true;
        if (selectedCategory === mentorCategory) return true;
        
        return false;
      });
      console.log('After category filter:', filtered.length);
    }

    console.log('Final filtered mentors:', filtered);
    setFilteredMentors(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">MentorConnect</span>
            </Link>

            <div className="flex items-center gap-3">
              {userId ? (
                <>
                  <button
                    onClick={() => navigate(userType === 'aspirant' ? '/dashboard/aspirant' : '/dashboard/achiever')}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Logout
                  </button>
                </>
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
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Mentor</h1>
          <p className="text-xl text-gray-600">
            Browse through verified achievers and book personalized mentorship sessions
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or exam..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Exam Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {examCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No mentors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor._id || mentor.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => navigate(`/mentor/${mentor._id || mentor.id}`)}
              >
                {/* Mentor Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {mentor.name?.charAt(0) || 'M'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{mentor.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500 mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {mentor.rating || '4.8'} ({mentor.reviewsCount || '0'} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exam Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{mentor.examCleared}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <GraduationCap className="w-4 h-4" />
                    <span>{mentor.examCategory} • Rank: {mentor.rank} • {mentor.year}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">{mentor.sessionsCompleted || 0}</div>
                    <div className="text-gray-600">Sessions</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{mentor.studentsHelped || 0}</div>
                    <div className="text-gray-600">Students</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{mentor.experience || '1'}+ yrs</div>
                    <div className="text-gray-600">Experience</div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{mentor.hourlyRate || 500}</span>
                    <span className="text-gray-600">/session</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}