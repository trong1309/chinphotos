import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types';
import { localizeCategory } from '../lib/localize';

export const Portfolio: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const { data: categories, isLoading, isError } = useCategories();

  return (
    <>
      <Seo
        title={t('portfolio.pageTitle')}
        description={t('portfolio.pageSubtitle')}
      />

      <div className="min-h-screen pt-32 sm:pt-40 pb-24 sm:pb-32 px-6 sm:px-10 lg:px-14 max-w-[1400px] mx-auto w-full">
        {/* Editorial Header */}
        <header className="max-w-3xl mb-16 sm:mb-24">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent-600 dark:text-accent-400 font-medium mb-3">
            {t('portfolio.subtitle')}
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-5">
            {t('portfolio.pageTitle')}
          </h1>
          <p className="text-neutral-600 dark:text-cream-300 text-base sm:text-lg leading-relaxed font-light max-w-xl">
            {t('portfolio.pageSubtitle')}
          </p>
        </header>

        {isLoading && <PortfolioSkeleton />}

        {isError && (
          <div className="py-20 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 font-serif text-xl">
              {t('portfolio.emptyCategories')}
            </p>
          </div>
        )}

        {!isLoading && !isError && categories && categories.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center border-t border-b border-neutral-200/80 dark:border-neutral-800">
            <FolderHeart className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mb-4 stroke-1" />
            <p className="text-neutral-600 dark:text-cream-300 font-serif text-xl mb-2">
              {t('portfolio.emptyCategories')}
            </p>
          </div>
        )}

        {!isLoading && !isError && categories && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-10 lg:gap-x-14 items-start">
            {categories.map((category, idx) => (
              <CategoryCard key={category._id} category={category} idx={idx} isVi={isVi} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

interface CategoryCardProps {
  category: Category;
  idx: number;
  isVi: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, idx, isVi }) => {
  const { t } = useTranslation();
  const localized = localizeCategory(category, isVi);
  const count = category.galleryCount ?? 0;
  const isWide = idx % 4 === 0 || idx % 4 === 3;
  const colSpan = isWide ? 'md:col-span-7' : 'md:col-span-5';
  const aspectClass = isWide ? 'aspect-[16/11]' : 'aspect-[4/5]';
  const topOffset = idx % 2 === 1 ? 'md:mt-16' : '';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={`${colSpan} ${topOffset}`}
    >
      <Link
        to={`/portfolio/${category.slug}`}
        data-cursor="view"
        className="group block"
      >
        <div
          className={`relative w-full ${aspectClass} overflow-hidden bg-neutral-200 dark:bg-neutral-800`}
        >
          {category.coverImage ? (
            <img
              src={category.coverImage}
              alt={localized.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream-100 dark:bg-neutral-800 text-neutral-400">
              <FolderHeart className="w-14 h-14 stroke-1" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 border-0 group-hover:border-[10px] border-white/25 dark:border-black/25 transition-all duration-500 ease-out" />
        </div>

        <div className="relative pt-5 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <span className="text-[11px] uppercase tracking-[0.26em] text-accent-600 dark:text-accent-400 font-medium">
              {String(idx + 1).padStart(2, '0')} &mdash; {localized.badge}
            </span>
            {count > 0 && (
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                {t('portfolio.galleryCount', { count })}
              </span>
            )}
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-cream-100 font-light mb-2 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
            {localized.name}
          </h2>

          {localized.description && (
            <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base line-clamp-2 font-light leading-relaxed mb-4 max-w-xl">
              {localized.description}
            </p>
          )}

          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] font-medium text-neutral-800 dark:text-cream-200 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            <span>{t('portfolio.viewCategory')}</span>
          </span>

          <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-accent-600 dark:bg-accent-400 transition-all duration-500 ease-out group-hover:w-full" />
        </div>
      </Link>
    </motion.div>
  );
};

const PortfolioSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      <div className="md:col-span-7 aspect-[16/11] bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
      <div className="md:col-span-5 aspect-[4/5] bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse md:mt-16" />
    </div>
  );
};

export default Portfolio;
