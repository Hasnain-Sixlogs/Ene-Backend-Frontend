// Events Management API Types

import type { Pagination } from './dashboard';

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
}

export interface Event {
  _id: string;
  event_name: string;
  description?: string;
  event_type?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  virtual_link_or_location?: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id: User;
  createdAt: string;
  updatedAt: string;
}

export interface EventsListData {
  events: Event[];
  pagination: Pagination;
}

export interface EventsListResponse {
  success: boolean;
  message: string;
  data: EventsListData;
}

export interface EventDetailResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
}

export interface CreateEventRequest {
  event_name: string;
  description?: string;
  event_type?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  virtual_link_or_location?: string;
}

export interface CreateEventResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
}

export interface UpdateEventRequest {
  event_name?: string;
  description?: string;
  event_type?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  virtual_link_or_location?: string;
}

export interface UpdateEventResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
}

export interface UpdateEventStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export interface UpdateEventStatusResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
}

export interface EventsListParams {
  user_id?: string;
  event_type?: string;
  status?: 'pending' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

