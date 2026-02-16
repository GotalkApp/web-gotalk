'use client';

import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ArrowLeft, Lock, Eye, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
            {t('privacy') || 'Privacy'}
          </h1>
        </div>

        {/* Content */}
        <div className="bg-[var(--chat-white)] rounded-xl shadow-sm border border-[var(--chat-border)] overflow-hidden">
          <div className="p-6 border-b border-[var(--chat-border)]">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[var(--chat-text)]">Who can see my profile?</h2>
                    <p className="text-[var(--chat-text-secondary)] text-sm">Manage visibility of your personal info</p>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-[var(--chat-hover)] rounded-lg cursor-pointer transition-colors">
                    <span className="text-[var(--chat-text)]">Last Seen & Online</span>
                    <span className="text-[var(--chat-text-secondary)] text-sm">Everyone</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-[var(--chat-hover)] rounded-lg cursor-pointer transition-colors">
                    <span className="text-[var(--chat-text)]">Profile Photo</span>
                    <span className="text-[var(--chat-text-secondary)] text-sm">Everyone</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-[var(--chat-hover)] rounded-lg cursor-pointer transition-colors">
                    <span className="text-[var(--chat-text)]">About</span>
                    <span className="text-[var(--chat-text-secondary)] text-sm">My Contacts</span>
                </div>
             </div>
          </div>

          <div className="p-6">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[var(--chat-text)]">Data & Personalization</h2>
                    <p className="text-[var(--chat-text-secondary)] text-sm">Control how your data is used</p>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-[var(--chat-hover)] rounded-lg cursor-pointer transition-colors">
                    <span className="text-[var(--chat-text)]">Clear History</span>
                    <span className="text-red-500 text-sm">Clear</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
