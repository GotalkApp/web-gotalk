export interface AppConfig {
    API_URL: string;
    WS_URL: string;
    GOOGLE_CLIENT_ID: string;
}

declare global {
    interface Window {
        __ENV?: AppConfig;
    }
}

/**
 * Get configuration value (supports both ssr and csr)
 * 1. Checks window.__ENV (injected at runtime)
 * 2. Fallbacks to process.env (build time or server runtime)
 */
export const getEnv = (): AppConfig => {
    if (typeof window !== 'undefined' && window.__ENV) {
        return window.__ENV;
    }

    // Default values or process.env fallbacks
    // Use bracket notation to prevent build-time inlining by Next.js/Webpack
    return {
        API_URL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api/v1',
        WS_URL: process.env['NEXT_PUBLIC_WS_URL'] || 'ws://localhost:8000/ws',
        GOOGLE_CLIENT_ID: process.env['NEXT_PUBLIC_GOOGLE_CLIENT_ID'] || '',
    };
};
