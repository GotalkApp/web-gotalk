'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message } from '../types';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { Phone, Video, Info, Send, Smile, Paperclip, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '../context/LanguageContext';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

import { useCall } from '../context/CallContext';
import { useSocket } from '../context/SocketContext';

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const { startCall } = useCall(); // Use CallContext
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  // Removed local call state
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);

  // Typing states
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ... (Fetch messages logic remains same)
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageService.getMessages(conversation.id, 30);
      
      if (data.length < 30) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const mapped: Message[] = data.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        type: msg.type,
        isRead: true,
      })).reverse();
      setMessages(mapped);
    } catch {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  useEffect(() => {
    setMessages([]); 
    fetchMessages();
    setHasMore(true); 
    setTypingUser(null); 
  }, [fetchMessages]);

  useEffect(() => {
    if (!loading && !isLoadingMore) {
      scrollToBottom();
    }
  }, [loading]);

  // WebSocket: Handle Realtime Messages & Typing
  useEffect(() => {
    if (!socket) return;
    
    const unsubscribe = socket.onMessage((event: any) => {
      if (event.type === 'new_message') {
        const payload = event.payload;
        if (payload.conversation_id === conversation.id) {
          if (payload.sender_id === currentUser?.id) return;
          
          const newMessage: Message = {
            id: payload.id,
            senderId: payload.sender_id,
            text: payload.content,
            timestamp: new Date(payload.created_at),
            type: payload.type,
            isRead: true,
          };
          
          setMessages(prev => {
             if (prev.some(m => m.id === newMessage.id)) return prev;
             setTimeout(scrollToBottom, 50);
             return [...prev, newMessage];
          });
          
          setTypingUser(null);
        }
      } else if (event.type === 'typing') {
        if (event.payload.conversation_id === conversation.id && event.payload.user_id !== currentUser?.id) {
            setTypingUser(event.payload.name);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
        }
      } else if (event.type === 'stop_typing') {
        if (event.payload.conversation_id === conversation.id && event.payload.user_id !== currentUser?.id) {
            setTypingUser(null);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      }
    });
    
    return () => {
        unsubscribe();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, conversation.id, currentUser?.id]);

  // Handle Input & Emit Typing
  const lastTypingTime = useRef<number>(0);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
      
      if (socket && conversation.id) {
          const now = Date.now();
          if (now - lastTypingTime.current > 2000) { 
              socket.emit('typing', { conversation_id: conversation.id });
              lastTypingTime.current = now;
          }
          
          if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
          stopTypingTimer.current = setTimeout(() => {
              socket.emit('stop_typing', { conversation_id: conversation.id });
          }, 2000);
      }
  };

  // ... (Load More Logic remains same)
  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || messages.length === 0 || loading) return; 

    try {
      setIsLoadingMore(true);
      if (messagesContainerRef.current) {
        prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
      }

      const oldestMessageId = messages[0].id;
      const data = await messageService.getMessages(conversation.id, 30, oldestMessageId);
      
      if (data.length < 30) {
        setHasMore(false);
      }

      const mapped: Message[] = data.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        type: msg.type,
        isRead: true,
      })).reverse();

      setMessages(prev => {
          const newIds = new Set(prev.map(m => m.id));
          const uniqueNewMessages = mapped.filter(m => !newIds.has(m.id));
          return [...uniqueNewMessages, ...prev];
      });

    } catch {
      console.error('Failed to load more');
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
      if (messagesContainerRef.current && prevScrollHeightRef.current > 0) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const diff = newScrollHeight - prevScrollHeightRef.current;
          if (diff > 0) {
              messagesContainerRef.current.scrollTop = diff;
          }
          prevScrollHeightRef.current = 0;
      }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.currentTarget;
      if (scrollTop === 0 && hasMore && !isLoadingMore) {
          loadMoreMessages();
      }
  };

  const handleSend = async () => {
     if (socket) socket.emit('stop_typing', { conversation_id: conversation.id });
     if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
     
     if (!message.trim() || sending) return;
     const messageText = message.trim();
     setMessage('');
     setSending(true);

     const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser?.id || '',
      text: messageText,
      timestamp: new Date(),
      type: 'text',
      isRead: false,
    };
    setMessages(prev => [...prev, tempMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      const sent = await messageService.sendMessage(conversation.id, {
        content: messageText,
        type: 'text',
      });

      setMessages(prev => {
        const alreadyExists = prev.some(m => m.id === sent.id);
        if (alreadyExists) {
            return prev.filter(m => m.id !== tempMessage.id);
        }

        return prev.map(m =>
          m.id === tempMessage.id
            ? {
                id: sent.id,
                senderId: sent.sender_id,
                text: sent.content,
                timestamp: new Date(sent.created_at),
                type: sent.type,
                isRead: true,
              }
            : m
        );
      });
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setMessage(messageText); 
    } finally {
      setSending(false);
    }
  };

  const handleCall = (type: 'video' | 'audio') => {
    // USE CONTEXT
    startCall(conversation.user, type, conversation.id);
  };

  return (
    <>
      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-header-user">
            {onBack && (
              <button 
                className="icon-button mobile-back-button" 
                onClick={onBack}
                title="Quay lại"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="chat-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={conversation.user.avatar} alt={conversation.user.name} />
              {conversation.user.status === 'online' && (
                <span className="status-indicator online"></span>
              )}
            </div>
            <div className="chat-user-info">
              <h3>{conversation.user.name}</h3>
              <span className="chat-user-status">
                {typingUser ? <span className="text-primary italic font-medium">{typingUser} đang soạn tin...</span> : 
                  (conversation.user.status === 'online' 
                  ? 'Đang hoạt động' 
                  : conversation.user.lastSeen || 'Ngoại tuyến')}
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button 
              className="icon-button"
              onClick={() => handleCall('audio')}
              title="Gọi thoại"
            >
              <Phone size={20} />
            </button>
            <button 
              className="icon-button"
              onClick={() => handleCall('video')}
              title="Gọi video"
            >
              <Video size={20} />
            </button>
            <button className="icon-button" title="Thông tin">
              <Info size={20} />
            </button>
          </div>
        </div>

        <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
          {isLoadingMore && (
              <div className="p-2 flex justify-center">
                  <Loader2 size={20} className="spin text-gray-400" />
              </div>
          )}
          
          {loading ? (
            <div className="chat-messages-loading">
              <Loader2 size={24} className="spin" />
              <p>{t('loading')}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-messages-empty">
              <p>{t('start_conversation_notice')}</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`message ${isMe ? 'message-sent' : 'message-received'}`}
                >
                  {!isMe && (
                    <img 
                      src={conversation.user.avatar} 
                      alt="" 
                      className="message-avatar"
                    />
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                    <span className="message-time">
                      {format(msg.timestamp, 'HH:mm')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          
          {typingUser && (
             <div className="typing-indicator-wrapper" style={{ marginBottom: '10px' }}>
               <div className="typing-indicator" style={{ marginLeft: '44px', marginBottom: '2px' }}>
                   <span></span>
                   <span></span>
                   <span></span>
               </div>
               <span style={{ marginLeft: '48px', fontSize: '11px', color: '#65676b' }}>
                 {typingUser} đang nhập...
               </span>
             </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <button className="icon-button" title="Thêm file">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Aa"
            value={message}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={sending}
          />
          <button className="icon-button" title="Emoji">
            <Smile size={20} />
          </button>
          <button 
            className="icon-button send-button" 
            onClick={handleSend}
            disabled={!message.trim() || sending}
            title="Gửi"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
};
