import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../types';
import api from '../../lib/api';

interface ConnectCTAProps {
  settings?: Settings;
}

export const ConnectCTA: React.FC<ConnectCTAProps> = ({ settings }) => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage(isVi ? 'Vui lòng nhập địa chỉ email hợp lệ.' : 'Please enter a valid email.');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');
      await api.post('/subscribers', { email });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMessage(
        isVi
          ? 'Không thể đăng ký hoặc email này đã tồn tại.'
          : 'Subscription failed or email already exists.',
      );
    }
  };

  const contactEmail = settings?.contactEmail || 'hello@chinphotos.vn';
  const serviceAreas = isVi
    ? settings?.serviceAreas && settings.serviceAreas.length > 0
      ? settings.serviceAreas.join(', ')
      : 'TP. Hồ Chí Minh'
    : 'Ho Chi Minh City, Thao Dien, Phu My Hung';

  const socialLinks = [
    { label: 'INSTAGRAM', url: settings?.social?.instagram },
    { label: 'FACEBOOK', url: settings?.social?.facebook },
    { label: 'TIKTOK', url: settings?.social?.tiktok },
    { label: 'YOUTUBE', url: settings?.social?.youtube },
    { label: 'THREADS', url: settings?.social?.threads },
  ].filter((item) => Boolean(item.url && item.url.trim()));

  return (
    <section
      className="py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#e8d5c8] dark:bg-[#141210] transition-colors"
      aria-label="Connect and Follow"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start">
          {/* Column 1 (7 cols) */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-[0.28em] font-semibold text-neutral-900 dark:text-cream-100">
                {isVi ? 'KẾT NỐI' : 'CONNECT'}
              </span>
              <span className="w-8 h-[1px] bg-neutral-900 dark:bg-cream-100" />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-6 leading-[1.12] max-w-xl">
              {t('connect.title')}
            </h2>

            <p className="text-xs uppercase tracking-[0.22em] text-neutral-700 dark:text-neutral-300 mb-3">
              {serviceAreas}
            </p>

            <p className="mb-8">
              <a
                href={`mailto:${contactEmail}`}
                className="text-xs uppercase tracking-[0.22em] font-mono text-neutral-800 dark:text-cream-200 hover:text-accent-600 dark:hover:text-accent-400 underline underline-offset-4 transition-colors"
              >
                {contactEmail}
              </a>
            </p>

            <Link
              to="/contact"
              className="group relative inline-flex items-center gap-2.5 px-6 py-3 overflow-hidden border border-neutral-900 dark:border-cream-100 text-xs uppercase tracking-[0.24em] font-semibold text-neutral-900 dark:text-cream-100 transition-colors duration-300 hover:text-white dark:hover:text-neutral-950"
            >
              <span className="absolute inset-0 bg-neutral-900 dark:bg-cream-100 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="relative z-10">{t('connect.checkAvailability')}</span>
            </Link>
          </div>

          {/* Column 2 (5 cols) */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs uppercase tracking-[0.28em] font-semibold text-neutral-900 dark:text-cream-100">
                  {isVi ? 'THEO DÕI' : 'FOLLOW'}
                </span>
                <span className="w-8 h-[1px] bg-neutral-900 dark:bg-cream-100" />
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {socialLinks.length > 0 ? (
                  socialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative py-0.5 text-xs uppercase tracking-[0.24em] text-neutral-800 dark:text-cream-200 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                    >
                      <span>{item.label}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent-600 dark:bg-accent-400 transition-all duration-300 group-hover:w-full" />
                    </a>
                  ))
                ) : (
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
                    @CHINPHOTOS
                  </span>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-900/15 dark:border-neutral-800">
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-700 dark:text-neutral-400 mb-3">
                {t('connect.newsletterTitle')}
              </p>

              {status === 'success' ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('connect.subscribed')}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex items-center border-b border-neutral-900/40 dark:border-neutral-700 focus-within:border-accent-600 pb-2 transition-colors">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('connect.emailPlaceholder')}
                      required
                      className="flex-1 bg-transparent text-xs text-neutral-900 dark:text-white placeholder:text-neutral-600 dark:placeholder:text-neutral-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="text-[11px] uppercase tracking-[0.24em] font-semibold text-accent-600 dark:text-accent-400 hover:text-neutral-900 dark:hover:text-white transition-transform duration-200 hover:translate-x-1 disabled:opacity-50"
                    >
                      {status === 'loading' ? '...' : `→ ${t('connect.subscribe')}`}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-rose-600 font-light">{errorMessage}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectCTA;
