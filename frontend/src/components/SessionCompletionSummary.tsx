import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Star, User, Calendar } from 'lucide-react';

interface SessionCompletionSummaryProps {
  sessionId: string;
  userType: 'aspirant' | 'achiever';
}

interface AttendanceData {
  session: {
    id: string;
    status: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    actualStartTime: string;
    actualEndTime: string;
    aspirantAttendanceDuration: number;
    achieverAttendanceDuration: number;
    minimumAttendanceRequired: number;
    attendanceRequirementMet: boolean;
    aspirantFeedback: {
      rating: number;
      review: string;
      submittedAt: string;
    };
    achieverFeedback: {
      rating: number;
      review: string;
      submittedAt: string;
    };
  };
  attendance: {
    scheduledDuration: number;
    aspirantDuration: number;
    achieverDuration: number;
    minimumRequired: number;
  };
}

export function SessionCompletionSummary({ sessionId, userType }: SessionCompletionSummaryProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, [sessionId]);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAttendanceData(data);
      } else {
        setError(data.message || 'Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return null;
  }

  const { session, attendance } = attendanceData;
  const isAspirant = userType === 'aspirant';
  const myAttendance = isAspirant ? session.aspirantAttendanceDuration : session.achieverAttendanceDuration;
  const otherAttendance = isAspirant ? session.achieverAttendanceDuration : session.aspirantAttendanceDuration;
  const myFeedback = isAspirant ? session.aspirantFeedback : session.achieverFeedback;
  const otherFeedback = isAspirant ? session.achieverFeedback : session.aspirantFeedback;

  const attendancePercentage = Math.round((myAttendance / attendance.scheduledDuration) * 100);
  const otherAttendancePercentage = Math.round((otherAttendance / attendance.scheduledDuration) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          session.attendanceRequirementMet ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          {session.attendanceRequirementMet ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Session Completed</h3>
          <p className="text-sm text-gray-600">
            {session.attendanceRequirementMet 
              ? 'Payment processed successfully' 
              : 'Payment adjusted based on attendance'}
          </p>
        </div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Scheduled: {formatDateTime(session.scheduledStartTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Duration: {formatDuration(attendance.scheduledDuration)}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium capitalize">{session.status}</span>
          </div>
          <div className="text-sm text-gray-600">
            Minimum Required: <span className="font-medium">{formatDuration(session.minimumAttendanceRequired)}</span>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Attendance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* My Attendance */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Your Attendance</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatDuration(myAttendance)}
            </div>
            <div className="text-sm text-blue-700">
              {attendancePercentage}% of session ({myAttendance >= session.minimumAttendanceRequired ? 'Met requirement' : 'Below requirement'})
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Other Participant's Attendance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">
                {isAspirant ? 'Mentor' : 'Student'} Attendance
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(otherAttendance)}
            </div>
            <div className="text-sm text-gray-700">
              {otherAttendancePercentage}% of session ({otherAttendance >= session.minimumAttendanceRequired ? 'Met requirement' : 'Below requirement'})
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(otherAttendancePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Summary */}
      {(myFeedback?.rating || otherFeedback?.rating) && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Feedback</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* My Feedback */}
            {myFeedback?.rating && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Your Feedback</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= myFeedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-green-700">
                    {myFeedback.rating}/5 stars
                  </span>
                </div>
                {myFeedback.review && (
                  <p className="text-sm text-green-800 italic">"{myFeedback.review}"</p>
                )}
              </div>
            )}

            {/* Other Participant's Feedback */}
            {otherFeedback?.rating && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    {isAspirant ? 'Mentor' : 'Student'} Feedback
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= otherFeedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-purple-700">
                    {otherFeedback.rating}/5 stars
                  </span>
                </div>
                {otherFeedback.review && (
                  <p className="text-sm text-purple-800 italic">"{otherFeedback.review}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="border-t pt-4">
        <div className={`p-4 rounded-lg ${
          session.attendanceRequirementMet 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            {session.attendanceRequirementMet ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p className={`font-medium ${
                session.attendanceRequirementMet ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {session.attendanceRequirementMet 
                  ? 'Full Payment Processed' 
                  : 'Partial Payment/Refund Processed'}
              </p>
              <p className={`text-sm ${
                session.attendanceRequirementMet ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {session.attendanceRequirementMet 
                  ? 'Both participants met the minimum attendance requirement.'
                  : 'Payment adjusted based on actual attendance. Check your wallet for details.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}