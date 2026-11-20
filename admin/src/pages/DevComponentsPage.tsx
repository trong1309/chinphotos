import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Switch,
  Checkbox,
  FormField,
  StatusBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  Drawer,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  Skeleton,
  EmptyState,
  ErrorState,
  PageHeader,
  FilterBar,
  Pagination,
  DataTable,
  ColumnDef,
} from '../components/common';
import { useDisclosure } from '../hooks/useDisclosure';
import { useConfirm } from '../hooks/useConfirm';
import { useToastStore } from '../stores/toast.store';
import {
  Plus,
  Trash2,
  Edit,
  Mail,
  Search,
  MoreVertical,
  Check,
  Sparkles,
  Download,
} from 'lucide-react';

interface SampleItem {
  id: string;
  name: string;
  category: string;
  status: string;
  views: number;
}

const sampleData: SampleItem[] = [
  { id: '1', name: 'Gia đình chị Lan - Thảo Điền', category: 'Gia đình', status: 'published', views: 1240 },
  { id: '2', name: 'Bé Bơ 1 tuổi - Studio Phú Nhuận', category: 'Trẻ em', status: 'draft', views: 420 },
  { id: '3', name: 'Kỷ niệm 10 năm - Bình Thạnh', category: 'Kỷ niệm', status: 'featured', views: 3100 },
  { id: '4', name: 'Gia đình anh Tuấn - Quận 7', category: 'Gia đình', status: 'archived', views: 890 },
  { id: '5', name: 'Bé Miu ngoại cảnh - Landmark 81', category: 'Trẻ em', status: 'published', views: 2450 },
];

export const DevComponentsPage: React.FC = () => {
  const modalDisc = useDisclosure();
  const drawerDisc = useDisclosure();
  const confirm = useConfirm();
  const { addToast } = useToastStore();

  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('option-1');
  const [switchVal, setSwitchVal] = useState(true);
  const [checkboxVal, setCheckboxVal] = useState<boolean | 'indeterminate'>(true);
  const [searchVal, setSearchVal] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>(['1']);

  const handleTestConfirm = async () => {
    const confirmed = await confirm({
      title: 'Xoá vĩnh viễn mục này?',
      message: 'Hành động này sẽ xoá dữ liệu vĩnh viễn khỏi hệ thống và không thể khôi phục.',
      confirmText: 'Xoá vĩnh viễn',
      cancelText: 'Huỷ bỏ',
      variant: 'danger',
    });

    if (confirmed) {
      addToast({ type: 'success', message: 'Đã xác nhận xoá thành công!' });
    } else {
      addToast({ type: 'info', message: 'Bạn đã huỷ thao tác.' });
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const columns: ColumnDef<SampleItem>[] = [
    {
      key: 'name',
      header: 'Tiêu đề / Tên',
      sortable: true,
      cell: (item) => (
        <span className="font-medium text-stone-900 dark:text-stone-100">
          {item.name}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'views',
      header: 'Lượt xem',
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (item) => item.views.toLocaleString('vi-VN'),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            aria-label="Chỉnh sửa"
            size="sm"
            onClick={() => addToast({ type: 'info', message: `Sửa: ${item.name}` })}
          >
            <Edit className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            aria-label="Xoá"
            size="sm"
            variant="danger"
            onClick={() => addToast({ type: 'error', message: `Xoá: ${item.name}` })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Design System & Component Showcase"
        description="Thư viện toàn bộ UI components dùng chung trong hệ thống quản trị chinphotos."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => addToast({ type: 'info', message: 'Tải tài liệu' })}
            >
              Export UI Kit
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => addToast({ type: 'success', message: 'Tạo mới component' })}
            >
              Thêm mới
            </Button>
          </div>
        }
      />

      {/* 1. Buttons */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          1. Buttons & IconButtons
        </h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" isLoading>
                Đang lưu...
              </Button>
              <Button variant="outline" disabled>
                Vô hiệu
              </Button>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Có Icon
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs text-stone-500 mr-2">Sizes:</span>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <span className="text-xs text-stone-500 ml-4 mr-2">Icon Buttons:</span>
              <IconButton aria-label="Tìm kiếm" size="sm" variant="outline">
                <Search className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton aria-label="Chỉnh sửa" size="md" variant="secondary">
                <Edit className="h-4 w-4" />
              </IconButton>
              <IconButton aria-label="Xoá" size="lg" variant="danger">
                <Trash2 className="h-5 w-5" />
              </IconButton>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Form Inputs */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          2. Form Inputs & Selects
        </h2>
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField label="Họ và tên" required helperText="Nhập đầy đủ họ và tên">
              <Input
                placeholder="Nguyễn Văn A"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                placeholder="chin@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </FormField>

            <FormField label="Trường có lỗi" error="Vui lòng nhập định dạng hợp lệ">
              <Input placeholder="Dữ liệu sai" error />
            </FormField>

            <FormField label="Danh mục dịch vụ" required>
              <Select
                value={selectVal}
                onValueChange={setSelectVal}
                options={[
                  { label: 'Gia đình & Em bé', value: 'option-1' },
                  { label: 'Chân dung cá nhân', value: 'option-2' },
                  { label: 'Kỷ niệm gia đình', value: 'option-3' },
                  { label: 'Ngoại cảnh Sài Gòn', value: 'option-4', disabled: true },
                ]}
              />
            </FormField>

            <FormField label="Ghi chú nội bộ" helperText="Tối đa 500 ký tự">
              <Textarea placeholder="Nhập ghi chú dành riêng cho admin..." rows={2} />
            </FormField>

            <div className="space-y-4 pt-2">
              <Switch
                checked={switchVal}
                onCheckedChange={setSwitchVal}
                label="Hiển thị trên website"
                description="Khách xem có thể thấy mục này ngoài trang chủ"
              />
              <Checkbox
                checked={checkboxVal}
                onCheckedChange={setCheckboxVal}
                label="Đánh dấu là nổi bật (Featured)"
                description="Hiển thị đầu danh sách và gắn huy hiệu vàng"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Status Badges */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          3. Status Badges
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="published" />
              <StatusBadge status="draft" />
              <StatusBadge status="featured" />
              <StatusBadge status="archived" />
              <StatusBadge status="new" />
              <StatusBadge status="contacted" />
              <StatusBadge status="booked" />
              <StatusBadge status="completed" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Feedback & Dialogs */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          4. Modals, ConfirmDialogs & Drawers
        </h2>
        <Card>
          <CardContent className="p-6 flex flex-wrap items-center gap-4">
            <Button variant="outline" onClick={modalDisc.onOpen}>
              Mở Modal mẫu
            </Button>
            <Button variant="outline" onClick={drawerDisc.onOpen}>
              Mở Drawer mẫu
            </Button>
            <Button variant="danger" onClick={handleTestConfirm}>
              Mở ConfirmDialog (useConfirm)
            </Button>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" rightIcon={<MoreVertical className="h-4 w-4" />}>
                  Tùy chọn menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => addToast({ type: 'info', message: 'Xem trước' })}>
                  <Sparkles className="h-4 w-4 mr-2" /> Xem trước
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addToast({ type: 'info', message: 'Nhân bản' })}>
                  <Check className="h-4 w-4 mr-2" /> Nhân bản mục
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onClick={() => addToast({ type: 'error', message: 'Xoá mục' })}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Xoá mục
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tooltip */}
            <Tooltip content="Đây là tooltip hướng dẫn người dùng" side="top">
              <Button variant="ghost">Rê chuột xem Tooltip</Button>
            </Tooltip>
          </CardContent>
        </Card>

        {/* Modal instance */}
        <Modal
          isOpen={modalDisc.isOpen}
          onClose={modalDisc.onClose}
          title="Tiêu đề Modal mẫu"
          description="Modal này hỗ trợ phím Esc để đóng, tự động trap focus và hoàn trả focus khi đóng."
          footer={
            <>
              <Button variant="outline" onClick={modalDisc.onClose}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  modalDisc.onClose();
                  addToast({ type: 'success', message: 'Đã lưu thay đổi từ Modal!' });
                }}
              >
                Lưu thay đổi
              </Button>
            </>
          }
        >
          <p className="text-sm text-stone-600 dark:text-stone-300">
            Nội dung chi tiết bên trong modal. Hỗ trợ responsive, backdrop blur và animation
            mượt mà.
          </p>
        </Modal>

        {/* Drawer instance */}
        <Drawer
          isOpen={drawerDisc.isOpen}
          onClose={drawerDisc.onClose}
          title="Ngăn kéo thông tin"
          description="Slide-out drawer trượt từ bên phải sang."
          footer={
            <Button variant="primary" onClick={drawerDisc.onClose}>
              Hoàn tất
            </Button>
          }
        >
          <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300">
            <p>Trang này rất hữu ích cho các form chi tiết, bộ lọc nâng cao hoặc xem lịch sử.</p>
            <Input placeholder="Bộ lọc nâng cao..." />
          </div>
        </Drawer>
      </section>

      {/* 5. Tabs */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          5. Tabs Component
        </h2>
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Tiếng Việt (VI)</TabsTrigger>
                <TabsTrigger value="tab2">Tiếng Anh (EN)</TabsTrigger>
                <TabsTrigger value="tab3">Cấu hình SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4 border rounded-xl mt-3 dark:border-stone-800">
                <p className="text-sm">Nội dung tab Tiếng Việt</p>
              </TabsContent>
              <TabsContent value="tab2" className="p-4 border rounded-xl mt-3 dark:border-stone-800">
                <p className="text-sm">English content tab</p>
              </TabsContent>
              <TabsContent value="tab3" className="p-4 border rounded-xl mt-3 dark:border-stone-800">
                <p className="text-sm">Meta Title, Meta Description và OG Image</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* 6. DataTable, Search, Filter & Pagination */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          6. FilterBar, DataTable & Pagination
        </h2>
        <div className="space-y-4">
          <FilterBar
            searchValue={searchVal}
            onSearchChange={setSearchVal}
            searchPlaceholder="Tìm theo tên album hoặc danh mục..."
            activeFilterCount={searchVal ? 1 : 0}
            onReset={() => setSearchVal('')}
            filters={
              <div className="w-44">
                <Select
                  value="all"
                  options={[
                    { label: 'Tất cả trạng thái', value: 'all' },
                    { label: 'Đã xuất bản', value: 'published' },
                    { label: 'Bản nháp', value: 'draft' },
                  ]}
                />
              </div>
            }
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToast({ type: 'info', message: 'Xuất CSV' })}
              >
                Xuất file Excel
              </Button>
            }
          />

          <DataTable
            data={sampleData}
            columns={columns}
            keyExtractor={(item) => item.id}
            selectable
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(item) => addToast({ type: 'info', message: `Bấm vào dòng: ${item.name}` })}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            total={25}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </section>

      {/* 7. Skeleton, EmptyState & ErrorState */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          7. Skeleton, Empty & Error States
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loaders</CardTitle>
              <CardDescription>Hiệu ứng loading mượt mà</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton variant="circular" className="h-10 w-10" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <EmptyState
            title="Chưa có dữ liệu"
            description="Bạn chưa tạo danh mục nào trong hệ thống."
            action={
              <Button size="sm" variant="outline">
                Tạo mục đầu tiên
              </Button>
            }
          />

          <ErrorState
            title="Lỗi kết nối máy chủ"
            message="Không thể kết nối đến API backend. Vui lòng kiểm tra dịch vụ Docker."
            onRetry={() => addToast({ type: 'info', message: 'Đang kết nối lại...' })}
          />
        </div>
      </section>
    </div>
  );
};

export default DevComponentsPage;
