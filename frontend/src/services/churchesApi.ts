// Church Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  ChurchesListResponse,
  ChurchDetailResponse,
  ChurchStatsResponse,
  UpdateChurchRequest,
  UpdateChurchResponse,
  CreateChurchRequest,
  CreateChurchResponse,
  ChurchesListParams,
} from '@/types/churches';

/**
 * Get church statistics
 */
export const getChurchStats = async (): Promise<ChurchStatsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHURCHES.STATS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch church statistics');
  }

  return response.json();
};

/**
 * Get all churches with pagination and filters
 */
export const getChurches = async (
  params?: ChurchesListParams
): Promise<ChurchesListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.CHURCHES.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch churches');
  }

  return response.json();
};

/**
 * Get church by ID
 */
export const getChurchById = async (id: string): Promise<ChurchDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHURCHES.BY_ID(id)), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch church');
  }

  return response.json();
};

/**
 * Update a church
 */
export const updateChurch = async (
  id: string,
  churchData: UpdateChurchRequest
): Promise<UpdateChurchResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHURCHES.UPDATE(id)), {
    method: 'PUT',
    body: JSON.stringify(churchData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update church');
  }

  return response.json();
};

/**
 * Create a church (admin only)
 */
export const createChurch = async (
  churchData: CreateChurchRequest
): Promise<CreateChurchResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHURCHES.CREATE), {
    method: 'POST',
    body: JSON.stringify(churchData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create church');
  }

  return response.json();
};

/**
 * Delete a church
 */
export const deleteChurch = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHURCHES.DELETE(id)), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete church');
  }
};

