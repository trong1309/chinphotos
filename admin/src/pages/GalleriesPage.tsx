import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { FilterBar } from '../components/common/FilterBar';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useConfirm } from '../hooks/useConfirm';
import { useTableState } from '../hooks/useTableState';
import { useToastStore } from '../stores/toast.store';
import galleriesService from '../services/galleries.service';
import categoriesService from '../services/categories.service';
import { Gallery, Category } from '../types';
import {
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Star,
  EyeOff,
} from 'lucide-react';

export const GalleriesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { addToast } = useToastStore();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setSorting,
    setFilter,
    resetFilters,
    searchParams,
  } = useTableState({
    defaultPage: 1,
    defaultPageSize: 12,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
  });

  const categoryFilter = searchParams.get('category') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const featuredFilter = searchParams.get('featured') || 'all';

  // Load categories for filter dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesService.getCategories(true),
  });

  // Load galleries with params
  const {
    data: galleriesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'admin',
      'galleries',
      page,
      pageSize,
      search,
      categoryFilter,
      statusFilter,
      featuredFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      galleriesService.getGalleries({
        page,
        limit: pageSize,
        search: search || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        featured: featuredFilter === 'true' ? true : undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleriesService.deleteGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'galleries'] });
      addToast({ type: 'success', message: 'Đã xoá bộ sưu tập ảnh thành công!' });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể xoá bộ ảnh';
      addToast({ type: 'error', message: msg });
    },
  });

  const handleDelete = async (gallery: Gallery) => {
    const ok = await confirm({
      title: `Xoá bộ ảnh "${gallery.title}"?`,
      message: (
        <div className="space-y-2 text-left">
          <p className="text-sm text-stone-600 dark:text-stone-300">
            Hành động này sẽ xoá bộ ảnh cùng toàn bộ ảnh đính kèm bên trong khỏi hệ thống và máy chủ.
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            Lưu ý: Không thể hoàn tác sau khi xoá!
          </p>
        </div>
      ),
      confirmText: 'Xoá vĩnh viễn',
      cancelText: 'Huỷ bỏ',
      variant: 'danger',
    });

    if (ok) {
      deleteMutation.mutate(gallery._id);
    }
  };

  const getCategoryName = (category: string | Category): string => {
    if (typeof category === 'object' && category?.name) return category.name;
    const found = categories.find((c) => c._id === category);
    return found ? found.name : 'Chung';
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (featuredFilter !== 'all' ? 1 : 0);

  const galleries = galleriesData?.items || [];
  const total = galleriesData?.pagination?.total || 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Quản lý Bộ ảnh (Galleries)"
        description="Toàn bộ các bộ sưu tập ảnh gia đình, trẻ em, phong cách sống..."
        actions={
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Chế độ bảng"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Chế độ lưới"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/galleries/new')}
            >
              Tạo bộ ảnh mới
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên bộ ảnh, địa điểm..."
        activeFilterCount={activeFilterCount}
        onReset={resetFilters}
        filters={
          <>
            {/* Category Filter */}
            <div className="w-44">
              <Select
                value={categoryFilter}
                onValueChange={(val) => setFilter('category', val)}
                options={[
                  { label: 'Tất cả danh mục', value: 'all' },
                  ...categories.map((c) => ({ label: c.name, value: c._id })),
                ]}
              />
            </div>

            {/* Status Filter */}
            <div className="w-36">
              <Select
                value={statusFilter}
                onValueChange={(val) => setFilter('status', val)}
                options={[
                  { label: 'Tất cả trạng thái', value: 'all' },
                  { label: 'Đã xuất bản', value: 'published' },
                  { label: 'Bản nháp', value: 'draft' },
                ]}
              />
            </div>

            {/* Featured Filter */}
            <div className="w-36">
              <Select
                value={featuredFilter}
                onValueChange={(val) => setFilter('featured', val)}
                options={[
                  { label: 'Tất cả nổi bật', value: 'all' },
                  { label: 'Ảnh nổi bật', value: 'true' },
                ]}
              />
            </div>
          </>
        }
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh sách bộ ảnh"
          message="Đã có lỗi khi kết nối máy chủ. Vui lòng thử lại."
          onRetry={() => refetch()}
        />
      ) : galleries.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-8 h-8" />}
          title={activeFilterCount > 0 ? 'Không tìm thấy bộ ảnh phù hợp' : 'Chưa có bộ ảnh nào'}
          description={
            activeFilterCount > 0
              ? 'Thử điều chỉnh lại bộ lọc hoặc từ khoá tìm kiếm.'
              : 'Hãy bắt đầu tạo bộ sưu tập hình ảnh đầu tiên cho khách hàng.'
          }
          action={
            activeFilterCount > 0 ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Đặt lại bộ lọc
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/galleries/new')}
              >
                Tạo bộ ảnh ngay
              </Button>
            )
          }
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="border-b border-stone-200 bg-stone-50/75 text-xs font-semibold uppercase tracking-wider text-stone-700 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-300">
              <tr>
                <th scope="col" className="px-4 py-3.5 w-16">Ảnh</th>
                <th scope="col" className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => setSorting('title')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-stone-900 dark:hover:text-stone-100"
                  >
                    Tiêu đề bộ ảnh
                  </button>
                </th>
                <th scope="col" className="px-4 py-3.5">Danh mục</th>
                <th scope="col" className="px-4 py-3.5">Địa điểm & Ngày</th>
                <th scope="col" className="px-4 py-3.5 text-center">Số ảnh</th>
                <th scope="col" className="px-4 py-3.5">Trạng thái</th>
                <th scope="col" className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {galleries.map((gallery) => (
                <tr
                  key={gallery._id}
                  className="hover:bg-stone-50/75 dark:hover:bg-stone-800/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {gallery.coverImage ? (
                        <img
                          src={gallery.coverImage}
                          alt={gallery.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                  </td>

                  {/* Title & Slug */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/galleries/${gallery._id}`}
                          className="font-semibold text-stone-900 hover:text-brand-600 dark:text-stone-100 dark:hover:text-brand-400 line-clamp-1"
                        >
                          {gallery.title}
                        </Link>
                        {gallery.isFeatured && (
                          <span
                            title="Nổi bật trên trang chủ"
                            className="inline-flex items-center p-0.5 rounded text-amber-500 bg-amber-50 dark:bg-amber-950/40 shrink-0"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </span>
                        )}
                        {gallery.isUnlisted && (
                          <span
                            title="Bộ ảnh này được ẩn khỏi danh sách chung"
                            className="inline-flex items-center p-0.5 rounded text-stone-400 bg-stone-100 dark:bg-stone-800 shrink-0"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 font-mono">
                        /{gallery.slug}
                      </p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      {getCategoryName(gallery.category)}
                    </span>
                  </td>

                  {/* Location & Date */}
                  <td className="px-4 py-3 text-xs text-stone-500 dark:text-stone-400 space-y-1">
                    {gallery.location && (
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                        <span className="truncate">{gallery.location}</span>
                      </div>
                    )}
                    {gallery.eventDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                        <span>{new Date(gallery.eventDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                  </td>

                  {/* Image Count */}
                  <td className="px-4 py-3 text-center text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {gallery.imageCount ?? 0}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={gallery.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {gallery.status === 'published' && (
                        <a
                          href={`http://localhost:5173/gallery/${gallery.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Xem trên trang chủ"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <IconButton
                        aria-label="Chỉnh sửa bộ ảnh"
                        size="sm"
                        onClick={() => navigate(`/galleries/${gallery._id}`)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        aria-label="Xoá bộ ảnh"
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(gallery)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {galleries.map((gallery) => (
            <div
              key={gallery._id}
              className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[4/3] bg-stone-100 dark:bg-stone-800 overflow-hidden">
                {gallery.coverImage ? (
                  <img
                    src={gallery.coverImage}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <StatusBadge status={gallery.status} size="sm" />
                  {gallery.isFeatured && (
                    <span className="p-1 rounded-full bg-amber-500 text-white shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>{gallery.imageCount ?? 0}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {getCategoryName(gallery.category)}
                  </span>
                  <Link
                    to={`/galleries/${gallery._id}`}
                    className="block font-semibold text-sm text-stone-900 hover:text-brand-600 dark:text-stone-100 dark:hover:text-brand-400 line-clamp-1"
                  >
                    {gallery.title}
                  </Link>
                  {gallery.location && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{gallery.location}</span>
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    {gallery.eventDate
                      ? new Date(gallery.eventDate).toLocaleDateString('vi-VN')
                      : 'Chưa đặt ngày'}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconButton
                      aria-label="Sửa bộ ảnh"
                      size="sm"
                      onClick={() => navigate(`/galleries/${gallery._id}`)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </IconButton>
                    <IconButton
                      aria-label="Xoá bộ ảnh"
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(gallery)}
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

      {/* Pagination */}
      {total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48]}
        />
      )}
    </div>
  );
};

export default GalleriesPage;
