import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';

export const Footer: React.FC = () => {
  const { data: settings } = useSettings();
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  return (
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-cream-50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Monospace Editorial Credit in Active Language */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start text-center sm:text-left gap-x-3 gap-y-1 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
          <span>
            &copy; {new Date().getFullYear()} {settings?.siteName || 'chinphotos'}
          </span>
          <span>::</span>
          <span>
            {isVi
              ? 'NHIẾP ẢNH GIA ĐÌNH & TUỔI THƠ TP.HCM'
              : 'SAIGON FAMILY & CHILDHOOD PHOTOGRAPHY'}
          </span>
        </div>

        {/* Right: Minimalist Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-[0.22em] text-neutral-600 dark:text-neutral-400">
          <Link to="/work" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
            {t('nav.work')}
          </Link>
          <Link to="/portfolio" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
            {t('nav.portfolio')}
          </Link>
          <Link to="/about" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
            {t('nav.about')}
          </Link>
          <Link to="/details" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
            {t('nav.details')}
          </Link>
          <Link to="/contact" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
            {t('nav.contact')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
