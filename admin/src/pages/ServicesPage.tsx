import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { FormField } from '../components/common/FormField';
import { Modal } from '../components/common/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/common/Tabs';
import { MarkdownEditor } from '../components/common/MarkdownEditor';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useConfirm } from '../hooks/useConfirm';
import { useToastStore } from '../stores/toast.store';
import servicesService from '../services/services.service';
import { Service } from '../types';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'chinphotos_service_form_draft';

const faqSchema = z.object({
  q: z.string().min(1, 'Câu hỏi không được để trống'),
  a: z.string().min(1, 'Câu trả lời không được để trống'),
});

const inclusionItemSchema = z.object({
  text: z.string().min(1, 'Nội dung bao gồm không được để trống'),
});

const serviceFormSchema = z.object({
  title: z.string().min(1, 'Tên gói dịch vụ là bắt buộc'),
  slug: z
    .string()
    .min(1, 'Đường dẫn (slug) là bắt buộc')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  summary: z.string().optional(),
  heroImage: z.string().url('URL ảnh không hợp lệ').or(z.literal('')).optional(),
  priceFrom: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  content: z.string().min(1, 'Nội dung mô tả chi tiết là bắt buộc'),
  inclusionsList: z.array(inclusionItemSchema),
  faqs: z.array(faqSchema),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

interface SortableServiceCardProps {
  service: Service;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
}

const SortableServiceCard: React.FC<SortableServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formattedPrice = service.priceFrom
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(service.priceFrom)
    : 'Liên hệ';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-stone-900 border rounded-2xl transition-all ${
        isDragging
          ? 'opacity-50 border-brand-500 shadow-xl ring-2 ring-brand-500/20 z-10'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-sm'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Kéo thả để sắp xếp thứ tự dịch vụ"
          className="cursor-grab active:cursor-grabbing p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded touch-none mt-1 sm:mt-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0 flex items-center justify-center">
          {service.heroImage ? (
            <img
              src={service.heroImage}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-stone-400" />
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">
              {service.title}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/50">
              Từ {formattedPrice}
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
            {service.summary || `/${service.slug}`}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {service.inclusions?.length || 0} quyền lợi bao gồm
            </span>
            <span className="inline-flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              {service.faqs?.length || 0} câu hỏi FAQ
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
        <a
          href={`http://localhost:5173/services/${service.slug}`}
          target="_blank"
          rel="noreferrer"
          title="Xem trang dịch vụ công khai"
          className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <IconButton
          aria-label="Chỉnh sửa dịch vụ"
          size="sm"
          onClick={() => onEdit(service)}
        >
          <Edit2 className="w-4 h-4" />
        </IconButton>
        <IconButton
          aria-label="Xoá dịch vụ"
          size="sm"
          variant="danger"
          onClick={() => onDelete(service)}
        >
          <Trash2 className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
};

export const ServicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { addToast } = useToastStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const {
    data: services = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: () => servicesService.getServices(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      heroImage: '',
      priceFrom: 3500000,
      content: '',
      inclusionsList: [{ text: '60 - 90 phút chụp ảnh tự nhiên' }],
      faqs: [{ q: 'Thời gian nhận ảnh là bao lâu?', a: 'Ảnh hoàn thiện sẽ được gửi trong vòng 7-10 ngày làm việc.' }],
    },
  });

  const {
    fields: inclusionFields,
    append: appendInclusion,
    remove: removeInclusion,
    move: moveInclusion,
  } = useFieldArray({
    control,
    name: 'inclusionsList',
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
    move: moveFaq,
  } = useFieldArray({
    control,
    name: 'faqs',
  });

  // Check if localStorage has a saved draft
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    setHasSavedDraft(Boolean(raw));
  }, [isModalOpen]);

  // Auto-save form changes to localStorage when modal is open and dirty
  const watchedValues = watch();
  useEffect(() => {
    if (isModalOpen && isDirty) {
      const timer = setTimeout(() => {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            editingId: editingService?._id || null,
            values: watchedValues,
            savedAt: new Date().toISOString(),
          }),
        );
        setHasSavedDraft(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [watchedValues, isModalOpen, isDirty, editingService]);

  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        editingId: string | null;
        values: ServiceFormData;
      };
      reset(parsed.values, { keepDefaultValues: false });
      addToast({ type: 'info', message: 'Đã khôi phục bản nháp chưa lưu!' });
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasSavedDraft(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title, { shouldDirty: true });
    if (!editingService) {
      const slug = title
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

  const openCreateModal = () => {
    setEditingService(null);
    setActiveTab('general');
    reset({
      title: '',
      slug: '',
      summary: '',
      heroImage: '',
      priceFrom: 3500000,
      content:
        '## Giới thiệu gói chụp\n\nBuổi chụp được thiết kế nhẹ nhàng, tôn vinh cảm xúc tự nhiên của gia đình bạn.\n\n### Điểm nổi bật\n- Ánh sáng tự nhiên ấm áp\n- Tư vấn trang phục và bối cảnh tận tâm',
      inclusionsList: [
        { text: '60 - 90 phút chụp ảnh tự nhiên ngoài trời hoặc tại nhà' },
        { text: '50+ file ảnh chỉnh màu nghệ thuật độ phân giải cao' },
        { text: 'Thư viện ảnh online riêng tư lưu trữ 12 tháng' },
      ],
      faqs: [
        {
          q: 'Nếu trời mưa thì buổi chụp sẽ xử lý thế nào?',
          a: 'Chúng mình hỗ trợ dời lịch miễn phí sang một ngày nắng đẹp gần nhất thuận tiện cho gia đình.',
        },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setActiveTab('general');
    reset({
      title: service.title,
      slug: service.slug,
      summary: service.summary || '',
      heroImage: service.heroImage || '',
      priceFrom: service.priceFrom ?? 0,
      content: service.content || '',
      inclusionsList:
        service.inclusions && service.inclusions.length > 0
          ? service.inclusions.map((inc) => ({ text: inc }))
          : [{ text: '' }],
      faqs: service.faqs && service.faqs.length > 0 ? service.faqs : [],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    if (isDirty) {
      const ok = await confirm({
        title: 'Đóng biểu mẫu chưa lưu?',
        message: 'Các thay đổi của bạn đã được lưu tạm vào bộ nhớ trình duyệt. Bạn có chắc muốn đóng?',
        confirmText: 'Đóng',
        cancelText: 'Tiếp tục chỉnh sửa',
        variant: 'primary',
      });
      if (!ok) return;
    }
    setIsModalOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Service>) => servicesService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      clearDraft();
      setIsModalOpen(false);
      addToast({ type: 'success', message: 'Đã tạo gói dịch vụ mới thành công!' });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tạo dịch vụ';
      addToast({ type: 'error', message: msg });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Service> }) =>
      servicesService.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      clearDraft();
      setIsModalOpen(false);
      addToast({ type: 'success', message: 'Đã cập nhật gói dịch vụ và FAQ thành công!' });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể cập nhật dịch vụ';
      addToast({ type: 'error', message: msg });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      addToast({ type: 'success', message: 'Đã xoá gói dịch vụ thành công!' });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể xoá dịch vụ' });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      servicesService.reorderServices(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      addToast({ type: 'success', message: 'Đã lưu thứ tự hiển thị gói dịch vụ!' });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể lưu thứ tự dịch vụ' });
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    const payload: Partial<Service> = {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      heroImage: data.heroImage,
      priceFrom: data.priceFrom,
      content: data.content,
      inclusions: data.inclusionsList.map((i) => i.text.trim()).filter(Boolean),
      faqs: data.faqs,
    };

    if (editingService) {
      await updateMutation.mutateAsync({ id: editingService._id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDelete = async (service: Service) => {
    const ok = await confirm({
      title: `Xoá gói dịch vụ "${service.title}"?`,
      message: 'Gói dịch vụ này sẽ bị gỡ khỏi trang báo giá và trang dịch vụ công khai.',
      confirmText: 'Xoá dịch vụ',
      cancelText: 'Huỷ bỏ',
      variant: 'danger',
    });
    if (ok) {
      deleteMutation.mutate(service._id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((s) => s._id === active.id);
      const newIndex = services.findIndex((s) => s._id === over.id);
      const newOrder = arrayMove(services, oldIndex, newIndex);

      queryClient.setQueryData(['admin', 'services'], newOrder);
      reorderMutation.mutate(
        newOrder.map((srv, idx) => ({ id: srv._id, order: idx + 1 })),
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Quản lý Gói dịch vụ (Services & FAQ)"
        description="Thiết lập bảng giá khởi điểm, quyền lợi đi kèm, bài viết Markdown và câu hỏi thường gặp (FAQ)"
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Thêm gói dịch vụ
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh sách dịch vụ"
          message="Đã có lỗi khi tải dữ liệu từ máy chủ."
          onRetry={() => refetch()}
        />
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8" />}
          title="Chưa có gói dịch vụ nào"
          description="Hãy tạo gói dịch vụ chụp ảnh đầu tiên để hiển thị trên website."
          action={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Tạo dịch vụ đầu tiên
            </Button>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={services.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {services.map((service) => (
                <SortableServiceCard
                  key={service._id}
                  service={service}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Service Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="full"
        title={
          editingService
            ? `Chỉnh sửa: ${editingService.title}`
            : 'Thêm gói dịch vụ chụp ảnh mới'
        }
        description="Mọi thay đổi về quyền lợi và FAQ sẽ được cập nhật trực tiếp lên trang công khai."
      >
        {hasSavedDraft && (
          <div className="mb-4 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
            <span>Tìm thấy bản nháp đã lưu tự động trong trình duyệt.</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3 h-3" />}
                onClick={handleRestoreDraft}
              >
                Khôi phục nháp
              </Button>
              <button
                type="button"
                onClick={clearDraft}
                className="text-stone-400 hover:text-stone-700 underline text-[11px]"
              >
                Xoá nháp
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="general">1. Thông tin & Giá</TabsTrigger>
              <TabsTrigger value="markdown">2. Nội dung chi tiết (Markdown)</TabsTrigger>
              <TabsTrigger value="inclusions">
                3. Quyền lợi bao gồm ({inclusionFields.length})
              </TabsTrigger>
              <TabsTrigger value="faqs">
                4. Câu hỏi thường gặp FAQ ({faqFields.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: GENERAL & PRICING */}
            <TabsContent value="general" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Tên gói dịch vụ"
                  required
                  error={errors.title?.message}
                >
                  <Input
                    placeholder="VD: Gói Chụp Gia Đình Tự Nhiên"
                    {...register('title')}
                    onChange={handleTitleChange}
                  />
                </FormField>

                <FormField
                  label="Đường dẫn (Slug)"
                  required
                  helperText="URL: /services/[slug]"
                  error={errors.slug?.message}
                >
                  <Input
                    placeholder="family-sessions"
                    {...register('slug')}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Giá khởi điểm (VND)"
                  required
                  helperText="Ví dụ: 4500000 (hiển thị: Từ 4.500.000 ₫)"
                  error={errors.priceFrom?.message}
                >
                  <Input
                    type="number"
                    step="100000"
                    placeholder="4500000"
                    {...register('priceFrom')}
                  />
                </FormField>

                <FormField
                  label="Ảnh bìa Hero (URL)"
                  error={errors.heroImage?.message}
                >
                  <Input
                    placeholder="https://... hoặc link ảnh"
                    {...register('heroImage')}
                  />
                </FormField>
              </div>

              <FormField
                label="Tóm tắt ngắn (Summary)"
                helperText="Hiển thị ở thẻ dịch vụ và phần mở đầu trang"
                error={errors.summary?.message}
              >
                <Textarea
                  rows={2}
                  placeholder="Lưu giữ trọn vẹn khoảnh khắc gắn kết tự nhiên của gia đình bạn tại Sài Gòn..."
                  {...register('summary')}
                />
              </FormField>
            </TabsContent>

            {/* TAB 2: MARKDOWN 2-COLUMN EDITOR */}
            <TabsContent value="markdown" className="pt-3">
              <FormField
                label="Nội dung chi tiết gói dịch vụ (Soạn thảo Markdown 2 cột)"
                required
              >
                <MarkdownEditor
                  value={watch('content') || ''}
                  onChange={(val) => setValue('content', val, { shouldDirty: true })}
                  error={errors.content?.message}
                  minHeight="280px"
                />
              </FormField>
            </TabsContent>

            {/* TAB 3: INCLUSIONS */}
            <TabsContent value="inclusions" className="space-y-4 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Danh sách các hạng mục bàn giao và quyền lợi khách hàng nhận được trong gói chụp.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => appendInclusion({ text: '' })}
                >
                  Thêm quyền lợi
                </Button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {inclusionFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-xl border border-stone-200/70 dark:border-stone-800"
                  >
                    <span className="text-xs font-bold text-stone-400 w-6 text-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        placeholder="VD: 60+ ảnh chỉnh sửa chi tiết độ phân giải cao"
                        {...register(`inclusionsList.${index}.text` as const)}
                        error={errors.inclusionsList?.[index]?.text?.message}
                      />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <IconButton
                        aria-label="Chuyển lên"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => moveInclusion(index, index - 1)}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </IconButton>
                      <IconButton
                        aria-label="Chuyển xuống"
                        size="sm"
                        disabled={index === inclusionFields.length - 1}
                        onClick={() => moveInclusion(index, index + 1)}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </IconButton>
                      <IconButton
                        aria-label="Xoá quyền lợi"
                        size="sm"
                        variant="danger"
                        onClick={() => removeInclusion(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 4: FAQS */}
            <TabsContent value="faqs" className="space-y-4 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Các câu hỏi thường gặp hiển thị dạng Accordion cuối trang dịch vụ (có cấu trúc JSON-LD SEO).
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => appendFaq({ q: '', a: '' })}
                >
                  Thêm câu hỏi FAQ
                </Button>
              </div>

              {faqFields.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                  Chưa có câu hỏi FAQ nào. Bấm &quot;Thêm câu hỏi FAQ&quot; để tạo mới.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {faqFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          Câu hỏi #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <IconButton
                            aria-label="Đưa câu hỏi lên trên"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveFaq(index, index - 1)}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </IconButton>
                          <IconButton
                            aria-label="Đưa câu hỏi xuống dưới"
                            size="sm"
                            disabled={index === faqFields.length - 1}
                            onClick={() => moveFaq(index, index + 1)}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </IconButton>
                          <IconButton
                            aria-label="Xoá câu hỏi"
                            size="sm"
                            variant="danger"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </div>

                      <Input
                        placeholder="Nhập câu hỏi (VD: Chúng tôi nên chuẩn bị trang phục như thế nào?)"
                        {...register(`faqs.${index}.q` as const)}
                        error={errors.faqs?.[index]?.q?.message}
                      />

                      <Textarea
                        rows={2}
                        placeholder="Nhập câu trả lời chi tiết..."
                        {...register(`faqs.${index}.a` as const)}
                        error={errors.faqs?.[index]?.a?.message}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingService ? 'Lưu gói dịch vụ' : 'Tạo gói dịch vụ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServicesPage;
