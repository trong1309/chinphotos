import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types';
import { useTranslation } from 'react-i18next';
import { localizeCategory } from '../../lib/localize';

const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=1400&q=85',
];

export const CategoryGrid: React.FC = () => {
  const { data: categories, isLoading, isError } = useCategories();
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  if (isLoading) {
    return <CategoryGridSkeleton />;
  }

  if (isError || !categories || categories.length === 0) {
    return null;
  }

  return (
    <section
      className="py-28 sm:py-36 px-6 sm:px-10 lg:px-14 bg-cream-50 dark:bg-neutral-950 transition-colors border-b border-neutral-200/70 dark:border-neutral-800/80"
      aria-label="Portfolio Categories"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Scroll-Animated Editorial Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 sm:mb-24 gap-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent-600 dark:text-accent-400 font-medium mb-3">
              {t('portfolio.subtitle')}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-[3.5rem] text-neutral-900 dark:text-cream-100 font-light tracking-tight leading-none">
              {t('portfolio.title')}
            </h2>
          </div>

          <Link
            to="/portfolio"
            className="group relative inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.24em] font-medium text-neutral-800 dark:text-cream-200 hover:text-accent-600 dark:hover:text-accent-400 transition-colors pb-1 border-b border-neutral-400 dark:border-neutral-700 hover:border-accent-600"
          >
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            <span>{t('portfolio.viewAll')}</span>
          </Link>
        </motion.div>

        {/* Scroll-Triggered Staggered Exhibition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-10 lg:gap-x-14 items-start">
          {categories.map((category: Category, idx: number) => {
            const imageSrc =
              category.coverImage || FALLBACK_COVERS[idx % FALLBACK_COVERS.length]!;
            const localized = localizeCategory(category, isVi);

            const isWide = idx % 4 === 0 || idx % 4 === 3;
            const colSpan = isWide ? 'md:col-span-7' : 'md:col-span-5';
            const aspectClass = isWide ? 'aspect-[16/11]' : 'aspect-[4/5]';
            const topOffset = idx % 2 === 1 ? 'md:mt-16' : '';

            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.8,
                  delay: (idx % 2) * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`${colSpan} ${topOffset}`}
              >
                <Link
                  to={`/portfolio/${category.slug}`}
                  className="group block"
                  aria-label={localized.name}
                >
                  <div
                    className={`relative w-full ${aspectClass} overflow-hidden bg-neutral-200 dark:bg-neutral-900`}
                  >
                    <img
                      src={imageSrc}
                      alt={localized.name}
                      className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  </div>

                  <div className="relative pt-5 flex items-baseline justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.26em] text-accent-600 dark:text-accent-400 font-medium mb-1.5">
                        {String(idx + 1).padStart(2, '0')} &mdash; {localized.badge}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-light text-neutral-900 dark:text-cream-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors duration-300">
                        {localized.name}
                      </h3>
                      {localized.description && (
                        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 font-light line-clamp-2 max-w-lg">
                          {localized.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 p-2 text-neutral-400 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>

                    <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-accent-600 dark:bg-accent-400 transition-all duration-500 ease-out group-hover:w-full" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const CategoryGridSkeleton: React.FC = () => (
  <section className="py-28 sm:py-36 px-6 sm:px-10 lg:px-14 bg-cream-50 dark:bg-neutral-950">
    <div className="max-w-[1400px] mx-auto">
      <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-3" />
      <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-16" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7 aspect-[16/11] bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="md:col-span-5 aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 animate-pulse md:mt-16" />
      </div>
    </div>
  </section>
);

export default CategoryGrid;
