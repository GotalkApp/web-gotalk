'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Globe, Calendar, Save, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { authService } from '../services/authService';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreviewUrl(user.avatar);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleEditClick = () => {
    setIsEditing(true);
    setName(user.name);
    setPreviewUrl(user.avatar);
    setAvatarFile(null);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setName(user.name);
    setPreviewUrl(user.avatar);
    setAvatarFile(null);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Tên không được để trống');
      return;
    }

    setLoading(true);
    try {
      // Update profile with direct file upload
      await authService.updateProfile({
        name: name.trim(),
        avatarFile: avatarFile || undefined,
      });

      // Refresh user context
      if (refreshProfile) {
        await refreshProfile();
      } else {
        // Fallback if refreshProfile is missing (should verify context)
        console.warn('refreshProfile not found in context');
      }
      
      setIsEditing(false);
      setAvatarFile(null);
      // alert('Cập nhật hồ sơ thành công');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = previewUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`;
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
            <div className={`profile-avatar-wrapper ${isEditing ? 'editable' : ''}`} onClick={handleAvatarClick}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt={name} className="profile-avatar" />
              {isEditing && (
                <div className="profile-avatar-overlay">
                    <Camera size={24} color="white" />
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            {isEditing ? (
                <div className="profile-name-edit">
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="profile-input"
                        placeholder="Nhập tên hiển thị"
                        maxLength={50}
                    />
                </div>
            ) : (
                <h3 className="profile-name">{user.name}</h3>
            )}
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
            {isEditing ? (
                <div className="flex gap-3">
                    <button 
                        className="button button-secondary flex items-center gap-2" 
                        onClick={handleCancelClick}
                        disabled={loading}
                    >
                        <X size={18} /> Hủy
                    </button>
                    <button 
                        className="button button-primary flex items-center gap-2"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Lưu thay đổi
                    </button>
                </div>
            ) : (
                <button 
                    className="button button-primary"
                    onClick={handleEditClick}
                >
                    Chỉnh sửa hồ sơ
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
