import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, CalendarCheck, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../types';
import { SocialIcons } from '../ui/SocialIcons';
import { useTheme } from '../../hooks/useTheme';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: Settings;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { label: t('nav.work'), path: '/work' },
    { label: t('nav.portfolio'), path: '/portfolio' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.details'), path: '/details' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  const currentLang = i18n.language.startsWith('en') ? 'en' : 'vi';

  const toggleLanguage = () => {
    const newLang = currentLang === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-cream-50 dark:bg-cream-950 flex flex-col justify-between p-6 sm:p-10 lg:hidden overflow-y-auto"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-4">
            <span className="font-serif text-xl tracking-wider font-semibold text-neutral-900 dark:text-cream-100">
              {settings?.siteName || 'chinphotos'}
              <span className="text-accent-600 dark:text-accent-400">.</span>
            </span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col justify-center gap-5 my-6">
            {navItems.map((item, idx) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * idx, duration: 0.2 }}
              >
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `font-serif text-3xl tracking-wide transition-colors ${
                      isActive
                        ? 'text-accent-600 dark:text-accent-400 font-medium'
                        : 'text-neutral-800 dark:text-cream-200 hover:text-accent-500'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </motion.div>
            ))}

            {/* Prominent CTA in Mobile Menu per prompt v2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="pt-4"
            >
              <Link
                to="/contact"
                onClick={onClose}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-neutral-900 dark:bg-cream-100 text-white dark:text-neutral-900 text-xs uppercase tracking-[0.2em] font-medium rounded-sm shadow-md"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{t('nav.checkAvailability')}</span>
              </Link>
            </motion.div>
          </nav>

          {/* Bottom Actions & Social */}
          <div className="border-t border-neutral-200/60 dark:border-neutral-800 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle dark/light mode"
                  className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  aria-label="Switch language"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{currentLang.toUpperCase()}</span>
                </button>
              </div>

              <SocialIcons social={settings?.social} />
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              &copy; {new Date().getFullYear()} {settings?.siteName || 'chinphotos'}. {t('footer.rights')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
