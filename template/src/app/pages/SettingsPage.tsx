import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Moon, 
  Sun, 
  Bell, 
  Lock, 
  Globe, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const settingSections = [
    {
      title: 'Giao diện',
      items: [
        {
          icon: theme === 'light' ? Sun : Moon,
          label: 'Chủ đề',
          value: theme === 'light' ? 'Sáng' : 'Tối',
          action: toggleTheme
        }
      ]
    },
    {
      title: 'Thông báo',
      items: [
        {
          icon: Bell,
          label: 'Thông báo đẩy',
          value: 'Bật',
          hasToggle: true
        },
        {
          icon: Bell,
          label: 'Âm thanh thông báo',
          value: 'Bật',
          hasToggle: true
        }
      ]
    },
    {
      title: 'Quyền riêng tư & Bảo mật',
      items: [
        {
          icon: Lock,
          label: 'Quyền riêng tư',
          hasChevron: true
        },
        {
          icon: Lock,
          label: 'Bảo mật',
          hasChevron: true
        }
      ]
    },
    {
      title: 'Chung',
      items: [
        {
          icon: Globe,
          label: 'Ngôn ngữ',
          value: 'Tiếng Việt',
          hasChevron: true
        },
        {
          icon: HelpCircle,
          label: 'Trợ giúp',
          hasChevron: true
        }
      ]
    }
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h2>Cài đặt</h2>
        </div>

        <div className="settings-content">
          {settingSections.map((section, index) => (
            <div key={index} className="settings-section">
              <h3 className="settings-section-title">{section.title}</h3>
              <div className="settings-items">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={itemIndex}
                      className="settings-item"
                      onClick={item.action}
                      style={{ cursor: item.action ? 'pointer' : 'default' }}
                    >
                      <div className="settings-item-left">
                        <div className="settings-item-icon">
                          <Icon size={20} />
                        </div>
                        <span className="settings-item-label">{item.label}</span>
                      </div>
                      <div className="settings-item-right">
                        {item.value && (
                          <span className="settings-item-value">{item.value}</span>
                        )}
                        {item.hasToggle && (
                          <div className="settings-toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="settings-toggle-slider"></span>
                          </div>
                        )}
                        {item.hasChevron && (
                          <ChevronRight size={20} className="settings-chevron" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="settings-section">
            <div className="settings-items">
              <div className="settings-item settings-item-danger">
                <div className="settings-item-left">
                  <div className="settings-item-icon">
                    <LogOut size={20} />
                  </div>
                  <span className="settings-item-label">Đăng xuất</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
