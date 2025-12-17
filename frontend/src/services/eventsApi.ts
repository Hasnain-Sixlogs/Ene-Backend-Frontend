// Events Management API Service

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  EventsListResponse,
  EventDetailResponse,
  CreateEventRequest,
  CreateEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  UpdateEventStatusRequest,
  UpdateEventStatusResponse,
  EventsListParams,
} from '@/types/events';

/**
 * Get all events with pagination and filters
 */
export const getEvents = async (
  params?: EventsListParams
): Promise<EventsListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.user_id) queryParams.append('user_id', params.user_id);
  if (params?.event_type) queryParams.append('event_type', params.event_type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.EVENTS.LIST)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch events');
  }

  return response.json();
};

/**
 * Get my events (events created by authenticated user)
 */
export const getMyEvents = async (
  params?: Omit<EventsListParams, 'user_id'>
): Promise<EventsListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.event_type) queryParams.append('event_type', params.event_type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `${getApiUrl(API_ENDPOINTS.EVENTS.MY_EVENTS)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch my events');
  }

  return response.json();
};

/**
 * Get event by ID
 */
export const getEventById = async (id: string): Promise<EventDetailResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.EVENTS.BY_ID(id)), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch event');
  }

  return response.json();
};

/**
 * Create a new event
 */
export const createEvent = async (
  eventData: CreateEventRequest
): Promise<CreateEventResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.EVENTS.CREATE), {
    method: 'POST',
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create event');
  }

  return response.json();
};

/**
 * Update an event
 */
export const updateEvent = async (
  id: string,
  eventData: UpdateEventRequest
): Promise<UpdateEventResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.EVENTS.UPDATE(id)), {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event');
  }

  return response.json();
};

/**
 * Update event status
 */
export const updateEventStatus = async (
  id: string,
  status: UpdateEventStatusRequest
): Promise<UpdateEventStatusResponse> => {
  const response = await authenticatedFetch(
    getApiUrl(API_ENDPOINTS.EVENTS.UPDATE_STATUS(id)),
    {
      method: 'PUT',
      body: JSON.stringify(status),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event status');
  }

  return response.json();
};

/**
 * Delete an event
 */
export const deleteEvent = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.EVENTS.DELETE(id)), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete event');
  }
};

