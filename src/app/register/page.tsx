'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { MessageCircle, Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useTranslation } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

type Step = 'register' | 'verify';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('register');

  // Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP fields
  const [otpCode, setOtpCode] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError(t('required_field'));
      return;
    }

    if (name.length < 2) {
      setError(t('name_required'));
      return;
    }

    if (password.length < 6) {
      setError(t('password_min_length'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({ name, email, password });
      setOtpExpiresIn(response.expires_in);
      setSuccessMessage(response.message || t('otp_sent_success'));
      setStep('verify');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.response?.data?.error;
        setError(message || t('register_failed'));
      } else {
        setError(t('error_occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length < 6) {
      setError(t('otp_invalid'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOTP({ email, code: otpCode });

      // Lưu token và user → redirect về trang chính
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.response?.data?.error;
        setError(message || t('otp_invalid'));
      } else {
        setError(t('error_occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.register({ name, email, password });
      setOtpExpiresIn(response.expires_in);
      setSuccessMessage(t('otp_sent_success'));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('error_occurred'));
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
            {step === 'register' ? (
              <>
                <div className="login-card-header">
                  <h2>{t('register_title')}</h2>
                  <p>{t('register_subtitle')}</p>
                </div>

                <form onSubmit={handleRegister} className="login-form">
                  {error && <div className="login-error">{error}</div>}

                  <div className="form-group">
                    <label htmlFor="name">{t('name_label')}</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={20} />
                      <input
                        id="name"
                        type="text"
                        placeholder={t('placeholder_name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        minLength={2}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-email">{t('email_label')}</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={20} />
                      <input
                        id="reg-email"
                        type="email"
                        placeholder={t('placeholder_email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-password">{t('password_label')}</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('placeholder_password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        minLength={6}
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

                  <div className="form-group">
                    <label htmlFor="confirm-password">{t('confirm_password_label')}</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('placeholder_password')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? t('registering') : t('register_button')}
                  </button>
                </form>

                <div className="login-footer">
                  <p>{t('have_account')} <Link href="/login">{t('login_now')}</Link></p>
                </div>
              </>
            ) : (
              <>
                <div className="login-card-header">
                  <button
                    className="otp-back-button"
                    onClick={() => { setStep('register'); setError(''); }}
                  >
                    <ArrowLeft size={20} /> {t('back_button')}
                  </button>
                  <h2>{t('verify_otp_title')}</h2>
                  <p>{t('otp_from_email')} <strong>{email}</strong></p>
                </div>

                <form onSubmit={handleVerifyOTP} className="login-form">
                  {error && <div className="login-error">{error}</div>}
                  {successMessage && (
                    <div className="login-success">{successMessage}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="otp-code">{t('otp_label')}</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        id="otp-code"
                        type="text"
                        placeholder={t('otp_placeholder')}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        disabled={isLoading}
                        maxLength={6}
                        autoComplete="one-time-code"
                        className="otp-input"
                      />
                    </div>
                    {otpExpiresIn > 0 && (
                      <span className="otp-expires">
                        {t('otp_expires_in')} {Math.floor(otpExpiresIn / 60)} phút
                      </span>
                    )}
                  </div>

                  <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? t('otp_verifying') : t('otp_verify_button')}
                  </button>

                  <div className="otp-resend">
                    <p>
                        {t('otp_resend_text')}{' '}
                      <button
                        type="button"
                        className="otp-resend-button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                      >
                       {t('otp_resend_button')}
                      </button>
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
