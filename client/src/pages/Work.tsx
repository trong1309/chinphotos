import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Camera, ArrowRight } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { useSettings } from '../hooks/useSettings';
import { useFeaturedImages } from '../hooks/useFeaturedImages';
import { MasonryGrid } from '../components/gallery/MasonryGrid';
import { LightboxViewer } from '../components/gallery/LightboxViewer';
import { GalleryImage } from '../types';

export const Work: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const { data: settings } = useSettings();
  const [, setSearchParams] = useSearchParams();

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useFeaturedImages(24);

  const images = useMemo<GalleryImage[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  const totalCount = data?.pages[0]?.pagination.total ?? 0;

  const handleImageClick = (image: GalleryImage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('itemId', image._id);
      return next;
    });
  };

  return (
    <>
      <Seo
        title={`${t('work.title')} | ${settings?.siteName || 'chinphotos'}`}
        description={
          settings?.bio ||
          'Tuyển tập những khoảnh khắc tự nhiên, ánh sáng chan hòa và nụ cười ấm áp của các gia đình nhỏ tại TP. Hồ Chí Minh.'
        }
      />

      <div className="pt-28 sm:pt-36 pb-24 px-6 sm:px-8 max-w-7xl mx-auto flex-1 flex flex-col w-full">
        {/* Editorial Page Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-700 dark:text-accent-400 font-semibold mb-3">
            {settings?.siteName || 'chinphotos'}
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 dark:text-cream-100 tracking-tight mb-4">
            {t('work.title')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 font-light text-base sm:text-lg leading-relaxed mb-6 font-serif italic">
            {t('work.subtitle')}
          </p>

          {totalCount > 0 && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-cream-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-mono">
              {t('work.showingCount', { count: images.length, total: totalCount })}
            </div>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <div className="py-20 text-center space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400">
              Không thể tải danh sách hình ảnh lúc này.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-neutral-900 dark:bg-cream-100 text-white dark:text-neutral-900 text-xs uppercase tracking-widest rounded-full hover:opacity-90"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Clean Modern Empty State when no photos are uploaded yet */}
        {!isLoading && !isError && images.length === 0 ? (
          <div className="my-8 py-20 px-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50 text-center max-w-2xl mx-auto w-full">
            <div className="w-14 h-14 rounded-2xl bg-accent-50 dark:bg-neutral-800 text-accent-600 dark:text-accent-400 flex items-center justify-center mx-auto mb-5">
              <Camera className="w-7 h-7 stroke-1" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-cream-100 font-light mb-3">
              {isVi ? 'Bộ sưu tập ảnh đang được cập nhật' : 'Curated works coming soon'}
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-light max-w-md mx-auto mb-8 leading-relaxed">
              {isVi
                ? 'Chúng tôi đang tuyển chọn và cập nhật những bộ ảnh gia đình mới nhất. Hãy khám phá các gói chụp hoặc nhắn tin trực tiếp để nhận album mẫu riêng tư từ studio.'
                : 'We are currently curating our newest family and childhood stories. Explore our collections or reach out directly to view recent private client galleries.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 dark:bg-cream-100 text-white dark:text-neutral-900 text-xs uppercase tracking-[0.18em] font-semibold hover:opacity-90 transition-all"
              >
                <span>{t('nav.portfolio')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-cream-200 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                <span>{t('nav.contact')}</span>
              </Link>
            </div>
          </div>
        ) : (
          <MasonryGrid
            images={images}
            onImageClick={handleImageClick}
            isLoading={isLoading}
          />
        )}

        {/* Load More Section */}
        {hasNextPage && (
          <div className="mt-14 sm:mt-18 text-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-neutral-900 dark:bg-cream-100 text-white dark:text-neutral-900 text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('work.loading')}</span>
                </>
              ) : (
                <span>{t('work.loadMore')}</span>
              )}
            </button>
          </div>
        )}

        {!hasNextPage && images.length > 0 && !isLoading && (
          <div className="mt-16 text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              &mdash; {t('work.allLoaded')} &mdash;
            </span>
          </div>
        )}

        <LightboxViewer images={images} allowDownload={false} />
      </div>
    </>
  );
};

export default Work;
