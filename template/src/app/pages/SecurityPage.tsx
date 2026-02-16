import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Lock, 
  Key,
  Smartphone,
  Shield,
  CheckCircle2,
  Mail,
  Clock,
  MapPin,
  Globe
} from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const navigate = useNavigate();

  const securityInfo = [
    {
      icon: Shield,
      label: 'Trạng thái bảo mật',
      value: 'Tài khoản được bảo vệ',
      status: 'good',
      description: 'Xác thực hai yếu tố đang hoạt động'
    },
    {
      icon: Key,
      label: 'Mật khẩu',
      value: 'Mạnh',
      status: 'good',
      description: 'Lần đổi cuối: 2 tháng trước'
    },
    {
      icon: Shield,
      label: 'Xác thực hai yếu tố',
      value: 'Đã bật',
      status: 'good',
      description: 'Bảo vệ bằng ứng dụng xác thực'
    },
    {
      icon: Smartphone,
      label: 'Sinh trắc học',
      value: 'Đã tắt',
      status: 'neutral',
      description: 'Vân tay và Face ID'
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email khôi phục',
      value: 'user@example.com',
      verified: true
    },
    {
      icon: Smartphone,
      label: 'Số điện thoại',
      value: '+84 *** *** **34',
      verified: true
    }
  ];

  const activityInfo = [
    {
      icon: Smartphone,
      label: 'Phiên đăng nhập',
      value: '3 thiết bị',
      description: 'iPhone 13, MacBook Pro, iPad Air'
    },
    {
      icon: MapPin,
      label: 'Vị trí đăng nhập gần nhất',
      value: 'Hà Nội, Việt Nam',
      description: 'Hôm nay lúc 10:30'
    },
    {
      icon: Clock,
      label: 'Lần đăng nhập cuối',
      value: 'Vừa xong',
      description: 'iPhone 13 - iOS 17.2'
    }
  ];

  const recoveryInfo = [
    {
      icon: Key,
      label: 'Mã khôi phục',
      value: '8 mã còn lại',
      description: 'Dùng khi không truy cập được thiết bị chính'
    },
    {
      icon: Mail,
      label: 'Email dự phòng',
      value: 'backup@example.com',
      description: 'Nhận thông báo khẩn cấp'
    }
  ];

  return (
    <div className="security-page">
      <div className="security-container">
        <div className="security-header">
          <button className="icon-button" onClick={() => navigate('/settings')}>
            <ArrowLeft size={24} />
          </button>
          <h2>Bảo mật</h2>
        </div>

        <div className="security-alert">
          <div className="security-alert-icon">
            <Shield size={24} />
          </div>
          <div className="security-alert-content">
            <h4>Tài khoản của bạn được bảo vệ</h4>
            <p>Xác thực hai yếu tố đang hoạt động và tài khoản của bạn an toàn.</p>
          </div>
        </div>

        <div className="security-content">
          {/* Security Status Section */}
          <div className="security-section">
            <h3 className="security-section-title">Tình trạng bảo mật</h3>
            <div className="security-items">
              {securityInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="security-info-item">
                    <div className="security-info-left">
                      <div className={`security-info-icon ${item.status}`}>
                        <Icon size={20} />
                      </div>
                      <div className="security-info-content">
                        <span className="security-info-label">{item.label}</span>
                        <span className="security-info-description">{item.description}</span>
                      </div>
                    </div>
                    <div className="security-info-right">
                      <span className={`security-info-value ${item.status}`}>{item.value}</span>
                      {item.status === 'good' && (
                        <CheckCircle2 size={20} className="security-check-icon" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Information */}
          <div className="security-section">
            <h3 className="security-section-title">Thông tin liên hệ</h3>
            <div className="security-items">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="security-info-item">
                    <div className="security-info-left">
                      <div className="security-info-icon">
                        <Icon size={20} />
                      </div>
                      <div className="security-info-content">
                        <span className="security-info-label">{item.label}</span>
                        <span className="security-info-description">{item.value}</span>
                      </div>
                    </div>
                    {item.verified && (
                      <div className="security-info-right">
                        <span className="security-verified-badge">
                          <CheckCircle2 size={16} />
                          Đã xác minh
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Information */}
          <div className="security-section">
            <h3 className="security-section-title">Hoạt động gần đây</h3>
            <div className="security-items">
              {activityInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="security-info-item">
                    <div className="security-info-left">
                      <div className="security-info-icon">
                        <Icon size={20} />
                      </div>
                      <div className="security-info-content">
                        <span className="security-info-label">{item.label}</span>
                        <span className="security-info-description">{item.description}</span>
                      </div>
                    </div>
                    <div className="security-info-right">
                      <span className="security-info-value">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recovery Options */}
          <div className="security-section">
            <h3 className="security-section-title">Tùy chọn khôi phục</h3>
            <div className="security-items">
              {recoveryInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="security-info-item">
                    <div className="security-info-left">
                      <div className="security-info-icon">
                        <Icon size={20} />
                      </div>
                      <div className="security-info-content">
                        <span className="security-info-label">{item.label}</span>
                        <span className="security-info-description">{item.description}</span>
                      </div>
                    </div>
                    <div className="security-info-right">
                      <span className="security-info-value">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Tips */}
          <div className="security-tips">
            <h4>💡 Mẹo bảo mật</h4>
            <ul>
              <li>Sử dụng mật khẩu mạnh với ít nhất 12 ký tự</li>
              <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
              <li>Bật xác thực hai yếu tố để tăng cường bảo mật</li>
              <li>Kiểm tra hoạt động đăng nhập thường xuyên</li>
              <li>Cập nhật thông tin khôi phục định kỳ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};