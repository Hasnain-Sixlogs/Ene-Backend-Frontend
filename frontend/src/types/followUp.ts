// Follow-Up Requests Management API Types

import type { Pagination } from './dashboard';

export interface FollowUpStats {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}

export interface FollowUpStatsResponse {
  success: boolean;
  message: string;
  data: FollowUpStats;
}

export interface FollowUpRequest {
  sno: number;
  _id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  type: 'New Visitor' | 'Prayer Request' | 'Counseling' | 'Membership' | 'Baptism' | 'Other';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  description?: string;
  notes?: string | null;
  createdAt: string;
}

export interface FollowUpRequestsListData {
  requests: FollowUpRequest[];
  pagination: Pagination;
}

export interface FollowUpRequestsListResponse {
  success: boolean;
  message: string;
  data: FollowUpRequestsListData;
}

export interface FollowUpRequestDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: 'New Visitor' | 'Prayer Request' | 'Counseling' | 'Membership' | 'Baptism' | 'Other';
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string;
  due_date: string;
  description?: string;
  notes?: string | null;
  createdAt: string;
}

export interface FollowUpRequestDetailResponse {
  success: boolean;
  message: string;
  data: {
    request: FollowUpRequestDetail;
  };
}

export interface CreateFollowUpRequest {
  name: string;
  email?: string;
  phone?: string;
  contact?: string;
  type?: 'New Visitor' | 'Prayer Request' | 'Counseling' | 'Membership' | 'Baptism' | 'Other';
  assigned_to?: string;
  assigned_to_id?: string;
  due_date?: string;
  description?: string;
  notes?: string;
  user_id?: string;
}

export interface UpdateFollowUpRequest {
  name?: string;
  assigned_to?: string;
  due_date?: string;
  notes?: string;
  description?: string;
}

export interface UpdateFollowUpRequestStatus {
  status: 'pending' | 'in_progress' | 'completed';
}

export interface FollowUpRequestsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  type?: 'New Visitor' | 'Prayer Request' | 'Counseling' | 'Membership' | 'Baptism' | 'Other';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

