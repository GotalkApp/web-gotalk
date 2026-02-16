import api from './api';
import { UploadResponse } from '../types';

export const uploadService = {
    /**
     * POST /upload/multiple
     * Upload multiple files
     */
    uploadMultipleFiles: async (files: File[]): Promise<UploadResponse[]> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await api.post<UploadResponse[]>('/upload/multiple', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    },

    /**
     * POST /upload
     * Upload a single file
     */
    uploadFile: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post<UploadResponse>('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }
};
