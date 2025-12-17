// API Configuration
// Base URL for the backend API
// Swagger Documentation: https://ljs0r9k3-8000.asse.devtunnels.ms/api-docs/#/
// 
// To configure:
// 1. Set VITE_API_BASE_URL in .env file (optional, defaults to the URL above)
// 2. Adjust endpoint paths below to match your Swagger API documentation
// 3. Common endpoint patterns:
//    - /api/auth/login
//    - /auth/login
//    - /admin/login
//    - /api/admin/login

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ljs0r9k3-8000.asse.devtunnels.ms';

// API endpoints - Admin Authentication API
// Documentation: https://ljs0r9k3-8000.asse.devtunnels.ms/api-docs/#/
export const API_ENDPOINTS = {
  // Admin Authentication endpoints
  AUTH: {
    LOGIN: '/api/v2/admin/signin', // POST - Admin login endpoint
    LOGOUT: '/api/v2/admin/logout', // POST - Logout endpoint
    REFRESH: '/api/v2/admin/refresh', // POST - Refresh token endpoint
    ME: '/api/v2/admin/me', // GET - Get current admin info
    FORGOT_PASSWORD: '/api/v2/admin/forgot-password', // POST - Request password reset
    RESET_PASSWORD: '/api/v2/admin/reset-password', // POST - Reset password with token
  },
  // Dashboard endpoints
  DASHBOARD: {
    STATS: '/api/v2/admin/dashboard/stats', // GET - Get dashboard statistics
    REGISTRATION_CHART: '/api/v2/admin/dashboard/registration-chart', // GET - Get registration chart data
    SURVEY_RESULTS: '/api/v2/admin/dashboard/survey-results', // GET - Get survey results
    RECENT_USERS: '/api/v2/admin/dashboard/recent-users', // GET - Get recent users
    TOTAL_USERS: '/api/v2/admin/dashboard/total-users', // GET - Get total users count
  },
  // Users Management endpoints
  USERS: {
    LIST: '/api/v2/admin/users', // GET - Get all users
    BY_ID: (id: string) => `/api/v2/admin/users/${id}`, // GET - Get user by ID
    UPDATE: (id: string) => `/api/v2/admin/users/${id}`, // PUT - Update user
  },
  // Pastor Requests endpoints
  PASTOR_REQUESTS: {
    LIST: '/api/v2/admin/pastor-requests', // GET - Get all pastor requests
    BY_ID: (id: string) => `/api/v2/admin/pastor-requests/${id}`, // GET - Get pastor request by ID
    UPDATE_STATUS: (id: string) => `/api/v2/admin/pastor-requests/${id}/status`, // PUT - Update pastor request status
    DELETE: (id: string) => `/api/v2/admin/pastor-requests/${id}`, // DELETE - Delete pastor request
  },
  // Follow-Up Requests endpoints
  FOLLOW_UP: {
    STATS: '/api/v2/admin/follow-up-requests/stats', // GET - Get follow-up statistics
    LIST: '/api/v2/admin/follow-up-requests', // GET - Get all follow-up requests
    CREATE: '/api/v2/admin/follow-up-requests', // POST - Create follow-up request
    BY_ID: (id: string) => `/api/v2/admin/follow-up-requests/${id}`, // GET - Get follow-up request by ID
    UPDATE: (id: string) => `/api/v2/admin/follow-up-requests/${id}`, // PUT - Update follow-up request
    UPDATE_STATUS: (id: string) => `/api/v2/admin/follow-up-requests/${id}/status`, // PUT - Update follow-up request status
    DELETE: (id: string) => `/api/v2/admin/follow-up-requests/${id}`, // DELETE - Delete follow-up request
  },
  // Events Management endpoints
  EVENTS: {
    LIST: '/api/v2/events', // GET - Get all events
    CREATE: '/api/v2/events', // POST - Create event
    MY_EVENTS: '/api/v2/events/user/my-events', // GET - Get my events
    BY_ID: (id: string) => `/api/v2/events/${id}`, // GET - Get event by ID
    UPDATE: (id: string) => `/api/v2/events/${id}`, // PUT - Update event
    UPDATE_STATUS: (id: string) => `/api/v2/events/${id}/status`, // PUT - Update event status
    DELETE: (id: string) => `/api/v2/events/${id}`, // DELETE - Delete event
  },
  // Church Management endpoints
  CHURCHES: {
    STATS: '/api/v2/admin/churches/stats', // GET - Get church statistics
    LIST: '/api/v2/admin/churches', // GET - Get all churches
    BY_ID: (id: string) => `/api/v2/admin/churches/${id}`, // GET - Get church by ID
    UPDATE: (id: string) => `/api/v2/admin/churches/${id}`, // PUT - Update church
    DELETE: (id: string) => `/api/v2/admin/churches/${id}`, // DELETE - Delete church
  },
  // Prayer Requests endpoints
  PRAYER_REQUESTS: {
    STATS: '/api/v2/admin/prayer-requests/stats', // GET - Get prayer request statistics
    LIST: '/api/v2/admin/prayer-requests', // GET - Get all prayer requests
    BY_ID: (id: string) => `/api/v2/admin/prayer-requests/${id}`, // GET - Get prayer request by ID
    UPDATE: (id: string) => `/api/v2/admin/prayer-requests/${id}`, // PUT - Update prayer request
    UPDATE_STATUS: (id: string) => `/api/v2/admin/prayer-requests/${id}/status`, // PUT - Update prayer request status
    DELETE: (id: string) => `/api/v2/admin/prayer-requests/${id}`, // DELETE - Delete prayer request
  },
  // Chat endpoints
  CHAT: {
    CONVERSATIONS: '/api/v2/chat/conversations', // GET - Get all conversations
    MESSAGES: (userId: string) => `/api/v2/chat/messages/${userId}`, // GET - Get messages for a conversation
    STATS: '/api/v2/chat/stats', // GET - Get chat statistics (Admin only)
    MARK_READ: (userId: string) => `/api/v2/chat/messages/read/${userId}`, // PUT - Mark messages as read
    DELETE_MESSAGE: (messageId: string) => `/api/v2/chat/messages/${messageId}`, // DELETE - Delete a message
  },
  // Video Management endpoints (Admin)
  ADMIN_VIDEOS: {
    STATS: '/api/v2/admin/videos/stats', // GET - Get video statistics
    LIST: '/api/v2/admin/videos', // GET - Get all videos (with filters)
    BY_ID: (id: string) => `/api/v2/admin/videos/${id}`, // GET - Get video by ID
    CREATE: '/api/v2/admin/videos', // POST - Create video
    UPDATE: (id: string) => `/api/v2/admin/videos/${id}`, // PUT - Update video
    UPDATE_STATUS: (id: string) => `/api/v2/admin/videos/${id}/status`, // PUT - Update video status
    DELETE: (id: string) => `/api/v2/admin/videos/${id}`, // DELETE - Delete video
  },
  // Video Management endpoints (User)
  VIDEOS: {
    LIST: '/api/v2/videos', // GET - Get all published videos
    BY_ID: (id: string) => `/api/v2/videos/${id}`, // GET - Get published video by ID
    INCREMENT_VIEW: (id: string) => `/api/v2/videos/${id}/view`, // POST - Increment video view count
  },
} as const;

// Helper to build full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

