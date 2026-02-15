export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface CallData {
  user: User;
  type: 'video' | 'audio';
  status: 'calling' | 'connected' | 'ended';
  duration?: number;
}
