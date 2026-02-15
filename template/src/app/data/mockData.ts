import { User, Conversation, Message } from '../types';

export const currentUser: User = {
  id: 'me',
  name: 'Bạn',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  status: 'online'
};

export const users: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    status: 'online'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    status: 'online'
  },
  {
    id: '3',
    name: 'Lê Văn C',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    status: 'away',
    lastSeen: '10 phút trước'
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    status: 'offline',
    lastSeen: '2 giờ trước'
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    status: 'online'
  },
  {
    id: '6',
    name: 'Vũ Thị F',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    status: 'offline',
    lastSeen: '1 ngày trước'
  }
];

const generateMessages = (userId: string, count: number): Message[] => {
  const messages: Message[] = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const isFromMe = i % 3 === 0;
    messages.push({
      id: `msg-${userId}-${i}`,
      senderId: isFromMe ? 'me' : userId,
      text: isFromMe 
        ? ['Chào bạn!', 'Bạn khỏe không?', 'Hẹn gặp lại nhé!', 'OK, cảm ơn!', 'Được rồi'][i % 5]
        : ['Xin chào!', 'Mình khỏe, còn bạn?', 'Hẹn gặp lại!', 'Không có gì!', 'Tuyệt vời!'][i % 5],
      timestamp: new Date(now.getTime() - i * 600000),
      isRead: i < count - 2
    });
  }
  
  return messages;
};

export const conversations: Conversation[] = users.map((user, index) => ({
  id: user.id,
  user,
  messages: generateMessages(user.id, 5 + index),
  get lastMessage() {
    return this.messages[this.messages.length - 1];
  },
  unreadCount: index === 0 ? 2 : index === 1 ? 1 : 0
}));
