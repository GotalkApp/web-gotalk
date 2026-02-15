'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`;
  const joinDate = user.last_seen 
    ? format(new Date(user.last_seen), "dd MMMM, yyyy", { locale: vi }) 
    : 'N/A';

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>Hồ sơ của tôi</h2>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt={user.name} className="profile-avatar" />
              <button className="profile-avatar-edit">
                <Camera size={20} />
              </button>
            </div>
            <h3 className="profile-name">{user.name}</h3>
            <span className={`profile-status-badge ${user.is_online ? 'online' : 'offline'}`}>
              {user.is_online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          </div>

          <div className="profile-info-section">
            <h4 className="profile-section-title">Thông tin cá nhân</h4>
            
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={20} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
            </div>

            {user.auth_provider && (
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Globe size={20} />
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Phương thức đăng nhập</span>
                  <span className="profile-info-value">{user.auth_provider}</span>
                </div>
              </div>
            )}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Calendar size={20} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Lần cuối hoạt động</span>
                <span className="profile-info-value">{joinDate}</span>
              </div>
            </div>
          </div>

          <div className="profile-bio-section">
            <h4 className="profile-section-title">Giới thiệu</h4>
            <p className="profile-bio">
              Xin chào! Tôi đang sử dụng ứng dụng chat này để kết nối với bạn bè và gia đình.
            </p>
          </div>

          <div className="profile-actions">
            <button className="button button-primary">Chỉnh sửa hồ sơ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
