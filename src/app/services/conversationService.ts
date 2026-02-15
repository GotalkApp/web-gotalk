import api from './api';
import {
    ConversationResponse,
    CreateConversationRequest,
    DirectConversationResponse,
} from '../types';

export const conversationService = {
    /**
     * GET /conversations
     * Get list of conversations for current user
     */
    getConversations: async (): Promise<ConversationResponse[]> => {
        const response = await api.get<ConversationResponse[]>('/conversations');
        return response.data;
    },

    /**
     * POST /conversations
     * Create a new private or group conversation
     */
    createConversation: async (data: CreateConversationRequest): Promise<ConversationResponse> => {
        const response = await api.post<ConversationResponse>('/conversations', data);
        return response.data;
    },
    /**
     * POST /conversations/direct
     * Get or create a direct conversation with a user
     */
    /**
     * POST /conversations/direct
     * Get or create a direct conversation with a user
     */
    getOrCreateDirectConversation: async (partnerId: string): Promise<DirectConversationResponse> => {
        const response = await api.post<DirectConversationResponse>('/conversations/direct', {
            receiver_id: partnerId
        });
        return response.data;
    },
};
