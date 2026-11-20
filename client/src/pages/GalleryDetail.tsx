import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, MapPin, Calendar, EyeOff } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { useGallery } from '../hooks/useGallery';
import { MasonryGrid, MasonryGridSkeleton } from '../components/gallery/MasonryGrid';
import { LightboxViewer } from '../components/gallery/LightboxViewer';
import { GalleryImage } from '../types';
import { formatDate } from '../lib/utils';

export const GalleryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  const { data, isLoading, isError } = useGallery(slug);

  const handleImageClick = (image: GalleryImage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('itemId', image._id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mb-12 space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-neutral-200/80 dark:bg-neutral-800/80 rounded" />
          <div className="h-10 w-3/4 bg-neutral-200/80 dark:bg-neutral-800/80 rounded" />
          <div className="h-4 w-1/2 bg-neutral-200/80 dark:bg-neutral-800/80 rounded" />
        </div>
        <MasonryGridSkeleton />
      </div>
    );
  }

  if (isError || !data || !data.gallery) {
    return (
      <>
        <Seo
          title={`${t('gallery.notFoundTitle')} | chinphotos`}
          description={t('gallery.notFoundMessage')}
          noindex={true}
        />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl font-light mb-4 text-neutral-900 dark:text-cream-100">
            {t('gallery.notFoundTitle')}
          </h1>
          <p className="max-w-md text-neutral-600 dark:text-cream-400 mb-8 font-light text-base">
            {t('gallery.notFoundMessage')}
          </p>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('gallery.backToPortfolio')}</span>
          </Link>
        </div>
      </>
    );
  }

  const { gallery, images, navigation } = data;
  const categoryObj = typeof gallery.category === 'object' ? gallery.category : null;
  const categorySlug = categoryObj ? categoryObj.slug : undefined;
  const categoryName = categoryObj ? categoryObj.name : undefined;

  const backLink = categorySlug ? `/portfolio/${categorySlug}` : '/portfolio';
  const backLabel = categoryName
    ? t('gallery.backToCategory', { category: categoryName })
    : t('gallery.backToPortfolio');

  const coverUrl = gallery.coverImage || images[0]?.url;

  return (
    <>
      <Seo
        title={`${gallery.seoTitle || gallery.title} | chinphotos`}
        description={gallery.seoDescription || gallery.description || `${gallery.title} gallery story by chinphotos.`}
        ogImage={coverUrl}
        noindex={gallery.isUnlisted}
      />

      <article className="min-h-screen py-12 sm:py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Unlisted Notice Banner */}
        {gallery.isUnlisted && (
          <div
            className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200"
            role="status"
          >
            <EyeOff className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold text-xs uppercase tracking-wider block">
                {t('gallery.unlistedBadge')}
              </span>
              <p className="text-xs sm:text-sm mt-0.5 opacity-90 font-light">
                {t('gallery.unlistedDescription')}
              </p>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mb-8">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-neutral-500 hover:text-accent-700 dark:text-neutral-400 dark:hover:text-accent-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Story Header */}
        <header className="max-w-3xl mb-12 sm:mb-16">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-4">
            {gallery.title}
          </h1>

          {/* Location and Date Metadata */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-neutral-500 dark:text-cream-400 font-light mb-6">
            {gallery.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                <span>{gallery.location}</span>
              </span>
            )}
            {gallery.eventDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                <span>{formatDate(gallery.eventDate, i18n.language)}</span>
              </span>
            )}
          </div>

          {/* Story Narrative / Description */}
          {gallery.description && (
            <p className="text-neutral-700 dark:text-cream-300 text-base sm:text-lg leading-relaxed font-light">
              {gallery.description}
            </p>
          )}

          {/* Vendor Credits */}
          {gallery.vendors && gallery.vendors.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/80">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-accent-700 dark:text-accent-400 mb-3">
                {t('gallery.vendors')}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {gallery.vendors.map((vendor, idx) => (
                  <div key={idx} className="flex flex-col">
                    <dt className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {vendor.role}
                    </dt>
                    <dd className="font-medium text-neutral-800 dark:text-cream-200">
                      {vendor.url ? (
                        <a
                          href={vendor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-accent-600 dark:hover:text-accent-400 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-2 transition-colors"
                        >
                          {vendor.name}
                        </a>
                      ) : (
                        vendor.name
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </header>

        {/* Photos Grid */}
        <section aria-label="Gallery Photographs" className="mb-16">
          <MasonryGrid
            images={images}
            onImageClick={handleImageClick}
            isLoading={false}
          />
        </section>

        {/* Lightbox Viewer */}
        <LightboxViewer images={images} />

        {/* Prev / Next Gallery Navigation */}
        {(navigation.prev || navigation.next) && (
          <nav
            className="mt-20 pt-12 border-t border-neutral-200/80 dark:border-neutral-800/80"
            aria-label="Story Navigation"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {navigation.prev ? (
                <Link
                  to={`/gallery/${navigation.prev.slug}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-cream-200 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-cream-100 dark:group-hover:text-neutral-900 transition-colors flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-0.5">
                      {t('gallery.prev')}
                    </span>
                    <span className="font-serif text-lg text-neutral-900 dark:text-cream-100 truncate block group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                      {navigation.prev.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}

              {navigation.next ? (
                <Link
                  to={`/gallery/${navigation.next.slug}`}
                  className="group flex items-center justify-end text-right gap-4 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all sm:col-start-2"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-0.5">
                      {t('gallery.next')}
                    </span>
                    <span className="font-serif text-lg text-neutral-900 dark:text-cream-100 truncate block group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                      {navigation.next.title}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-cream-200 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-cream-100 dark:group-hover:text-neutral-900 transition-colors flex-shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              ) : null}
            </div>
          </nav>
        )}
      </article>
    </>
  );
};

export default GalleryDetail;
