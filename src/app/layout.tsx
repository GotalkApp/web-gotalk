import type { Metadata } from "next";
import "./globals.css";
import { ThemeWrapper } from "@/app/components/ThemeWrapper";

export const metadata: Metadata = {
  title: 'GoTalk',
  description: 'Realtime Chat Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
