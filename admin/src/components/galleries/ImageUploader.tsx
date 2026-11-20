import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, FileImage, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useToastStore } from '../../stores/toast.store';
import imagesService from '../../services/images.service';
import { ImageItem } from '../../types';

export interface ImageUploaderProps {
  galleryId: string;
  onUploaded: (newImages: ImageItem[]) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ galleryId, onUploaded }) => {
  const { addToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFiles = (fileList: FileList | File[]): File[] => {
    const valid: File[] = [];
    const files = Array.from(fileList);

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        addToast({
          type: 'error',
          message: `Tệp "${file.name}" không hợp lệ. Chỉ chấp nhận định dạng JPG, PNG, WEBP.`,
        });
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        addToast({
          type: 'error',
          message: `Tệp "${file.name}" vượt quá kích thước 15MB cho phép.`,
        });
        continue;
      }

      valid.push(file);
    }

    return valid;
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const queued: UploadingFile[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'pending',
    }));

    setUploadQueue((prev) => [...prev, ...queued]);
    setIsProcessing(true);

    try {
      // Execute upload
      const uploaded = await imagesService.uploadImages(
        galleryId,
        newFiles,
        (percent) => {
          setUploadQueue((prev) =>
            prev.map((item) =>
              queued.some((q) => q.id === item.id)
                ? { ...item, progress: percent, status: 'uploading' }
                : item,
            ),
          );
        },
      );

      setUploadQueue((prev) =>
        prev.map((item) =>
          queued.some((q) => q.id === item.id)
            ? { ...item, progress: 100, status: 'success' }
            : item,
        ),
      );

      addToast({
        type: 'success',
        message: `Đã tải lên thành công ${uploaded.length} ảnh!`,
      });

      onUploaded(uploaded);

      // Clean up queue after short delay
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((item) => item.status !== 'success'));
      }, 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Tải ảnh lên thất bại';

      setUploadQueue((prev) =>
        prev.map((item) =>
          queued.some((q) => q.id === item.id)
            ? { ...item, status: 'error', errorMessage: msg }
            : item,
        ),
      );

      addToast({ type: 'error', message: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const valid = validateFiles(e.dataTransfer.files);
    handleFilesAdded(valid);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const valid = validateFiles(e.target.files);
      handleFilesAdded(valid);
      e.target.value = '';
    }
  };

  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-4 ring-brand-500/10'
            : 'border-stone-300 dark:border-stone-700 hover:border-brand-400 bg-stone-50/50 dark:bg-stone-900/40 hover:bg-stone-50 dark:hover:bg-stone-850'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
          disabled={isProcessing}
        />

        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3.5 shadow-inner">
          {isProcessing ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <UploadCloud className="w-7 h-7" />
          )}
        </div>

        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1 text-center">
          Kéo thả ảnh vào đây hoặc bấm để chọn tệp
        </h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 text-center max-w-md">
          Hỗ trợ tải lên nhiều ảnh định dạng <strong>JPG, PNG, WEBP</strong>. Dung lượng tối đa{' '}
          <strong>15MB</strong> mỗi ảnh. Ảnh sẽ được tự động tối ưu hóa đa kích thước.
        </p>

        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Chọn ảnh từ máy
          </Button>
        </div>
      </div>

      {/* Upload Progress Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 pb-2 border-b border-stone-100 dark:border-stone-800">
            <span>Tiến trình tải lên ({uploadQueue.length} tệp)</span>
            {isProcessing && (
              <span className="text-brand-600 dark:text-brand-400 font-medium animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý...
              </span>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pt-1 divide-y divide-stone-50 dark:divide-stone-800/60">
            {uploadQueue.map((item) => (
              <div key={item.id} className="pt-2 flex items-center gap-3 text-xs">
                {/* Preview Thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileImage className="w-full h-full p-2 text-stone-400" />
                  )}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-stone-900 dark:text-stone-100 truncate">
                      {item.file.name}
                    </span>
                    <span className="text-[11px] text-stone-400 shrink-0">
                      {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'success'
                          ? 'bg-emerald-500'
                          : item.status === 'error'
                            ? 'bg-rose-500'
                            : 'bg-brand-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Icon */}
                <div className="shrink-0 flex items-center">
                  {item.status === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  {item.status === 'error' && (
                    <span title={item.errorMessage}>
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    </span>
                  )}
                  {item.status !== 'uploading' && (
                    <button
                      type="button"
                      aria-label="Xoá khỏi hàng đợi"
                      onClick={() => removeQueueItem(item.id)}
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
