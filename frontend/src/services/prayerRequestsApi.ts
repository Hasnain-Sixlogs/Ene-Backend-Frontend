// Prayer Requests Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  PrayerRequestsListResponse,
  PrayerRequestDetailResponse,
  PrayerRequestStatsResponse,
  UpdatePrayerRequestRequest,
  UpdatePrayerRequestResponse,
  UpdatePrayerRequestStatusRequest,
  UpdatePrayerRequestStatusResponse,
  PrayerRequestsListParams,
} from '@/types/prayerRequests';

/**
 * Get prayer request statistics
 */
export const getPrayerRequestStats = async (): Promise<PrayerRequestStatsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.PRAYER_REQUESTS.STATS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch prayer request statistics');
  }

  return response.json();
};

/**
 * Get all prayer requests with pagination and filters
 */
export const getPrayerRequests = async (
  params?: PrayerRequestsListParams
): Promise<PrayerRequestsListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.PRAYER_REQUESTS.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch prayer requests');
  }

  return response.json();
};

/**
 * Get prayer request by ID
 */
export const getPrayerRequestById = async (id: string): Promise<PrayerRequestDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.PRAYER_REQUESTS.BY_ID(id)), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch prayer request');
  }

  return response.json();
};

/**
 * Update a prayer request
 */
export const updatePrayerRequest = async (
  id: string,
  requestData: UpdatePrayerRequestRequest
): Promise<UpdatePrayerRequestResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.PRAYER_REQUESTS.UPDATE(id)), {
    method: 'PUT',
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update prayer request');
  }

  return response.json();
};

/**
 * Update prayer request status
 */
export const updatePrayerRequestStatus = async (
  id: string,
  status: UpdatePrayerRequestStatusRequest
): Promise<UpdatePrayerRequestStatusResponse> => {
  const response = await authenticatedFetch(
    getApiUrl(API_ENDPOINTS.PRAYER_REQUESTS.UPDATE_STATUS(id)),
    {
      method: 'PUT',
      body: JSON.stringify(status),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update prayer request status');
  }

  return response.json();
};

/**
 * Delete prayer request
 */
export const deletePrayerRequest = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.PRAYER_REQUESTS.DELETE(id)), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete prayer request');
  }
};
