// Chat API Service
// Documentation: https://ljs0r9k3-8000.asse.devtunnels.ms/api-docs/#/

import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { authenticatedFetch } from '@/services/auth';
import type {
  ConversationsResponse,
  MessagesResponse,
  ChatStatsResponse,
  MarkReadResponse,
  DeleteMessageResponse,
  MessagesParams,
} from '@/types/chat';

/**
 * Get all conversations for the authenticated user
 */
export const getConversations = async (): Promise<ConversationsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHAT.CONVERSATIONS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch conversations');
  }

  return response.json();
};

/**
 * Get messages for a specific conversation
 * @param userId - ID of the other participant (user if admin, admin if user)
 * @param params - Query parameters (page, limit)
 */
export const getMessages = async (
  userId: string,
  params?: MessagesParams
): Promise<MessagesResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `${getApiUrl(API_ENDPOINTS.CHAT.MESSAGES(userId))}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch messages');
  }

  return response.json();
};

/**
 * Get chat statistics (Admin only)
 */
export const getChatStats = async (): Promise<ChatStatsResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHAT.STATS), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch chat statistics');
  }

  return response.json();
};

/**
 * Mark all unread messages in a conversation as read
 * @param userId - ID of the other participant
 */
export const markMessagesAsRead = async (userId: string): Promise<MarkReadResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHAT.MARK_READ(userId)), {
    method: 'PUT',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark messages as read');
  }

  return response.json();
};

/**
 * Delete a message (soft delete - only sender can delete their own message)
 * @param messageId - ID of the message to delete
 */
export const deleteMessage = async (messageId: string): Promise<DeleteMessageResponse> => {
  const response = await authenticatedFetch(getApiUrl(API_ENDPOINTS.CHAT.DELETE_MESSAGE(messageId)), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete message');
  }

  return response.json();
};

