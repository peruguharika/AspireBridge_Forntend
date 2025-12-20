import { useState, useEffect } from 'react';
import { Calendar, Clock, CalendarDays, User, AlertCircle, X, CreditCard } from 'lucide-react';
import { availabilityAPI } from '../utils/api';

interface AvailabilityViewerProps {
  mentorId: string;
  mentorName: string;
  currentUserType: string | null;
  showBookingButton?: boolean;
  onBookSlot?: (slot: any) => void;
}

interface TimeSlot {
  id?: string;
  slotId?: string;
  type: 'weekly' | 'specific';
  date: string;
  startTime: string;
  endTime: string;
  duration?: number;
  day?: string;
}

export function AvailabilityViewer({ 
  mentorId, 
  mentorName, 
  currentUserType, 
  showBookingButton = true,
  onBookSlot 
}: AvailabilityViewerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Next 2 weeks
  });

  useEffect(() => {
    fetchAvailableSlots();
  }, [mentorId, selectedDateRange]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      console.log('🔄 AvailabilityViewer: Fetching slots for mentor:', mentorId);
      console.log('📅 Date range:', selectedDateRange);
      
      // Add cache-busting timestamp
      const timestamp = Date.now();
      const response = await availabilityAPI.getSlots(
        selectedDateRange.start,
        selectedDateRange.end,
        mentorId
      );
      
      console.log('📥 AvailabilityViewer: API response:', response);
      
      if (response.success) {
        const slots = response.slots || [];
        console.log(`✅ AvailabilityViewer: Received ${slots.length} slots`);
        console.log('📋 Slots:', slots);
        setAvailableSlots(slots);
      } else {
        console.error('❌ AvailabilityViewer: API failed:', response.message);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('❌ AvailabilityViewer: Error fetching availability:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    const grouped: { [key: string]: TimeSlot[] } = {};
    
    slots.forEach(slot => {
      const dateKey = slot.date.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    
    // Sort slots within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    return grouped;
  };

  const canBookSlots = currentUserType === 'aspirant' && showBookingButton;
  const isAchieverViewingAchiever = currentUserType === 'achiever';

  const handleSlotClick = (slot: TimeSlot) => {
    if (canBookSlots) {
      setSelectedSlot(slot);
      setShowBookingModal(true);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedSlot && onBookSlot) {
      onBookSlot(selectedSlot);
      setShowBookingModal(false);
      setSelectedSlot(null);
    }
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(availableSlots);
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Available Time Slots
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAvailableSlots}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {isAchieverViewingAchiever && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">View Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={selectedDateRange.start}
              onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={selectedDateRange.end}
              onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
              min={selectedDateRange.start}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Availability Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{availableSlots.length}</div>
          <div className="text-sm text-gray-600">Total Slots</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{sortedDates.length}</div>
          <div className="text-sm text-gray-600">Available Days</div>
        </div>
      </div>

      {/* Debug Info - Remove this in production */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <div><strong>Debug Info:</strong></div>
        <div>Mentor ID: {mentorId}</div>
        <div>Date Range: {selectedDateRange.start} to {selectedDateRange.end}</div>
        <div>Last Updated: {new Date().toLocaleTimeString()}</div>
        <div>Raw Slots Count: {availableSlots.length}</div>
        <div>Today's Slots: {availableSlots.filter(slot => slot.date === new Date().toISOString().split('T')[0]).length}</div>
      </div>

      {/* Available Slots */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h3>
          <p className="text-gray-600">
            {mentorName} hasn't set any availability for the selected date range.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  {formatDate(date)}
                </h3>
              </div>
              
              <div className="p-4">
                <div className="grid gap-3">
                  {groupedSlots[date].map((slot, index) => (
                    <div 
                      key={`${slot.type}-${index}`}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        canBookSlots 
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      onClick={() => handleSlotClick(slot)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          slot.type === 'weekly' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>
                              {slot.duration ? `${slot.duration} minutes` : 'Duration varies'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              slot.type === 'weekly' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {slot.type === 'weekly' ? 'Recurring' : 'One-time'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {canBookSlots && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Book
                        </button>
                      )}
                      
                      {isAchieverViewingAchiever && (
                        <div className="text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            {canBookSlots ? (
              <>
                <p className="font-medium mb-1">How to Book</p>
                <p className="text-blue-700">
                  Click on any available time slot to see session details and book. 
                  You'll be able to review the details before confirming your booking.
                </p>
              </>
            ) : isAchieverViewingAchiever ? (
              <>
                <p className="font-medium mb-1">Achiever Profile</p>
                <p className="text-blue-700">
                  You're viewing another achiever's availability. 
                  Booking is only available for aspirants.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">Availability Information</p>
                <p className="text-blue-700">
                  These are the time slots when {mentorName} is available for mentoring sessions.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Session Details</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Mentor</div>
                  <div className="text-sm text-gray-600">{mentorName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Date</div>
                  <div className="text-sm text-gray-600">{formatDate(selectedSlot.date)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Time</div>
                  <div className="text-sm text-gray-600">
                    {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">Duration</div>
                  <div className="text-sm text-gray-600">{selectedSlot.duration || 60} minutes</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Booking Information</p>
                  <p className="text-blue-700">
                    You'll be redirected to the payment page to complete your session booking. 
                    The session will be confirmed once payment is processed.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}