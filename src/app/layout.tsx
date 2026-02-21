import type { Metadata } from "next";
import "./globals.css";
import { ThemeWrapper } from "@/app/components/ThemeWrapper";

export const metadata: Metadata = {
  title: 'GoTalk',
  description: 'Realtime Chat Application',
};

// Layout này không cần dynamic nữa → tất cả các trang sẽ được pre-render tĩnh (SSG)
// Env được inject bằng /config.js route riêng ở runtime
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/*
          Script /config.js là một Next.js API route động (force-dynamic).
          Trình duyệt tải script này → server đọc process.env bên trong container
          và trả về: window.__ENV = { API_URL, WS_URL, GOOGLE_CLIENT_ID }
          Nhờ vậy client JS có thể đọc đúng env của Docker lúc runtime.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/config.js" />
      </head>
      <body>
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
