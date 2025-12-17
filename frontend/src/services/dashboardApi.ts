// Dashboard API Service
// Documentation: https://ljs0r9k3-8000.asse.devtunnels.ms/api-docs/#/

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  DashboardStatsResponse,
  RegistrationChartResponse,
  SurveyResultsResponse,
  RecentUsersResponse,
  TotalUsersResponse,
  RecentUsersParams,
  RegistrationChartParams,
} from '@/types/dashboard';

/**
 * Get dashboard statistics
 * @returns Promise with dashboard stats
 */
export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.DASHBOARD.STATS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch dashboard statistics');
  }

  return response.json();
};

/**
 * Get registration chart data
 * @param params - Query parameters (year)
 * @returns Promise with registration chart data
 */
export const getRegistrationChart = async (
  params?: RegistrationChartParams
): Promise<RegistrationChartResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.year) {
    queryParams.append('year', params.year.toString());
  }

  const url = `${getApiUrl(API_ENDPOINTS.DASHBOARD.REGISTRATION_CHART)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch registration chart data');
  }

  return response.json();
};

/**
 * Get survey results
 * @returns Promise with survey results
 */
export const getSurveyResults = async (): Promise<SurveyResultsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.DASHBOARD.SURVEY_RESULTS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch survey results');
  }

  return response.json();
};

/**
 * Get recent users
 * @param params - Query parameters (page, limit, search, sortBy, sortOrder)
 * @returns Promise with recent users data
 */
export const getRecentUsers = async (
  params?: RecentUsersParams
): Promise<RecentUsersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params?.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder);
  }

  const url = `${getApiUrl(API_ENDPOINTS.DASHBOARD.RECENT_USERS)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recent users');
  }

  return response.json();
};

/**
 * Get total users count
 * @returns Promise with total users count
 */
export const getTotalUsers = async (): Promise<TotalUsersResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.DASHBOARD.TOTAL_USERS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch total users count');
  }

  return response.json();
};

