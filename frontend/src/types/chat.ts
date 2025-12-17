// Chat API Types
// Documentation: https://ljs0r9k3-8000.asse.devtunnels.ms/api-docs/#/

export interface Message {
  _id: string;
  user_id: string;
  admin_id: string;
  message: string;
  sender_id: {
    _id: string;
    name: string;
    email: string;
    profile?: string;
  };
  sender_role: 'user' | 'admin';
  attachment?: string | null;
  attachment_type?: 'image' | 'video' | 'audio' | 'document' | null;
  is_read: boolean;
  read_at?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userProfile?: string;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  adminProfile?: string;
  lastMessage?: {
    _id: string;
    message: string;
    sender_id: string | {
      _id: string;
      name: string;
      email: string;
      profile?: string;
    };
    sender_role: 'user' | 'admin';
    createdAt: string;
  };
  unreadCount: number;
}

export interface ConversationsResponse {
  success: boolean;
  message: string;
  data: {
    conversations: Conversation[];
  };
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ChatStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalChats: number;
    onlineUsers: number;
    unreadMessages: number;
    respondedChats: number;
  };
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: {
    updatedCount: number;
  };
}

export interface DeleteMessageResponse {
  success: boolean;
  message: string;
}

export interface MessagesParams {
  page?: number;
  limit?: number;
}

// Socket.IO Event Types
export interface SocketMessage extends Message {}

export interface SocketTypingData {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface SocketUserStatus {
  userId: string;
  status: 'online' | 'offline';
}

export interface SocketNotification {
  type: 'new_message';
  from: {
    _id: string;
    name: string;
  };
  userId?: string; // Only for admin notifications
  message: string; // Message preview (first 100 chars)
}

export interface SocketError {
  error: string;
}

export interface SocketJoinPayload {
  userId: string;
}

export interface SocketSendMessagePayload {
  userId: string;
  message: string;
  attachment?: string | null;
  attachment_type?: 'image' | 'video' | 'audio' | 'document' | null;
}

export interface SocketTypingPayload {
  userId: string;
  isTyping: boolean;
}

export interface SocketMarkReadPayload {
  userId: string;
}

