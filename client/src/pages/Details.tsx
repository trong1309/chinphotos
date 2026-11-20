import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, ArrowUpRight, MessageCircle, Sparkles, HeartHandshake, PackageCheck } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { useServices } from '../hooks/useServices';
import { Service } from '../types';
import { localizeService } from '../lib/localize';

export const Details: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: services, isLoading } = useServices();

  const isVi = i18n.language.startsWith('vi');

  // General FAQs for the Details page
  const defaultFaqs = [
    {
      q: isVi
        ? 'Buổi chụp ảnh gia đình thường kéo dài bao lâu?'
        : 'How long does a family photography session typically last?',
      a: isVi
        ? 'Tùy theo gói bạn chọn, buổi chụp kéo dài từ 45 phút (Mini Session) đến 90 - 120 phút (Family Session). Thời lượng này được nghiên cứu tối ưu để các bé không bị mệt và luôn giữ được tinh thần vui vẻ tự nhiên.'
        : 'Depending on your collection, sessions range from 45 minutes (Mini Session) to 90 - 120 minutes (Full Family Session). This duration is intentionally paced so children stay relaxed and joyful without getting overwhelmed.',
    },
    {
      q: isVi
        ? 'Nếu con tôi nhút nhát hoặc không hợp tác khi chụp thì sao?'
        : 'What if my child is shy or energetic and will not cooperate?',
      a: isVi
        ? 'Ba mẹ hoàn toàn yên tâm nhé! Chúng tôi không bao giờ ép bé tạo dáng. Nhiếp ảnh gia sẽ dành thời gian đầu để chơi đùa, làm bạn và bắt trọn những khoảnh khắc bé chơi tự nhiên nhất cùng ba mẹ.'
        : 'Please do not worry at all! We never force poses. We take the time to play, connect, and let children explore naturally while capturing candid laughter and tender interactions.',
    },
    {
      q: isVi
        ? 'Gia đình có cần chuẩn bị trang phục như thế nào?'
        : 'How should our family prepare our outfits?',
      a: isVi
        ? 'Sau khi đặt lịch, chinphotos sẽ gửi bạn một cẩm nang phối màu trang phục (Style Guide) chi tiết. Chúng tôi khuyến khích các tone màu trung tính, dịu mát như be, trắng, kem, nâu nhạt, xanh olive hoặc pastel để bộ ảnh luôn thanh lịch và vượt thời gian.'
        : 'Upon reserving, chinphotos provides a curated Styling Palette Guide. We recommend soft neutrals such as cream, beige, oatmeal, soft earth tones, or gentle pastels to ensure timeless elegance across all photographs.',
    },
    {
      q: isVi
        ? 'Nếu trời mưa hoặc thời tiết xấu vào ngày chụp ngoài trời thì xử lý ra sao?'
        : 'What happens if it rains or weather is bad on our session day?',
      a: isVi
        ? 'Nếu chụp ngoại cảnh và thời tiết mưa bão không thuận lợi, chúng tôi hỗ trợ dời lịch sang một ngày khác thuận tiện cho cả hai bên hoàn toàn miễn phí, hoặc chuyển vào chụp không gian ấm cúng tại nhà của bạn.'
        : 'In case of inclement weather for outdoor sessions, we will gladly reschedule to another mutually suitable date with zero extra fee, or pivot to an intimate session inside your home.',
    },
    {
      q: isVi
        ? 'Bao lâu sau buổi chụp gia đình sẽ nhận được ảnh?'
        : 'When will we receive our photographs?',
      a: isVi
        ? 'Gia đình sẽ nhận được một vài hình ảnh xem trước (sneak peek) trong vòng 48 giờ. Toàn bộ file ảnh hoàn thiện được bàn giao qua online gallery riêng tư chất lượng cao sau 7 - 10 ngày làm việc.'
        : 'You will receive a preview sneak peek within 48 hours. Your complete curated digital gallery in high-resolution will be delivered within 7 to 10 business days.',
    },
    {
      q: isVi
        ? 'Tôi có nhận được toàn bộ file ảnh gốc không?'
        : 'Do we receive all original unedited photographs?',
      a: isVi
        ? 'Có, tất cả các gói chụp của chinphotos đều bao gồm toàn bộ file ảnh gốc đã được cân chỉnh ánh sáng và màu sắc cơ bản để gia đình lưu trữ trọn vẹn kỷ niệm.'
        : 'Yes, all chinphotos collections include all high-resolution digital files with base lighting and tone adjustments for your complete family archives.',
    },
  ];

  // Accordion state
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Structured Data (JSON-LD FAQPage)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: defaultFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const steps = [
    {
      icon: MessageCircle,
      title: t('details.step1Title'),
      desc: t('details.step1Desc'),
    },
    {
      icon: Sparkles,
      title: t('details.step2Title'),
      desc: t('details.step2Desc'),
    },
    {
      icon: HeartHandshake,
      title: t('details.step3Title'),
      desc: t('details.step3Desc'),
    },
    {
      icon: PackageCheck,
      title: t('details.step4Title'),
      desc: t('details.step4Desc'),
    },
  ];

  const formatPrice = (price?: number) => {
    if (!price) return isVi ? 'Liên hệ' : 'Inquire';
    return isVi
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(price)
      : `${new Intl.NumberFormat('en-US').format(price)} VND`;
  };

  return (
    <>
      <Seo
        title={`${t('details.title')} | chinphotos`}
        description={t('details.description')}
        jsonLd={faqJsonLd}
      />

      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-20 sm:mb-28">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-700 dark:text-accent-400 font-semibold mb-3">
            {t('details.subtitle')}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-5">
            {t('details.title')}
          </h1>
          <p className="text-neutral-600 dark:text-cream-300 text-base sm:text-lg leading-relaxed font-light">
            {t('details.description')}
          </p>
        </header>

        {/* 4-Step Process Section */}
        <section aria-label={isVi ? 'Quy trình làm việc' : 'Our Process'} className="mb-24 sm:mb-32">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-2">
              {t('details.processTitle')}
            </h2>
            <div className="w-12 h-0.5 bg-accent-600 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-neutral-800 flex items-center justify-center text-accent-700 dark:text-accent-400 mb-5 group-hover:bg-accent-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6 stroke-1" />
                  </div>
                  <h3 className="font-serif text-xl text-neutral-900 dark:text-cream-100 font-normal mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-cream-400 font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing / Service Collections Table */}
        <section aria-label={isVi ? 'Bảng gói dịch vụ' : 'Collections and Pricing'} className="mb-24 sm:mb-32">
          <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-3">
              {t('details.pricingTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-cream-400 text-sm sm:text-base font-light">
              {t('details.pricingSubtitle')}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {services?.map((service: Service, idx: number) => {
                const isFeatured = idx === 0;
                const locSvc = localizeService(service, isVi);
                return (
                  <div
                    key={service._id}
                    className={`flex flex-col justify-between p-8 rounded-2xl border transition-all duration-300 ${
                      isFeatured
                        ? 'bg-cream-50/90 dark:bg-neutral-900 border-accent-600/60 dark:border-accent-500/60 shadow-xl ring-1 ring-accent-500/30'
                        : 'bg-white/80 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      {isFeatured && (
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-accent-600 text-white mb-4">
                          {isVi ? 'Phổ biến nhất' : 'Most Popular'}
                        </span>
                      )}
                      <h3 className="font-serif text-2xl text-neutral-900 dark:text-cream-100 font-normal mb-2">
                        {locSvc.title}
                      </h3>
                      {locSvc.summary && (
                        <p className="text-xs text-neutral-500 dark:text-cream-400 font-light mb-6 leading-relaxed">
                          {locSvc.summary}
                        </p>
                      )}

                      <div className="mb-6 pb-6 border-b border-neutral-200/60 dark:border-neutral-800">
                        <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">
                          {t('services.startingFrom')}
                        </span>
                        <span className="font-serif text-3xl font-light text-neutral-900 dark:text-cream-100">
                          {formatPrice(service.priceFrom)}
                        </span>
                      </div>

                      {/* Inclusions List */}
                      <div className="space-y-3 mb-8">
                        <span className="text-xs uppercase tracking-wider font-semibold text-neutral-600 dark:text-cream-300 block mb-2">
                          {t('details.inclusions')}:
                        </span>
                        {locSvc.inclusions.map((inc, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600 dark:text-cream-300 font-light">
                            <Check className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                      <Link
                        to={`/services/${service.slug}`}
                        className="w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-center text-xs uppercase tracking-[0.15em] font-semibold text-neutral-700 dark:text-cream-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {t('services.viewDetails')}
                      </Link>
                      <Link
                        to={`/contact?service=${service.slug}`}
                        className={`w-full py-3 rounded-lg text-center text-xs uppercase tracking-[0.15em] font-semibold transition-all shadow-sm ${
                          isFeatured
                            ? 'bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 hover:opacity-90'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-cream-100 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {t('details.cta')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQ Accordion Section */}
        <section aria-label={isVi ? 'Câu hỏi thường gặp' : 'Frequently Asked Questions'} className="max-w-3xl mx-auto mb-24 sm:mb-32">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-accent-700 dark:text-accent-400 font-semibold mb-2">
              FAQ
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-3">
              {t('details.faqTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-cream-400 text-sm sm:text-base font-light">
              {t('details.faqSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {defaultFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              const contentId = `faq-answer-${idx}`;
              const buttonId = `faq-question-${idx}`;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 overflow-hidden transition-colors"
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
                      className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-serif text-lg sm:text-xl text-neutral-900 dark:text-cream-100 font-normal hover:text-accent-600 dark:hover:text-accent-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-neutral-400 transition-transform duration-300 flex-shrink-0 ${
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
                    className={`px-6 pb-6 text-neutral-600 dark:text-cream-400 text-sm sm:text-base font-light leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-4 ${
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

        {/* CTA Bottom Banner */}
        <section className="text-center py-16 px-8 rounded-2xl bg-cream-100/70 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 dark:text-cream-100 mb-4 tracking-tight">
            {t('connect.title')}
          </h2>
          <p className="max-w-xl mx-auto text-neutral-600 dark:text-cream-400 text-sm sm:text-base font-light mb-8">
            {t('connect.description')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 hover:opacity-90 transition-all text-xs uppercase tracking-[0.2em] font-semibold shadow-md"
          >
            <span>{t('details.cta')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </>
  );
};

export default Details;
