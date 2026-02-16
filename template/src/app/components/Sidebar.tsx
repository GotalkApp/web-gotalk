import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { MessageCircle, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Chat' },
    { path: '/profile', icon: User, label: 'Hồ sơ' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <MessageCircle size={32} className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
              onClick={handleNavClick}
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