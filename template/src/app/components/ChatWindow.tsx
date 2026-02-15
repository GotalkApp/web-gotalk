import React, { useState } from 'react';
import { Conversation } from '../types';
import { Phone, Video, Info, Send, Smile, Paperclip, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { CallPopup } from './CallPopup';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const [message, setMessage] = useState('');
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');

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
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                  <span className="message-time">
                    {format(msg.timestamp, 'HH:mm')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-input">
          <button className="icon-button" title="Thêm file">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Aa"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="icon-button" title="Emoji">
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
    </>
  );
};