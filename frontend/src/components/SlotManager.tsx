import { useState, useEffect } from 'react';
import { Clock, Trash2, RefreshCw, Calendar, AlertCircle } from 'lucide-react';

interface SlotManagerProps {
  userId: string;
}

interface TimeSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  bookingId?: string;
}

export function SlotManager({ userId }: SlotManagerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSlots();
  }, [userId]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      if (!token) {
        setMessage('❌ Authentication required');
        return;
      }

      console.log('🔄 Fetching slots for user:', userId);

      const response = await fetch('http://localhost:5000/api/availability', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`❌ Failed to fetch slots: ${errorData.message}`);
        return;
      }

      const data = await response.json();
      console.log('📥 Availability data:', data);

      if (data.success) {
        const specificSlots = data.availability.specificSlots || [];
        console.log(`✅ Found ${specificSlots.length} slots`);
        setSlots(specificSlots);
        setMessage(`✅ Loaded ${specificSlots.length} slots`);
      } else {
        setMessage(`❌ Failed to fetch slots: ${data.message}`);
      }

    } catch (error: any) {
      console.error('❌ Error fetching slots:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (slotId: string) => {
    try {
      setDeleting(slotId);
      setMessage('');

      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      if (!token) {
        setMessage('❌ Authentication required');
        return;
      }

      console.log('🗑️ Deleting slot:', slotId);

      // Get current availability
      const getResponse = await fetch('http://localhost:5000/api/availability', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!getResponse.ok) {
        setMessage('❌ Failed to get current availability');
        return;
      }

      const currentData = await getResponse.json();
      if (!currentData.success) {
        setMessage(`❌ Failed to get availability: ${currentData.message}`);
        return;
      }

      // Remove the slot from specificSlots array
      const updatedSlots = currentData.availability.specificSlots.filter(
        (slot: any) => slot._id !== slotId
      );

      console.log(`📝 Updating slots: ${currentData.availability.specificSlots.length} -> ${updatedSlots.length}`);

      // Update availability
      const updateResponse = await fetch('http://localhost:5000/api/availability', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weeklySlots: currentData.availability.weeklySlots,
          specificSlots: updatedSlots
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        setMessage(`❌ Failed to delete slot: ${errorData.message}`);
        return;
      }

      const updateData = await updateResponse.json();
      console.log('✅ Delete response:', updateData);

      if (updateData.success) {
        setMessage(`✅ Slot deleted successfully! Total slots: ${updateData.availability.specificSlots.length}`);
        // Refresh the slots list
        await fetchSlots();
      } else {
        setMessage(`❌ Failed to delete slot: ${updateData.message}`);
      }

    } catch (error: any) {
      console.error('❌ Error deleting slot:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setDeleting(null);
    }
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

  const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isSlotInPast = (dateString: string, startTime: string): boolean => {
    const now = new Date();
    const slotDate = new Date(dateString);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (slotDate < today) return true;
    
    if (slotDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const slotStartTime = new Date(today);
      slotStartTime.setHours(hours, minutes, 0, 0);
      return slotStartTime <= now;
    }
    
    return false;
  };

  const groupSlotsByDate = () => {
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

  const groupedSlots = groupSlotsByDate();
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          My Floated Slots
        </h2>
        
        <button
          onClick={fetchSlots}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{slots.length}</div>
          <div className="text-sm text-gray-600">Total Slots</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {slots.filter(slot => !slot.isBooked).length}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {slots.filter(slot => slot.isBooked).length}
          </div>
          <div className="text-sm text-gray-600">Booked</div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Slots List */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Slots Found</h3>
          <p className="text-gray-600">You haven't floated any time slots yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {formatDate(date)}
                </h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {groupedSlots[date].map((slot) => {
                    const isPast = isSlotInPast(slot.date, slot.startTime);
                    const isDeleting = deleting === slot._id;
                    
                    return (
                      <div 
                        key={slot._id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          slot.isBooked 
                            ? 'border-red-200 bg-red-50' 
                            : isPast 
                              ? 'border-gray-200 bg-gray-50' 
                              : 'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            slot.isBooked 
                              ? 'bg-red-100 text-red-600' 
                              : isPast 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-green-100 text-green-600'
                          }`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <span>{slot.duration} minutes</span>
                              <span className="text-gray-400">•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                slot.isBooked 
                                  ? 'bg-red-100 text-red-700' 
                                  : isPast 
                                    ? 'bg-gray-100 text-gray-700' 
                                    : 'bg-green-100 text-green-700'
                              }`}>
                                {slot.isBooked ? 'Booked' : isPast ? 'Past' : 'Available'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {slot.isBooked && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>Cannot Delete</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => deleteSlot(slot._id)}
                            disabled={slot.isBooked || isDeleting}
                            className={`p-2 rounded-lg transition-colors ${
                              slot.isBooked 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                            title={slot.isBooked ? 'Cannot delete booked slots' : 'Delete slot'}
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Slot Management</p>
            <ul className="text-blue-700 space-y-1">
              <li>• You can delete available slots that haven't been booked</li>
              <li>• Booked slots cannot be deleted (contact support if needed)</li>
              <li>• Deleted slots will immediately disappear from your profile</li>
              <li>• Past slots are shown for reference but cannot be deleted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}