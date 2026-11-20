import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { useCategories } from '../hooks/useCategories';
import { useGalleries } from '../hooks/useGalleries';
import { Gallery } from '../types';
import { cn, formatDate } from '../lib/utils';

export const PortfolioCategory: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const { t, i18n } = useTranslation();

  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const {
    data: galleriesData,
    isLoading: isLoadingGalleries,
    isError,
  } = useGalleries({
    category: categorySlug,
    limit: 24,
  });

  const currentCategory = categories?.find(
    (c) => c.slug.toLowerCase() === categorySlug?.toLowerCase(),
  );

  const categoryTitle = currentCategory?.name || categorySlug?.replace(/-/g, ' ') || 'Stories';
  const categoryDesc = currentCategory?.description || t('portfolio.pageSubtitle');

  const galleries = galleriesData?.items || [];

  return (
    <>
      <Seo
        title={`${categoryTitle} | chinphotos Portfolio`}
        description={categoryDesc}
      />

      <div className="min-h-screen py-12 sm:py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-neutral-500 hover:text-accent-700 dark:text-neutral-400 dark:hover:text-accent-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('gallery.backToPortfolio')}</span>
          </Link>
        </div>

        {/* Category Header */}
        <header className="mb-12">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-4 capitalize">
            {categoryTitle}
          </h1>
          {categoryDesc && (
            <p className="max-w-2xl text-neutral-600 dark:text-cream-300 text-base sm:text-lg font-light leading-relaxed">
              {categoryDesc}
            </p>
          )}
        </header>

        {/* Filter Chips Bar */}
        <nav
          className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-12 scrollbar-none border-b border-neutral-200/60 dark:border-neutral-800/80"
          aria-label="Category Filters"
        >
          <Link
            to="/portfolio"
            className={cn(
              'px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all whitespace-nowrap',
              'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-cream-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
            )}
          >
            {t('gallery.all')}
          </Link>

          {!isLoadingCats &&
            categories?.map((cat) => {
              const isActive = cat.slug.toLowerCase() === categorySlug?.toLowerCase();
              return (
                <Link
                  key={cat._id}
                  to={`/portfolio/${cat.slug}`}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-cream-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                  )}
                >
                  {cat.name}
                  {typeof cat.galleryCount === 'number' && (
                    <span className="ml-1.5 opacity-60 text-[10px]">({cat.galleryCount})</span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Content Section */}
        {isLoadingGalleries && <GalleriesSkeleton />}

        {isError && (
          <div className="py-24 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 font-serif text-xl">
              {t('gallery.noGalleries')}
            </p>
          </div>
        )}

        {!isLoadingGalleries && !isError && galleries.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center">
            <ImageIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mb-4 stroke-1" />
            <p className="text-neutral-600 dark:text-cream-300 font-serif text-xl mb-3">
              {t('gallery.noGalleries')}
            </p>
            <Link
              to="/portfolio"
              className="text-xs uppercase tracking-[0.2em] font-semibold text-accent-700 dark:text-accent-400 hover:underline"
            >
              {t('gallery.backToPortfolio')}
            </Link>
          </div>
        )}

        {!isLoadingGalleries && !isError && galleries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {galleries.map((gallery) => (
              <GalleryItemCard key={gallery._id} gallery={gallery} locale={i18n.language} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

interface GalleryItemCardProps {
  gallery: Gallery;
  locale: string;
}

const GalleryItemCard: React.FC<GalleryItemCardProps> = ({ gallery, locale }) => {
  return (
    <Link
      to={`/gallery/${gallery.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {gallery.coverImage ? (
          <img
            src={gallery.coverImage}
            alt={gallery.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-100 dark:bg-neutral-800 text-neutral-400">
            <ImageIcon className="w-12 h-12 stroke-1" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
      </div>

      {/* Meta Info */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 dark:text-cream-100 font-normal mb-2 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">
            {gallery.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-cream-400 font-light mt-3">
            {gallery.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                {gallery.location}
              </span>
            )}
            {gallery.eventDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                {formatDate(gallery.eventDate, locale)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const GalleriesSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/40 animate-pulse"
        >
          <div className="aspect-[4/3] bg-neutral-200/70 dark:bg-neutral-800/70" />
          <div className="p-5 sm:p-6 space-y-3">
            <div className="h-6 w-3/4 bg-neutral-200/70 dark:bg-neutral-800/70 rounded" />
            <div className="h-4 w-1/2 bg-neutral-200/70 dark:bg-neutral-800/70 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioCategory;
