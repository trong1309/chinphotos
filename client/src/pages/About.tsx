import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { useSettings } from '../hooks/useSettings';
import { useLocations } from '../hooks/useLocations';
import { localizeBio } from '../lib/localize';

const DEFAULT_STUDIO_PORTRAIT =
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85';

export const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: settings } = useSettings();
  const { data: locations } = useLocations();

  const isVi = i18n.language.startsWith('vi');
  const portraitSrc = settings?.heroImages?.[0] || DEFAULT_STUDIO_PORTRAIT;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Photographer',
    name: settings?.siteName || 'chinphotos',
    description: isVi
      ? 'Dịch vụ chụp ảnh gia đình và trẻ em tự nhiên tại TP. Hồ Chí Minh.'
      : 'Natural family and children photography based in Ho Chi Minh City, Vietnam.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://chinphotos.vn',
    image: portraitSrc,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Ho Chi Minh City',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ho Chi Minh City',
      addressCountry: 'VN',
    },
    email: settings?.contactEmail || 'hello@chinphotos.vn',
    priceRange: '1500000 - 5000000 VND',
  };

  return (
    <>
      <Seo
        title={`${t('about.title')} | ${settings?.siteName || 'chinphotos'}`}
        description={t('about.tagline')}
        jsonLd={jsonLd}
      />

      <div className="min-h-screen pt-32 sm:pt-40 pb-24 sm:pb-32 px-6 sm:px-10 lg:px-14 max-w-[1400px] mx-auto w-full">
        {/* Asymmetric Editorial Spread */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24 sm:mb-32">
          {/* Left: Sharp Editorial Portrait */}
          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
              <img
                src={portraitSrc}
                alt={`${settings?.siteName || 'chinphotos'} studio`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
              {settings?.siteName || 'chinphotos'} &mdash;{' '}
              {isVi ? 'TP. HỒ CHÍ MINH, VIỆT NAM' : 'SAIGON, VIETNAM'}
            </p>
          </div>

          {/* Right: Narrative */}
          <div className="lg:col-span-7 lg:pt-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent-600 dark:text-accent-400 font-medium mb-4">
              {t('about.subtitle')}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-8 leading-[1.08]">
              {t('about.title')}
            </h1>
            <p className="font-serif italic text-xl sm:text-2xl text-neutral-800 dark:text-cream-200 font-light leading-relaxed mb-8">
              {localizeBio(settings?.bio, isVi, t('about.tagline'))}
            </p>
            <div className="space-y-6 text-neutral-600 dark:text-cream-300 text-base sm:text-[17px] leading-[1.85] font-light mb-10 max-w-2xl">
              <p>{t('about.storyP1')}</p>
              <p>{t('about.storyP2')}</p>
              <p>{t('about.storyP3')}</p>
            </div>

            <Link
              to="/contact"
              className="group inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.24em] font-medium text-accent-600 dark:text-accent-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              <span>{t('about.ctaButton')}</span>
            </Link>
          </div>
        </section>

        {/* Minimalist Hairline Pillars */}
        <section
          aria-label="Studio Pillars"
          className="mb-24 sm:mb-32 py-14 border-t border-b border-neutral-200/80 dark:border-neutral-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-accent-600 dark:text-accent-400 block mb-2">
                01 &mdash; {isVi ? 'PHONG CÁCH' : 'APPROACH'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-cream-100 font-light mb-2">
                {isVi ? 'Không tạo dáng gượng gạo' : 'Unposed & Authentic'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                {isVi
                  ? 'Quan sát tinh tế để bắt trọn tiếng cười, ánh mắt và sự gắn kết tự nhiên nhất của gia đình bạn.'
                  : 'Gentle direction that lets children play freely while capturing genuine family connection.'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-accent-600 dark:text-accent-400 block mb-2">
                02 &mdash; {isVi ? 'ÁNH SÁNG & MÀU SẮC' : 'LIGHT & TONE'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-cream-100 font-light mb-2">
                {isVi ? 'Ánh sáng tự nhiên vượt thời gian' : 'Timeless Natural Light'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                {isVi
                  ? 'Màu ảnh trong trẻo, ấm áp như tạp chí in, giữ nguyên vẻ đẹp nguyên bản qua nhiều thập kỷ.'
                  : 'Warm, editorial film-inspired tones crafted to age gracefully for generations.'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-accent-600 dark:text-accent-400 block mb-2">
                03 &mdash; {isVi ? 'TRẢI NGHIỆM' : 'EXPERIENCE'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-cream-100 font-light mb-2">
                {isVi ? 'Thảnh thơi tại nhà & ngoại cảnh' : 'At-Home & Outdoor'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                {isVi
                  ? 'Linh hoạt theo nhịp sinh hoạt của bé tại tổ ấm gia đình hoặc những khoảng xanh yên bình tại Sài Gòn.'
                  : 'Paced around your children in the comfort of home or Saigon’s sunlit green spaces.'}
              </p>
            </div>
          </div>
        </section>

        {/* Locations in HCMC (Only rendered if locations exist in DB) */}
        {locations && locations.length > 0 && (
          <section className="mb-24">
            <div className="mb-12">
              <p className="text-[11px] uppercase tracking-[0.28em] text-accent-600 dark:text-accent-400 font-medium mb-2">
                {isVi ? 'KHU VỰC CHỤP TẠI TP.HCM' : 'SAIGON LOCATIONS'}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-cream-100 font-light">
                {t('about.locationsTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((loc, idx) => {
                const locTitle = isVi ? loc.titleVi : loc.titleEn;
                const locDesc = isVi ? loc.descriptionVi : loc.descriptionEn;

                return (
                  <Link
                    key={loc._id}
                    to={`/locations/${loc.slug}`}
                    className="group block pt-5 border-t border-neutral-300 dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent-600 dark:text-accent-400">
                        0{idx + 1} &mdash; {loc.name}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-accent-600 transition-colors" />
                    </div>
                    <h3 className="font-serif text-2xl text-neutral-900 dark:text-cream-100 font-light mb-2 group-hover:text-accent-600 transition-colors">
                      {locTitle}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-cream-400 line-clamp-3 font-light leading-relaxed">
                      {locDesc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default About;
