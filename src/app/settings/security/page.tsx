'use client';

import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ArrowLeft, Shield, Key, Smartphone, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-200">
      <div className="max-w-2xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--chat-hover)] rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--chat-text)]" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--chat-text)]">
            {t('security') || 'Security'}
          </h1>
        </div>

        {/* Content */}
        <div className="bg-[var(--chat-white)] rounded-xl shadow-sm border border-[var(--chat-border)] overflow-hidden divide-y divide-[var(--chat-border)]">
          
          {/* 2FA Section */}
          <div className="p-6">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[var(--chat-text)]">Two-Step Verification</h2>
                    <p className="text-[var(--chat-text-secondary)] text-sm">Add an extra layer of security</p>
                </div>
             </div>
             
             <div className="flex items-center justify-between p-3 bg-[var(--chat-secondary)] rounded-lg">
                <span className="text-[var(--chat-text)] font-medium">2FA is currently off</span>
                <button className="px-4 py-2 bg-[var(--chat-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                    Enable
                </button>
             </div>
          </div>

          {/* Password Section */}
          <div className="p-6">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Key className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[var(--chat-text)]">Password</h2>
                    <p className="text-[var(--chat-text-secondary)] text-sm">Manage your password</p>
                </div>
             </div>
             
             <button className="w-full flex items-center justify-between p-3 hover:bg-[var(--chat-hover)] rounded-lg cursor-pointer transition-colors text-left">
                <span className="text-[var(--chat-text)]">Change Password</span>
                <span className="text-[var(--chat-text-secondary)] text-sm">Last changed 3 months ago</span>
             </button>
          </div>

          {/* Active Sessions */}
          <div className="p-6">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[var(--chat-secondary)] rounded-lg">
                    <Lock className="w-6 h-6 text-[var(--chat-text-secondary)]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[var(--chat-text)]">Active Sessions</h2>
                    <p className="text-[var(--chat-text-secondary)] text-sm">Manage devices logged in</p>
                </div>
             </div>
             
             <div className="space-y-2">
                 <div className="flex items-center justify-between p-3 hover:bg-[var(--chat-hover)] rounded-lg transition-colors">
                    <div>
                        <div className="text-[var(--chat-text)] font-medium">MacBook Pro</div>
                        <div className="text-[var(--chat-text-secondary)] text-xs">Ho Chi Minh City, Vietnam • Active now</div>
                    </div>
                </div>
                 <div className="flex items-center justify-between p-3 hover:bg-[var(--chat-hover)] rounded-lg transition-colors">
                    <div>
                        <div className="text-[var(--chat-text)] font-medium">iPhone 13</div>
                        <div className="text-[var(--chat-text-secondary)] text-xs">Ho Chi Minh City, Vietnam • 2 hours ago</div>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
