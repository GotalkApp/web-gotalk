import { NextResponse } from 'next/server';

// Bắt buộc dynamic để đọc env lúc runtime (bên trong Docker container),
// không bị Next.js "đóng băng" giá trị tại thời điểm build image.
export const dynamic = 'force-dynamic';

export async function GET() {
    const config = {
        API_URL: process.env.API_URL || 'http://localhost:8000/api/v1',
        WS_URL: process.env.WS_URL || 'ws://localhost:8000/ws',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    };

    // Trả về Javascript snippet để trình duyệt thực thi: window.__ENV = {...}
    return new NextResponse(`window.__ENV = ${JSON.stringify(config)};`, {
        headers: {
            'Content-Type': 'application/javascript',
            // Không cho CDN/browser cache, luôn lấy giá trị mới nhất từ server
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
