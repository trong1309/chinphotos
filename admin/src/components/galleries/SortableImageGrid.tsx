import React, { useState } from 'react';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Checkbox } from '../common/Checkbox';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { FormField } from '../common/FormField';
import { EmptyState } from '../common/EmptyState';
import { useConfirm } from '../../hooks/useConfirm';
import { useToastStore } from '../../stores/toast.store';
import imagesService from '../../services/images.service';
import { ImageItem } from '../../types';
import {
  GripVertical,
  Star,
  Trash2,
  Edit2,
  ImageIcon,
  Sparkles,
} from 'lucide-react';

export interface SortableImageGridProps {
  images: ImageItem[];
  coverImageUrl?: string;
  onSetCover: (imageUrl: string) => void;
  onImagesChange: (newImages: ImageItem[]) => void;
}

interface SortableImageCardProps {
  image: ImageItem;
  isCover: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSetCover: () => void;
  onToggleFeatured: () => void;
  onEditAlt: () => void;
  onDelete: () => void;
}

const SortableImageCard: React.FC<SortableImageCardProps> = ({
  image,
  isCover,
  isSelected,
  onToggleSelect,
  onSetCover,
  onToggleFeatured,
  onEditAlt,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border transition-all ${
        isDragging
          ? 'opacity-40 border-brand-500 shadow-2xl z-20 ring-4 ring-brand-500/20'
          : isSelected
            ? 'border-brand-500 ring-2 ring-brand-500/30'
            : isCover
              ? 'border-brand-500 ring-2 ring-brand-500/20'
              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      {/* Image */}
      <img
        src={image.url}
        alt={image.alt || 'Ảnh bộ sưu tập'}
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="lazy"
      />

      {/* Badges (Top Left) */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="bg-black/50 backdrop-blur-sm p-1 rounded-md"
        >
          <Checkbox
            aria-label="Chọn ảnh"
            checked={isSelected}
            onCheckedChange={onToggleSelect}
          />
        </div>

        {isCover && (
          <span className="bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
            Ảnh bìa
          </span>
        )}
      </div>

      {/* Drag Handle (Top Right) */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Kéo để đổi thứ tự ảnh"
        className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-grab active:cursor-grabbing z-10 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Action Overlay (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center gap-1">
          {/* Cover button */}
          {!isCover && (
            <button
              type="button"
              onClick={onSetCover}
              className="text-[11px] font-medium text-white hover:text-brand-300 bg-white/20 hover:bg-white/30 px-2 py-1 rounded backdrop-blur-sm transition-colors"
            >
              Đặt bìa
            </button>
          )}

          {/* Featured toggle */}
          <button
            type="button"
            onClick={onToggleFeatured}
            title={image.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
            className={`p-1 rounded transition-colors ${
              image.isFeatured
                ? 'text-amber-400 bg-black/40'
                : 'text-white/80 hover:text-amber-300 bg-black/40'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${image.isFeatured ? 'fill-current' : ''}`} />
          </button>

          {/* Edit Alt button */}
          <button
            type="button"
            onClick={onEditAlt}
            title="Chỉnh sửa chú thích (Alt / Caption)"
            className="p-1 rounded text-white/80 hover:text-white bg-black/40 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDelete}
          title="Xoá ảnh"
          className="p-1 rounded text-rose-400 hover:text-rose-300 bg-black/40 hover:bg-rose-950/60 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dim overlay when selected */}
      {isSelected && <div className="absolute inset-0 bg-brand-500/10 pointer-events-none" />}
    </div>
  );
};

export const SortableImageGrid: React.FC<SortableImageGridProps> = ({
  images,
  coverImageUrl,
  onSetCover,
  onImagesChange,
}) => {
  const confirm = useConfirm();
  const { addToast } = useToastStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [altText, setAltText] = useState('');
  const [captionText, setCaptionText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img._id === active.id);
      const newIndex = images.findIndex((img) => img._id === over.id);
      const newOrderList = arrayMove(images, oldIndex, newIndex);

      const reorderPayload = newOrderList.map((img, index) => ({
        id: img._id,
        order: index + 1,
      }));

      onImagesChange(newOrderList);

      try {
        await imagesService.reorderImages(reorderPayload);
        addToast({ type: 'success', message: 'Đã lưu thứ tự hiển thị ảnh mới!' });
      } catch {
        addToast({ type: 'error', message: 'Không thể lưu thứ tự ảnh' });
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map((img) => img._id));
    }
  };

  const handleToggleFeatured = async (image: ImageItem) => {
    try {
      const updated = await imagesService.updateImage(image._id, {
        isFeatured: !image.isFeatured,
      });
      onImagesChange(images.map((img) => (img._id === updated._id ? updated : img)));
      addToast({
        type: 'success',
        message: updated.isFeatured ? 'Đã đánh dấu ảnh nổi bật!' : 'Đã bỏ đánh dấu nổi bật!',
      });
    } catch {
      addToast({ type: 'error', message: 'Không thể cập nhật trạng thái ảnh' });
    }
  };

  const handleDeleteSingle = async (image: ImageItem) => {
    const ok = await confirm({
      title: 'Xoá ảnh này?',
      message: 'Ảnh sẽ bị xoá hoàn toàn khỏi hệ thống lưu trữ.',
      confirmText: 'Xoá ảnh',
      cancelText: 'Huỷ bỏ',
      variant: 'danger',
    });

    if (ok) {
      try {
        await imagesService.deleteImage(image._id);
        onImagesChange(images.filter((img) => img._id !== image._id));
        setSelectedIds((prev) => prev.filter((id) => id !== image._id));
        addToast({ type: 'success', message: 'Đã xoá ảnh thành công!' });
      } catch {
        addToast({ type: 'error', message: 'Không thể xoá ảnh' });
      }
    }
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Xoá ${selectedIds.length} ảnh đã chọn?`,
      message: 'Các ảnh đã chọn sẽ bị xoá vĩnh viễn khỏi máy chủ lưu trữ.',
      confirmText: 'Xoá tất cả',
      cancelText: 'Huỷ bỏ',
      variant: 'danger',
    });

    if (ok) {
      try {
        await imagesService.bulkAction(selectedIds, 'delete');
        onImagesChange(images.filter((img) => !selectedIds.includes(img._id)));
        addToast({
          type: 'success',
          message: `Đã xoá ${selectedIds.length} ảnh thành công!`,
        });
        setSelectedIds([]);
      } catch {
        addToast({ type: 'error', message: 'Không thể xoá hàng loạt ảnh' });
      }
    }
  };

  const handleBulkFeature = async () => {
    try {
      await imagesService.bulkAction(selectedIds, 'feature');
      onImagesChange(
        images.map((img) =>
          selectedIds.includes(img._id) ? { ...img, isFeatured: true } : img,
        ),
      );
      addToast({ type: 'success', message: 'Đã đánh dấu nổi bật các ảnh đã chọn!' });
      setSelectedIds([]);
    } catch {
      addToast({ type: 'error', message: 'Không thể cập nhật nổi bật hàng loạt' });
    }
  };

  const openAltModal = (img: ImageItem) => {
    setEditingImage(img);
    setAltText(img.alt || '');
    setCaptionText(img.caption || '');
  };

  const handleSaveAlt = async () => {
    if (!editingImage) return;
    try {
      const updated = await imagesService.updateImage(editingImage._id, {
        alt: altText,
        caption: captionText,
      });
      onImagesChange(images.map((img) => (img._id === updated._id ? updated : img)));
      addToast({ type: 'success', message: 'Đã cập nhật chú thích ảnh!' });
      setEditingImage(null);
    } catch {
      addToast({ type: 'error', message: 'Không thể cập nhật chú thích' });
    }
  };

  if (images.length === 0) {
    return (
      <EmptyState
        icon={<ImageIcon className="w-8 h-8" />}
        title="Chưa có ảnh nào trong bộ sưu tập"
        description="Hãy kéo thả hoặc tải lên các bức ảnh đầu tiên ở khu vực phía trên."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Bar (Actions & Selection) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
        <div className="flex items-center gap-3">
          <Checkbox
            label={`Chọn tất cả (${images.length} ảnh)`}
            checked={
              selectedIds.length === 0
                ? false
                : selectedIds.length === images.length
                  ? true
                  : 'indeterminate'
            }
            onCheckedChange={handleSelectAll}
          />
          {selectedIds.length > 0 && (
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Đã chọn: {selectedIds.length}
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={handleBulkFeature}
            >
              Nổi bật ({selectedIds.length})
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleBulkDelete}
            >
              Xoá ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Grid with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img._id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {images.map((image) => (
              <SortableImageCard
                key={image._id}
                image={image}
                isCover={coverImageUrl === image.url}
                isSelected={selectedIds.includes(image._id)}
                onToggleSelect={() => handleToggleSelect(image._id)}
                onSetCover={() => onSetCover(image.url)}
                onToggleFeatured={() => handleToggleFeatured(image)}
                onEditAlt={() => openAltModal(image)}
                onDelete={() => handleDeleteSingle(image)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Alt Text & Caption Modal */}
      <Modal
        isOpen={Boolean(editingImage)}
        onClose={() => setEditingImage(null)}
        title="Chỉnh sửa chú thích ảnh"
        description="Thêm mô tả hỗ trợ SEO và hiển thị trong chế độ xem lightbox"
      >
        {editingImage && (
          <div className="space-y-4 pt-2">
            <div className="w-full h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <img
                src={editingImage.url}
                alt="Xem trước ảnh"
                className="w-full h-full object-contain"
              />
            </div>

            <FormField
              label="Mô tả ảnh (Alt text)"
              helperText="Hỗ trợ người khiếm thị đọc màn hình và tối ưu hóa SEO hình ảnh"
            >
              <Input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="VD: Bé gái cười rạng rỡ bên bó hoa dã quỳ tại Thảo Điền..."
              />
            </FormField>

            <FormField
              label="Chú thích ảnh (Caption)"
              helperText="Hiển thị bên dưới ảnh khi người xem phóng to lightbox"
            >
              <Input
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Khoảnh khắc bắt trọn lúc hoàng hôn..."
              />
            </FormField>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
              <Button variant="outline" onClick={() => setEditingImage(null)}>
                Huỷ
              </Button>
              <Button variant="primary" onClick={handleSaveAlt}>
                Lưu chú thích
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
