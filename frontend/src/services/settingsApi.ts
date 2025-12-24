// Settings Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';

export interface UserSettings {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  bio?: string;
  two_factor_auth: boolean;
  login_alerts: boolean;
  theme: 'light' | 'dark' | 'system';
  compact_mode: boolean;
  animations: boolean;
  [key: string]: any;
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  data: UserSettings;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  profileImage?: File;
}

export interface UpdateSecurityRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  two_factor_auth?: boolean;
  login_alerts?: boolean;
}

export interface UpdateAppearanceRequest {
  theme?: 'light' | 'dark' | 'system';
  compact_mode?: boolean;
  animations?: boolean;
}

/**
 * Get current user settings
 */
export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.SETTINGS.GET), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch settings');
  }

  return response.json();
};

/**
 * Update profile information
 * Supports both JSON data and FormData (for file uploads)
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<SettingsResponse> => {
  let body: FormData | string;
  let headers: HeadersInit = {};

  // If profile image is provided, use FormData
  if (data.profileImage) {
    const formData = new FormData();
    formData.append('profile', data.profileImage);
    formData.append('folder', 'profiles');
    if (data.name) formData.append('name', data.name);
    if (data.bio !== undefined) formData.append('bio', data.bio);
    body = formData;
    // Don't set Content-Type for FormData - browser will set it with boundary
  } else {
    // Regular JSON request
    body = JSON.stringify({
      name: data.name,
      bio: data.bio,
    });
    headers['Content-Type'] = 'application/json';
  }

  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.SETTINGS.UPDATE_PROFILE), {
    method: 'PUT',
    body,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
};

/**
 * Update security settings
 */
export const updateSecurity = async (
  data: UpdateSecurityRequest
): Promise<SettingsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.SETTINGS.UPDATE_SECURITY), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update security settings');
  }

  return response.json();
};

/**
 * Update appearance settings
 */
export const updateAppearance = async (
  data: UpdateAppearanceRequest
): Promise<SettingsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.SETTINGS.UPDATE_APPEARANCE), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update appearance settings');
  }

  return response.json();
};

