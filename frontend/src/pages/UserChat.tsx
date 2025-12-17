import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Send, MessageCircle, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { getConversations, getMessages, getChatStats, markMessagesAsRead, deleteMessage } from "@/services/chatApi";
import { useSocket } from "@/hooks/useSocket";
import { getSession } from "@/services/auth";
import type { Conversation, Message, SocketMessage, SocketTypingData, SocketUserStatus } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";

export default function UserChat() {
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [stats, setStats] = useState({
    totalChats: 0,
    onlineUsers: 0,
    unreadMessages: 0,
    respondedChats: 0,
  });
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineStatuses, setOnlineStatuses] = useState<Map<string, 'online' | 'offline'>>(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const session = getSession();
  const currentUserId = session?.user?.id || '';

  // Get other user ID from conversation
  const getOtherUserId = (conversation: Conversation): string | null => {
    if (conversation.userId) return conversation.userId; // Admin viewing user
    if (conversation.adminId) return conversation.adminId; // User viewing admin
    return null;
  };

  // Socket.IO integration
  const { isConnected, joinRoom, sendMessage: sendSocketMessage, sendTyping, markAsRead: markAsReadSocket, notifyOnline } = useSocket({
    onMessage: (message: SocketMessage) => {
      const otherUserId = selectedConversation ? getOtherUserId(selectedConversation) : null;
      if (otherUserId && (message.user_id === otherUserId || message.admin_id === otherUserId)) {
        // Add message to current conversation
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        
        // Update conversation's last message
        updateConversationLastMessage(message);
        
        // Mark as read if user is viewing the conversation
        if (message.sender_id._id !== currentUserId) {
          markAsReadSocket({ userId: otherUserId });
        }
      } else {
        // Update conversation list if message is from another conversation
        updateConversationLastMessage(message);
      }
    },
    onTyping: (data: SocketTypingData) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    },
    onUserStatus: (data: SocketUserStatus) => {
      setOnlineStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data.status);
        return newMap;
      });
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.error,
        variant: "destructive",
      });
    },
    onConnect: () => {
      notifyOnline();
    },
  });

  // Update conversation's last message
  const updateConversationLastMessage = (message: Message | SocketMessage) => {
    const senderId = typeof message.sender_id === 'string' ? message.sender_id : message.sender_id._id;
    setConversations(prev => prev.map(conv => {
      const otherUserId = getOtherUserId(conv);
      if (otherUserId && (message.user_id === otherUserId || message.admin_id === otherUserId)) {
        return {
          ...conv,
          lastMessage: {
            _id: message._id,
            message: message.message,
            sender_id: senderId,
            sender_role: message.sender_role,
            createdAt: message.createdAt,
          },
          unreadCount: senderId !== currentUserId && !message.is_read 
            ? (conv.unreadCount || 0) + 1 
            : conv.unreadCount,
        };
      }
      return conv;
    }));
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const response = await getConversations();
      if (response.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (userId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await getMessages(userId, { page: 1, limit: 100 });
      if (response.success) {
        setMessages(response.data.messages.reverse()); // Reverse to show oldest first
        // Mark messages as read
        await markMessagesAsRead(userId);
        // Also mark via socket
        markAsReadSocket({ userId });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [markAsReadSocket]);

  // Fetch chat statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await getChatStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      // Stats might fail for non-admin users, ignore silently
      console.log('Stats not available:', error);
    }
  }, []);

  // Load conversations and stats on mount
  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations, fetchStats]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const otherUserId = getOtherUserId(conversation);
    if (otherUserId) {
      // Join room
      if (isConnected) {
        joinRoom({ userId: otherUserId });
      }
      // Fetch messages
      fetchMessages(otherUserId);
      // Mark as read
      markMessagesAsRead(otherUserId).catch(console.error);
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUserId = getOtherUserId(selectedConversation);
    if (!otherUserId) return;

    // Send via socket
    sendSocketMessage({
      userId: otherUserId,
      message: newMessage.trim(),
    });

    setNewMessage("");
    setIsTyping(false);
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!selectedConversation) return;
    const otherUserId = getOtherUserId(selectedConversation);
    if (!otherUserId) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTyping({ userId: otherUserId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping({ userId: otherUserId, isTyping: false });
    }, 1000);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join room when conversation is selected and socket is connected
  useEffect(() => {
    if (selectedConversation && isConnected) {
      const otherUserId = getOtherUserId(selectedConversation);
      if (otherUserId) {
        joinRoom({ userId: otherUserId });
      }
    }
  }, [selectedConversation, isConnected, joinRoom]);

  const filteredConversations = conversations.filter(conv => {
    const name = conv.userName || conv.adminName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get display name for conversation
  const getConversationName = (conv: Conversation): string => {
    return conv.userName || conv.adminName || 'Unknown';
  };

  // Get display avatar for conversation
  const getConversationAvatar = (conv: Conversation): string | undefined => {
    return conv.userProfile || conv.adminProfile;
  };

  // Get online status for conversation
  const getConversationStatus = (conv: Conversation): 'online' | 'offline' => {
    const otherUserId = getOtherUserId(conv);
    if (!otherUserId) return 'offline';
    return onlineStatuses.get(otherUserId) || 'offline';
  };

  // Check if other user is typing
  const isOtherUserTyping = (): boolean => {
    if (!selectedConversation) return false;
    const otherUserId = getOtherUserId(selectedConversation);
    if (!otherUserId) return false;
    return typingUsers.has(otherUserId);
  };

  // Format time
  const formatTime = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Format message time
  const formatMessageTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  // Check if message is from current user
  const isOwnMessage = (message: Message): boolean => {
    return message.sender_id._id === currentUserId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">User Chat</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Chats</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoadingConversations ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalChats || conversations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.onlineUsers || Array.from(onlineStatuses.values()).filter(s => s === 'online').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.unreadMessages || conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responded</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.respondedChats || conversations.filter(c => (c.unreadCount || 0) === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Conversation List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(600px-73px)]">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const name = getConversationName(conv);
                    const avatar = getConversationAvatar(conv);
                    const status = getConversationStatus(conv);
                    const isSelected = selectedConversation && 
                      getOtherUserId(selectedConversation) === getOtherUserId(conv);

                    return (
                      <div
                        key={getOtherUserId(conv) || Math.random()}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-4 cursor-pointer transition-colors border-b border-border ${
                          isSelected ? "bg-accent/10" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {name.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                                status === "online" ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground truncate">{name}</p>
                              {conv.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conv.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.lastMessage?.message || 'No messages yet'}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="bg-accent text-accent-foreground text-xs rounded-full px-2 py-0.5 font-medium">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-2 flex flex-col h-full min-h-0">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center gap-3 flex-shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getConversationAvatar(selectedConversation)} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getConversationName(selectedConversation)
                          .split(" ")
                          .map(n => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {getConversationName(selectedConversation)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {getConversationStatus(selectedConversation)}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-4 space-y-4">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <>
                          {messages.map((message) => {
                            const isOwn = isOwnMessage(message);
                            return (
                              <div
                                key={message._id}
                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                    isOwn
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{message.message}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p
                                      className={`text-xs ${
                                        isOwn
                                          ? "text-accent-foreground/70"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {formatMessageTime(message.createdAt)}
                                    </p>
                                    {isOwn && message.is_read && (
                                      <span className="text-xs text-accent-foreground/70">✓✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {isOtherUserTyping() && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-2xl px-4 py-2">
                                <p className="text-sm text-muted-foreground">Typing...</p>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                        disabled={!isConnected}
                      />
                      <Button
                        className="bg-accent hover:bg-accent/90"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
