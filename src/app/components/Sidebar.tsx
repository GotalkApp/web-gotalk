'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  
  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Chat' },
    { path: '/profile', icon: User, label: 'Hồ sơ' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' }
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <MessageCircle size={32} className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon size={24} />
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          title="Đăng xuất"
        >
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );
};
