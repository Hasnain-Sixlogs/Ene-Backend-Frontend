// Authentication service with API integration
// API Documentation: https://ljs0r9k3-8000.asse.devtunnels.ms/api-docs/#/

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import type { 
  LoginRequest, 
  LoginResponse, 
  ApiError,
  refresh_tokenRequest,
  refresh_tokenResponse,
  MeResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  Admin,
} from '@/types/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

const STORAGE_KEY = 'auth_session';
const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

// Access token expires in 15 minutes (900 seconds)
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

// Helper to get session from localStorage
export const getSession = (): Session | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const session: Session = JSON.parse(stored);
    
    // Check if session is expired
    if (session.expires_at && Date.now() > session.expires_at) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

// Helper to set session in localStorage
const setSession = (session: Session | null): void => {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_STORAGE_KEY, session.access_token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, session.refresh_token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
  // Dispatch custom event for same-tab listeners
  window.dispatchEvent(new Event('auth-state-change'));
};

// Get refresh token
export const getrefresh_token = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

// Get access token for API requests
export const getAccessToken = (): string | null => {
  const session = getSession();
  return session?.access_token || localStorage.getItem(TOKEN_STORAGE_KEY);
};

// Helper to make authenticated API requests with automatic token refresh
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = getAccessToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Only set Content-Type for non-FormData requests
  // FormData will set Content-Type automatically with boundary
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  let response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If token expired (401), try to refresh it
  if (response.status === 401 && token) {
    const refreshResult = await refreshAccessToken();
    if (refreshResult.error === null && refreshResult.accessToken) {
      // Retry the request with new token
      headers.set('Authorization', `Bearer ${refreshResult.accessToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }
  
  return response;
};

// Refresh access token using refresh token
export const refreshAccessToken = async (): Promise<{ accessToken: string | null; error: Error | null }> => {
  try {
    const refresh_token = getrefresh_token();
    if (!refresh_token) {
      return { accessToken: null, error: new Error('No refresh token found') };
    }

    const request: refresh_tokenRequest = {
      refresh_token,
    };

    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.REFRESH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const apiError = data as ApiError;
      const errorMessage = apiError.message || 'Failed to refresh token';
      
      // If refresh token is invalid, clear session
      if (response.status === 401) {
        setSession(null);
      }
      
      return { accessToken: null, error: new Error(errorMessage) };
    }

    const refreshResponse = data as refresh_tokenResponse;
    const newAccessToken = refreshResponse.data.accessToken;

    // Update session with new access token
    const session = getSession();
    if (session) {
      const updatedSession: Session = {
        ...session,
        access_token: newAccessToken,
        expires_at: Date.now() + ACCESS_TOKEN_EXPIRY,
      };
      setSession(updatedSession);
    } else {
      // Store token temporarily if no session
      localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken);
    }

    return { accessToken: newAccessToken, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Network error. Please check your connection.';
    return { accessToken: null, error: new Error(errorMessage) };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
  try {
    const loginRequest: LoginRequest = {
      email,
      password,
    };

    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginRequest),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Handle API error response
      const apiError = data as ApiError;
      const errorMessage = apiError.message || 'Login failed';
      return { error: new Error(errorMessage) };
    }

    // Handle successful login response
    const loginResponse = data as LoginResponse;
    const admin = loginResponse.data.admin;
    
    // Access token expires in 15 minutes, refresh token in 7 days
    const expiresAt = Date.now() + ACCESS_TOKEN_EXPIRY;

    // Create session from API response
    const session: Session = {
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        created_at: admin.createdAt,
      },
      access_token: loginResponse.data.accessToken,
      refresh_token: loginResponse.data.refresh_token,
      expires_at: expiresAt,
    };

    // Store session and tokens
    setSession(session);

    return { error: null };
  } catch (error) {
    // Handle network errors or other exceptions
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Network error. Please check your connection.';
    return { error: new Error(errorMessage) };
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For now, create a session directly
  // In the future, this will call your API
  const session: Session = {
    user: {
      id: Date.now().toString(),
      email: email,
      created_at: new Date().toISOString(),
    },
    access_token: 'mock_token_' + Date.now(),
    expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  setSession(session);
  return { error: null };
};

// Sign out
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const token = getAccessToken();
    
    // Call logout endpoint if token exists
    if (token) {
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Check if logout was successful
        if (!response.ok) {
          const data = await response.json();
          // Log warning but continue with local logout
          console.warn('Logout API call failed:', data.message || 'Unknown error');
        }
      } catch (error) {
        // Continue with local logout even if API call fails
        console.warn('Logout API call failed:', error);
      }
    }
    
    // Clear local storage
    setSession(null);
    
    return { error: null };
  } catch (error) {
    // Even if logout fails, clear local session
    setSession(null);
    return { error: null };
  }
};

// Reset password (forgot password)
export const resetPassword = async (email: string): Promise<{ error: Error | null; resetToken?: string }> => {
  try {
    const request: ForgotPasswordRequest = {
      email,
    };

    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const apiError = data as ApiError;
      const errorMessage = apiError.message || 'Failed to send reset password email';
      return { error: new Error(errorMessage) };
    }

    // In development mode, reset token might be returned
    const resetToken = data.data?.resetToken;
    return { error: null, resetToken };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Network error. Please check your connection.';
    return { error: new Error(errorMessage) };
  }
};

// Update password (set new password)
export const updatePassword = async (
  newPassword: string, 
  confirmPassword: string, 
  token: string
): Promise<{ error: Error | null }> => {
  try {
    const request: ResetPasswordRequest = {
      token,
      newPassword,
      confirmPassword,
    };

    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const apiError = data as ApiError;
      const errorMessage = apiError.message || 'Failed to update password';
      return { error: new Error(errorMessage) };
    }

    return { error: null };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Network error. Please check your connection.';
    return { error: new Error(errorMessage) };
  }
};

// Get current admin info
export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const token = getAccessToken();
    if (!token) {
      return { user: null, error: new Error('No authentication token found') };
    }

    const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.AUTH.ME));

    if (!response.ok) {
      const data = await response.json();
      const apiError = data as ApiError;
      const errorMessage = apiError.message || 'Failed to fetch admin info';
      return { user: null, error: new Error(errorMessage) };
    }

    const data = await response.json();
    const meResponse = data as MeResponse;
    const admin = meResponse.data.admin;

    const user: User = {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      created_at: admin.createdAt,
    };

    // Update session with fresh user data
    const session = getSession();
    if (session) {
      const updatedSession: Session = {
        ...session,
        user,
      };
      setSession(updatedSession);
    }

    return { user, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Network error. Please check your connection.';
    return { user: null, error: new Error(errorMessage) };
  }
};

// Listen for auth state changes (simplified version)
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  // Check initial state
  const session = getSession();
  callback('INITIAL_SESSION', session);
  
  // Listen for storage changes (for multi-tab support)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const session = e.newValue ? JSON.parse(e.newValue) : null;
      callback('SIGNED_IN', session);
    }
  };
  
  // Also listen for custom events (for same-tab changes)
  const handleCustomStorageChange = () => {
    const session = getSession();
    callback('SIGNED_IN', session);
  };
  
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('auth-state-change', handleCustomStorageChange);
  
  // Return unsubscribe function
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          window.removeEventListener('storage', handleStorageChange);
          window.removeEventListener('auth-state-change', handleCustomStorageChange);
        },
      },
    },
  };
};

