import api from './api';
import {
    MessageResponse,
    SendMessageRequest,
} from '../types';

export const messageService = {
    /**
     * GET /conversations/:id/messages
     * Get messages in a conversation with pagination
     */
    getMessages: async (
        conversationId: string,
        limit: number = 50,
        before?: string
    ): Promise<MessageResponse[]> => {
        const params: Record<string, string | number> = { limit };
        if (before) {
            params.before = before;
        }
        const response = await api.get<MessageResponse[]>(
            `/conversations/${conversationId}/messages`,
            { params }
        );
        return response.data;
    },

    /**
     * POST /conversations/:id/messages
     * Send a new message to a conversation
     */
    sendMessage: async (
        conversationId: string,
        data: SendMessageRequest
    ): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(
            `/conversations/${conversationId}/messages`,
            data
        );
        return response.data;
    },
};
