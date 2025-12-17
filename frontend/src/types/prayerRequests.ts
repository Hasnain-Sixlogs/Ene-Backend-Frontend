// Prayer Requests Management API Types

import type { Pagination } from './dashboard';

export interface PrayerRequestUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
}

export interface PrayerRequest {
  sno: number;
  _id: string;
  user: PrayerRequestUser;
  name: string;
  email: string;
  phone: string;
  mobileNumber: string;
  dialCode?: string;
  church: string;
  churchId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  time?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequestsListData {
  prayerRequests: PrayerRequest[];
  pagination: Pagination;
}

export interface PrayerRequestsListResponse {
  success: boolean;
  message: string;
  data: PrayerRequestsListData;
}

export interface PrayerRequestDetail {
  _id: string;
  user: PrayerRequestUser;
  name: string;
  email: string;
  phone: string;
  mobileNumber: string;
  dialCode?: string;
  church: string;
  churchId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  time?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequestDetailResponse {
  success: boolean;
  message: string;
  data: {
    prayerRequest: PrayerRequestDetail;
  };
}

export interface PrayerRequestStats {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface PrayerRequestStatsResponse {
  success: boolean;
  message: string;
  data: PrayerRequestStats;
}

export interface UpdatePrayerRequestRequest {
  name?: string;
  mobile_number?: string;
  description?: string;
  date?: string;
  time?: string;
}

export interface UpdatePrayerRequestResponse {
  success: boolean;
  message: string;
  data: {
    prayerRequest: Partial<PrayerRequest>;
  };
}

export interface UpdatePrayerRequestStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export interface UpdatePrayerRequestStatusResponse {
  success: boolean;
  message: string;
  data: {
    prayerRequest: Partial<PrayerRequest>;
  };
}

export interface PrayerRequestsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
