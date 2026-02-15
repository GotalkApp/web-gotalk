'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ConversationList } from './components/ConversationList';
import { ChatWindow } from './components/ChatWindow';
import { conversationService } from './services/conversationService';
import { ConversationResponse, Conversation, User, Message, UserResponse } from './types';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useSocket } from './context/SocketContext';
import { WebSocketMessagePayload } from './types';

/**
 * Chuyển ConversationResponse (API) → Conversation (frontend display)
 */
function mapConversation(conv: ConversationResponse, currentUserId: string): Conversation {
  // Tìm user khác trong conversation (cho private chat)
  // members: MemberResponse[] -> user is inside m.user
  const otherMember = conv.members?.find(m => m.user && m.user.id !== currentUserId);

  const userData = otherMember?.user;

  const user: User = userData
    ? {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        status: userData.is_online ? 'online' : 'offline',
        lastSeen: userData.last_seen
          ? new Date(userData.last_seen).toLocaleString('vi-VN')
          : undefined,
      }
    : {
        id: `temp-${conv.id}`,
        name: conv.name || 'Cuộc trò chuyện',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || 'C')}&background=random`,
        status: 'offline',
      };

  const lastMessage: Message | undefined = conv.last_message
    ? {
        id: conv.last_message.id,
        senderId: conv.last_message.sender_id,
        text: conv.last_message.content,
        timestamp: new Date(conv.last_message.created_at),
        type: conv.last_message.type,
        isRead: true, // Default to true for initial load, logic can be improved
      }
    : undefined;

  return {
    id: conv.id,
    name: conv.name || user.name,
    type: conv.type,
    user,
    messages: [],
    lastMessage,
    unreadCount: conv.unread_count,
  };
}

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Handle Realtime Messages
  useEffect(() => {
    if (!socket) return;

    const unsubscribe = socket.onMessage((event: any) => {
      if (event.type === 'new_message') {
        const payload = event.payload;

        setConversations(prev => {
          const index = prev.findIndex(c => c.id === payload.conversation_id);
          const isSelected = payload.conversation_id === selectedConversationId;

          const newMessage: Message = {
            id: payload.id,
            senderId: payload.sender_id,
            text: payload.content,
            timestamp: new Date(payload.created_at),
            type: payload.type,
            isRead: isSelected // Mark read if currently viewing
          };

          if (index !== -1) {
            // Update existing conversation
            const conversation = prev[index];
            const updated: Conversation = {
              ...conversation,
              lastMessage: newMessage,
              unreadCount: isSelected ? 0 : conversation.unreadCount + 1
            };
            
            // Move to top
            const newArr = [...prev];
            newArr.splice(index, 1);
            return [updated, ...newArr];
          } else {
            // New conversation
            // Only add if sender is not me (or handle my own message differently?)
            // Assuming this event is only for received messages or sync
            
            const newConv: Conversation = {
              id: payload.conversation_id,
              name: payload.sender.name,
              type: 'private',
              user: {
                id: payload.sender.id,
                name: payload.sender.name,
                avatar: payload.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.sender.name)}`,
                status: payload.sender.is_online ? 'online' : 'offline',
                lastSeen: payload.sender.last_seen 
              },
              messages: [],
              lastMessage: newMessage,
              unreadCount: 1
            };
            return [newConv, ...prev];
          }
        });
      }
    });

    return () => unsubscribe();
  }, [socket, selectedConversationId]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await conversationService.getConversations();
      const mapped = data.map(c => mapConversation(c, user.id));
      setConversations(mapped);

      // Auto-select first conversation nếu chưa chọn
      setSelectedConversationId(prev => {
        if (!prev && mapped.length > 0) {
          return mapped[0].id;
        }
        return prev;
      });
    } catch {
      setError('Không thể tải cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const selectedConversation = conversations.find(
    c => c.id === selectedConversationId
  );

  const handleSelectConversation = async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    
    // Ensure we call API for any private conversation to sync/verify
    // Handle case-insensitive type check and potential missing type if it looks like a direct chat
    const isGroup = conversation?.type?.toLowerCase() === 'group';
    const isPrivate = conversation?.type?.toLowerCase() === 'private';
    const hasPartner = conversation?.user?.id && !conversation.user.id.startsWith('temp-');

    // Call API if it is explicitly private OR (not a group AND has a valid partner ID)
    if (conversation && (isPrivate || (!isGroup && hasPartner))) {
        try {
            // Call API direct to ensure we have correct ID or sync
            const partnerId = conversation.user.id;
            const data = await conversationService.getOrCreateDirectConversation(partnerId);
            setSelectedConversationId(data.conversation.id);
            // Update conversation list to reflect cleared unread count
             setConversations(prev => prev.map(c => 
                c.id === data.conversation.id ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error('Failed to get direct conversation:', error);
            setSelectedConversationId(id);
             setConversations(prev => prev.map(c => 
                c.id === id ? { ...c, unreadCount: 0 } : c
            ));
        }
    } else {
        setSelectedConversationId(id);
         setConversations(prev => prev.map(c => 
            c.id === id ? { ...c, unreadCount: 0 } : c
        ));
    }
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  // ...
  const handleUserSelect = async (selectedUser: UserResponse) => {
    if (!user) return;
    try {
      // Không set loading toàn màn hình để tránh flicker, chỉ loading search result (đã handle bên kia)
      // Nhưng ở đây nên hiện loading overlay hoặc spinner
      // Tạm thời dùng loading state chung
      
      const data = await conversationService.getOrCreateDirectConversation(selectedUser.id);
      
      const newConversation = mapConversation(data.conversation, user.id);
      
      setConversations(prev => {
        const exists = prev.find(c => c.id === newConversation.id);
        if (exists) return prev;
        return [newConversation, ...prev];
      });

      setSelectedConversationId(newConversation.id);
      setShowChat(true);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Có thể show toast error ở đây
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-loading">
          <Loader2 size={32} className="spin" />
          <p>Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page">
        <div className="chat-loading">
          <p className="chat-error-text">{error}</p>
          <button className="button button-primary" onClick={fetchConversations}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className={`conversation-list-wrapper ${showChat ? 'hidden-mobile' : ''}`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          onUserSelect={handleUserSelect}
        />
      </div>
      {selectedConversation ? (
        <div className={`chat-window-wrapper ${!showChat ? 'hidden-mobile' : ''}`}>
          <ChatWindow 
            conversation={selectedConversation}
            onBack={handleBackToList}
          />
        </div>
      ) : (
        <div className="chat-empty">
          <p>{conversations.length === 0 ? 'Chưa có cuộc trò chuyện nào' : 'Chọn một cuộc trò chuyện để bắt đầu'}</p>
        </div>
      )}
    </div>
  );
}
