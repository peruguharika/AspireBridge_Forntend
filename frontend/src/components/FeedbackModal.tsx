import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { feedbackAPI } from '../utils/api';

interface FeedbackModalProps {
  sessionId: string;
  mentorId: string;
  mentorName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function FeedbackModal({ sessionId, mentorId, mentorName, onClose, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState({
    communication: 5,
    knowledge: 5,
    punctuality: 5,
    helpful: 5,
    comments: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      await feedbackAPI.submit({
        sessionId,
        mentorId,
        rating,
        ...feedback
      });
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rate Your Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="text-center">
            <p className="text-gray-700 mb-4">How was your session with {mentorName}?</p>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {rating === 0 ? 'Click to rate' : 
               rating === 1 ? 'Poor' :
               rating === 2 ? 'Fair' :
               rating === 3 ? 'Good' :
               rating === 4 ? 'Very Good' :
               'Excellent'}
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Detailed Feedback</h3>
            
            {[
              { key: 'communication', label: 'Communication Skills' },
              { key: 'knowledge', label: 'Subject Knowledge' },
              { key: 'punctuality', label: 'Punctuality' },
              { key: 'helpful', label: 'Overall Helpfulness' }
            ].map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <span className="text-sm text-gray-600">{feedback[key as keyof typeof feedback]}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={feedback[key as keyof typeof feedback]}
                  onChange={(e) => setFeedback({ ...feedback, [key]: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your experience..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}