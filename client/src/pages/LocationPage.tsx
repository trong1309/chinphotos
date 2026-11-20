import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Sun, ArrowLeft, ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { useLocation, useLocations } from '../hooks/useLocations';

export const LocationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { data: location, isLoading, isError } = useLocation(slug);
  const { data: allLocations } = useLocations();

  const isVi = i18n.language.startsWith('vi');

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 px-6 sm:px-8 max-w-5xl mx-auto w-full animate-pulse space-y-8">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-12 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      </div>
    );
  }

  if (isError || !location) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-light mb-4 text-neutral-900 dark:text-cream-100">
          Không tìm thấy địa điểm
        </h1>
        <p className="text-neutral-600 dark:text-cream-400 mb-8 font-light">
          Khu vực bạn đang tìm kiếm không tồn tại hoặc đã thay đổi.
        </p>
        <Link
          to="/about"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 text-xs uppercase tracking-[0.2em] font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang giới thiệu</span>
        </Link>
      </div>
    );
  }

  const title = isVi ? location.titleVi : location.titleEn;
  const description = isVi ? location.descriptionVi : location.descriptionEn;
  const popularSpots = isVi ? location.popularSpotsVi : location.popularSpotsEn;
  const tips = isVi ? location.tipsVi : location.tipsEn;

  const otherLocations = allLocations?.filter((l) => l.slug !== location.slug) || [];

  // Structured Data (JSON-LD LocalBusiness / Photographer for local SEO)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Photographer',
    name: 'chinphotos',
    description: description,
    image: location.coverImage || 'http://localhost:5000/uploads/1792256040074-597d2a53-large.webp',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: location.name,
      containedInPlace: {
        '@type': 'City',
        name: 'Ho Chi Minh City',
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ho Chi Minh City',
      addressCountry: 'VN',
    },
    priceRange: '1500000 - 5000000 VND',
  };

  return (
    <>
      <Seo
        title={`${title} | chinphotos TP.HCM`}
        description={description}
        ogImage={location.coverImage}
        jsonLd={jsonLd}
      />

      <article className="min-h-screen py-12 sm:py-20 px-6 sm:px-8 max-w-5xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-neutral-500 hover:text-accent-700 dark:text-neutral-400 dark:hover:text-accent-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('about.subtitle')}</span>
          </Link>
        </div>

        {/* Location Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-accent-700 dark:text-accent-400 font-semibold mb-3">
            <Compass className="w-4 h-4" />
            <span>{location.name} · Ho Chi Minh City</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-6">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-cream-300 font-light leading-relaxed max-w-3xl">
            {description}
          </p>
        </header>

        {/* Cover Image */}
        {location.coverImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-16 shadow-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800">
            <img
              src={location.coverImage}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Popular Spots Grid */}
        {popularSpots && popularSpots.length > 0 && (
          <section aria-label="Popular Spots" className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-cream-100 font-light">
                {t('locations.popularSpots')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularSpots.map((spot, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-1" />
                  <span className="text-sm text-neutral-800 dark:text-cream-200 font-normal">
                    {spot}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lighting Tips Box */}
        {tips && (
          <section
            aria-label="Lighting and Timing Tips"
            className="mb-16 p-8 rounded-2xl bg-cream-50/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800"
          >
            <div className="flex items-center gap-2 mb-3 text-accent-700 dark:text-accent-400">
              <Sun className="w-5 h-5" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">
                {t('locations.tipsTitle')}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-neutral-700 dark:text-cream-300 font-light leading-relaxed">
              {tips}
            </p>
          </section>
        )}

        {/* Other Locations */}
        {otherLocations.length > 0 && (
          <section aria-label="Other Areas" className="mb-16">
            <h3 className="font-serif text-2xl text-neutral-900 dark:text-cream-100 font-light mb-6">
              {t('locations.otherLocations')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {otherLocations.map((other) => (
                <Link
                  key={other._id}
                  to={`/locations/${other.slug}`}
                  className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 hover:bg-white dark:hover:bg-neutral-900 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-neutral-800 dark:text-cream-200 group-hover:text-accent-600 transition-colors">
                    {other.name}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-accent-600 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Book Session CTA */}
        <section className="text-center py-12 px-8 rounded-2xl bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 shadow-xl">
          <h2 className="font-serif text-3xl font-light mb-3">
            {t('locations.bookAtLocation')}
          </h2>
          <p className="max-w-md mx-auto text-neutral-300 dark:text-neutral-600 text-sm mb-6 font-light">
            Chúng tôi sẵn sàng đồng hành cùng gia đình bạn trên mọi nẻo đường xinh đẹp của Sài Gòn.
          </p>
          <Link
            to={`/contact?location=${location.slug}`}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-accent-600 text-white hover:bg-accent-700 transition-all text-xs uppercase tracking-[0.2em] font-semibold shadow-lg"
          >
            <span>{t('locations.bookAtLocation')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </article>
    </>
  );
};

export default LocationPage;
