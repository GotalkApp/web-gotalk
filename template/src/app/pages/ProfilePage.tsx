import React, { useState } from 'react';
import { currentUser } from '../data/mockData';
import { Camera, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [user] = useState(currentUser);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>Hồ sơ của tôi</h2>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <img src={user.avatar} alt={user.name} className="profile-avatar" />
              <button className="profile-avatar-edit">
                <Camera size={20} />
              </button>
            </div>
            <h3 className="profile-name">{user.name}</h3>
            <span className="profile-status-badge online">Đang hoạt động</span>
          </div>

          <div className="profile-info-section">
            <h4 className="profile-section-title">Thông tin cá nhân</h4>
            
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={20} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">example@email.com</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Phone size={20} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Số điện thoại</span>
                <span className="profile-info-value">+84 123 456 789</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <MapPin size={20} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Địa chỉ</span>
                <span className="profile-info-value">Hà Nội, Việt Nam</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Calendar size={20} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Ngày tham gia</span>
                <span className="profile-info-value">14 tháng 2, 2024</span>
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
};
