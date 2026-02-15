import React, { useState, useEffect } from 'react';
import { Conversation, UserResponse } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Search, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { useTranslation } from '../context/LanguageContext';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onUserSelect?: (user: UserResponse) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  onUserSelect
}) => {
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await userService.searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserClick = (user: UserResponse) => {
    if (onUserSelect) {
      onUserSelect(user);
      setSearchQuery('');
    }
  };

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>{t('chat_header')}</h2>
        <div className="conversation-search">
          <Search size={18} className="conversation-search-icon" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="conversation-search-input"
          />
          {isSearching && (
            <Loader2 size={16} className="conversation-search-loading spin" />
          )}
        </div>
      </div>
      
      <div className="conversation-list-items">
        {hasSearchQuery ? (
          // Search Results
          <div>
            {searchResults.length === 0 && !isSearching ? (
              <div className="conversation-no-results">
                <p>{t('no_results')}</p>
              </div>
            ) : (
              searchResults.map(user => (
                <div
                  key={user.id}
                  className="conversation-item search-result"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="conversation-avatar">
                   <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt={user.name} />
                    {user.is_online && <span className="status-indicator online"></span>}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="conversation-name">{user.name}</span>
                    </div>
                    <div className="conversation-footer">
                      <span className="conversation-last-message">{user.email}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Conversation List
          conversations.length === 0 ? (
            <div className="conversation-no-results">
              <p>{t('no_conversations')}</p>
            </div>
          ) : (
            conversations.map(conversation => {
              const isSelected = conversation.id === selectedId;
              const lastMessage = conversation.lastMessage;
              const timeLocale = locale === 'vi' ? vi : enUS;
              
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
                            locale: timeLocale 
                          })}
                        </span>
                      )}
                    </div>
                    <div className="conversation-footer">
                      <span className={`conversation-last-message ${!lastMessage?.isRead ? 'unread' : ''}`}>
                        {lastMessage?.text || t('start_conversation_notice')}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="conversation-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};
