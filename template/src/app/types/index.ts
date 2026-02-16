export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: Date;
  isRead: boolean;
  media?: MediaAttachment[];
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