import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, Calendar, Clock, Video, 
  Award, Star, Plus, Search, Filter, MapPin,
  CheckCircle, DollarSign
} from 'lucide-react';
import { masterClassAPI } from '../utils/api';

interface MasterClassProps {
  userId: string;
  userType: string;
}

export function MasterClass({ userId, userType }: MasterClassProps) {
  const [masterClasses, setMasterClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    category: 'UPSC',
    date: '',
    time: '',
    duration: 120,
    maxParticipants: 5,
    price: 500,
    topics: ''
  });

  const categories = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'State PSC'];

  useEffect(() => {
    fetchMasterClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, selectedCategory, masterClasses]);

  const fetchMasterClasses = async () => {
    try {
      const response = await masterClassAPI.getAll();
      if (response.success) {
        setMasterClasses(response.masterClasses || []);
      }
    } catch (error) {
      console.error('Error fetching master classes:', error);
    }
  };

  const filterClasses = () => {
    let filtered = [...masterClasses];

    if (searchQuery) {
      filtered = filtered.filter(mc =>
        mc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mc.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(mc => mc.category === selectedCategory);
    }

    setFilteredClasses(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await masterClassAPI.create({
        ...createData,
        mentorId: userId,
        mentorName: 'Current User',
        topics: createData.topics.split(',').map(t => t.trim())
      });

      if (response.success) {
        setShowCreateModal(false);
        fetchMasterClasses();
        setCreateData({
          title: '',
          description: '',
          category: 'UPSC',
          date: '',
          time: '',
          duration: 120,
          maxParticipants: 5,
          price: 500,
          topics: ''
        });
      }
    } catch (error) {
      console.error('Error creating master class:', error);
    }
  };

  const handleEnroll = async (classId: string) => {
    // Check if user is logged in
    if (!userId || userType === 'public') {
      alert('Please login to enroll in master classes');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await masterClassAPI.enroll(classId);
      if (response.success) {
        alert('Enrolled successfully!');
        fetchMasterClasses();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const getAvailableSeats = (mc: any) => {
    return mc.maxParticipants - (mc.enrolledStudents?.length || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            {userType === 'achiever' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Master Class
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Classes</h1>
          <p className="text-xl text-gray-600">
            Join group learning sessions with expert mentors
          </p>
        </div>

        {/* Visual Representation Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Master Class Experience</h2>
              <p className="text-blue-100 mb-6 text-lg">
                Join interactive group sessions where 1 expert mentor teaches up to 5 aspirants simultaneously. 
                Experience collaborative learning with personalized attention.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                  <span className="text-blue-100">Small group of maximum 5 students</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                  <span className="text-blue-100">Expert mentor with proven track record</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                  <span className="text-blue-100">Interactive discussions and Q&A</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                  <span className="text-blue-100">Recorded sessions for review</span>
                </div>
              </div>
            </div>
            
            {/* Visual Representation */}
            <div className="relative">
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-6 text-center">Live Master Class Session</h3>
                
                {/* Mentor (Top Center) */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Mentor
                    </div>
                  </div>
                </div>

                {/* Connection Lines */}
                <div className="relative mb-4">
                  <svg className="w-full h-16" viewBox="0 0 300 60">
                    {/* Lines from mentor to students */}
                    <line x1="150" y1="10" x2="60" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="150" y1="10" x2="105" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="150" y1="10" x2="150" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="150" y1="10" x2="195" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="150" y1="10" x2="240" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>
                </div>

                {/* Students (Bottom Row) */}
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((student) => (
                    <div key={student} className="relative">
                      <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                        S{student}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <p className="text-blue-100 text-sm">5 Aspirants Learning Together</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are Master Classes?</h3>
              <p className="text-gray-700 mb-3">
                Master Classes are group learning sessions where expert achievers teach 5 aspirants together. 
                These sessions are available to achievers who have completed at least 5 individual mentoring sessions.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Maximum 5 students per session</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">2 hours of focused learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Interactive Q&A sessions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search master classes..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Available Master Classes Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Master Classes</h2>
          <p className="text-gray-600">Join upcoming group learning sessions with expert mentors</p>
        </div>

        {/* Master Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((mc) => {
            const availableSeats = getAvailableSeats(mc);
            const isFull = availableSeats === 0;
            const isUpcoming = new Date(mc.date) > new Date();

            return (
              <div key={mc._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{mc.title}</h3>
                      <div className="flex items-center gap-2 text-blue-100">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">{mc.mentorName}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                      {mc.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current text-yellow-300" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{mc.description}</p>

                  {/* Date & Time */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{new Date(mc.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>{mc.time} • {mc.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>
                        {availableSeats}/{mc.maxParticipants} seats available
                      </span>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</div>
                    <div className="flex flex-wrap gap-2">
                      {mc.topics?.slice(0, 3).map((topic: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Enrollment */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">₹{mc.price}</div>
                      <div className="text-sm text-gray-600">per person</div>
                    </div>
                    <button
                      onClick={() => handleEnroll(mc._id)}
                      disabled={isFull || !isUpcoming}
                      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isFull || !isUpcoming
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isFull ? 'Full' : !isUpcoming ? 'Completed' : 'Enroll Now'}
                    </button>
                  </div>

                  {/* Seats Warning */}
                  {availableSeats > 0 && availableSeats <= 2 && isUpcoming && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-xs text-center font-medium">
                        Only {availableSeats} seat{availableSeats > 1 ? 's' : ''} left!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredClasses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No master classes found</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Master Class</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={createData.title}
                  onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., UPSC Prelims Strategy Session"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what students will learn"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={createData.category}
                    onChange={(e) => setCreateData({ ...createData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UPSC">UPSC</option>
                    <option value="SSC">SSC</option>
                    <option value="Banking">Banking</option>
                    <option value="Railways">Railways</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={createData.duration}
                    onChange={(e) => setCreateData({ ...createData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={createData.date}
                    onChange={(e) => setCreateData({ ...createData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    required
                    value={createData.time}
                    onChange={(e) => setCreateData({ ...createData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                  <input
                    type="number"
                    required
                    value={createData.maxParticipants}
                    onChange={(e) => setCreateData({ ...createData, maxParticipants: parseInt(e.target.value) })}
                    min="2"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Person (₹)</label>
                  <input
                    type="number"
                    required
                    value={createData.price}
                    onChange={(e) => setCreateData({ ...createData, price: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topics (comma separated)</label>
                <input
                  type="text"
                  required
                  value={createData.topics}
                  onChange={(e) => setCreateData({ ...createData, topics: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Strategy, Time Management, Mock Tests"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Master Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}