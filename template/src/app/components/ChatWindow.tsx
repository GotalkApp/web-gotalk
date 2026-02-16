import React, { useState } from 'react';
import { Conversation, MediaAttachment } from '../types';
import { Phone, Video, Info, Send, Smile, Paperclip, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { CallPopup } from './CallPopup';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentPicker } from './AttachmentPicker';
import { MediaViewer } from './MediaViewer';
import { MessageMedia } from './MessageMedia';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const [message, setMessage] = useState('');
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ media: MediaAttachment[]; index: number } | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      // Mock sending message
      console.log('Sending:', message);
      setMessage('');
    }
  };

  const handleCall = (type: 'video' | 'audio') => {
    setCallType(type);
    setShowCallPopup(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleAttachmentSelect = (type: 'image' | 'video' | 'file') => {
    console.log('Selected attachment type:', type);
    // Mock file selection - in real app, would open file picker
  };

  const handleMediaClick = (media: MediaAttachment[], index: number) => {
    setMediaViewer({ media, index });
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
              <img src={conversation.user.avatar} alt={conversation.user.name} />
              {conversation.user.status === 'online' && (
                <span className="status-indicator online"></span>
              )}
            </div>
            <div className="chat-user-info">
              <h3>{conversation.user.name}</h3>
              <span className="chat-user-status">
                {conversation.user.status === 'online' 
                  ? 'Đang hoạt động' 
                  : conversation.user.lastSeen}
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

        <div className="chat-messages">
          {conversation.messages.map(msg => {
            const isMe = msg.senderId === 'me';
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
          })}
        </div>

        <div className="chat-input">
          <button 
            className="icon-button" 
            title="Thêm file"
            onClick={() => setShowAttachmentPicker(true)}
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Aa"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            className="icon-button" 
            title="Emoji"
            onClick={() => setShowEmojiPicker(true)}
          >
            <Smile size={20} />
          </button>
          <button 
            className="icon-button send-button" 
            onClick={handleSend}
            disabled={!message.trim()}
            title="Gửi"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {showCallPopup && (
        <CallPopup
          user={conversation.user}
          type={callType}
          onClose={() => setShowCallPopup(false)}
        />
      )}

      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {showAttachmentPicker && (
        <AttachmentPicker
          onSelect={handleAttachmentSelect}
          onClose={() => setShowAttachmentPicker(false)}
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