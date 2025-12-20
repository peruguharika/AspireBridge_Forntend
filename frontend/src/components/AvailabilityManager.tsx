import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, CalendarDays, X } from 'lucide-react';
import { availabilityAPI } from '../utils/api';

interface AvailabilityManagerProps {
  userId: string;
}

interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD format
  startTime: string;
  endTime: string;
  duration: number; // in minutes
}

interface WeeklySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export function AvailabilityManager({ userId }: AvailabilityManagerProps) {
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklySlot[]>([]);
  const [specificDates, setSpecificDates] = useState<TimeSlot[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekly' | 'specific'>('weekly');
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  // Debug authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const adminToken = localStorage.getItem('adminToken');
    console.log('🔐 AvailabilityManager Auth Check:', {
      userId,
      hasAuthToken: !!token,
      hasAdminToken: !!adminToken,
      authToken: token ? token.substring(0, 20) + '...' : 'none'
    });
  }, [userId]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Common time slots for quick selection
  const commonSlots = [
    { label: '30 minutes', duration: 30 },
    { label: '1 hour', duration: 60 },
    { label: '1.5 hours', duration: 90 },
    { label: '2 hours', duration: 120 }
  ];

  useEffect(() => {
    fetchAvailability();
  }, [userId]);

  const fetchAvailability = async () => {
    try {
      console.log('🚀 Fetching availability...');
      const response = await availabilityAPI.get();
      console.log('📅 Availability response:', response);
      
      if (response.success) {
        const { availability } = response;
        console.log('✅ Availability data:', availability);
        setWeeklyAvailability(availability.weeklySlots || []);
        
        // Convert specific slots to frontend format
        const specificSlots = (availability.specificSlots || []).map((slot: any) => ({
          id: slot._id || slot.id || Date.now().toString(),
          date: slot.date.split('T')[0], // Convert to YYYY-MM-DD format
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration
        }));
        console.log('📋 Converted specific slots:', specificSlots);
        setSpecificDates(specificSlots);
      } else {
        console.error('❌ Availability fetch failed:', response.message);
        alert('Failed to load availability: ' + response.message);
      }
    } catch (error: any) {
      console.error('❌ Error fetching availability:', error);
      alert('Failed to load availability. Please check your connection and try again. Error: ' + (error.message || 'Unknown error'));
    }
  };

  // Helper functions
  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return (end.getTime() - start.getTime()) / (1000 * 60);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const addWeeklySlot = () => {
    setWeeklyAvailability([...weeklyAvailability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeWeeklySlot = (index: number) => {
    setWeeklyAvailability(weeklyAvailability.filter((_, i) => i !== index));
  };

  const updateWeeklySlot = (index: number, field: keyof WeeklySlot, value: string) => {
    const updated = [...weeklyAvailability];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklyAvailability(updated);
  };

  const addSpecificSlot = () => {
    console.log('🚀 Adding specific slot:', newSlot);
    
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      alert('Please fill in all fields');
      return;
    }

    const duration = calculateDuration(newSlot.startTime, newSlot.endTime);
    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }

    // Validate that the slot time hasn't passed (for today's slots)
    const now = new Date();
    const slotDate = new Date(newSlot.date);
    const todayStr = now.toISOString().split('T')[0];
    const slotDateStr = slotDate.toISOString().split('T')[0];
    
    console.log('Time validation:', {
      now: now.toLocaleString(),
      slotDate: slotDateStr,
      isToday: slotDateStr === todayStr
    });
    
    if (slotDateStr === todayStr) {
      const [hours, minutes] = newSlot.startTime.split(':').map(Number);
      const slotStartTime = new Date();
      slotStartTime.setHours(hours, minutes, 0, 0);
      
      console.log('Today slot validation:', {
        slotStartTime: slotStartTime.toLocaleString(),
        now: now.toLocaleString(),
        isPast: slotStartTime <= now
      });
      
      if (slotStartTime <= now) {
        alert('Cannot add availability for past times. The selected time has already passed.');
        return;
      }
    }

    const slot: TimeSlot = {
      id: Date.now().toString(),
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      duration
    };

    console.log('✅ Adding slot to local state:', slot);
    setSpecificDates([...specificDates, slot]);
    setNewSlot({ date: '', startTime: '09:00', endTime: '10:00' });
    setShowAddSlot(false);
  };

  const removeSpecificSlot = (id: string) => {
    setSpecificDates(specificDates.filter(slot => slot.id !== id));
  };

  const setQuickSlot = (duration: number) => {
    if (!newSlot.date || !newSlot.startTime) return;
    
    const start = new Date(`2000-01-01T${newSlot.startTime}:00`);
    const end = new Date(start.getTime() + duration * 60000);
    const endTime = end.toTimeString().slice(0, 5);
    
    setNewSlot({ ...newSlot, endTime });
  };

  const handleSave = async () => {
    if (loading) return; // Prevent double-clicks
    
    try {
      setLoading(true);
      console.log('🚀 Starting save process...');
      console.log('User ID:', userId);
      console.log('Specific dates to save:', specificDates);
      console.log('Weekly slots to save:', weeklyAvailability);
      
      // Check authentication
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      if (!token) {
        alert('Authentication error: Please log in again');
        return;
      }
      console.log('🔐 Token available:', !!token);
      
      // Convert specific dates to backend format
      const specificSlots = specificDates.map(slot => ({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration
      }));

      console.log('📤 Sending to API:', {
        weeklySlots: weeklyAvailability,
        specificSlots: specificSlots
      });

      const response = await availabilityAPI.update({
        weeklySlots: weeklyAvailability,
        specificSlots: specificSlots
      });

      console.log('📥 API response:', response);

      if (response.success) {
        setIsEditing(false);
        setShowAddSlot(false);
        alert('✅ Availability saved successfully!');
        console.log('✅ Save successful, refreshing data...');
        await fetchAvailability(); // Refresh data
      } else {
        console.error('❌ Save failed:', response.message);
        alert('❌ Failed to save availability: ' + response.message);
      }
    } catch (error: any) {
      console.error('❌ Error saving availability:', error);
      const errorMessage = error.message || 'Failed to save availability. Please try again.';
      alert('❌ Failed to save availability: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Availability</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setShowAddSlot(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'weekly'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveTab('specific')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'specific'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CalendarDays className="w-4 h-4 inline mr-2" />
          Specific Dates
        </button>
      </div>

      {/* Weekly Schedule Tab */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            Set your regular weekly availability. These slots will repeat every week.
          </p>
          
          {weeklyAvailability.map((slot, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <select
                  value={slot.day}
                  onChange={(e) => updateWeeklySlot(index, 'day', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateWeeklySlot(index, 'startTime', e.target.value)}
                  disabled={!isEditing}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateWeeklySlot(index, 'endTime', e.target.value)}
                  disabled={!isEditing}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {isEditing && (
                <button
                  onClick={() => removeWeeklySlot(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              onClick={addWeeklySlot}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Weekly Time Slot
            </button>
          )}

          {weeklyAvailability.length === 0 && !isEditing && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No weekly schedule set</p>
            </div>
          )}
        </div>
      )}

      {/* Specific Dates Tab */}
      {activeTab === 'specific' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Add specific date and time slots for one-time availability.
            </p>
            {isEditing && !showAddSlot && (
              <button
                onClick={() => setShowAddSlot(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </button>
            )}
          </div>

          {/* Add New Slot Form */}
          {showAddSlot && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-900">Add New Time Slot</h3>
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Duration Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Duration</label>
                <div className="flex gap-2">
                  {commonSlots.map((slot) => (
                    <button
                      key={slot.duration}
                      onClick={() => setQuickSlot(slot.duration)}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addSpecificSlot}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Slot
                </button>
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Specific Date Slots */}
          <div className="space-y-3">
            {specificDates
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {formatDate(slot.date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {slot.startTime} - {slot.endTime} ({slot.duration} minutes)
                    </div>
                  </div>
                  
                  {isEditing && (
                    <button
                      onClick={() => removeSpecificSlot(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
          </div>

          {specificDates.length === 0 && !showAddSlot && (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No specific dates set</p>
            </div>
          )}
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Students can only book sessions during your available time slots. 
          Make sure to update your availability regularly to avoid booking conflicts.
        </p>
      </div>
    </div>
  );
}