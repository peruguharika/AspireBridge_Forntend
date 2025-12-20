import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { reportAPI } from '../utils/api';

interface MyReportsProps {
  userId: string;
}

export function MyReports({ userId }: MyReportsProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [userId]);

  const fetchReports = async () => {
    try {
      const response = await reportAPI.getUserReports(userId);
      if (response.success) {
        setReports(response.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = selectedStatus === 'all' 
    ? reports 
    : reports.filter(r => r.status === selectedStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'in-progress':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reports</h2>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'pending', 'in-progress', 'resolved', 'closed'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">
                  {getStatusIcon(report.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{report.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${getPriorityColor(report.priority)}`}>
                      {report.priority} priority
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{report.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Category: {report.category}</span>
                    <span>•</span>
                    <span>Reported: {new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.sessionId && (
                      <>
                        <span>•</span>
                        <span>Session ID: {report.sessionId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Response */}
            {report.adminResponse && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Admin Response:</p>
                    <p className="text-gray-700">{report.adminResponse}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Responded on {new Date(report.respondedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* No Reports */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {selectedStatus === 'all' ? 'No reports found' : `No ${selectedStatus} reports`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}