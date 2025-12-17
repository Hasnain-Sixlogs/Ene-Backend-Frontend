// Pastor Requests Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  PastorRequestsListResponse,
  PastorRequestDetailResponse,
  UpdatePastorRequestStatusRequest,
  UpdatePastorRequestStatusResponse,
  PastorRequestsListParams,
} from '@/types/pastorRequests';

/**
 * Get all pastor requests with pagination and filters
 */
export const getPastorRequests = async (
  params?: PastorRequestsListParams
): Promise<PastorRequestsListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.PASTOR_REQUESTS.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch pastor requests');
  }

  return response.json();
};

/**
 * Get pastor request by ID
 */
export const getPastorRequestById = async (id: string): Promise<PastorRequestDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.PASTOR_REQUESTS.BY_ID(id)), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch pastor request');
  }

  return response.json();
};

/**
 * Update pastor request status
 */
export const updatePastorRequestStatus = async (
  id: string,
  status: UpdatePastorRequestStatusRequest
): Promise<UpdatePastorRequestStatusResponse> => {
  const response = await authenticatedFetch(
    getApiUrl(API_ENDPOINTS.PASTOR_REQUESTS.UPDATE_STATUS(id)),
    {
      method: 'PUT',
      body: JSON.stringify(status),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update pastor request status');
  }

  return response.json();
};

/**
 * Delete pastor request
 */
export const deletePastorRequest = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.PASTOR_REQUESTS.DELETE(id)), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete pastor request');
  }
};

