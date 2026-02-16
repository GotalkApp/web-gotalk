import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Eye, 
  MessageCircle, 
  Users, 
  Image,
  Clock,
  CheckCircle2,
  Activity,
  Globe
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    status: 'contacts',
    readReceipts: true,
    groups: 'contacts',
    liveLocation: false,
    blockedContacts: 3
  });

  const privacySections = [
    {
      title: 'Ai có thể xem thông tin của tôi',
      items: [
        {
          icon: Clock,
          label: 'Lần truy cập cuối',
          key: 'lastSeen',
          description: 'Nếu bạn không chia sẻ, bạn sẽ không thấy lần truy cập cuối của người khác'
        },
        {
          icon: Image,
          label: 'Ảnh đại diện',
          key: 'profilePhoto',
          description: 'Ai có thể xem ảnh đại diện của bạn'
        },
        {
          icon: MessageCircle,
          label: 'Giới thiệu',
          key: 'about',
          description: 'Ai có thể xem giới thiệu của bạn'
        },
        {
          icon: Activity,
          label: 'Trạng thái',
          key: 'status',
          description: 'Ai có thể xem trạng thái của bạn'
        }
      ]
    },
    {
      title: 'Tin nhắn',
      items: [
        {
          icon: CheckCircle2,
          label: 'Xác nhận đã đọc',
          key: 'readReceipts',
          description: 'Nếu tắt, bạn sẽ không thể xem xác nhận đã đọc của người khác',
          isToggle: true
        }
      ]
    },
    {
      title: 'Nhóm & Kênh',
      items: [
        {
          icon: Users,
          label: 'Ai có thể thêm tôi vào nhóm',
          key: 'groups',
          description: 'Kiểm soát ai có thể thêm bạn vào nhóm'
        }
      ]
    },
    {
      title: 'Vị trí',
      items: [
        {
          icon: Globe,
          label: 'Vị trí trực tiếp',
          key: 'liveLocation',
          description: 'Chia sẻ vị trí trực tiếp của bạn',
          isToggle: true
        }
      ]
    }
  ];

  const options = [
    { value: 'everyone', label: 'Mọi người' },
    { value: 'contacts', label: 'Liên hệ của tôi' },
    { value: 'nobody', label: 'Không ai' }
  ];

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <button className="icon-button" onClick={() => navigate('/settings')}>
            <ArrowLeft size={24} />
          </button>
          <h2>Quyền riêng tư</h2>
        </div>

        <div className="privacy-content">
          {privacySections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="privacy-section">
              <h3 className="privacy-section-title">{section.title}</h3>
              <div className="privacy-items">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const currentValue = settings[item.key as keyof typeof settings];
                  
                  return (
                    <div key={itemIndex} className="privacy-item">
                      <div className="privacy-item-header">
                        <div className="privacy-item-left">
                          <div className="privacy-item-icon">
                            <Icon size={20} />
                          </div>
                          <div className="privacy-item-info">
                            <span className="privacy-item-label">{item.label}</span>
                            <span className="privacy-item-description">
                              {item.description}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {item.isToggle ? (
                        <div className="privacy-item-control">
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={currentValue as boolean}
                              onChange={() => handleToggle(item.key)}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      ) : (
                        <div className="privacy-options">
                          {options.map((option) => (
                            <label
                              key={option.value}
                              className={`privacy-option ${
                                currentValue === option.value ? 'selected' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={item.key}
                                value={option.value}
                                checked={currentValue === option.value}
                                onChange={() => handleSelect(item.key, option.value)}
                              />
                              <span className="privacy-option-radio"></span>
                              <span className="privacy-option-label">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="privacy-section">
            <h3 className="privacy-section-title">Chặn</h3>
            <div className="privacy-items">
              <div className="privacy-item privacy-item-clickable" onClick={() => console.log('Open blocked list')}>
                <div className="privacy-item-header">
                  <div className="privacy-item-left">
                    <div className="privacy-item-icon">
                      <Users size={20} />
                    </div>
                    <div className="privacy-item-info">
                      <span className="privacy-item-label">Danh sách chặn</span>
                      <span className="privacy-item-description">
                        {settings.blockedContacts} liên hệ bị chặn
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
