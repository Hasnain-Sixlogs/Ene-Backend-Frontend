// Users Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  UsersListResponse,
  UserDetailResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UsersListParams,
} from '@/types/users';

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (params?: UsersListParams): Promise<UsersListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.USERS.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch users');
  }

  return response.json();
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<UserDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.USERS.BY_ID(id)), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user');
  }

  return response.json();
};

/**
 * Update user
 * Supports both JSON data and FormData (for file uploads)
 */
export const updateUser = async (
  id: string,
  data: UpdateUserRequest | FormData
): Promise<UpdateUserResponse> => {
  // If data is FormData, send as-is (for file uploads)
  // Otherwise, stringify JSON data
  const body = data instanceof FormData ? data : JSON.stringify(data);
  
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.USERS.UPDATE(id)), {
    method: 'PUT',
    body,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }

  return response.json();
};

