// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000
};

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  currency: 'INR',
  name: 'MentorConnect',
  description: 'Mentorship Platform Payment',
  theme: {
    color: '#2563eb'
  }
};

// Zegocloud Configuration
export const ZEGOCLOUD_CONFIG = {
  appId: parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID || '1234567890'),
  serverSecret: import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET || 'your_server_secret'
};

// Feature Flags
export const FEATURES = {
  OTP_VERIFICATION: true,
  VIDEO_CALLS: true,
  MASTER_CLASSES: true,
  RESOURCES_HUB: true,
  PAYMENT_INTEGRATION: true,
  EMAIL_NOTIFICATIONS: true
};

// Auth Token Management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// API Headers
export const getHeaders = () => {
  const token = getAuthToken();
  const adminToken = localStorage.getItem('adminToken');
  const finalToken = adminToken || token;
  console.log('API Headers - authToken:', token ? 'present' : 'none');
  console.log('API Headers - adminToken:', adminToken ? 'present' : 'none');
  console.log('API Headers - finalToken:', finalToken ? 'present' : 'none');
  return {
    'Content-Type': 'application/json',
    ...(finalToken && { 'Authorization': `Bearer ${finalToken}` })
  };
};