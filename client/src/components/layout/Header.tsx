import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, ArrowUpRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';
import { useTheme } from '../../hooks/useTheme';
import { MobileMenu } from './MobileMenu';

export const Header: React.FC = () => {
  const { data: settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: t('nav.work'), path: '/work' },
    { label: t('nav.portfolio'), path: '/portfolio' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.details'), path: '/details' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  const currentLang = i18n.language.startsWith('en') ? 'en' : 'vi';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
    document.documentElement.lang = nextLang;
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-neutral-900 text-white text-xs uppercase tracking-widest outline-none"
      >
        {t('nav.skipToContent')}
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-cream-50/85 dark:bg-neutral-950/85 backdrop-blur-xl border-b border-neutral-200/70 dark:border-neutral-800/80 py-3.5'
            : 'bg-cream-50/60 dark:bg-neutral-950/60 backdrop-blur-md border-b border-neutral-200/30 dark:border-neutral-800/30 py-5'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
          {/* Left: Editorial Wordmark */}
          <Link
            to="/"
            className="group flex items-baseline gap-1 focus:outline-none"
          >
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName || 'chinphotos'}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="font-serif text-2xl sm:text-[28px] tracking-[0.04em] lowercase font-normal text-neutral-900 dark:text-cream-100">
                {settings?.siteName || 'chinphotos'}
                <span className="text-accent-600 dark:text-accent-400 font-serif">.</span>
              </span>
            )}
          </Link>

          {/* Center: Navigation with Floating Shared Pill Highlight */}
          <nav
            className="hidden lg:flex items-center gap-2"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onMouseEnter={() => setHoveredPath(link.path)}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                    isActive
                      ? 'text-accent-600 dark:text-accent-400 font-medium'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {hoveredPath === link.path && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 rounded-full bg-neutral-900/[0.05] dark:bg-white/[0.07] -z-10"
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-line"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute bottom-1 left-4 right-4 h-[1.5px] bg-accent-600 dark:bg-accent-400"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: Sleek Language Button + Theme + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Sleek Minimal Language Toggle with Animated Flip Text */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={`Switch language (current: ${currentLang.toUpperCase()})`}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-900/[0.05] dark:hover:bg-white/[0.07] transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400 transition-transform duration-500 group-hover:rotate-180" />
              <span className="relative inline-flex overflow-hidden h-4 w-5 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={currentLang}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="font-semibold"
                  >
                    {currentLang.toUpperCase()}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>

            {/* Animated Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-neutral-900/[0.05] dark:hover:bg-white/[0.07] transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 stroke-[1.5]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            <span className="w-px h-4 bg-neutral-300/80 dark:bg-neutral-800" />

            <Link
              to="/contact"
              className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full overflow-hidden bg-neutral-900 dark:bg-cream-100 text-[11px] uppercase tracking-[0.2em] font-medium text-white dark:text-neutral-950 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-accent-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 group-hover:text-white transition-colors">
                {t('nav.checkAvailability')}
              </span>
              <ArrowUpRight className="relative z-10 w-3.5 h-3.5 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900/[0.05] dark:bg-white/[0.08] text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-700 dark:text-neutral-200"
            >
              <Globe className="w-3 h-3 text-accent-600 dark:text-accent-400" />
              <span>{currentLang.toUpperCase()}</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2.5 rounded-full bg-neutral-900/[0.05] dark:bg-white/[0.08] text-neutral-900 dark:text-cream-100"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        settings={settings}
      />
    </>
  );
};

export default Header;
