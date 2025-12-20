import { API_CONFIG, getHeaders } from '../config';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  try {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_CONFIG.BASE_URL}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        ...getHeaders(),
        ...headers
      }
    };

    if (body && method !== 'GET') {
      console.log('API call body before stringify:', body);
      config.body = JSON.stringify(body);
      console.log('API call body after stringify:', config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(data.message || data.error || `API request failed with status ${response.status}`);
    }

    return data;

  } catch (error: any) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  signup: (data: any) => apiCall('/auth/signup', { method: 'POST', body: data }),
  login: (data: any) => apiCall('/auth/login', { method: 'POST', body: data }),
  sendOTP: (email: string) => apiCall('/auth/send-otp', { method: 'POST', body: { email } }),
  verifyOTP: (email: string, otp: string) => apiCall('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
  adminLogin: (data: any) => {
    console.log('API adminLogin called with:', data);
    return apiCall('/auth/admin-login', { method: 'POST', body: data });
  }
};

// User APIs
export const userAPI = {
  getUser: (id: string) => apiCall(`/users/${id}`),
  getUserByEmail: (email: string) => apiCall(`/users/email/${email}`),
  getAllUsers: (filters?: any) => apiCall(`/users${filters ? `?${new URLSearchParams(filters)}` : ''}`),
  updateUser: (id: string, data: any) => apiCall(`/users/${id}`, { method: 'PUT', body: data })
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data: any) => apiCall('/bookings', { method: 'POST', body: data }),
  getUserBookings: (userId: string, userType: string) => apiCall(`/bookings/user/${userId}?userType=${userType}`),
  getBooking: (id: string) => apiCall(`/bookings/${id}`),
  updateBookingStatus: (id: string, status: string, cancelledBy?: string) => 
    apiCall(`/bookings/${id}/status`, { method: 'PUT', body: { status, cancelledBy } }),
  getAllBookings: () => apiCall('/bookings'),
  deleteBooking: (id: string) => apiCall(`/bookings/${id}`, { method: 'DELETE' })
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data: any) => apiCall('/payments/create-order', { method: 'POST', body: data }),
  verifyPayment: (data: any) => apiCall('/payments/verify', { method: 'POST', body: data }),
  getUserPayments: (userId: string) => apiCall(`/payments/user/${userId}`),
  getMentorEarnings: (mentorId: string) => apiCall(`/payments/mentor/${mentorId}/earnings`),
  processRefund: (data: any) => apiCall('/payments/refund', { method: 'POST', body: data }),
  processPayout: (data: any) => apiCall('/payments/payout', { method: 'POST', body: data }),
  getAllPayments: () => apiCall('/payments')
};

// Session APIs
export const sessionAPI = {
  createSession: (data: any) => apiCall('/sessions', { method: 'POST', body: data }),
  getSessionByBooking: (bookingId: string) => apiCall(`/sessions/booking/${bookingId}`),
  startSession: (id: string) => apiCall(`/sessions/${id}/start`, { method: 'PUT' }),
  endSession: (id: string) => apiCall(`/sessions/${id}/end`, { method: 'PUT' }),
  getUserSessions: (userId: string) => apiCall(`/sessions/user/${userId}`),
  getAllSessions: () => apiCall('/sessions'),
  submitFeedback: (sessionId: string, feedback: { rating: number; review: string }) => 
    apiCall(`/sessions/${sessionId}/feedback`, { method: 'POST', body: feedback }),
  completeWithFeedback: (sessionId: string) => 
    apiCall(`/sessions/${sessionId}/complete-with-feedback`, { method: 'PUT' }),
  forceComplete: (sessionId: string, reason?: string) => 
    apiCall(`/sessions/${sessionId}/force-complete`, { method: 'PUT', body: { reason } }),
  getAttendance: (sessionId: string) => apiCall(`/sessions/${sessionId}/attendance`)
};

// Master Class APIs
export const masterClassAPI = {
  create: (data: any) => apiCall('/masterclass', { method: 'POST', body: data }),
  getAll: (filters?: any) => apiCall(`/masterclass${filters ? `?${new URLSearchParams(filters)}` : ''}`),
  getById: (id: string) => apiCall(`/masterclass/${id}`),
  enroll: (id: string) => apiCall(`/masterclass/${id}/enroll`, { method: 'POST' }),
  update: (id: string, data: any) => apiCall(`/masterclass/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiCall(`/masterclass/${id}`, { method: 'DELETE' })
};

// Resource APIs
export const resourceAPI = {
  create: (data: any) => apiCall('/resources', { method: 'POST', body: data }),
  getAll: (filters?: any) => apiCall(`/resources${filters ? `?${new URLSearchParams(filters)}` : ''}`),
  getById: (id: string) => apiCall(`/resources/${id}`),
  like: (id: string) => apiCall(`/resources/${id}/like`, { method: 'POST' }),
  trackDownload: (id: string) => apiCall(`/resources/${id}/download`, { method: 'POST' }),
  delete: (id: string) => apiCall(`/resources/${id}`, { method: 'DELETE' })
};

// Admin APIs
export const adminAPI = {
  getStats: () => apiCall('/admin/stats'),
  getAllUsers: (filters?: any) => apiCall(`/admin/users${filters ? `?${new URLSearchParams(filters)}` : ''}`),
  getPendingApprovals: () => apiCall('/admin/users/pending-approval'),
  approveUser: (id: string) => apiCall(`/admin/users/${id}/approve`, { method: 'PUT' }),
  rejectUser: (id: string, reason?: string) => apiCall(`/admin/users/${id}/reject`, { method: 'PUT', body: { reason } }),
  deleteUser: (id: string) => apiCall(`/admin/users/${id}`, { method: 'DELETE' }),
  getAllBookings: () => apiCall('/admin/bookings'),
  deleteBooking: (id: string) => apiCall(`/admin/bookings/${id}`, { method: 'DELETE' }),
  getPendingPayouts: () => apiCall('/admin/payments/pending-payouts'),
  processPayout: (data: any) => apiCall('/admin/payments/process-payout', { method: 'POST', body: data }),
  getAllPosts: () => apiCall('/admin/posts'),
  deletePost: (id: string) => apiCall(`/admin/posts/${id}`, { method: 'DELETE' }),
  getAllFeedbacks: () => apiCall('/admin/feedbacks'),
  deleteFeedback: (id: string) => apiCall(`/admin/feedbacks/${id}`, { method: 'DELETE' }),
  getAllReports: (filters?: any) => apiCall(`/admin/reports${filters ? `?${new URLSearchParams(filters)}` : ''}`),
  respondToReport: (id: string, response: string, status: string) => 
    apiCall(`/admin/reports/${id}/respond`, { method: 'PUT', body: { response, status } }),
  updateUserPrice: (userId: string, hourlyRate: number) => 
    apiCall(`/admin/users/${userId}/price`, { method: 'PUT', body: { hourlyRate } }),
  updateUserScorecard: (userId: string, scorecardUrl: string) => 
    apiCall(`/admin/users/${userId}/scorecard`, { method: 'PUT', body: { scorecardUrl } }),
  
  // Exam Price Management
  getExamPrices: () => apiCall('/admin/exam-prices'),
  createExamPrice: (data: any) => apiCall('/admin/exam-prices', { method: 'POST', body: data }),
  updateExamPrice: (id: string, data: any) => apiCall(`/admin/exam-prices/${id}`, { method: 'PUT', body: data }),
  deleteExamPrice: (id: string) => apiCall(`/admin/exam-prices/${id}`, { method: 'DELETE' })
};

// Feedback APIs
export const feedbackAPI = {
  submit: (data: any) => apiCall('/feedback', { method: 'POST', body: data }),
  getUserFeedbacks: (userId: string) => apiCall(`/feedback/user/${userId}`),
  getAll: () => apiCall('/feedback')
};

// Report APIs
export const reportAPI = {
  create: (data: any) => apiCall('/reports', { method: 'POST', body: data }),
  getUserReports: (userId: string) => apiCall(`/reports/user/${userId}`),
  getAll: (filters?: any) => apiCall(`/reports${filters ? `?${new URLSearchParams(filters)}` : ''}`)
};

// Mentor Post APIs
export const mentorPostAPI = {
  create: (data: any) => apiCall('/mentorposts', { method: 'POST', body: data }),
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString());
        }
      });
    }
    const queryString = params.toString();
    console.log('🔗 MentorPost API URL:', `/mentorposts${queryString ? `?${queryString}` : ''}`);
    return apiCall(`/mentorposts${queryString ? `?${queryString}` : ''}`);
  },
  like: (id: string) => apiCall(`/mentorposts/${id}/like`, { method: 'POST' }),
  delete: (id: string) => apiCall(`/mentorposts/${id}`, { method: 'DELETE' })
};

// Availability APIs
export const availabilityAPI = {
  get: () => apiCall('/availability'),
  update: (data: any) => apiCall('/availability', { method: 'PUT', body: data }),
  getSlots: (startDate: string, endDate: string, userId?: string) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (userId) params.append('userId', userId);
    return apiCall(`/availability/slots?${params}`);
  },
  bookSlot: (data: any) => apiCall('/availability/book-slot', { method: 'POST', body: data }),
  unbookSlot: (data: any) => apiCall('/availability/unbook-slot', { method: 'POST', body: data })
};

// Follow APIs
export const followAPI = {
  follow: (userId: string) => apiCall(`/follow/${userId}`, { method: 'POST' }),
  unfollow: (userId: string) => apiCall(`/follow/${userId}`, { method: 'DELETE' }),
  getFollowers: (userId: string) => apiCall(`/follow/${userId}/followers`),
  getFollowing: (userId: string) => apiCall(`/follow/${userId}/following`),
  checkFollowStatus: (userId: string, targetUserId: string) => apiCall(`/follow/${userId}/status/${targetUserId}`)
};

// Wallet APIs
export const walletAPI = {
  getWallet: (userId: string) => apiCall(`/wallets/user/${userId}`),
  topup: (data: any) => apiCall('/wallets/topup', { method: 'POST', body: data }),
  getWithdrawals: (userId: string) => apiCall(`/wallets/withdrawals/${userId}`),
  requestWithdrawal: (data: any) => apiCall('/wallets/withdrawal', { method: 'POST', body: data }),
  updateBankDetails: (userId: string, bankDetails: any) => apiCall(`/wallets/bank-details/${userId}`, { method: 'PUT', body: { bankDetails } })
};