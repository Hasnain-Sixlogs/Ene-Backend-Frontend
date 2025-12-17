// Church Management API Types

import type { Pagination } from './dashboard';

export interface ChurchLocation {
  address: string;
  city: string;
  coordinates?: [number, number];
}

export interface ChurchUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
}

export interface ChurchData {
  _id: string;
  name: string;
  user_id: ChurchUser;
  location: ChurchLocation;
}

export interface Church {
  sno?: number;
  _id: string;
  churchName: string;
  // pastor: string;
  // pastorId: string;
  user_id: ChurchUser;
  location: string;
  city: string;
  address: string;
  members: number;
  phone: string;
  email: string;
  status: string;
  churchStatus: number;
  isAvailability: number;
  approveStatus: number;
  placeId?: string;
  coordinates?: [number, number];
  createdAt: string;
  updatedAt: string;
  churchData?: ChurchData;
}

export interface ChurchDetail extends Church {
  churchData: ChurchData;
}

export interface ChurchesListData {
  churches: Church[];
  pagination: Pagination;
}

export interface ChurchesListResponse {
  success: boolean;
  message: string;
  data: ChurchesListData;
}

export interface ChurchDetailResponse {
  success: boolean;
  message: string;
  data: {
    church: ChurchDetail;
  };
}

export interface ChurchStats {
  totalChurches: number;
  totalMembers: number;
  activeChurches: number;
}

export interface ChurchStatsResponse {
  success: boolean;
  message: string;
  data: ChurchStats;
}

export interface UpdateChurchRequest {
  name?: string;
  location?: {
    address?: string;
    city?: string;
    coordinates?: [number, number];
  };
  church_status?: number;
  is_availability?: number;
  approve_status?: number;
}

export interface UpdateChurchResponse {
  success: boolean;
  message: string;
  data: {
    church: Partial<Church>;
  };
}

export interface ChurchesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

