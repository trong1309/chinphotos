import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { subscribeNewsletter } from '../../services/subscriber.service';

export const NewsletterForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !validateEmail(trimmed)) {
      setStatus('error');
      setFeedbackMessage(
        isVi ? 'Vui lòng nhập địa chỉ email hợp lệ.' : 'Please enter a valid email address.',
      );
      return;
    }

    try {
      setStatus('loading');
      const response = await subscribeNewsletter(trimmed);
      setStatus('success');
      setFeedbackMessage(
        response.message ||
          (isVi
            ? 'Cảm ơn bạn đã đăng ký nhận bản tin của chinphotos!'
            : 'Thank you for subscribing to our newsletter!'),
      );
      setEmail('');
    } catch {
      setStatus('error');
      setFeedbackMessage(
        isVi
          ? 'Đã xảy ra lỗi khi gửi. Vui lòng thử lại sau.'
          : 'Failed to subscribe. Please try again later.',
      );
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-serif text-lg tracking-wider text-neutral-900 dark:text-cream-100 uppercase">
        {t('connect.newsletterBadge')}
      </h3>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
        {t('connect.newsletterDescription')}
      </p>

      {status === 'success' ? (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
          <span>{feedbackMessage}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder={t('connect.emailPlaceholder')}
              disabled={status === 'loading'}
              className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 text-neutral-900 dark:text-cream-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
            >
              {status === 'loading' ? (
                <span>...</span>
              ) : (
                <>
                  <span>{t('connect.subscribe')}</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {status === 'error' && (
            <div className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default NewsletterForm;
