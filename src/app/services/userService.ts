import api from './api';
import { UserResponse } from '../types';

export const userService = {
    /**
     * GET /users/search
     * Search users by name or email
     */
    searchUsers: async (query: string): Promise<UserResponse[]> => {
        const response = await api.get<UserResponse[]>('/users/search', {
            params: { q: query }
        });
        return response.data;
    },

    /**
     * GET /users/:id
     * Get user details by ID
     */
    getUserById: async (id: string): Promise<UserResponse> => {
        const response = await api.get<UserResponse>(`/users/${id}`);
        return response.data;
    },
};
