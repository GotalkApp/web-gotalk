'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { MessageCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { getEnv } from '../config/env';

// Use runtime environment variable
// const GOOGLE_CLIENT_ID = getEnv().GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

function LoginForm() {
  const router = useRouter();
  const { login, loginWithGoogle: authLoginWithGoogle } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError(t('required_field'));
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.response?.data?.error;
        setError(message || t('login_failed'));
      } else {
        setError(t('error_occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <LanguageSwitcher />
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="login-logo">
              <MessageCircle size={48} />
            </div>
            <h1>{t('app_name')}</h1>
            <p>{t('app_tagline')}</p>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h2>{t('login_title')}</h2>
              <p>{t('login_subtitle')}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">{t('email_label')}</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    placeholder={t('placeholder_email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">{t('password_label')}</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('placeholder_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>{t('remember_me')}</span>
                </label>
                <a href="#" className="forgot-password">{t('forgot_password')}</a>
              </div>
              
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? t('logging_in') : t('login_button')}
              </button>
            </form>
            
            <div className="login-divider">
              <span>{t('or_divider')}</span>
            </div>
            
            <div className="login-social" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="google-login-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      console.log('Google Login Success:', credentialResponse);
                      if (credentialResponse.credential) {
                        try {
                          setIsLoading(true);
                          // Send ID Token to backend
                          await authLoginWithGoogle(credentialResponse.credential);
                          router.push('/');
                        } catch (err) {
                           console.error('Backend Google Login Failed:', err);
                           if (axios.isAxiosError(err)) {
                                setError(err.response?.data?.message || t('login_failed'));
                           } else {
                                setError('Google Login verification failed');
                           }
                           setIsLoading(false);
                        }
                      }
                    }}
                    onError={() => {
                      console.log('Google Login Failed');
                      setError('Google Login Failed');
                    }}

                    theme="outline"
                    shape="rectangular"
                    width="100%"
                  />
              </div>
            </div>
            
            <div className="login-footer">
              <p>{t('no_account')} <Link href="/register">{t('register_now')}</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={getEnv().GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
