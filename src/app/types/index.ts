// ==================== API Request Types ====================

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface VerifyOTPRequest {
    email: string;
    code: string;
}

export interface CreateConversationRequest {
    type: 'private' | 'group';
    name?: string;
    member_ids: string[];
}

export interface UpdateProfileRequest {
    name?: string;
    avatar?: string;
}

export interface UpdateSettingsRequest {
    language?: string;
    is_notification_enabled?: boolean;
    is_sound_enabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
}

export interface AttachmentInput {
    type: 'image' | 'video' | 'file';
    url: string;
    file_name?: string;
    file_size?: number;
}

export interface SendMessageRequest {
    content: string;
    type?: 'text' | 'image' | 'file' | 'video';
    reply_to_id?: string;
    attachments?: AttachmentInput[];
    file_url?: string;
    file_name?: string;
    file_size?: number;
}

export interface UploadResponse {
    url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
}

// ==================== API Response Types ====================

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    avatar: string;
    auth_provider: string;
    is_online: boolean;
    last_seen: string;
    language?: string;
    is_notification_enabled?: boolean;
    is_sound_enabled?: boolean;
    theme?: string;
    bio?: string;
}

export interface AuthResponse {
    token: string;
    user: UserResponse;
}

export interface OTPSentResponse {
    message: string;
    email: string;
    expires_in: number;
}

export interface ErrorResponse {
    error: string;
    message: string;
}

export interface MessageResponse {
    id: string;
    content: string;
    type: string;
    sender_id: string;
    created_at: string;
    attachments?: AttachmentInput[];
}

export interface MemberResponse {
    id: string;
    user_id: string;
    role: string;
    user: UserResponse;
    joined_at: string;
}

export interface ConversationResponse {
    id: string;
    type: string;
    name: string;
    members?: MemberResponse[];
    unread_count: number;
    last_message: MessageResponse | null;
}

export interface DirectConversationRequest {
    partner_id: string;
}

export interface DirectConversationResponse {
    conversation: ConversationResponse;
    messages: MessageResponse[];
    is_new: boolean;
}

// ==================== Frontend Display Types ====================

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
    text: string;
    timestamp: Date;
    type: string;
    isRead: boolean;
    media?: MediaAttachment[];
}

export interface Conversation {
    id: string;
    name: string;
    type: string;
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

// ==================== WebSocket Types ====================

export interface WebSocketMessagePayload {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender: UserResponse;
    content: string;
    type: 'text' | 'image' | 'file';
    status: 'sent' | 'delivered' | 'read';
    created_at: string;
    updated_at: string;
}

export interface WebSocketEvent {
    type: 'new_message';
    payload: WebSocketMessagePayload;
}
