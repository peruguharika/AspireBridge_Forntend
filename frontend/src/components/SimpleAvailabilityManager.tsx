import { useState, useEffect } from 'react';
import { Clock, Plus, Save } from 'lucide-react';

interface SimpleAvailabilityManagerProps {
  userId: string;
}

export function SimpleAvailabilityManager({ userId }: SimpleAvailabilityManagerProps) {
  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '22:30',
    endTime: '23:00'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const addSlot = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      console.log('🚀 Adding slot:', newSlot);
      
      // Get auth token
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      if (!token) {
        setMessage('❌ No authentication token found. Please log in again.');
        return;
      }
      
      console.log('🔐 Token found:', !!token);
      
      // Calculate duration
      const start = new Date(`2000-01-01T${newSlot.startTime}:00`);
      const end = new Date(`2000-01-01T${newSlot.endTime}:00`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      
      if (duration <= 0) {
        setMessage('❌ End time must be after start time');
        return;
      }
      
      // Get current availability
      console.log('📅 Getting current availability...');
      const getResponse = await fetch('http://localhost:5000/api/availability', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!getResponse.ok) {
        const errorData = await getResponse.json();
        setMessage(`❌ Failed to get availability: ${errorData.message}`);
        return;
      }
      
      const availabilityData = await getResponse.json();
      console.log('📋 Current availability:', availabilityData);
      
      if (!availabilityData.success) {
        setMessage(`❌ Failed to get availability: ${availabilityData.message}`);
        return;
      }
      
      // Add new slot
      const newSlotData = {
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        duration: duration
      };
      
      const updatedSlots = [...availabilityData.availability.specificSlots, newSlotData];
      
      console.log('💾 Saving updated availability...');
      const updateResponse = await fetch('http://localhost:5000/api/availability', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weeklySlots: availabilityData.availability.weeklySlots,
          specificSlots: updatedSlots
        })
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        setMessage(`❌ Failed to save: ${errorData.message}`);
        return;
      }
      
      const updateData = await updateResponse.json();
      console.log('✅ Save response:', updateData);
      
      if (updateData.success) {
        setMessage(`✅ Slot added successfully! Total slots: ${updateData.availability.specificSlots.length}`);
        // Reset form
        const nextTime = new Date();
        nextTime.setMinutes(nextTime.getMinutes() + 30);
        const nextTimeStr = nextTime.getHours().toString().padStart(2, '0') + ':' + 
                           nextTime.getMinutes().toString().padStart(2, '0');
        const nextEndTime = new Date(nextTime.getTime() + 30 * 60000);
        const nextEndTimeStr = nextEndTime.getHours().toString().padStart(2, '0') + ':' + 
                              nextEndTime.getMinutes().toString().padStart(2, '0');
        
        setNewSlot({
          date: new Date().toISOString().split('T')[0],
          startTime: nextTimeStr,
          endTime: nextEndTimeStr
        });
      } else {
        setMessage(`❌ Save failed: ${updateData.message}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Quick Add Slot
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={newSlot.date}
            onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={addSlot}
          disabled={saving}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
            saving 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Slot
            </>
          )}
        </button>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}