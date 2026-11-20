import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Clock, ShieldCheck, Quote } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { useService } from '../hooks/useServices';

export const ServicePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { data: service, isLoading, isError } = useService(slug);

  const isVi = i18n.language.startsWith('vi');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat(isVi ? 'vi-VN' : 'en-US').format(price) + ' VND';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 px-6 sm:px-8 max-w-5xl mx-auto w-full animate-pulse space-y-8">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-12 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        <div className="h-24 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-light mb-4 text-neutral-900 dark:text-cream-100">
          Không tìm thấy dịch vụ
        </h1>
        <p className="text-neutral-600 dark:text-cream-400 mb-8 font-light">
          Gói chụp bạn đang tìm kiếm không tồn tại hoặc đã thay đổi đường dẫn.
        </p>
        <Link
          to="/details"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 text-xs uppercase tracking-[0.2em] font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chi phí</span>
        </Link>
      </div>
    );
  }

  const testimonials = [
    {
      quote: isVi
        ? 'Buổi chụp diễn ra như một buổi dã ngoại nhẹ nhàng. Bé nhà mình bình thường rất nhát người lạ nhưng hôm đó cười tít mắt và chơi đùa say sưa cùng chú nhiếp ảnh.'
        : 'The session felt like a gentle Sunday picnic. Our toddler is usually very shy around strangers, but she was giggling and running around happily within minutes.',
      author: 'Gia đình chị Mai & bé Bơ (Quận 2, TP.HCM)',
    },
    {
      quote: isVi
        ? 'Ảnh nhận về đẹp vượt mong đợi. Màu da của con rất tự nhiên, ánh sáng trong trẻo mà không hề bị làm quá đà. Cả nhà xem lại ai cũng rưng rưng xúc động.'
        : 'The delivered gallery exceeded all our hopes. Pure skin tones, warm golden light, and completely candid moments. Our entire family was moved to tears.',
      author: 'Gia đình anh Tuấn & chị Lan (Thảo Điền, TP.HCM)',
    },
  ];

  // Structured Data (JSON-LD Service + FAQPage)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: service.summary || service.content,
      provider: {
        '@type': 'Photographer',
        name: 'chinphotos',
      },
      areaServed: {
        '@type': 'City',
        name: 'Ho Chi Minh City',
      },
      offers: {
        '@type': 'Offer',
        price: service.priceFrom,
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
      },
    },
    ...(service.faqs && service.faqs.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: service.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <Seo
        title={`${service.title} | Gói chụp chinphotos`}
        description={service.summary || service.content}
        ogImage={service.heroImage}
        jsonLd={jsonLd}
      />

      <article className="min-h-screen py-12 sm:py-20 px-6 sm:px-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb Back */}
        <div className="mb-8">
          <Link
            to="/details"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-neutral-500 hover:text-accent-700 dark:text-neutral-400 dark:hover:text-accent-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại tất cả gói chụp</span>
          </Link>
        </div>

        {/* Hero Section */}
        <header className="mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-accent-700 dark:text-accent-400 font-semibold mb-3 block">
            {t('serviceDetail.subtitle')}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-6">
            {service.title}
          </h1>
          {service.summary && (
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-cream-300 font-light leading-relaxed max-w-3xl">
              {service.summary}
            </p>
          )}
        </header>

        {/* Hero Image */}
        {service.heroImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-16 shadow-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800">
            <img
              src={service.heroImage}
              alt={service.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Overview & Content */}
        <section className="mb-16 prose dark:prose-invert max-w-none text-neutral-700 dark:text-cream-300 font-light text-base sm:text-lg leading-relaxed">
          <p>{service.content}</p>
        </section>

        {/* Investment & Inclusions Box */}
        <section
          aria-label="Investment and Details"
          className="mb-16 p-8 sm:p-10 rounded-2xl bg-cream-50/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-neutral-200/80 dark:border-neutral-800 pb-6 md:pb-0 md:pr-8">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent-700 dark:text-accent-400 block mb-2">
                {t('serviceDetail.investment')}
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 dark:text-cream-100 mb-4">
                {formatPrice(service.priceFrom)}
              </div>
              <div className="space-y-2 text-xs text-neutral-500 dark:text-cream-400 font-light">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                  <span>Linh hoạt thời gian theo lịch sinh hoạt của bé</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                  <span>Hỗ trợ dời lịch miễn phí khi thời tiết xấu</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900 dark:text-cream-100 mb-4">
                {t('serviceDetail.inclusionsTitle')}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {service.inclusions?.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-cream-300 font-light">
                    <Check className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs for this Service (Accessible accordion with aria-expanded) */}
        {service.faqs && service.faqs.length > 0 && (
          <section aria-label="Service FAQ" className="mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-cream-100 font-light mb-6">
              {t('serviceDetail.faqTitle')}
            </h2>
            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                const contentId = `service-faq-content-${idx}`;
                const buttonId = `service-faq-btn-${idx}`;

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 overflow-hidden"
                  >
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        onClick={() => toggleFaq(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleFaq(idx);
                          }
                        }}
                        className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-neutral-900 dark:text-cream-100 hover:text-accent-600 dark:hover:text-accent-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-neutral-400 transition-transform duration-300 flex-shrink-0 ${
                            isOpen ? 'rotate-180 text-accent-600 dark:text-accent-400' : ''
                          }`}
                        />
                      </button>
                    </h3>
                    <div
                      id={contentId}
                      role="region"
                      aria-labelledby={buttonId}
                      hidden={!isOpen}
                      className={`px-6 pb-5 text-neutral-600 dark:text-cream-400 text-sm font-light leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3 ${
                        isOpen ? 'block' : 'hidden'
                      }`}
                    >
                      {faq.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section aria-label="Kind Words" className="mb-20">
          <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-cream-100 font-light mb-8 text-center">
            {t('serviceDetail.testimonialsTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((tItem, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800/70 flex flex-col justify-between"
              >
                <div className="mb-4">
                  <Quote className="w-6 h-6 text-accent-400/60 mb-2 stroke-1" />
                  <p className="text-sm text-neutral-600 dark:text-cream-300 font-light italic leading-relaxed">
                    "{tItem.quote}"
                  </p>
                </div>
                <span className="text-xs font-medium text-neutral-800 dark:text-cream-200 uppercase tracking-wider">
                  — {tItem.author}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Book This Service CTA */}
        <section className="text-center py-12 px-8 rounded-2xl bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 shadow-xl">
          <h2 className="font-serif text-3xl font-light mb-3">
            Đặt lịch {service.title}
          </h2>
          <p className="max-w-md mx-auto text-neutral-300 dark:text-neutral-600 text-sm mb-6 font-light">
            Số lượng buổi chụp giới hạn mỗi tháng để đảm bảo chất lượng hình ảnh trọn vẹn nhất.
          </p>
          <Link
            to={`/contact?service=${service.slug}`}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-accent-600 text-white hover:bg-accent-700 transition-all text-xs uppercase tracking-[0.2em] font-semibold shadow-lg"
          >
            <span>{t('serviceDetail.bookThisService')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </article>
    </>
  );
};

export default ServicePage;
