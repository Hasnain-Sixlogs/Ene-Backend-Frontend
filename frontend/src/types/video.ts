// Video Management Types

export type VideoCategory = 'Sermon' | 'Worship' | 'Teaching' | 'Prayer' | 'Documentary' | 'Other';
export type VideoStatus = 'published' | 'draft';

export interface VideoUploader {
  _id: string;
  name: string;
  email?: string;
  profile?: string;
}

export interface Video {
  _id: string;
  title: string;
  category: VideoCategory;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  duration?: string;
  views: number;
  status: VideoStatus;
  uploadDate: string;
  uploadedBy: VideoUploader;
  createdAt: string;
  updatedAt: string;
}

export interface VideoWithSno extends Video {
  sno: number;
}

export interface VideoStats {
  totalVideos: number;
  published: number;
  drafts: number;
  totalViews: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API Request Types
export interface CreateVideoRequest {
  title: string;
  category: VideoCategory;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  duration?: string;
  status?: VideoStatus;
}

export interface UpdateVideoRequest {
  title?: string;
  category?: VideoCategory;
  video_url?: string;
  thumbnail_url?: string;
  description?: string;
  duration?: string;
}

export interface UpdateVideoStatusRequest {
  status: VideoStatus;
}

export interface GetVideosParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: VideoCategory | 'all';
  status?: VideoStatus | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Response Types
export interface VideoStatsResponse {
  success: boolean;
  message: string;
  data: VideoStats;
}

export interface VideosListResponse {
  success: boolean;
  message: string;
  data: {
    videos: Video[];
    pagination: Pagination;
  };
}

export interface VideoResponse {
  success: boolean;
  message: string;
  data: {
    video: Video;
  };
}

export interface CreateVideoResponse {
  success: boolean;
  message: string;
  data: {
    video: Video;
  };
}

export interface UpdateVideoResponse {
  success: boolean;
  message: string;
  data: {
    video: Video;
  };
}

export interface DeleteVideoResponse {
  success: boolean;
  message: string;
}

export interface IncrementViewResponse {
  success: boolean;
  message: string;
  data: {
    views: number;
  };
}

