'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider, useTranslation } from '../context/LanguageContext';
import { Sidebar } from './Sidebar';
import { SocketProvider } from '../context/SocketContext';

const PUBLIC_ROUTES = ['/login', '/register'];

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        router.replace('/login');
      } else if (isAuthenticated && isPublicRoute) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  // Show loading khi đang kiểm tra auth
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner"></div>
      </div>
    );
  }

  // Nếu chưa auth và không phải public route → không render gì (đang redirect)
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // Nếu đã auth và đang ở public route → không render gì (đang redirect)
  if (isAuthenticated && isPublicRoute) {
    return null;
  }

  // Public routes (login, register) → render trực tiếp không sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes → render có sidebar
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        {children}
      </div>
    </div>
  );
};

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <RouteGuard>{children}</RouteGuard>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};
