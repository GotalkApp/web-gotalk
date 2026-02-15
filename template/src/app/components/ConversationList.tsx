import React from 'react';
import { Conversation } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect
}) => {
  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>Chat</h2>
      </div>
      <div className="conversation-list-items">
        {conversations.map(conversation => {
          const isSelected = conversation.id === selectedId;
          const lastMessage = conversation.lastMessage;
          
          return (
            <div
              key={conversation.id}
              className={`conversation-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(conversation.id)}
            >
              <div className="conversation-avatar">
                <img src={conversation.user.avatar} alt={conversation.user.name} />
                {conversation.user.status === 'online' && (
                  <span className="status-indicator online"></span>
                )}
              </div>
              <div className="conversation-content">
                <div className="conversation-header">
                  <span className="conversation-name">{conversation.user.name}</span>
                  {lastMessage && (
                    <span className="conversation-time">
                      {formatDistanceToNow(lastMessage.timestamp, { 
                        addSuffix: false, 
                        locale: vi 
                      })}
                    </span>
                  )}
                </div>
                <div className="conversation-footer">
                  <span className="conversation-last-message">
                    {lastMessage?.text || 'Chưa có tin nhắn'}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="conversation-badge">{conversation.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
