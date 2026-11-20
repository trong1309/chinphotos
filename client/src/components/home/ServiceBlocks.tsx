import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useServices } from '../../hooks/useServices';
import { Service } from '../../types';
import { localizeService } from '../../lib/localize';

const FALLBACK_SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1400&q=85',
];

const AUTO_CYCLE_MS = 6000;

export const ServiceBlocks: React.FC = () => {
  const { data: services, isLoading, isError } = useServices();
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const featuredServices = services ? services.slice(0, 4) : [];

  // Built-in automatic cycling animation through services when not hovered
  useEffect(() => {
    if (isPaused || featuredServices.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % featuredServices.length);
    }, AUTO_CYCLE_MS);
    return () => clearInterval(timer);
  }, [isPaused, featuredServices.length]);

  if (isLoading) {
    return <ServiceBlocksSkeleton />;
  }

  if (isError || featuredServices.length === 0) {
    return null;
  }

  const currentService: Service = featuredServices[activeIdx] ?? featuredServices[0]!;
  const localizedCurrent = localizeService(currentService, isVi);
  const currentImage =
    currentService.heroImage ||
    FALLBACK_SERVICE_IMAGES[activeIdx % FALLBACK_SERVICE_IMAGES.length]!;

  const formatPriceVND = (price?: number) => {
    if (!price || price <= 0) return '';
    return isVi
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(price)
      : `${new Intl.NumberFormat('en-US').format(price)} VND`;
  };

  const formattedPrice = formatPriceVND(currentService.priceFrom);

  return (
    <section
      className="py-28 sm:py-36 px-6 sm:px-10 lg:px-14 bg-[#efe5da] dark:bg-[#161412] transition-colors border-b border-neutral-300/60 dark:border-neutral-800/80"
      aria-label="Photography Services"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          {/* Left (5 cols): Sharp Editorial Portrait Frame */}
          <div className="lg:col-span-5">
            <Link
              to={`/services/${currentService.slug}`}
              className="group block relative aspect-[4/5] w-full overflow-hidden bg-neutral-300 dark:bg-neutral-900"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentService._id}
                  src={currentImage}
                  alt={localizedCurrent.title}
                  initial={{ opacity: 0, scale: 1.06, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </AnimatePresence>
            </Link>
          </div>

          {/* Right (7 cols): Auto-Animated Editorial Spread */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Numbered Collection Switcher with Live Auto-Progress Bar */}
            <div
              className="flex flex-wrap items-center gap-6 sm:gap-8 mb-8 pb-4 border-b border-neutral-400/40 dark:border-neutral-800 w-full"
              role="tablist"
              aria-label="Service collections"
            >
              {featuredServices.map((svc, idx) => {
                const isSelected = idx === activeIdx;
                const locSvc = localizeService(svc, isVi);
                return (
                  <button
                    key={svc._id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveIdx(idx)}
                    className={`group relative pb-2.5 flex items-baseline gap-2.5 text-left transition-colors ${
                      isSelected
                        ? 'text-accent-600 dark:text-accent-400'
                        : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <span className="font-mono text-xs tracking-[0.22em]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-lg sm:text-xl">
                      {locSvc.title}
                    </span>
                    {isSelected && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-400/30 dark:bg-neutral-800 overflow-hidden">
                        <motion.span
                          key={`svc-progress-${activeIdx}-${isPaused}`}
                          initial={{ width: '0%' }}
                          animate={{ width: isPaused ? '100%' : '100%' }}
                          transition={{
                            duration: isPaused ? 0.25 : AUTO_CYCLE_MS / 1000,
                            ease: 'linear',
                          }}
                          className="block h-full bg-accent-600 dark:bg-accent-400"
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentService._id}-${isVi ? 'vi' : 'en'}`}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full"
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-600 dark:text-neutral-400 font-medium mb-3">
                  {t('services.subtitle')} &mdash; {String(activeIdx + 1).padStart(2, '0')}
                </p>

                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-accent-600 dark:text-accent-400 font-light tracking-tight mb-6 leading-[1.08]">
                  {localizedCurrent.title}
                </h2>

                <p className="font-serif italic text-xl sm:text-2xl text-neutral-800 dark:text-cream-100 font-light leading-relaxed mb-6 max-w-2xl">
                  {localizedCurrent.summary}
                </p>

                {formattedPrice && (
                  <p className="text-xs font-mono uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400 mb-8">
                    {t('services.startingFrom')} &mdash;{' '}
                    <span className="text-neutral-900 dark:text-cream-100 font-semibold">
                      {formattedPrice}
                    </span>
                  </p>
                )}

                {localizedCurrent.inclusions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 mb-10 pt-6 border-t border-neutral-400/30 dark:border-neutral-800 max-w-2xl">
                    {localizedCurrent.inclusions.slice(0, 4).map((inc, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                        className="flex items-baseline gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-light"
                      >
                        <span className="text-accent-600 dark:text-accent-400 font-mono text-[10px]">
                          /0{i + 1}
                        </span>{' '}
                        <span>{inc}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-8 pt-2">
                  <Link
                    to={`/services/${currentService.slug}`}
                    className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full overflow-hidden bg-neutral-900 dark:bg-cream-100 text-xs uppercase tracking-[0.2em] font-medium text-white dark:text-neutral-950 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="absolute inset-0 bg-accent-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 group-hover:text-white transition-colors">
                      {t('services.viewDetails')}
                    </span>
                    <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to={`/contact?service=${currentService.slug}`}
                    className="group relative inline-flex items-center gap-2 py-2 text-xs uppercase tracking-[0.24em] font-medium text-accent-600 dark:text-accent-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <span>{t('hero.inquire')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent-600/60 group-hover:bg-neutral-900 dark:group-hover:bg-white transition-colors" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const ServiceBlocksSkeleton: React.FC = () => (
  <section className="py-28 sm:py-36 px-6 sm:px-10 lg:px-14 bg-[#efe5da] dark:bg-[#161412]">
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-5 aspect-[4/5] bg-neutral-300/70 dark:bg-neutral-800 animate-pulse" />
      <div className="lg:col-span-7 space-y-5">
        <div className="h-4 w-40 bg-neutral-300/70 dark:bg-neutral-800 animate-pulse" />
        <div className="h-12 w-3/4 bg-neutral-300/70 dark:bg-neutral-800 animate-pulse" />
        <div className="h-6 w-full bg-neutral-300/70 dark:bg-neutral-800 animate-pulse" />
      </div>
    </div>
  </section>
);

export default ServiceBlocks;
