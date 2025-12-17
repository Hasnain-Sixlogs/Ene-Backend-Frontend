// Video Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  VideoStatsResponse,
  VideosListResponse,
  VideoResponse,
  CreateVideoRequest,
  CreateVideoResponse,
  UpdateVideoRequest,
  UpdateVideoResponse,
  UpdateVideoStatusRequest,
  DeleteVideoResponse,
  IncrementViewResponse,
  GetVideosParams,
} from '@/types/video';

// Admin: Get video statistics
export const getVideoStats = async (): Promise<VideoStatsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.ADMIN_VIDEOS.STATS), {
    method: 'GET',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch video statistics');
  }
  return response.json();
};

// Admin: Get all videos with filters
export const getAdminVideos = async (params?: GetVideosParams): Promise<VideosListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.ADMIN_VIDEOS.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch videos');
  }
  return response.json();
};

// Admin: Get video by ID
export const getAdminVideoById = async (id: string): Promise<VideoResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.ADMIN_VIDEOS.BY_ID(id)), {
    method: 'GET',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch video');
  }
  return response.json();
};

// Admin: Create video
export const createVideo = async (data: CreateVideoRequest): Promise<CreateVideoResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.ADMIN_VIDEOS.CREATE), {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create video');
  }
  return response.json();
};

// Admin: Update video
export const updateVideo = async (id: string, data: UpdateVideoRequest): Promise<UpdateVideoResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.ADMIN_VIDEOS.UPDATE(id)), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update video');
  }
  return response.json();
};

// Admin: Update video status
export const updateVideoStatus = async (id: string, data: UpdateVideoStatusRequest): Promise<UpdateVideoResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.ADMIN_VIDEOS.UPDATE_STATUS(id)), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update video status');
  }
  return response.json();
};

// Admin: Delete video
export const deleteVideo = async (id: string): Promise<DeleteVideoResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.ADMIN_VIDEOS.DELETE(id)), {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete video');
  }
  return response.json();
};

// User: Get all published videos
export const getVideos = async (params?: GetVideosParams): Promise<VideosListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.VIDEOS.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch videos');
  }
  return response.json();
};

// User: Get published video by ID
export const getVideoById = async (id: string): Promise<VideoResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.VIDEOS.BY_ID(id)), {
    method: 'GET',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch video');
  }
  return response.json();
};

// User: Increment video view count
export const incrementVideoView = async (id: string): Promise<IncrementViewResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.VIDEOS.INCREMENT_VIEW(id)), {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to increment video view');
  }
  return response.json();
};

