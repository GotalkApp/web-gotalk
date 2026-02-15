import React, { useState } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { conversations } from '../data/mockData';

export const ChatPage: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    conversations[0]?.id
  );
  const [showChat, setShowChat] = useState(false);

  const selectedConversation = conversations.find(
    c => c.id === selectedConversationId
  );

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  return (
    <div className="chat-page">
      <div className={`conversation-list ${showChat ? 'hidden-mobile' : ''}`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
        />
      </div>
      {selectedConversation ? (
        <div className={`chat-window ${!showChat ? 'hidden-mobile' : ''}`}>
          <ChatWindow 
            conversation={selectedConversation}
            onBack={handleBackToList}
          />
        </div>
      ) : (
        <div className="chat-empty">
          <p>Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
      )}
    </div>
  );
};