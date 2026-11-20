import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../types';
import { localizeBio } from '../../lib/localize';

interface IntroBioProps {
  settings?: Settings;
}

const DEFAULT_PORTRAIT =
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=85';

export const IntroBio: React.FC<IntroBioProps> = ({ settings }) => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const serviceAreasText = isVi
    ? settings?.serviceAreas && settings.serviceAreas.length > 0
      ? settings.serviceAreas.join(' · ')
      : 'TP. HỒ CHÍ MINH'
    : 'HO CHI MINH CITY · THAO DIEN · PHU MY HUNG';

  const portraitSrc = settings?.logo || settings?.heroImages?.[0] || DEFAULT_PORTRAIT;
  const bioParagraph1 = localizeBio(settings?.bio, isVi, t('intro.bio1'));

  return (
    <section
      id="intro-bio"
      className="py-28 sm:py-36 px-6 sm:px-10 lg:px-14 bg-cream-50 dark:bg-neutral-950 transition-colors border-b border-neutral-200/70 dark:border-neutral-800/80"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Column 1 (3 cols): Scroll-Animated Circular Portrait with Rotating Orbit Ring */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 flex flex-col items-center lg:items-start"
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
              {/* Subtle Continuous Rotating Dashed Tech-Editorial Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-accent-600/35 dark:border-accent-400/35"
              />
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <img
                  src={portraitSrc}
                  alt={settings?.siteName || 'chinphotos portrait'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <span className="mt-5 text-[11px] font-mono uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
              {settings?.siteName || 'chinphotos'} &mdash;{' '}
              {isVi ? 'STUDIO NHIẾP ẢNH' : 'PHOTOGRAPHY STUDIO'}
            </span>
          </motion.div>

          {/* Column 2 (4 cols): Scroll-Animated Eyebrow + Expressive Serif Headline */}
          <motion.div
            initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 text-center lg:text-left"
          >
            <p className="text-[11px] uppercase tracking-[0.26em] text-accent-600 dark:text-accent-400 font-medium mb-4">
              {serviceAreasText}
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-light text-neutral-900 dark:text-cream-100 tracking-tight leading-[1.15]">
              {t('intro.greeting')}
            </h2>
          </motion.div>

          {/* Column 3 (5 cols): Scroll-Animated Narrative Paragraphs */}
          <motion.div
            initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-5 text-neutral-600 dark:text-neutral-300 text-base sm:text-[17px] leading-[1.85] font-light"
          >
            <p>{bioParagraph1}</p>
            <p>{t('intro.bio2')}</p>

            <div className="pt-4">
              <Link
                to="/about"
                className="group relative inline-flex items-center gap-3 text-xs uppercase tracking-[0.24em] font-medium text-accent-600 dark:text-accent-400 hover:text-neutral-900 dark:hover:text-white transition-colors pb-1"
              >
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                <span>{t('intro.cta')}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-neutral-900 dark:bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IntroBio;
