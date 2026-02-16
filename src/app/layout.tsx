import type { Metadata } from "next";
import "./globals.css";
import { ThemeWrapper } from "@/app/components/ThemeWrapper";
import { EnvScript } from "@/app/config/EnvScript"; // Import EnvScript
import { AppConfig } from "@/app/config/env"; // Import AppConfig type

export const metadata: Metadata = {
  title: 'GoTalk',
  description: 'Realtime Chat Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get environment variables at runtime (on server)
  const config: AppConfig = {
    // Fallback logic handled here or EnvScript, but explicit is better
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  };

  return (
    <html lang="vi">
      <body>
        <EnvScript config={config} />
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
