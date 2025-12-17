// Users Management API Types

import type { Pagination } from './dashboard';

export interface User {
  sno: number;
  _id: string;
  image: string | null;
  name: string;
  email: string;
  mobileNumber: string;
  location: string;
  city: string;
  createdAt: string;
}

export interface UsersListData {
  users: User[];
  pagination: Pagination;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: UsersListData;
}

export interface UserDetail {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  profile: string | null;
  location: {
    address: string;
    city: string;
    coordinates?: [number, number];
  };
  createdAt: string;
}

export interface UserDetailResponse {
  success: boolean;
  message: string;
  data: {
    user: UserDetail;
  };
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  location?: {
    address?: string;
    city?: string;
  };
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: Partial<UserDetail>;
  };
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

