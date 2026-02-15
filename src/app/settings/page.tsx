'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { LucideIcon } from 'lucide-react';
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

interface SettingItem {
  icon: LucideIcon;
  label: string;
  value?: string;
  action?: () => void;
  hasToggle?: boolean;
  hasChevron?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    // Redirect handled by AuthContext/RouterGuard
  };

  const settingSections: SettingSection[] = [
    {
      title: t('theme'),
      items: [
        {
          icon: theme === 'light' ? Sun : Moon,
          label: t('theme'),
          value: theme === 'light' ? t('light_mode') : t('dark_mode'),
          action: toggleTheme
        }
      ]
    },
    {
      title: t('notifications'),
      items: [
        {
          icon: Bell,
          label: t('push_notifications'),
          value: 'On',
          hasToggle: true
        },
        {
          icon: Bell,
          label: t('sound_notifications'),
          value: 'On',
          hasToggle: true
        }
      ]
    },
    {
      title: t('privacy_security'),
      items: [
        {
          icon: Lock,
          label: t('privacy'),
          hasChevron: true
        },
        {
          icon: Lock,
          label: t('security'),
          hasChevron: true
        }
      ]
    },
    {
      title: t('general'),
      items: [
        {
          icon: Globe,
          label: t('language'),
          value: t('language') === 'Language' ? 'English' : 'Tiếng Việt',
          hasChevron: true
        },
        {
          icon: HelpCircle,
          label: t('help'),
          hasChevron: true
        }
      ]
    }
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h2>{t('settings_title')}</h2>
        </div>

        <div className="settings-content">
          {settingSections.map((section, index) => (
            <div key={index} className="settings-section">
              <h3 className="settings-section-title">{section.title}</h3>
              <div className="settings-items">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  // @ts-ignore
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
              <div 
                className="settings-item settings-item-danger" 
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
              >
                <div className="settings-item-left">
                  <div className="settings-item-icon">
                    <LogOut size={20} />
                  </div>
                  <span className="settings-item-label">{t('logout')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
