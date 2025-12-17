// Pastor Requests Management API Types

import type { Pagination } from './dashboard';

export interface ChurchData {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
  approve_status: number;
}

export interface PastorRequest {
  sno: number;
  _id: string;
  name: string;
  email: string;
  phone: string;
  church: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  churchData?: ChurchData;
}

export interface PastorRequestsListData {
  requests: PastorRequest[];
  pagination: Pagination;
}

export interface PastorRequestsListResponse {
  success: boolean;
  message: string;
  data: PastorRequestsListData;
}

export interface PastorRequestDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  church: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  churchData?: ChurchData;
}

export interface PastorRequestDetailResponse {
  success: boolean;
  message: string;
  data: {
    request: PastorRequestDetail;
  };
}

export interface UpdatePastorRequestStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export interface UpdatePastorRequestStatusResponse {
  success: boolean;
  message: string;
  data: {
    request: PastorRequest;
  };
}

export interface PastorRequestsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

