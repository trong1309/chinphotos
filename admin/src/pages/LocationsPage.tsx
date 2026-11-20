import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { FormField } from '../components/common/FormField';
import { Modal } from '../components/common/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/common/Tabs';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useConfirm } from '../hooks/useConfirm';
import { useToastStore } from '../stores/toast.store';
import locationsService from '../services/locations.service';
import { LocationItem } from '../types';
import {
  Plus,
  MapPin,
  Edit2,
  Trash2,
  ExternalLink,
  Sun,
  Image as ImageIcon,
} from 'lucide-react';

const locationFormSchema = z.object({
  name: z.string().min(1, 'Tên khu vực không được để trống'),
  slug: z
    .string()
    .min(1, 'Slug không được để trống')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  titleVi: z.string().min(1, 'Tiêu đề tiếng Việt là bắt buộc'),
  titleEn: z.string().min(1, 'Tiêu đề tiếng Anh là bắt buộc'),
  descriptionVi: z.string().min(1, 'Mô tả tiếng Việt là bắt buộc'),
  descriptionEn: z.string().min(1, 'Mô tả tiếng Anh là bắt buộc'),
  spotsViText: z.string(),
  spotsEnText: z.string(),
  tipsVi: z.string(),
  tipsEn: z.string(),
  coverImage: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

export const LocationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { addToast } = useToastStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [activeTab, setActiveTab] = useState('vi');

  const {
    data: locations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: () => locationsService.getLocations(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      titleVi: '',
      titleEn: '',
      descriptionVi: '',
      descriptionEn: '',
      spotsViText: '',
      spotsEnText: '',
      tipsVi: '',
      tipsEn: '',
      coverImage: '',
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val);
    if (!editingLocation) {
      const slug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setValue('slug', slug);
    }
  };

  const openCreateModal = () => {
    setEditingLocation(null);
    setActiveTab('vi');
    reset({
      name: '',
      slug: '',
      titleVi: '',
      titleEn: '',
      descriptionVi: '',
      descriptionEn: '',
      spotsViText: '',
      spotsEnText: '',
      tipsVi: '',
      tipsEn: '',
      coverImage: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setActiveTab('vi');
    reset({
      name: loc.name,
      slug: loc.slug,
      titleVi: loc.titleVi,
      titleEn: loc.titleEn,
      descriptionVi: loc.descriptionVi,
      descriptionEn: loc.descriptionEn,
      spotsViText: (loc.popularSpotsVi || []).join('\n'),
      spotsEnText: (loc.popularSpotsEn || []).join('\n'),
      tipsVi: loc.tipsVi || '',
      tipsEn: loc.tipsEn || '',
      coverImage: loc.coverImage || '',
    });
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (payload: Partial<LocationItem>) =>
      locationsService.createLocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'locations'] });
      setIsModalOpen(false);
      addToast({ type: 'success', message: 'Đã tạo trang địa điểm SEO mới!' });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể tạo địa điểm' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LocationItem> }) =>
      locationsService.updateLocation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'locations'] });
      setIsModalOpen(false);
      addToast({ type: 'success', message: 'Đã cập nhật địa điểm thành công!' });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể cập nhật địa điểm' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'locations'] });
      addToast({ type: 'success', message: 'Đã xoá địa điểm thành công!' });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể xoá địa điểm' });
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    const payload: Partial<LocationItem> = {
      name: data.name,
      slug: data.slug,
      titleVi: data.titleVi,
      titleEn: data.titleEn,
      descriptionVi: data.descriptionVi,
      descriptionEn: data.descriptionEn,
      popularSpotsVi: data.spotsViText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      popularSpotsEn: data.spotsEnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      tipsVi: data.tipsVi,
      tipsEn: data.tipsEn,
      coverImage: data.coverImage,
    };

    if (editingLocation) {
      await updateMutation.mutateAsync({ id: editingLocation._id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDelete = async (loc: LocationItem) => {
    const ok = await confirm({
      title: `Xoá khu vực "${loc.name}"?`,
      message: 'Trang SEO địa phương này sẽ bị gỡ khỏi hệ thống.',
      confirmText: 'Xoá khu vực',
      cancelText: 'Huỷ',
      variant: 'danger',
    });
    if (ok) {
      deleteMutation.mutate(loc._id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Quản lý Địa phương (Local SEO TP.HCM)"
        description="Quản lý nội dung song ngữ VI/EN cho các khu vực chụp ảnh tại Sài Gòn: Thủ Đức, Quận 1, Quận 7, Bình Thạnh, Phú Nhuận..."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Thêm khu vực
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh sách địa phương"
          message="Vui lòng thử lại sau."
          onRetry={() => refetch()}
        />
      ) : locations.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-8 h-8" />}
          title="Chưa có khu vực nào"
          description="Thêm các khu vực chụp ảnh tại TP.HCM để tăng hiệu quả Local SEO."
          action={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Tạo khu vực đầu tiên
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-40 bg-stone-100 dark:bg-stone-800">
                {loc.coverImage ? (
                  <img
                    src={loc.coverImage}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/65 text-white backdrop-blur-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-300" />
                  {loc.name}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {loc.titleVi}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                    {loc.descriptionVi}
                  </p>

                  {loc.tipsVi && (
                    <div className="pt-1 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                      <Sun className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{loc.tipsVi}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">
                    /locations/{loc.slug}
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={`http://localhost:5173/locations/${loc.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Xem trang công khai"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <IconButton
                      aria-label="Sửa khu vực"
                      size="sm"
                      onClick={() => openEditModal(loc)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </IconButton>
                    <IconButton
                      aria-label="Xoá khu vực"
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(loc)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        title={
          editingLocation
            ? `Chỉnh sửa khu vực: ${editingLocation.name}`
            : 'Thêm khu vực chụp ảnh mới'
        }
        description="Cấu hình nội dung SEO địa phương song ngữ Tiếng Việt & Tiếng Anh"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Tên khu vực" required error={errors.name?.message}>
              <Input
                placeholder="VD: Thảo Điền - Thủ Đức"
                {...register('name')}
                onChange={handleNameChange}
              />
            </FormField>

            <FormField label="Slug URL" required error={errors.slug?.message}>
              <Input placeholder="thu-duc" {...register('slug')} />
            </FormField>

            <FormField label="Ảnh bìa (URL)" error={errors.coverImage?.message}>
              <Input placeholder="https://..." {...register('coverImage')} />
            </FormField>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="vi">Nội dung Tiếng Việt (VI)</TabsTrigger>
              <TabsTrigger value="en">Nội dung Tiếng Anh (EN)</TabsTrigger>
            </TabsList>

            <TabsContent value="vi" className="space-y-3 pt-3">
              <FormField
                label="Tiêu đề trang (VI)"
                required
                error={errors.titleVi?.message}
              >
                <Input
                  placeholder="Chụp Ảnh Gia Đình Tại TP. Thủ Đức & Thảo Điền"
                  {...register('titleVi')}
                />
              </FormField>

              <FormField
                label="Mô tả khu vực (VI)"
                required
                error={errors.descriptionVi?.message}
              >
                <Textarea rows={3} {...register('descriptionVi')} />
              </FormField>

              <FormField
                label="Các địa điểm chụp nổi bật (Mỗi dòng 1 địa điểm)"
              >
                <Textarea
                  rows={3}
                  placeholder="Công viên Sala&#10;Bến tàu Thủ Thiêm"
                  {...register('spotsViText')}
                />
              </FormField>

              <FormField label="Mẹo khung giờ vàng & Ánh sáng (VI)">
                <Textarea rows={2} {...register('tipsVi')} />
              </FormField>
            </TabsContent>

            <TabsContent value="en" className="space-y-3 pt-3">
              <FormField
                label="Page Title (EN)"
                required
                error={errors.titleEn?.message}
              >
                <Input
                  placeholder="Family Photography in Thu Duc City & Thao Dien"
                  {...register('titleEn')}
                />
              </FormField>

              <FormField
                label="Area Description (EN)"
                required
                error={errors.descriptionEn?.message}
              >
                <Textarea rows={3} {...register('descriptionEn')} />
              </FormField>

              <FormField label="Popular Photo Spots (One per line)">
                <Textarea
                  rows={3}
                  placeholder="Sala Urban Park&#10;Thu Thiem Waterbus"
                  {...register('spotsEnText')}
                />
              </FormField>

              <FormField label="Golden Hour & Lighting Tips (EN)">
                <Textarea rows={2} {...register('tipsEn')} />
              </FormField>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingLocation ? 'Lưu thay đổi' : 'Tạo khu vực'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LocationsPage;
