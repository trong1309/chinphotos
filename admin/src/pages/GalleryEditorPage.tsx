import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { Switch } from '../components/common/Switch';
import { FormField } from '../components/common/FormField';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/common/Tabs';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { ImageUploader } from '../components/galleries/ImageUploader';
import { SortableImageGrid } from '../components/galleries/SortableImageGrid';
import { useToastStore } from '../stores/toast.store';
import galleriesService from '../services/galleries.service';
import categoriesService from '../services/categories.service';
import { Gallery, ImageItem } from '../types';
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Globe,
  ImageIcon,
  Users,
  Settings,
  AlertTriangle,
} from 'lucide-react';

const vendorSchema = z.object({
  role: z.string().min(1, 'Vai trò không được để trống'),
  name: z.string().min(1, 'Tên không được để trống'),
  url: z.string().url('URL không hợp lệ').or(z.literal('')).optional(),
});

const galleryFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bộ ảnh là bắt buộc'),
  slug: z
    .string()
    .min(1, 'Đường dẫn (slug) là bắt buộc')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  location: z.string().optional(),
  eventDate: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
  isUnlisted: z.boolean(),
  isFeatured: z.boolean(),
  coverImage: z.string().optional(),
  vendors: z.array(vendorSchema).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  // English translation fields
  titleEn: z.string().optional(),
  descriptionEn: z.string().optional(),
  locationEn: z.string().optional(),
});

type GalleryFormData = z.infer<typeof galleryFormSchema>;

export const GalleryEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const isNew = !id || id === 'new';
  const [activeTab, setActiveTab] = useState(isNew ? 'general' : 'images');
  const [galleryImages, setGalleryImages] = useState<ImageItem[]>([]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesService.getCategories(true),
  });

  // Fetch existing gallery if editing
  const {
    data: galleryData,
    isLoading: isGalleryLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'gallery', id],
    queryFn: () => galleriesService.getGalleryById(id!),
    enabled: !isNew,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: '',
      location: '',
      eventDate: '',
      description: '',
      status: 'draft',
      isUnlisted: false,
      isFeatured: false,
      coverImage: '',
      vendors: [],
      seoTitle: '',
      seoDescription: '',
      titleEn: '',
      descriptionEn: '',
      locationEn: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vendors',
  });

  // Populate data when fetched
  useEffect(() => {
    if (galleryData?.gallery) {
      const g = galleryData.gallery;
      const catId = typeof g.category === 'object' ? g.category._id : g.category;

      reset({
        title: g.title || '',
        slug: g.slug || '',
        category: catId || '',
        location: g.location || '',
        eventDate: g.eventDate ? g.eventDate.split('T')[0] : '',
        description: g.description || '',
        status: g.status || 'draft',
        isUnlisted: Boolean(g.isUnlisted),
        isFeatured: Boolean(g.isFeatured),
        coverImage: g.coverImage || '',
        vendors: g.vendors || [],
        seoTitle: g.seoTitle || '',
        seoDescription: g.seoDescription || '',
      });

      if (galleryData.images) {
        setGalleryImages(galleryData.images);
      }
    }
  }, [galleryData, reset]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('title', val, { shouldDirty: true });
    if (isNew) {
      const slug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setValue('slug', slug, { shouldDirty: true });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: GalleryFormData) => galleriesService.createGallery(data as Partial<Gallery>),
    onSuccess: (newGallery) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'galleries'] });
      addToast({
        type: 'success',
        message: 'Tạo bộ sưu tập thành công! Bạn có thể tải ảnh lên ngay bây giờ.',
      });
      navigate(`/galleries/${newGallery._id}`, { replace: true });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tạo bộ ảnh';
      addToast({ type: 'error', message: msg });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: GalleryFormData) =>
      galleriesService.updateGallery(id!, data as Partial<Gallery>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'galleries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', id] });
      addToast({ type: 'success', message: 'Lưu thay đổi thành công!' });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể lưu bộ ảnh';
      addToast({ type: 'error', message: msg });
    },
  });

  const onSubmit = async (data: GalleryFormData) => {
    if (isNew) {
      await createMutation.mutateAsync(data);
    } else {
      await updateMutation.mutateAsync(data);
    }
  };

  const handleSetCover = (coverUrl: string) => {
    setValue('coverImage', coverUrl, { shouldDirty: true });
    if (!isNew && id) {
      updateMutation.mutate({ ...watch(), coverImage: coverUrl });
      addToast({ type: 'success', message: 'Đã đặt làm ảnh bìa cho bộ sưu tập!' });
    }
  };

  const handleNewImagesUploaded = (newImages: ImageItem[]) => {
    setGalleryImages((prev) => [...prev, ...newImages]);
    if (!watch('coverImage') && newImages[0]?.url) {
      setValue('coverImage', newImages[0].url, { shouldDirty: true });
    }
    queryClient.invalidateQueries({ queryKey: ['admin', 'galleries'] });
  };

  if (!isNew && isGalleryLoading) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isNew && isError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Không tìm thấy bộ ảnh"
          message="Bộ ảnh không tồn tại hoặc đã bị xoá khỏi hệ thống."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const currentCover = watch('coverImage');
  const titleEnValue = watch('titleEn');
  const isEnMissing = !titleEnValue || titleEnValue.trim() === '';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/galleries"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:text-stone-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>{isNew ? 'Tạo mới bộ sưu tập ảnh' : watch('title') || 'Chỉnh sửa bộ ảnh'}</span>
              {isEnMissing && (
                <span
                  title="Chưa có bản dịch tiếng Anh"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 px-2 py-0.5 rounded-full"
                >
                  <AlertTriangle className="w-3 h-3" /> Thiếu EN
                </span>
              )}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {isNew ? 'Nhập thông tin ban đầu sau đó tải ảnh lên' : `Đường dẫn: /${watch('slug')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {!isNew && watch('status') === 'published' && (
            <a
              href={`http://localhost:5173/gallery/${watch('slug')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem thực tế</span>
            </a>
          )}

          <Button
            type="button"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSubmit(onSubmit)}
          >
            {isNew ? 'Tạo bộ ảnh' : isDirty ? 'Lưu thay đổi *' : 'Đã lưu'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto p-1 h-auto gap-1">
          <TabsTrigger value="general" className="gap-2 py-2">
            <ImageIcon className="w-4 h-4" />
            <span>Thông tin chung (VI)</span>
          </TabsTrigger>

          {!isNew && (
            <TabsTrigger value="images" className="gap-2 py-2">
              <ImageIcon className="w-4 h-4" />
              <span>Hình ảnh ({galleryImages.length})</span>
            </TabsTrigger>
          )}

          <TabsTrigger value="english" className="gap-2 py-2">
            <Globe className="w-4 h-4" />
            <span>Bản dịch (EN)</span>
            {isEnMissing && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </TabsTrigger>

          <TabsTrigger value="vendors" className="gap-2 py-2">
            <Users className="w-4 h-4" />
            <span>Đội ngũ ({fields.length})</span>
          </TabsTrigger>

          <TabsTrigger value="seo" className="gap-2 py-2">
            <Settings className="w-4 h-4" />
            <span>Cài đặt & SEO</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* TAB 1: THÔNG TIN CHUNG (VI) */}
          <TabsContent value="general" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-2 space-y-5 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <FormField
                  label="Tiêu đề bộ ảnh (VI)"
                  required
                  error={errors.title?.message}
                >
                  <Input
                    placeholder="VD: Gia đình chị Lan - Thảo Điền đầy nắng"
                    {...register('title')}
                    onChange={handleTitleChange}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Đường dẫn (Slug)"
                    required
                    helperText="URL: /gallery/[slug]"
                    error={errors.slug?.message}
                  >
                    <Input
                      placeholder="gia-dinh-chi-lan-thao-dien"
                      {...register('slug')}
                    />
                  </FormField>

                  <FormField
                    label="Danh mục"
                    required
                    error={errors.category?.message}
                  >
                    <Select
                      value={watch('category')}
                      onValueChange={(val) => setValue('category', val, { shouldDirty: true })}
                      placeholder="Chọn danh mục..."
                      options={categories.map((c) => ({
                        label: c.name,
                        value: c._id,
                      }))}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Địa điểm chụp ảnh"
                    helperText="VD: Thảo Điền, TP. Thủ Đức, TP.HCM"
                    error={errors.location?.message}
                  >
                    <Input
                      placeholder="Quận 2, TP.HCM"
                      {...register('location')}
                    />
                  </FormField>

                  <FormField
                    label="Ngày chụp / Sự kiện"
                    error={errors.eventDate?.message}
                  >
                    <Input
                      type="date"
                      {...register('eventDate')}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Mô tả & Câu chuyện bộ ảnh (VI)"
                  helperText="Chia sẻ cảm xúc, concept và kỷ niệm ấm áp trong buổi chụp"
                  error={errors.description?.message}
                >
                  <Textarea
                    placeholder="Một buổi chiều cuối tuần ấm áp ngập tràn tiếng cười của bé Miu và bố mẹ..."
                    rows={5}
                    {...register('description')}
                  />
                </FormField>
              </div>

              {/* Right Column: Status & Cover Preview */}
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Trạng thái xuất bản
                  </h3>

                  <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                    <div>
                      <span className="text-xs font-medium text-stone-800 dark:text-stone-200 block">
                        Chế độ xuất bản
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {watch('status') === 'published' ? 'Đã công khai trên web' : 'Bản nháp nội bộ'}
                      </span>
                    </div>
                    <Switch
                      checked={watch('status') === 'published'}
                      onCheckedChange={(checked) =>
                        setValue('status', checked ? 'published' : 'draft', { shouldDirty: true })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                    <div>
                      <span className="text-xs font-medium text-stone-800 dark:text-stone-200 block">
                        Đánh dấu nổi bật
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Hiển thị tại trang chủ
                      </span>
                    </div>
                    <Switch
                      checked={watch('isFeatured')}
                      onCheckedChange={(checked) => setValue('isFeatured', checked, { shouldDirty: true })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                    <div>
                      <span className="text-xs font-medium text-stone-800 dark:text-stone-200 block">
                        Ẩn khỏi danh sách (Unlisted)
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Chỉ truy cập khi có link trực tiếp
                      </span>
                    </div>
                    <Switch
                      checked={watch('isUnlisted')}
                      onCheckedChange={(checked) => setValue('isUnlisted', checked, { shouldDirty: true })}
                    />
                  </div>
                </div>

                {/* Cover Image Preview */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Ảnh bìa đại diện
                  </h3>

                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                    {currentCover ? (
                      <img
                        src={currentCover}
                        alt="Ảnh bìa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-stone-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                        <span className="text-xs">Chưa chọn ảnh bìa</span>
                      </div>
                    )}
                  </div>

                  <FormField
                    label="URL ảnh bìa"
                    helperText="Chọn từ tab Hình ảnh hoặc nhập link"
                  >
                    <Input
                      placeholder="https://..."
                      {...register('coverImage')}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: HÌNH ẢNH & TẢI LÊN */}
          {!isNew && (
            <TabsContent value="images" className="mt-4 space-y-6">
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Tải lên hình ảnh mới
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Kéo thả nhiều ảnh cùng lúc, hỗ trợ định dạng JPG, PNG, WEBP tối đa 15MB.
                  </p>
                </div>

                <ImageUploader
                  galleryId={id!}
                  onUploaded={handleNewImagesUploaded}
                />
              </div>

              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Danh sách hình ảnh ({galleryImages.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Kéo thả để sắp xếp thứ tự hiển thị trên website. Bấm vào ảnh để đặt làm ảnh bìa hoặc sửa chú thích.
                  </p>
                </div>

                <SortableImageGrid
                  images={galleryImages}
                  coverImageUrl={currentCover}
                  onSetCover={handleSetCover}
                  onImagesChange={setGalleryImages}
                />
              </div>
            </TabsContent>
          )}

          {/* TAB 3: BẢN DỊCH (EN) */}
          <TabsContent value="english" className="mt-4">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 max-w-3xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Bản dịch tiếng Anh (English Content)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Giúp khách hàng quốc tế đọc hiểu nội dung khi chuyển ngôn ngữ EN.
                  </p>
                </div>
                {isEnMissing && (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
                    Chưa dịch EN
                  </span>
                )}
              </div>

              <FormField
                label="Tiêu đề tiếng Anh (Title EN)"
                helperText="VD: Lan's Family - Sunny Memories in Thao Dien"
              >
                <Input
                  placeholder="English title..."
                  {...register('titleEn')}
                />
              </FormField>

              <FormField
                label="Địa điểm tiếng Anh (Location EN)"
                helperText="VD: Thao Dien, District 2, Ho Chi Minh City"
              >
                <Input
                  placeholder="English location..."
                  {...register('locationEn')}
                />
              </FormField>

              <FormField
                label="Mô tả tiếng Anh (Description EN)"
                helperText="English description and story of this photo session"
              >
                <Textarea
                  placeholder="A warm weekend afternoon filled with joy and natural smiles..."
                  rows={5}
                  {...register('descriptionEn')}
                />
              </FormField>
            </div>
          </TabsContent>

          {/* TAB 4: ĐỘI NGŨ / VENDORS */}
          <TabsContent value="vendors" className="mt-4">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 max-w-3xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Đội ngũ & Đối tác (Vendors / Credits)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Ghi nhận đối tác trang điểm, trang phục, studio hoặc địa điểm thực hiện buổi chụp.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => append({ role: '', name: '', url: '' })}
                >
                  Thêm đối tác
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Chưa có đối tác nào được thêm. Bấm &quot;Thêm đối tác&quot; để tạo dòng credit đầu tiên.
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl"
                    >
                      <div className="w-full sm:w-1/3">
                        <Input
                          placeholder="Vai trò (VD: Makeup, Trang phục)"
                          {...register(`vendors.${index}.role` as const)}
                          error={errors.vendors?.[index]?.role?.message}
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <Input
                          placeholder="Tên đối tác / Thương hiệu"
                          {...register(`vendors.${index}.name` as const)}
                          error={errors.vendors?.[index]?.name?.message}
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <Input
                          placeholder="Website hoặc Instagram URL"
                          {...register(`vendors.${index}.url` as const)}
                          error={errors.vendors?.[index]?.url?.message}
                        />
                      </div>
                      <IconButton
                        aria-label="Xoá dòng credit"
                        size="sm"
                        variant="danger"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 5: CÀI ĐẶT & SEO */}
          <TabsContent value="seo" className="mt-4">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 max-w-3xl">
              <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Tối ưu hóa máy tìm kiếm (SEO)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Tùy chỉnh thẻ tiêu đề và mô tả hiển thị trên kết quả tìm kiếm Google và khi chia sẻ liên kết lên mạng xã hội.
                </p>
              </div>

              <FormField
                label="Tiêu đề SEO (Meta Title)"
                helperText="Nếu để trống sẽ tự động dùng tiêu đề bộ ảnh kèm tên studio"
                error={errors.seoTitle?.message}
              >
                <Input
                  placeholder="Chụp ảnh gia đình Thảo Điền | chinphotos Studio"
                  {...register('seoTitle')}
                />
              </FormField>

              <FormField
                label="Mô tả SEO (Meta Description)"
                helperText="Đoạn văn ngắn 150-160 ký tự hiển thị trên Google Snippet"
                error={errors.seoDescription?.message}
              >
                <Textarea
                  placeholder="Khám phá bộ ảnh gia đình ngập tràn cảm xúc tự nhiên tại Thảo Điền TP.HCM do chinphotos thực hiện..."
                  rows={3}
                  {...register('seoDescription')}
                />
              </FormField>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
};

export default GalleryEditorPage;
