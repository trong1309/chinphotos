import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/StatusBadge';
import { Drawer } from '../components/common/Drawer';
import { FormField } from '../components/common/FormField';
import { ErrorState } from '../components/common/ErrorState';
import { useTableState } from '../hooks/useTableState';
import { useConfirm } from '../hooks/useConfirm';
import { useToastStore } from '../stores/toast.store';
import inquiriesService from '../services/inquiries.service';
import analyticsService from '../services/analytics.service';
import { Inquiry, InquiryStatus } from '../types';
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Download,
  Trash2,
  CheckCircle2,
  Archive,
  Eye,
  Send,
  Save,
  Clock,
  MessageSquare,
} from 'lucide-react';

export const InquiriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { addToast } = useToastStore();

  const {
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    resetFilters,
    searchParams,
  } = useTableState({
    defaultPage: 1,
    defaultPageSize: 20,
  });

  const statusFilter = searchParams.get('status') || 'all';
  const serviceFilter = searchParams.get('serviceType') || 'all';
  const fromDate = searchParams.get('from') || '';
  const toDate = searchParams.get('to') || '';
  const sortOrder = (searchParams.get('sort') as 'newest' | 'oldest') || 'newest';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<InquiryStatus>('read');

  const {
    data: inquiriesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'admin',
      'inquiries',
      page,
      pageSize,
      search,
      statusFilter,
      serviceFilter,
      fromDate,
      toDate,
      sortOrder,
    ],
    queryFn: () =>
      inquiriesService.getInquiries({
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceType: serviceFilter !== 'all' ? serviceFilter : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        sort: sortOrder,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      internalNote,
    }: {
      id: string;
      status: InquiryStatus;
      internalNote?: string;
    }) => inquiriesService.updateInquiryStatus(id, status, internalNote),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      setSelectedInquiry(updated);
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể cập nhật yêu cầu' });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({
      ids,
      action,
    }: {
      ids: string[];
      action: 'read' | 'replied' | 'archived' | 'delete';
    }) => inquiriesService.bulkAction(ids, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      setSelectedIds([]);
      const actionLabels = {
        read: 'đánh dấu đã đọc',
        replied: 'đánh dấu đã trả lời',
        archived: 'chuyển vào lưu trữ',
        delete: 'xoá vĩnh viễn',
      };
      addToast({
        type: 'success',
        message: `Đã ${actionLabels[variables.action]} ${variables.ids.length} yêu cầu!`,
      });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Thao tác hàng loạt thất bại' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inquiriesService.deleteInquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      setSelectedInquiry(null);
      addToast({ type: 'success', message: 'Đã xoá yêu cầu liên hệ!' });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Không thể xoá yêu cầu' });
    },
  });

  const handleOpenInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNoteDraft(inquiry.internalNote || '');
    const nextStatus = inquiry.status === 'new' ? 'read' : inquiry.status;
    setStatusDraft(nextStatus);

    if (inquiry.status === 'new') {
      try {
        const updated = await inquiriesService.getInquiryById(inquiry._id);
        setSelectedInquiry(updated);
        queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      } catch {
        // Fallback status update
        updateMutation.mutate({ id: inquiry._id, status: 'read' });
      }
    }
  };

  const handleSaveDrawerChanges = () => {
    if (!selectedInquiry) return;
    updateMutation.mutate(
      {
        id: selectedInquiry._id,
        status: statusDraft,
        internalNote: noteDraft,
      },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            message: 'Đã lưu trạng thái và ghi chú nội bộ!',
          });
        },
      },
    );
  };

  const handleBulkAction = async (
    action: 'read' | 'replied' | 'archived' | 'delete',
  ) => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      const ok = await confirm({
        title: `Xoá ${selectedIds.length} yêu cầu đã chọn?`,
        message: 'Dữ liệu liên hệ đã xoá sẽ không thể khôi phục.',
        confirmText: 'Xoá tất cả',
        cancelText: 'Huỷ',
        variant: 'danger',
      });
      if (!ok) return;
    }

    bulkMutation.mutate({ ids: selectedIds, action });
  };

  const handleDeleteSingle = async (inq: Inquiry) => {
    const ok = await confirm({
      title: `Xoá tin nhắn của "${inq.name}"?`,
      message: 'Tin nhắn này sẽ bị xoá vĩnh viễn khỏi hộp thư.',
      confirmText: 'Xoá',
      cancelText: 'Huỷ',
      variant: 'danger',
    });
    if (ok) {
      deleteMutation.mutate(inq._id);
    }
  };

  const handleExportCSV = async () => {
    try {
      const allFiltered = await inquiriesService.getInquiries({
        page: 1,
        limit: 1000,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceType: serviceFilter !== 'all' ? serviceFilter : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        sort: sortOrder,
      });

      const items = allFiltered.items;
      analyticsService.exportToCSV(
        `chinphotos_inquiries_${new Date().toISOString().split('T')[0]}`,
        [
          'Họ và tên',
          'Email',
          'Số điện thoại',
          'Gói dịch vụ',
          'Ngày chụp dự kiến',
          'Địa điểm',
          'Trạng thái',
          'Nội dung lời nhắn',
          'Ghi chú nội bộ',
          'Ngày gửi',
        ],
        items.map((item) => [
          item.name,
          item.email,
          item.phone || '',
          item.serviceType || 'Chung',
          item.eventDate ? new Date(item.eventDate).toLocaleDateString('vi-VN') : '',
          item.location || '',
          item.status,
          item.message,
          item.internalNote || '',
          item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '',
        ]),
      );

      addToast({
        type: 'success',
        message: `Đã xuất ${items.length} dòng ra file CSV (UTF-8 BOM)!`,
      });
    } catch {
      addToast({ type: 'error', message: 'Không thể xuất file CSV' });
    }
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (serviceFilter !== 'all' ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0);

  const inquiries = inquiriesData?.items || [];
  const total = inquiriesData?.pagination?.total || 0;

  const columns: ColumnDef<Inquiry>[] = [
    {
      key: 'name',
      header: 'Khách hàng',
      cell: (item) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                item.status === 'new'
                  ? 'font-bold text-stone-900 dark:text-white'
                  : 'font-medium text-stone-700 dark:text-stone-200'
              }`}
            >
              {item.name}
            </span>
            {item.status === 'new' && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            )}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <span>{item.email}</span>
            {item.phone && <span>· {item.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Gói & Địa điểm',
      cell: (item) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-stone-800 dark:text-stone-200 block">
            {item.serviceType || 'Tư vấn chung'}
          </span>
          {item.location && (
            <span className="text-stone-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {item.location}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Lời nhắn',
      mobileHidden: true,
      cell: (item) => (
        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 max-w-xs">
          {item.message}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Ngày gửi',
      cell: (item) => (
        <span className="text-xs text-stone-500">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (item) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            aria-label="Xem chi tiết"
            size="sm"
            onClick={() => handleOpenInquiry(item)}
          >
            <Eye className="w-4 h-4" />
          </IconButton>
          <IconButton
            aria-label="Xoá yêu cầu"
            size="sm"
            variant="danger"
            onClick={() => handleDeleteSingle(item)}
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Hộp thư Yêu cầu chụp ảnh (Inquiries)"
        description="Quản lý tin nhắn đặt lịch từ khách hàng, ghi chú nội bộ và xuất báo cáo CSV"
        actions={
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Xuất CSV ({total})
          </Button>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, email, SĐT, lời nhắn..."
        activeFilterCount={activeFilterCount}
        onReset={resetFilters}
        filters={
          <>
            <div className="w-36">
              <Select
                value={statusFilter}
                onValueChange={(val) => setFilter('status', val)}
                options={[
                  { label: 'Mọi trạng thái', value: 'all' },
                  { label: 'Mới (Chưa đọc)', value: 'new' },
                  { label: 'Đã đọc', value: 'read' },
                  { label: 'Đã trả lời', value: 'replied' },
                  { label: 'Lưu trữ', value: 'archived' },
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={serviceFilter}
                onValueChange={(val) => setFilter('serviceType', val)}
                options={[
                  { label: 'Mọi gói dịch vụ', value: 'all' },
                  { label: 'Family', value: 'Family' },
                  { label: 'Kids', value: 'Kids' },
                  { label: 'Mini session', value: 'Mini session' },
                  { label: 'Home Lifestyle', value: 'Home Lifestyle' },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFilter('from', e.target.value)}
                className="flex-1 sm:flex-none sm:w-36 min-w-0 text-xs py-1.5 dark:[color-scheme:dark]"
                title="Từ ngày"
                aria-label="Từ ngày"
              />
              <span className="text-stone-400 text-xs">-</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setFilter('to', e.target.value)}
                className="flex-1 sm:flex-none sm:w-36 min-w-0 text-xs py-1.5 dark:[color-scheme:dark]"
                title="Đến ngày"
                aria-label="Đến ngày"
              />
            </div>

            <div className="w-32">
              <Select
                value={sortOrder}
                onValueChange={(val) => setFilter('sort', val)}
                options={[
                  { label: 'Mới nhất', value: 'newest' },
                  { label: 'Cũ nhất', value: 'oldest' },
                ]}
              />
            </div>
          </>
        }
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60">
          <span className="text-xs font-semibold text-brand-800 dark:text-brand-200">
            Đang chọn {selectedIds.length} yêu cầu liên hệ
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => handleBulkAction('read')}
            >
              Đánh dấu Đã đọc
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => handleBulkAction('replied')}
            >
              Đánh dấu Đã trả lời
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Archive className="w-3.5 h-3.5" />}
              onClick={() => handleBulkAction('archived')}
            >
              Lưu trữ
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => handleBulkAction('delete')}
            >
              Xoá ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Main DataTable */}
      {isError ? (
        <ErrorState
          title="Không thể tải hộp thư"
          message="Vui lòng kiểm tra kết nối máy chủ."
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable
          data={inquiries}
          columns={columns}
          keyExtractor={(item) => item._id}
          selectable
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          isLoading={isLoading}
          onRowClick={handleOpenInquiry}
        />
      )}

      {total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {/* Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        size="lg"
        title={selectedInquiry ? `Chi tiết yêu cầu: ${selectedInquiry.name}` : 'Chi tiết yêu cầu'}
        description={
          selectedInquiry?.createdAt
            ? `Gửi lúc ${new Date(selectedInquiry.createdAt).toLocaleString('vi-VN')}`
            : undefined
        }
        footer={
          selectedInquiry && (
            <div className="flex items-center justify-between w-full gap-3">
              <a
                href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                  `[chinphotos] Phản hồi yêu cầu chụp ảnh của ${selectedInquiry.name}`,
                )}&body=${encodeURIComponent(
                  `Chào ${selectedInquiry.name},\n\nCảm ơn bạn và gia đình đã liên hệ với chinphotos Studio!\n\n`,
                )}`}
                onClick={() => {
                  setStatusDraft('replied');
                  updateMutation.mutate({
                    id: selectedInquiry._id,
                    status: 'replied',
                    internalNote: noteDraft,
                  });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-600" />
                Trả lời bằng Email
              </a>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInquiry(null)}
                >
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  isLoading={updateMutation.isPending}
                  onClick={handleSaveDrawerChanges}
                >
                  Lưu cập nhật
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Client Contact Info Card */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-700/60 pb-2.5">
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {selectedInquiry.name}
                </span>
                <StatusBadge status={selectedInquiry.status} size="sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="hover:underline text-brand-600 dark:text-brand-400"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>

                {selectedInquiry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    Ngày chụp:{' '}
                    <strong>
                      {selectedInquiry.eventDate
                        ? new Date(selectedInquiry.eventDate).toLocaleDateString('vi-VN')
                        : 'Chưa xác định'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    Khu vực: <strong>{selectedInquiry.location || 'TP.HCM'}</strong>
                  </span>
                </div>

                {(selectedInquiry.adultsCount || selectedInquiry.childrenInfo) && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Users className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>
                      Thành viên:{' '}
                      <strong>
                        {selectedInquiry.adultsCount
                          ? `${selectedInquiry.adultsCount} người lớn`
                          : ''}
                        {selectedInquiry.childrenInfo
                          ? ` · Bé: ${selectedInquiry.childrenInfo}`
                          : ''}
                      </strong>
                    </span>
                  </div>
                )}

                {selectedInquiry.source && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>
                      Biết đến qua: <strong>{selectedInquiry.source}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Nội dung lời nhắn từ khách hàng
              </h4>
              <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status & Internal Note Editor */}
            <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
              <FormField label="Trạng thái xử lý">
                <Select
                  value={statusDraft}
                  onValueChange={(val) => setStatusDraft(val as InquiryStatus)}
                  options={[
                    { label: 'Mới (New)', value: 'new' },
                    { label: 'Đã đọc (Read)', value: 'read' },
                    { label: 'Đã trả lời (Replied)', value: 'replied' },
                    { label: 'Lưu trữ (Archived)', value: 'archived' },
                  ]}
                />
              </FormField>

              <FormField
                label="Ghi chú nội bộ (Chỉ Admin nhìn thấy)"
                helperText="Ghi lại lịch hẹn, yêu cầu đặc biệt của bé hoặc báo giá đã gửi"
              >
                <Textarea
                  rows={4}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="VD: Đã gọi tư vấn chiều 14/11, gia đình muốn chụp lúc 16h tại Công viên Sala..."
                />
              </FormField>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default InquiriesPage;
