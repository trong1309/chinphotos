import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Send, AlertCircle, HeartHandshake, Sparkles } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { Toast } from '../components/ui/Toast';
import { useSettings } from '../hooks/useSettings';
import { submitInquiry, CreateInquiryDto } from '../services/inquiry.service';

const vnPhoneRegex = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;

export const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { data: settings } = useSettings();
  const isVi = i18n.language.startsWith('vi');

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  const contactSchema = z.object({
    name: z
      .string()
      .min(2, isVi ? 'Vui lòng nhập họ và tên của bạn' : 'Please enter your full name'),
    email: z
      .string()
      .email(isVi ? 'Địa chỉ email không hợp lệ' : 'Invalid email address'),
    phone: z
      .string()
      .min(1, isVi ? 'Vui lòng nhập số điện thoại' : 'Phone number is required')
      .regex(
        vnPhoneRegex,
        isVi
          ? 'Số điện thoại Việt Nam không hợp lệ (Ví dụ: 0901234567)'
          : 'Invalid Vietnamese phone number (e.g. 0901234567 or +84901234567)',
      ),
    serviceType: z.string().optional(),
    eventDate: z.string().optional(),
    location: z.string().optional(),
    adultsCount: z.coerce.number().min(1).optional(),
    childrenInfo: z.string().optional(),
    message: z
      .string()
      .min(
        5,
        isVi
          ? 'Lời nhắn cần có tối thiểu 5 ký tự'
          : 'Message must be at least 5 characters long',
      ),
    source: z.string().optional(),
    website_url_hp: z.string().optional(),
  });

  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      serviceType: '',
      eventDate: '',
      location: '',
      adultsCount: 2,
      childrenInfo: '',
      message: '',
      source: '',
      website_url_hp: '',
    },
  });

  // URL Query Prefill: ?service=... or ?location=...
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      if (serviceParam.includes('family')) setValue('serviceType', 'Family Sessions');
      else if (serviceParam.includes('kids')) setValue('serviceType', 'Kids Portraits');
      else if (serviceParam.includes('mini')) setValue('serviceType', 'Mini Sessions');
      else setValue('serviceType', serviceParam);
    }

    const locationParam = searchParams.get('location');
    if (locationParam) {
      const locationMap: Record<string, string> = {
        'ho-chi-minh-city': 'Toàn TP. Hồ Chí Minh',
        'thu-duc': 'TP. Thủ Đức & Thảo Điền',
        'quan-1': 'Quận 1, TP.HCM',
        'quan-7': 'Quận 7 & Phú Mỹ Hưng',
        'binh-thanh': 'Bình Thạnh & Bán đảo Thanh Đa',
        'phu-nhuan': 'Phú Nhuận & Công viên Gia Định',
      };
      setValue('location', locationMap[locationParam] || locationParam);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      const payload: CreateInquiryDto = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        serviceType: data.serviceType || undefined,
        eventDate: data.eventDate || undefined,
        location: data.location || undefined,
        adultsCount: data.adultsCount || undefined,
        childrenInfo: data.childrenInfo || undefined,
        message: data.message,
        source: data.source || undefined,
        lang: isVi ? 'vi' : 'en',
        website_url_hp: data.website_url_hp,
      };

      await submitInquiry(payload);

      setToast({
        isVisible: true,
        message: t('contactForm.successToast'),
        type: 'success',
      });

      reset();
    } catch {
      setToast({
        isVisible: true,
        message: t('contactForm.errorToast'),
        type: 'error',
      });
    }
  };

  return (
    <>
      <Seo
        title={`${t('contactForm.title')} | chinphotos`}
        description={t('contactForm.subtitle')}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="max-w-2xl mx-auto text-center mb-16 sm:mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-700 dark:text-accent-400 font-semibold mb-3">
            {t('connect.subtitle')}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-neutral-900 dark:text-cream-100 font-light tracking-tight mb-4">
            {t('contactForm.title')}
          </h1>
          <p className="text-neutral-600 dark:text-cream-300 text-base sm:text-lg font-light leading-relaxed">
            {t('contactForm.subtitle')}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Info & Reassurance */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-2xl bg-cream-50/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-6">
              <h2 className="font-serif text-2xl text-neutral-900 dark:text-cream-100 font-normal">
                chinphotos Studio
              </h2>
              <p className="text-sm text-neutral-600 dark:text-cream-300 font-light leading-relaxed">
                {t('connect.description')}
              </p>

              <div className="pt-4 space-y-4 border-t border-neutral-200/60 dark:border-neutral-800 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-0.5">
                      {t('connect.directEmail')}
                    </span>
                    <a
                      href={`mailto:${settings?.contactEmail || 'hello@chinphotos.com'}`}
                      className="font-medium text-neutral-900 dark:text-cream-100 hover:text-accent-600 transition-colors"
                    >
                      {settings?.contactEmail || 'hello@chinphotos.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-0.5">
                      {t('connect.base')}
                    </span>
                    <span className="text-neutral-800 dark:text-cream-200 font-light">
                      {settings?.serviceAreas?.join(' · ') || 'TP. Hồ Chí Minh'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200/60 dark:border-neutral-800 space-y-2 text-xs text-neutral-500 dark:text-cream-400 font-light">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-500" />
                  <span>
                    {isVi
                      ? 'Phản hồi chi tiết kèm bảng báo giá trong vòng 24 giờ'
                      : 'Detailed response and pricing guide within 24 hours'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-accent-500" />
                  <span>
                    {isVi
                      ? 'Tư vấn trang phục & địa điểm phù hợp hoàn toàn miễn phí'
                      : 'Complimentary wardrobe styling & HCMC location consultation'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 shadow-xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {/* Honeypot field (hidden from legitimate users) */}
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="website_url_hp">Website</label>
                  <input
                    id="website_url_hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...register('website_url_hp')}
                  />
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.nameLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t('contactForm.namePlaceholder')}
                      {...register('name')}
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${
                        errors.name
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-neutral-200 dark:border-neutral-700 focus:ring-accent-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.emailLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder={t('contactForm.emailPlaceholder')}
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-neutral-200 dark:border-neutral-700 focus:ring-accent-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone & Service Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.phoneLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder={t('contactForm.phonePlaceholder')}
                      {...register('phone')}
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${
                        errors.phone
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-neutral-200 dark:border-neutral-700 focus:ring-accent-500'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.serviceLabel')}
                    </label>
                    <select
                      {...register('serviceType')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                    >
                      <option value="">{t('contactForm.serviceDefault')}</option>
                      <option value="Family Sessions">
                        {isVi ? 'Gói Gia đình Trọn vẹn' : 'Full Family Session'}
                      </option>
                      <option value="Kids Portraits">
                        {isVi ? 'Chân dung Tuổi thơ' : 'Childhood Portraits'}
                      </option>
                      <option value="Mini Sessions">
                        {isVi ? 'Gói Chụp Nhanh' : 'Mini Session'}
                      </option>
                      <option value="Other">{t('contactForm.serviceOptionOther')}</option>
                    </select>
                  </div>
                </div>

                {/* Event Date & Location Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.dateLabel')}
                    </label>
                    <input
                      type="date"
                      {...register('eventDate')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.locationLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('contactForm.locationPlaceholder')}
                      {...register('location')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                    />
                  </div>
                </div>

                {/* Adults Count & Children Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.adultsLabel')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={2}
                      {...register('adultsCount')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                      {t('contactForm.childrenLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('contactForm.childrenPlaceholder')}
                      {...register('childrenInfo')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                    />
                  </div>
                </div>

                {/* Referral Source Dropdown */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                    {t('contactForm.sourceLabel')}
                  </label>
                  <select
                    {...register('source')}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                  >
                    <option value="">{t('contactForm.sourceDefault')}</option>
                    <option value="Facebook">{t('contactForm.sourceFacebook')}</option>
                    <option value="Instagram">{t('contactForm.sourceInstagram')}</option>
                    <option value="Referral">{t('contactForm.sourceReferral')}</option>
                    <option value="Google Search">{t('contactForm.sourceSearch')}</option>
                    <option value="Other">{t('contactForm.sourceOther')}</option>
                  </select>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 dark:text-cream-200 mb-2">
                    {t('contactForm.messageLabel')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t('contactForm.messagePlaceholder')}
                    {...register('message')}
                    className={`w-full px-4 py-3 rounded-xl border text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-cream-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${
                      errors.message
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-neutral-200 dark:border-neutral-700 focus:ring-accent-500'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>{t('contactForm.submitting')}</span>
                    ) : (
                      <>
                        <span>{t('contactForm.submit')}</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
