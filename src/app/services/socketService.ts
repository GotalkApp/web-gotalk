import { MessageResponse } from '../types';

type MessageCallback = (message: any) => void;

class SocketService {
    private socket: WebSocket | null = null;
    private callbacks: MessageCallback[] = [];
    private token: string | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    public connect(token: string) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

        this.token = token;
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://api.localhost/ws';
        const url = `${wsUrl}?token=${token}`;

        console.log('Connecting to WebSocket:', wsUrl);
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
        };

        this.socket.onmessage = (event) => {
            try {
                // Handle potential multiple JSON objects (e.g. newline delimited)
                const rawData = event.data;
                console.log('WS Raw Data:', rawData); // Debug log

                const messages = rawData.split('\n').filter((line: string) => line.trim() !== '');

                messages.forEach((msg: string) => {
                    try {
                        const data = JSON.parse(msg);
                        console.log('WebSocket Message Parsed:', data); // Debug log
                        this.callbacks.forEach(cb => cb(data));
                    } catch (e) {
                        console.error('Error parsing individual message:', msg, e);
                    }
                });
            } catch (err) {
                console.error('WebSocket Global Parsing Error:', err);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket Disconnected. Reconnecting in 3s...');
            this.socket = null;
            this.reconnectTimeout = setTimeout(() => {
                if (this.token) this.connect(this.token);
            }, 3000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            if (this.socket) {
                this.socket.close();
            }
        };
    }

    public disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.socket) {
            this.socket.onclose = null; // Prevent auto-reconnect
            this.socket.close();
            this.socket = null;
        }
        this.token = null;
    }

    public emit(event: string, payload: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const data = JSON.stringify({ type: event, payload });
            console.log(`Socket sending [${event}]:`, data.length, 'chars');

            this.socket.send(data);
        }
    }

    public onMessage(callback: MessageCallback) {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }
}

export const socketService = new SocketService();
