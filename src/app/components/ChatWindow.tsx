'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message } from '../types';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { Phone, Video, Info, Send, Smile, Paperclip, ArrowLeft, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '../context/LanguageContext';
import { uploadService } from '../services/uploadService';
import { EmojiPicker } from './EmojiPicker';
import { MediaViewer, MediaAttachment } from './MediaViewer';
import { MessageMedia } from './MessageMedia';
import { AttachmentInput } from '../types';

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
  
  // Emoji picker & Media viewer states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ media: MediaAttachment[]; index: number } | null>(null);
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        media: msg.attachments?.map((a, i) => ({
            id: `${msg.id}-att-${i}`,
            type: (a.type === 'video' ? 'video' : 'image') as 'image' | 'video',
            url: a.url
        })),
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
            media: payload.attachments?.map((a: any, i: number) => ({
                id: `${payload.id}-att-${i}`,
                type: (a.type === 'video' ? 'video' : 'image') as 'image' | 'video',
                url: a.url
            })),
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
        media: msg.attachments?.map((a, i) => ({
            id: `${msg.id}-att-${i}`,
            type: (a.type === 'video' ? 'video' : 'image') as 'image' | 'video',
            url: a.url
        })),
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
    // Reset typing
    if (socket) socket.emit('stop_typing', { conversation_id: conversation.id });
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);

    if ((!message.trim() && selectedFiles.length === 0) || sending) return;

    setSending(true);
    let attachments: AttachmentInput[] = [];

    try {
      // 1. Upload files if present
      if (selectedFiles.length > 0) {
        try {
           const uploads = await uploadService.uploadMultipleFiles(selectedFiles);
           attachments = uploads.map(u => ({
              type: u.mime_type.startsWith('image/') ? 'image' : u.mime_type.startsWith('video/') ? 'video' : 'file',
              url: u.url,
              file_name: u.file_name,
              file_size: u.file_size
           }));
        } catch (error) {
           console.error('Upload failed', error);
           alert('Tải file thất bại');
           setSending(false);
           return;
        }
      }

      // 2. Send message
      const msgType = attachments.length > 0 ? (attachments[0].type === 'image' ? 'image' : 'file') : 'text';
      const sentMsg = await messageService.sendMessage(conversation.id, { 
        content: message.trim(),
        type: msgType,
        attachments: attachments.length > 0 ? attachments : undefined
      });
      
      // Map to Message interface
      const newMessage: Message = {
        id: sentMsg.id,
        senderId: sentMsg.sender_id,
        text: sentMsg.content,
        timestamp: new Date(sentMsg.created_at),
        type: sentMsg.type,
        isRead: true,
        media: attachments.length > 0 ? attachments.map((a, i) => ({
           id: `sent-${Date.now()}-${i}`,
           type: a.type as 'image' | 'video',
           url: a.url
        })) : undefined
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setSelectedFiles([]);
      setPreviewUrls(prev => {
         prev.forEach(url => URL.revokeObjectURL(url));
         return [];
      });
      setShowEmojiPicker(false);
      setTimeout(scrollToBottom, 100);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCall = (type: 'video' | 'audio') => {
    startCall(conversation.user, type, conversation.id);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Filter only images and videos
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      alert('Chỉ được chọn ảnh hoặc video');
      return;
    }

    // Update state
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    
    // Reset inputs
    e.target.value = '';
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
       // Revoke URL to avoid memory leak
       URL.revokeObjectURL(prev[index]);
       return prev.filter((_, i) => i !== index);
    });
  };

  const handleMediaClick = (media: MediaAttachment[], index: number) => {
    setMediaViewer({ media, index });
  };
  
  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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
                    {msg.media && msg.media.length > 0 && (
                      <MessageMedia 
                        media={msg.media} 
                        onClick={(index) => handleMediaClick(msg.media!, index)}
                      />
                    )}
                    {msg.text && (
                      <div className="message-bubble">
                        {msg.text}
                      </div>
                    )}
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

        {/* File Previews */}
        {previewUrls.length > 0 && (
          <div className="chat-attachment-preview">
            {previewUrls.map((url, index) => (
              <div key={index} className="preview-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Preview" />
                <button 
                  className="preview-remove"
                  onClick={() => removeFile(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="chat-input">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button 
            className="icon-button" 
            title="Thêm ảnh/video"
            onClick={handleFileSelect}
          >
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
          <button 
            className="icon-button" 
            title="Emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>
          <button 
            className="icon-button send-button" 
            onClick={handleSend}
            disabled={(!message.trim() && selectedFiles.length === 0) || sending}
            title="Gửi"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {mediaViewer && (
        <MediaViewer
          media={mediaViewer.media}
          initialIndex={mediaViewer.index}
          onClose={() => setMediaViewer(null)}
        />
      )}
    </>
  );
};
