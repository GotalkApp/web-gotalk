'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Loader2,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { Locale } from '../i18n/messages';

interface SettingItem {
  icon: LucideIcon;
  label: string;
  value?: string;
  action?: () => void;
  hasToggle?: boolean;
  toggleState?: boolean;
  onToggle?: (checked: boolean) => void;
  hasChevron?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout, user, refreshProfile } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await authService.getSettings();
        setNotificationsEnabled(settings.is_notification_enabled ?? true);
        // Map API field is_sound_enabled to local state
        setSoundEnabled(settings.is_sound_enabled ?? true);
        
        // Sync language if different
        if (settings.language && settings.language !== locale) {
             setLocale(settings.language as Locale);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleLogout = async () => {
    await logout();
    // Redirect handled by AuthContext/RouterGuard
  };

  const handleToggleNotifications = async (checked: boolean) => {
    setNotificationsEnabled(checked);
    setLoading(true);
    try {
      await authService.updateSettings({
        is_notification_enabled: checked,
      });
      // Optionally refresh profile to sync context
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('Failed to update notifications setting:', error);
      // Revert on error
      setNotificationsEnabled(!checked);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSound = async (checked: boolean) => {
    setSoundEnabled(checked);
    setLoading(true);
    try {
      await authService.updateSettings({
        is_sound_enabled: checked,
      });
      // Optionally refresh profile to sync context
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('Failed to update sound setting:', error);
      // Revert on error
      setSoundEnabled(!checked);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale === locale) {
        setIsLanguageModalOpen(false);
        return;
    }

    setLocale(newLocale);
    setIsLanguageModalOpen(false);
    setLoading(true);

    try {
        await authService.updateSettings({
            language: newLocale
        });
        if (refreshProfile) {
            await refreshProfile();
        }
    } catch (error) {
        console.error('Failed to update language setting:', error);
        // Ideally revert locale here if critical
    } finally {
        setLoading(false);
    }
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
          hasToggle: true,
          toggleState: notificationsEnabled,
          onToggle: handleToggleNotifications
        },
        {
          icon: Bell,
          label: t('sound_notifications'),
          hasToggle: true,
          toggleState: soundEnabled,
          onToggle: handleToggleSound
        }
      ]
    },

    {
      title: t('general'),
      items: [
        {
          icon: Globe,
          label: t('language'),
          value: locale === 'vi' ? 'Tiếng Việt' : 'English',
          hasChevron: true,
          action: () => setIsLanguageModalOpen(true)
        },
        // {
        //   icon: HelpCircle,
        //   label: t('help'),
        //   hasChevron: true
        // }
      ]
    }
  ];

  if (initialLoading) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

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
                  return (
                    <div
                      key={itemIndex}
                      className="settings-item"
                      onClick={item.action}
                      style={{ cursor: item.action || item.hasToggle ? 'pointer' : 'default' }}
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
                          <div 
                            className="settings-toggle"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.onToggle && !loading) {
                                item.onToggle(!item.toggleState);
                              }
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={item.toggleState ?? false}
                              onChange={(e) => {
                                if (item.onToggle && !loading) {
                                  item.onToggle(e.target.checked);
                                }
                              }}
                              disabled={loading}
                            />
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

      {/* Language Selection Modal */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsLanguageModalOpen(false)}>
          <div className="bg-[var(--chat-white)] text-[var(--chat-text)] rounded-lg shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--chat-border)] flex justify-between items-center" style={{ padding: '16px' }}>
              <h3 className="text-lg font-semibold">{t('language')}</h3>
              <button 
                onClick={() => setIsLanguageModalOpen(false)} 
                className="p-1 hover:bg-[var(--chat-hover)] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-2">
              <div 
                className={`settings-item rounded-lg ${locale === 'vi' ? 'bg-[var(--chat-primary-light)]' : 'hover:bg-[var(--chat-hover)]'}`}
                onClick={() => handleLanguageChange('vi')}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <div className="settings-item-left">
                  <div className="settings-item-icon">
                    <span className="text-xl">🇻🇳</span>
                  </div>
                  <span className={`settings-item-label ${locale === 'vi' ? 'text-[var(--chat-primary)] font-medium' : ''}`}>Tiếng Việt</span>
                </div>
                <div className="settings-item-right">
                  {locale === 'vi' && <Check size={20} className="text-[var(--chat-primary)]" />}
                </div>
              </div>
              
              <div 
                className={`settings-item rounded-lg ${locale === 'en' ? 'bg-[var(--chat-primary-light)]' : 'hover:bg-[var(--chat-hover)]'}`}
                onClick={() => handleLanguageChange('en')}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <div className="settings-item-left">
                  <div className="settings-item-icon">
                    <span className="text-xl">🇺🇸</span>
                  </div>
                  <span className={`settings-item-label ${locale === 'en' ? 'text-[var(--chat-primary)] font-medium' : ''}`}>English</span>
                </div>
                <div className="settings-item-right">
                  {locale === 'en' && <Check size={20} className="text-[var(--chat-primary)]" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
