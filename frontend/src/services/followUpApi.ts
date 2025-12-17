// Follow-Up Requests Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  FollowUpStatsResponse,
  FollowUpRequestsListResponse,
  FollowUpRequestDetailResponse,
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
  UpdateFollowUpRequestStatus,
  FollowUpRequestsListParams,
} from '@/types/followUp';

/**
 * Get follow-up statistics
 */
export const getFollowUpStats = async (): Promise<FollowUpStatsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.FOLLOW_UP.STATS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch follow-up statistics');
  }

  return response.json();
};

/**
 * Get all follow-up requests with pagination and filters
 */
export const getFollowUpRequests = async (
  params?: FollowUpRequestsListParams
): Promise<FollowUpRequestsListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.FOLLOW_UP.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch follow-up requests');
  }

  return response.json();
};

/**
 * Create follow-up request
 */
export const createFollowUpRequest = async (
  data: CreateFollowUpRequest
): Promise<FollowUpRequestDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.FOLLOW_UP.CREATE), {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create follow-up request');
  }

  return response.json();
};

/**
 * Get follow-up request by ID
 */
export const getFollowUpRequestById = async (id: string): Promise<FollowUpRequestDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.FOLLOW_UP.BY_ID(id)), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch follow-up request');
  }

  return response.json();
};

/**
 * Update follow-up request
 */
export const updateFollowUpRequest = async (
  id: string,
  data: UpdateFollowUpRequest
): Promise<FollowUpRequestDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.FOLLOW_UP.UPDATE(id)), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update follow-up request');
  }

  return response.json();
};

/**
 * Update follow-up request status
 */
export const updateFollowUpRequestStatus = async (
  id: string,
  status: UpdateFollowUpRequestStatus
): Promise<FollowUpRequestDetailResponse> => {
  const response = await authenticatedFetch(
    getApiUrl(API_ENDPOINTS.FOLLOW_UP.UPDATE_STATUS(id)),
    {
      method: 'PUT',
      body: JSON.stringify(status),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update follow-up request status');
  }

  return response.json();
};

/**
 * Delete follow-up request
 */
export const deleteFollowUpRequest = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.FOLLOW_UP.DELETE(id)), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete follow-up request');
  }
};

