import { useEffect, RefObject } from 'react';
import { AdminLang } from '../stores/ui.store';

const VI_TO_EN_EXACT: Record<string, string> = {
  // Dashboard & Analytics
  'Tổng quan Studio': 'Studio Overview',
  'Làm mới': 'Refresh',
  '7 ngày': '7 days',
  '30 ngày': '30 days',
  '3 tháng': '3 months',
  '12 tháng': '12 months',
  'Lượt xem & Yêu cầu theo thời gian': 'Views & Inquiries Over Time',
  'Tương quan giữa số lượt ghé thăm website và số khách gửi yêu cầu chụp ảnh':
    'Correlation between website pageviews and client booking inquiries',
  'Biểu đồ so sánh lưu lượng truy cập và số lượng khách hàng liên hệ mỗi ngày':
    'Daily comparison of website traffic and client booking inquiries',
  'Bảng số liệu': 'Data Table',
  'Biểu đồ': 'Chart',
  'Lượt xem (Views)': 'Pageviews',
  'Lượt xem': 'Pageviews',
  'Yêu cầu': 'Inquiries',
  'Yêu cầu gần đây': 'Recent Inquiries',
  'Yêu cầu chụp mới nhất': 'Recent Client Inquiries',
  'Các liên hệ đặt lịch gần đây từ khách hàng': 'Latest booking inquiries submitted by clients',
  'Xem tất cả': 'View all',
  'Chưa có yêu cầu nào': 'No inquiries yet',
  'Chưa có yêu cầu đặt lịch nào': 'No booking inquiries yet',
  'Các tin nhắn liên hệ từ trang khách hàng sẽ hiển thị tại đây.':
    'Client messages submitted via the contact form will appear here.',
  'Top bộ sưu tập': 'Top Galleries',
  'Bộ sưu tập nổi bật': 'Top Galleries',
  'Các bộ ảnh được xem nhiều nhất trong kỳ': 'Most viewed photo galleries during this period',
  'Chưa có số liệu': 'No data yet',
  'Chưa có dữ liệu lượt xem bộ ảnh': 'No gallery view data yet',
  'Thống kê & Phân tích chi tiết': 'Detailed Traffic & Conversion Analytics',
  'Đo lường hiệu quả chuyển đổi, mức độ quan tâm của khách hàng và các nguồn truy cập':
    'Measure conversion performance, client interest, and traffic sources',
  'Xuất báo cáo': 'Export Report',
  'Tổng lượt xem': 'Total Pageviews',
  'Khách xem duy nhất': 'Unique Visitors',
  'Yêu cầu chụp ảnh': 'Booking Inquiries',
  'Lưu lượng truy cập & Tỷ lệ gửi yêu cầu': 'Traffic & Inquiry Conversion Trend',
  'Biểu đồ so sánh lượng khách truy cập và tỷ lệ gửi form liên hệ qua các mốc thời gian':
    'Comparison of visitor traffic and contact form submissions over time',
  'Bản tin & Khách hàng tiềm năng': 'Newsletter & Leads',
  'Số lượng gia đình đã đăng ký nhận tư vấn và ưu đãi mùa chụp ảnh':
    'Families subscribed to seasonal offers and styling guides',
  'Người đăng ký nhận tin': 'Newsletter Subscribers',
  'Danh sách email thực tế': 'Verified subscriber emails',
  'Yêu cầu trên lượt xem': 'Inquiries per pageview',
  'Dữ liệu được cập nhật tự động sau mỗi phiên xem trang hoặc đăng ký từ khách ghé thăm.':
    'Metrics update automatically with every visitor session and signup.',
  'Báo cáo & Phân tích (Analytics)': 'Traffic & Conversion Analytics',
  'Báo cáo & Phân tích': 'Traffic & Conversion Analytics',
  'Thống kê chi tiết lưu lượng truy cập, tỷ lệ chuyển đổi và hiệu quả nội dung':
    'Detailed metrics on visitor traffic, conversion rate, and content performance',
  'Xuất CSV': 'Export CSV',
  'Hiện bảng dữ liệu': 'Show data table',
  'Ẩn bảng dữ liệu': 'Hide data table',
  'Khách truy cập duy nhất': 'Unique Visitors',
  'Tỷ lệ chuyển đổi': 'Conversion Rate',
  'Phân bổ yêu cầu theo gói dịch vụ': 'Inquiries by Service Package',
  'Nguồn truy cập (Top Referrers)': 'Top Traffic Sources',

  // Categories
  'Quản lý Danh mục': 'Manage Categories',
  'Quản lý Danh mục (Categories)': 'Manage Categories',
  'Tổ chức các thể loại ảnh trên Portfolio (kéo thả để sắp xếp thứ tự hiển thị).':
    'Organize portfolio categories (drag and drop to reorder display).',
  'Phân loại các bộ sưu tập ảnh trên trang Portfolio công khai (Kéo thả để sắp xếp thứ tự).':
    'Organize portfolio galleries into categories (Drag and drop to reorder).',
  'Thêm danh mục': 'Add Category',
  'Tạo danh mục mới': 'Create Category',
  'Chỉnh sửa danh mục': 'Edit Category',
  'Tên danh mục': 'Category Name',
  'Đường dẫn (Slug)': 'URL Slug',
  'Mô tả ngắn': 'Short Description',
  'Ảnh bìa (Cover Image URL)': 'Cover Image URL',
  'Hiển thị công khai': 'Publicly Visible',
  'Đang hiển thị': 'Visible',
  'Đang ẩn': 'Hidden',
  'Bộ ảnh': 'Galleries',
  'Thứ tự': 'Order',
  'Thao tác': 'Actions',
  'Chưa có danh mục nào': 'No categories yet',

  // Galleries & Gallery Editor
  'Quản lý Bộ ảnh (Galleries)': 'Manage Galleries',
  'Quản lý Bộ sưu tập': 'Manage Galleries',
  'Quản lý Bộ sưu tập (Galleries)': 'Manage Galleries',
  'Quản lý các bộ ảnh, sắp xếp hình ảnh và xuất bản song ngữ (VI / EN).':
    'Manage photo galleries, sort images, and publish bilingual content (VI / EN).',
  'Danh sách toàn bộ các bộ ảnh gia đình, trẻ em và ngoại cảnh.':
    'All family, childhood, and outdoor photography galleries.',
  'Tạo bộ ảnh mới': 'Create Gallery',
  'Tạo bộ ảnh ngay': 'Create Your First Gallery',
  'Chưa có bộ ảnh nào': 'No galleries yet',
  'Tất cả danh mục': 'All Categories',
  'Tất cả trạng thái': 'All Statuses',
  'Tất cả nổi bật': 'All Featured',
  'Đã xuất bản': 'Published',
  'Bản nháp': 'Draft',
  'Nổi bật': 'Featured',
  'Ẩn (Unlisted)': 'Unlisted',
  'Thiếu EN': 'Missing EN',
  'Chưa có bộ sưu tập nào': 'No galleries yet',
  'Nội dung Tiếng Việt (VI)': 'Vietnamese Content (VI)',
  'Bản dịch Tiếng Anh (EN)': 'English Translation (EN)',
  'Đối tác (Vendors)': 'Credits & Vendors',
  'Tối ưu SEO': 'SEO Settings',

  // Services
  'Quản lý Gói dịch vụ (Services & FAQ)': 'Manage Services & FAQs',
  'Quản lý Gói dịch vụ': 'Manage Services',
  'Quản lý Gói dịch vụ (Services)': 'Manage Services',
  'Thiết lập bảng giá VNĐ, quyền lợi bao gồm và câu hỏi thường gặp (FAQ) cho từng gói chụp.':
    'Configure VND pricing, package inclusions, and FAQs for each photography service.',
  'Thêm gói dịch vụ': 'Add Service Package',
  'Giá khởi điểm': 'Starting Price',
  'Liên hệ': 'Contact for price',

  // Locations
  'Quản lý Địa phương (Local SEO TP.HCM)': 'Manage Locations (HCMC Local SEO)',
  'Quản lý Khu vực (Local SEO)': 'Manage Locations (Local SEO)',
  'Quản lý các trang đích địa điểm chụp ảnh tại TP. Hồ Chí Minh hỗ trợ SEO địa phương song ngữ.':
    'Manage bilingual Ho Chi Minh City neighborhood landing pages for local SEO.',
  'Thêm khu vực': 'Add Location',

  // Inquiries
  'Quản lý Yêu cầu đặt lịch (Inquiries)': 'Client Booking Inquiries',
  'Quản lý Lời nhắn & Đặt lịch': 'Client Inquiries & Bookings',
  'Quản lý Lời nhắn (Inquiries)': 'Client Inquiries & Bookings',
  'Theo dõi, phản hồi và ghi chú các yêu cầu tư vấn chụp ảnh từ khách hàng.':
    'Track, reply to, and manage client booking inquiries.',
  'Mọi trạng thái': 'All Statuses',
  'Mới (Chưa đọc)': 'New (Unread)',
  'Mọi gói dịch vụ': 'All Packages',
  'Mới nhất': 'Newest First',
  'Cũ nhất': 'Oldest First',
  'Tìm theo tên, email, SĐT, lời nhắn...': 'Search by name, email, phone, message...',
  'Không tìm thấy mục nào phù hợp với bộ lọc hiện tại': 'No inquiries found',
  'Mới': 'New',
  'Đã đọc': 'Read',
  'Đã trả lời': 'Replied',
  'Lưu trữ': 'Archived',
  'Đánh dấu đã đọc': 'Mark as Read',
  'Đánh dấu đã trả lời': 'Mark as Replied',
  'Đưa vào lưu trữ': 'Archive',
  'Xóa đã chọn': 'Delete Selected',
  'Trả lời qua Email': 'Reply via Email',
  'Lưu ghi chú': 'Save Note',
  'Ghi chú nội bộ': 'Internal Note',

  // Settings
  'Cài đặt hệ thống (Settings)': 'System Settings',
  'Cài đặt hệ thống': 'System Settings',
  'Quản lý thông tin thương hiệu chinphotos, mạng xã hội, SEO mặc định, tài khoản và giao diện Admin.':
    'Manage chinphotos studio branding, social links, default SEO, admin profile, and appearance.',
  'Chung (General)': 'General',
  'Mạng xã hội & SEO': 'Social & SEO',
  'Hồ sơ (Profile)': 'Profile',
  'Bảo mật (Security)': 'Security',
  'Thông báo': 'Notifications',
  'Giao diện (Appearance)': 'Appearance',
  'Thông tin Studio & Thương hiệu': 'Studio & Brand Information',
  'Tên thương hiệu, khẩu hiệu, giới thiệu ngắn và email liên hệ chính.':
    'Brand name, tagline, short bio, and primary contact email.',
  'Tên Website / Studio': 'Website / Studio Name',
  'Email nhận liên hệ': 'Contact Email',
  'Khẩu hiệu (Tagline)': 'Tagline',
  'URL Logo': 'Logo URL',
  'Để trống nếu dùng chữ thương hiệu mặc định': 'Leave blank to use default typographic wordmark',
  'Giới thiệu ngắn (Bio)': 'Short Biography',
  'Ảnh Hero Trang chủ (Hero Images)': 'Homepage Hero Images',
  'Danh sách các ảnh hiển thị ở đầu trang chủ. Có thể sắp xếp thứ tự ưu tiên.':
    'Photographs displayed in the homepage hero section. Reorder to set priority.',
  'Thêm ảnh': 'Add Image',
  'Thêm': 'Add',
  'Khu vực phục vụ (Service Areas)': 'Service Areas',
  'Các khu vực chụp ảnh chính tại TP.HCM và lân cận.':
    'Primary photography service neighborhoods in Ho Chi Minh City.',
  'Menu điều hướng (Navigation Menu)': 'Navigation Menu',
  'Thứ tự và trạng thái hiển thị các mục trên thanh điều hướng Client.':
    'Order and visibility of links in the public website header.',
  'Lưu cài đặt chung': 'Save General Settings',
  'Liên kết mạng xã hội (Social Links)': 'Social Media Links',
  'Đường dẫn tới các trang mạng xã hội chính thức của studio.':
    'Official social media profile URLs for the studio.',
  'SEO Mặc định (Default SEO & OpenGraph)': 'Default SEO & OpenGraph',
  'Thẻ tiêu đề, mô tả và ảnh đại diện khi chia sẻ liên kết trang chủ lên mạng xã hội.':
    'Default meta title, description, and OpenGraph image when sharing on social networks.',
  'Tiêu đề SEO mặc định (Meta Title)': 'Default Meta Title',
  'Mô tả SEO mặc định (Meta Description)': 'Default Meta Description',
  'Ảnh chia sẻ OpenGraph (OG Image URL)': 'OpenGraph Image URL',
  'Xem trước thẻ chia sẻ (OG Preview)': 'Social Share Card Preview',
  'Lưu Mạng xã hội & SEO': 'Save Social & SEO',
  'Hồ sơ Quản trị viên (Admin Profile)': 'Administrator Profile',
  'Cập nhật tên hiển thị và ảnh đại diện của tài khoản quản trị.':
    'Update display name and avatar for your administrator account.',
  'Tên hiển thị': 'Display Name',
  'Địa chỉ Email (Chỉ đọc)': 'Email Address (Read-only)',
  'Email đăng nhập không thể thay đổi trực tiếp': 'Login email cannot be changed directly',
  'URL Ảnh đại diện (Avatar URL)': 'Avatar Image URL',
  'Lưu hồ sơ': 'Save Profile',
  'Đổi mật khẩu (Change Password)': 'Change Password',
  'Sử dụng mật khẩu mạnh tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.':
    'Use a strong password of at least 8 characters including uppercase, lowercase, numbers, and symbols.',
  'Mật khẩu hiện tại': 'Current Password',
  'Mật khẩu mới': 'New Password',
  'Xác nhận mật khẩu mới': 'Confirm New Password',
  'Cập nhật mật khẩu': 'Update Password',
  'Cài đặt Thông báo (Notifications)': 'Notification Preferences',
  'Quản lý cách hệ thống gửi thông báo khi có khách hàng gửi lời nhắn mới.':
    'Configure how the system notifies you when a new client inquiry arrives.',
  'Nhận email khi có lời nhắn đặt lịch mới (Inquiry)':
    'Receive email notification on new booking inquiry',
  'Lưu cài đặt thông báo': 'Save Notification Settings',
  'Chế độ Giao diện (Theme Mode)': 'Theme Mode',
  'Thay đổi chế độ sáng/tối cho bảng điều khiển Admin. Áp dụng ngay lập tức.':
    'Switch between light, dark, or system theme for the Admin CMS. Applies immediately.',
  'Sáng (Light)': 'Light',
  'Giao diện nền sáng rõ ràng': 'Clean bright interface',
  'Tối (Dark)': 'Dark',
  'Dịu mắt khi làm việc ban đêm': 'Easy on the eyes at night',
  'Hệ thống (System)': 'System',
  'Đồng bộ theo cài đặt máy tính': 'Syncs with your OS preference',
  'Mật độ bảng dữ liệu & Màu nhấn (Density & Accent)': 'Table Density & Accent Color',
  'Tùy chỉnh khoảng cách hiển thị bảng dữ liệu và màu chủ đạo trong trình quản trị.':
    'Customize data table row spacing and primary accent color.',
  'Mật độ bảng dữ liệu (Table Density)': 'Table Density',
  'Thoải mái (Comfortable)': 'Comfortable',
  'Thu gọn (Compact)': 'Compact',
  'Màu nhấn (Accent Color)': 'Accent Color',
  'Indigo (Mặc định)': 'Indigo (Default)',

  // Common Buttons & Table UI
  'Lưu thay đổi': 'Save Changes',
  'Hủy': 'Cancel',
  'Xóa': 'Delete',
  'Chỉnh sửa': 'Edit',
  'Đóng': 'Close',
  'Đặt lại bộ lọc': 'Reset Filters',
  'Chuyển tab': 'Switch Tab',
  'Ở lại': 'Stay',
};

const stripParentheticalEnglishForVi = (text: string): string => {
  return text.replace(
    /\s*\((Settings|General|Profile|Security|Appearance|Notifications|Inquiries|Galleries|Categories|Services|Services & FAQ|Analytics|Locations|Local SEO TP\.HCM|Views|Density & Accent|Inquiry|Weak|Medium|Strong|Light|Dark|System|Comfortable|Compact|Admin Profile|Change Password|Theme Mode|Table Density|Accent Color|Hero Images|Service Areas|Navigation Menu|Social Links|OG Preview)\)/g,
    '',
  );
};

const translateTextNode = (original: string, lang: AdminLang): string => {
  const trimmed = original.trim();
  if (!trimmed) return original;

  if (lang === 'vi') {
    const cleaned = stripParentheticalEnglishForVi(trimmed);
    return original.replace(trimmed, cleaned);
  }

  // English mode
  if (VI_TO_EN_EXACT[trimmed]) {
    return original.replace(trimmed, VI_TO_EN_EXACT[trimmed]!);
  }

  const cleanedVi = stripParentheticalEnglishForVi(trimmed);
  if (VI_TO_EN_EXACT[cleanedVi]) {
    return original.replace(trimmed, VI_TO_EN_EXACT[cleanedVi]!);
  }

  return original;
};

const originalTextMap = new WeakMap<Node, string>();

export const useAdminDomTranslator = (
  containerRef: RefObject<HTMLElement>,
  lang: AdminLang,
): void => {
  useEffect(() => {
    document.title =
      lang === 'vi' ? 'chinphotos · Quản trị Studio' : 'chinphotos · Studio Admin';
    const root = containerRef.current;
    if (!root) return;

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parentTag = node.parentElement?.tagName;
        if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'TEXTAREA') {
          return;
        }
        const currentVal = node.nodeValue || '';
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, currentVal);
        }
        const orig = originalTextMap.get(node) || currentVal;
        const nextVal = translateTextNode(orig, lang);
        if (node.nodeValue !== nextVal) {
          node.nodeValue = nextVal;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.hasAttribute('placeholder')) {
          const origPlaceholder =
            el.getAttribute('data-orig-placeholder') || el.getAttribute('placeholder') || '';
          if (!el.hasAttribute('data-orig-placeholder')) {
            el.setAttribute('data-orig-placeholder', origPlaceholder);
          }
          const nextPlaceholder = translateTextNode(origPlaceholder, lang);
          if (el.getAttribute('placeholder') !== nextPlaceholder) {
            el.setAttribute('placeholder', nextPlaceholder);
          }
        }
        node.childNodes.forEach(processNode);
      }
    };

    processNode(root);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(processNode);
        }
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [containerRef, lang]);
};
