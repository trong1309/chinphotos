import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
import { Switch } from '../components/common/Switch';
import { FormField } from '../components/common/FormField';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useConfirm } from '../hooks/useConfirm';
import { useToastStore } from '../stores/toast.store';
import categoriesService from '../services/categories.service';
import { Category } from '../types';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Folder,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  slug: z
    .string()
    .min(1, 'Đường dẫn (slug) không được để trống')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  description: z.string().optional(),
  coverImage: z.string().url('URL ảnh bìa không hợp lệ').or(z.literal('')).optional(),
  isVisible: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface SortableCategoryItemProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onToggleVisible: (cat: Category) => void;
}

const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleVisible,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-stone-900 border rounded-xl transition-all ${
        isDragging
          ? 'opacity-50 border-brand-500 shadow-lg ring-2 ring-brand-500/20 z-10'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Kéo để thay đổi thứ tự"
          className="cursor-grab active:cursor-grabbing p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0 flex items-center justify-center">
          {category.coverImage ? (
            <img
              src={category.coverImage}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-stone-400" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
              {category.name}
            </h4>
            {!category.isVisible && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full">
                <EyeOff className="w-3 h-3" /> Đã ẩn
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
            /{category.slug}
            {category.description ? ` · ${category.description}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {category.galleryCount ?? 0}
          </span>
          <span className="text-xs text-stone-400 ml-1">bộ ảnh</span>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            aria-label={category.isVisible ? 'Ẩn danh mục' : 'Hiện danh mục'}
            size="sm"
            onClick={() => onToggleVisible(category)}
          >
            {category.isVisible ? (
              <Eye className="w-4 h-4 text-emerald-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-stone-400" />
            )}
          </IconButton>

          <IconButton
            aria-label="Chỉnh sửa danh mục"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <Edit2 className="w-4 h-4" />
          </IconButton>

          <IconButton
            aria-label="Xoá danh mục"
            size="sm"
            variant="danger"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesService.getCategories(true),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      coverImage: '',
      isVisible: true,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    // Auto-generate slug if not manually editing existing category
    if (!editingCategory) {
      const slug = name
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
    setEditingCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
      coverImage: '',
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      coverImage: cat.coverImage || '',
      isVisible: cat.isVisible,
    });
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoriesService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      addToast({ type: 'success', message: 'Tạo danh mục mới thành công!' });
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tạo danh mục';
      addToast({ type: 'error', message: msg });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      addToast({ type: 'success', message: 'Cập nhật danh mục thành công!' });
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể cập nhật danh mục';
      addToast({ type: 'error', message: msg });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      addToast({ type: 'success', message: 'Đã xoá danh mục thành công!' });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể xoá danh mục';
      addToast({ type: 'error', message: msg });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      categoriesService.reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      addToast({ type: 'success', message: 'Đã lưu thứ tự danh mục mới!' });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể lưu thứ tự danh mục' });
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleToggleVisible = (cat: Category) => {
    updateMutation.mutate({
      id: cat._id,
      data: { isVisible: !cat.isVisible },
    });
  };

  const handleDelete = async (cat: Category) => {
    // Check if category still has galleries
    if (cat.galleryCount && cat.galleryCount > 0) {
      await confirm({
        title: 'Không thể xoá danh mục',
        message: (
          <div className="space-y-2 text-left">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Danh mục <strong>&quot;{cat.name}&quot;</strong> hiện đang chứa{' '}
              <strong className="text-rose-600">{cat.galleryCount} bộ ảnh</strong>.
            </p>
            <p className="text-xs text-stone-500">
              Vui lòng chuyển các bộ ảnh sang danh mục khác hoặc xoá chúng trước khi xoá danh mục này.
            </p>
          </div>
        ),
        confirmText: 'Đã hiểu',
        cancelText: 'Đóng',
        variant: 'primary',
      });
      return;
    }

    const ok = await confirm({
      title: `Xoá danh mục "${cat.name}"?`,
      message: 'Hành động này sẽ xoá hoàn toàn danh mục khỏi hệ thống.',
      confirmText: 'Xoá vĩnh viễn',
      cancelText: 'Huỷ bỏ',
      variant: 'danger',
    });

    if (ok) {
      deleteMutation.mutate(cat._id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c._id === active.id);
      const newIndex = categories.findIndex((c) => c._id === over.id);
      const newOrderList = arrayMove(categories, oldIndex, newIndex);

      // Reorder payload
      const reorderPayload = newOrderList.map((cat, index) => ({
        id: cat._id,
        order: index + 1,
      }));

      // Optimistic update
      queryClient.setQueryData(['admin', 'categories'], newOrderList);
      reorderMutation.mutate(reorderPayload);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
    );
  }, [categories, search]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Quản lý Danh mục (Categories)"
        description="Tổ chức các thể loại ảnh: Gia đình, Trẻ em, Kỷ niệm, Ngoại cảnh..."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Thêm danh mục
          </Button>
        }
      />

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên hoặc slug danh mục..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-stone-500 dark:text-stone-400 self-end sm:self-center">
          Tổng số: <strong className="text-stone-900 dark:text-stone-100">{categories.length}</strong> danh mục
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh mục"
          message="Đã có lỗi khi kết nối máy chủ. Vui lòng thử lại."
          onRetry={() => refetch()}
        />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-8 h-8" />}
          title={search ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
          description={
            search
              ? `Không có kết quả nào phù hợp với từ khóa "${search}".`
              : 'Hãy bắt đầu tạo danh mục đầu tiên cho studio của bạn.'
          }
          action={
            !search && (
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                Tạo danh mục ngay
              </Button>
            )
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredCategories.map((c) => c._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {filteredCategories.map((category) => (
                <SortableCategoryItem
                  key={category._id}
                  category={category}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onToggleVisible={handleToggleVisible}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        description={
          editingCategory
            ? `Cập nhật thông tin cho danh mục "${editingCategory.name}"`
            : 'Nhập thông tin chi tiết để tạo danh mục ảnh mới'
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormField
            label="Tên danh mục"
            required
            error={errors.name?.message}
          >
            <Input
              placeholder="VD: Gia đình & Trẻ em"
              {...register('name')}
              onChange={handleNameChange}
            />
          </FormField>

          <FormField
            label="Đường dẫn (Slug)"
            required
            helperText="Dùng để hiển thị trên URL: /portfolio/[slug]"
            error={errors.slug?.message}
          >
            <Input
              placeholder="gia-dinh-tre-em"
              {...register('slug')}
            />
          </FormField>

          <FormField
            label="Ảnh bìa (URL)"
            helperText="Link hình đại diện hiển thị ngoài trang Portfolio"
            error={errors.coverImage?.message}
          >
            <Input
              placeholder="https://... hoặc đường dẫn ảnh"
              {...register('coverImage')}
            />
          </FormField>

          <FormField
            label="Mô tả ngắn"
            helperText="Mô tả phong cách chụp của danh mục này"
            error={errors.description?.message}
          >
            <Textarea
              placeholder="Khoảnh khắc ấm áp và tự nhiên của mọi thành viên trong gia đình..."
              rows={3}
              {...register('description')}
            />
          </FormField>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Switch
              label="Hiển thị công khai"
              description="Cho phép khách truy cập xem danh mục này trên website"
              checked={watch('isVisible')}
              onCheckedChange={(checked) => setValue('isVisible', checked)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
