import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizeTagline } from '../../lib/localize';

interface HeroSlideshowProps {
  images?: string[];
  siteName?: string;
  tagline?: string;
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=2000&q=85',
];

const SLIDE_DURATION_MS = 5500;

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({
  images: propImages,
  siteName = 'chinphotos',
  tagline,
}) => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const validPropImages = propImages?.filter((img) => Boolean(img && img.trim()));
  const images =
    validPropImages && validPropImages.length > 0 ? validPropImages : DEFAULT_IMAGES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || images.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, prefersReducedMotion, images.length, nextSlide]);

  const firstImage = images[0] ?? DEFAULT_IMAGES[0]!;
  const currentImage = images[currentIndex] ?? firstImage;
  const secondaryImage = images[(currentIndex + 1) % images.length] ?? firstImage;

  const displayHeadline = localizeTagline(tagline, isVi);
  const headlineWords = displayHeadline.split(' ');
  const cityLabel = isVi ? 'TP. HỒ CHÍ MINH' : 'HO CHI MINH CITY';

  return (
    <section
      className="relative pt-16 sm:pt-24 pb-0 bg-cream-50 dark:bg-neutral-950 border-b border-neutral-200/70 dark:border-neutral-800/80 overflow-hidden select-none"
      aria-label="Editorial Hero Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Helmet>
        <link rel="preload" as="image" href={firstImage} fetchPriority="high" />
      </Helmet>

      {/* Ambient Floating Light Orb Animation (Built-in Tech Atmosphere) */}
      {!prefersReducedMotion && (
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.12, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-32 right-1/4 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-accent-500/12 via-amber-400/8 to-transparent blur-3xl -z-0"
        />
      )}

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 pb-16 sm:pb-24">
        {/* Top Editorial Masthead Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-10 sm:mb-14">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.28em] text-accent-600 dark:text-accent-400 font-medium mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-600 dark:bg-accent-400" />
              </span>
              <span>
                {t('hero.subtitle')} &mdash; {cityLabel}
              </span>
            </motion.div>

            {/* Staggered Word-by-Word Animated Reveal with real spaces for screen readers */}
            <h1
              key={displayHeadline}
              className="font-serif text-4xl sm:text-6xl lg:text-[4.5rem] font-light text-neutral-900 dark:text-cream-100 tracking-tight leading-[1.08] flex flex-wrap gap-y-1"
            >
              {headlineWords.map((word, idx) => (
                <React.Fragment key={`${word}-${idx}`}>
                  <span className="overflow-hidden inline-block py-0.5">
                    <motion.span
                      initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      transition={{
                        duration: 0.65,
                        delay: idx * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  </span>
                  {idx < headlineWords.length - 1 && (
                    <span className="inline-block w-[0.28em]">&nbsp;</span>
                  )}
                </React.Fragment>
              ))}
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end gap-5"
          >
            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/portfolio"
                className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full overflow-hidden bg-neutral-900 dark:bg-cream-100 text-xs uppercase tracking-[0.2em] font-medium text-white dark:text-neutral-950 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-accent-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {t('hero.exploreWork')}
                </span>
                <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="group relative inline-flex items-center gap-2 py-2 text-xs uppercase tracking-[0.22em] font-medium text-accent-600 dark:text-accent-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <span>{t('hero.inquire')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent-600/60 group-hover:bg-neutral-900 dark:group-hover:bg-white transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Asymmetric Editorial Diptych with Auto Ken-Burns & Live Progress Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Primary Large Frame (8 Columns) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 relative"
          >
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900">
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={`primary-${currentIndex}`}
                  src={currentImage}
                  alt={`${siteName} frame ${currentIndex + 1}`}
                  initial={{
                    opacity: prefersReducedMotion ? 1 : 0,
                    scale: prefersReducedMotion ? 1 : 1.08,
                    filter: prefersReducedMotion ? 'blur(0px)' : 'blur(6px)',
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: prefersReducedMotion ? 1 : 0,
                    scale: prefersReducedMotion ? 1 : 1.03,
                  }}
                  transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading={currentIndex === 0 ? 'eager' : 'lazy'}
                />
              </AnimatePresence>
            </div>

            {/* Live Animated Progress Bar & Slide Switcher Below Image */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              <span>
                {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')} &mdash;{' '}
                {isVi ? `BỘ SƯU TẬP ${siteName}` : `${siteName} ARCHIVE`}
              </span>

              {images.length > 1 && (
                <div
                  className="flex items-center gap-5"
                  role="tablist"
                  aria-label="Slideshow controls"
                >
                  {images.map((_, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Slide ${idx + 1}`}
                        onClick={() => setCurrentIndex(idx)}
                        className="group flex items-center gap-2 focus:outline-none"
                      >
                        <span
                          className={`transition-colors ${
                            isActive
                              ? 'text-neutral-900 dark:text-cream-100 font-semibold'
                              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {/* Animated Progress Track */}
                        <span className="relative h-[2px] w-10 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          {isActive && (
                            <motion.span
                              key={`progress-${currentIndex}-${isPaused}`}
                              initial={{ width: '0%' }}
                              animate={{ width: isPaused ? '35%' : '100%' }}
                              transition={{
                                duration: isPaused ? 0.3 : SLIDE_DURATION_MS / 1000,
                                ease: 'linear',
                              }}
                              className="absolute inset-y-0 left-0 bg-accent-600 dark:bg-accent-400"
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Secondary Offset Vertical Frame (4 Columns) */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block lg:col-span-4 lg:mt-14"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900">
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={`secondary-${currentIndex}`}
                  src={secondaryImage}
                  alt={`${siteName} companion frame`}
                  initial={{
                    opacity: prefersReducedMotion ? 1 : 0,
                    scale: prefersReducedMotion ? 1 : 1.08,
                  }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
            <p className="mt-4 font-serif italic text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isVi
                ? '“Không chỉ là bối cảnh, điều đọng lại mãi là cảm xúc chân thật của gia đình bạn.”'
                : '“It is never just about the setting; it is about the feeling that stays with your family.”'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlideshow;
