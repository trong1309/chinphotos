# Hướng dẫn Quản trị Nội dung (`chinphotos` Content Guide)

Tài liệu này dành cho nhiếp ảnh gia / quản trị viên studio **chinphotos** để cập nhật bộ ảnh, gói chụp và quản lý khách hàng hằng ngày.

---

## 1. Đăng nhập trang Quản trị (Admin CMS)

- Truy cập: `/admin` (hoặc `http://localhost:5174` ở môi trường phát triển).
- Nhấn tổ hợp phím **`Ctrl + K`** (hoặc `Cmd + K` trên Mac) bất kỳ lúc nào để mở thanh tìm kiếm và chuyển trang nhanh.

---

## 2. Đăng một Bộ ảnh mới (Gallery)

1. Vào mục **Bộ sưu tập (Galleries)** → nhấn **Tạo bộ ảnh mới**.
2. **Tab Tiếng Việt (VI)**:
   - Nhập **Tiêu đề bộ ảnh** (ví dụ: *Buổi chiều đầy nắng tại Thảo Điền*). Đường dẫn `slug` sẽ tự động được tạo.
   - Chọn **Danh mục** (ví dụ: *Gia đình*, *Em bé & Tuổi thơ*, *Bầu & Sơ sinh*).
   - Nhập **Địa điểm**, **Ngày chụp**, và **Câu chuyện (Story)** của buổi chụp.
3. **Tab Tiếng Anh (EN)**:
   - Nhập bản dịch tiếng Anh (`Title EN`, `Location EN`, `Story EN`) để khách nước ngoài xem trang ở chế độ `EN` thấy nội dung chuẩn xác. Nếu chưa nhập, hệ thống sẽ gắn nhãn `Thiếu EN` để nhắc bạn bổ sung sau.
4. **Nhấn Tạo bộ ảnh**, sau đó chuyển sang **Tab Hình ảnh (Images)**:
   - Kéo thả nhiều file ảnh (`JPG`, `PNG`, `WEBP`, tối đa `15MB`/ảnh) vào khung tải lên.
   - Hệ thống tự động nén và tạo 3 kích thước WebP (`thumb`, `medium`, `large`) giúp trang web tải mượt trên điện thoại.
   - **Kéo thả** các ảnh trong lưới để sắp xếp mạch kể chuyện.
   - Nhấn biểu tượng **Ngôi sao / Ảnh bìa** trên tấm ảnh đẹp nhất để đặt làm ảnh đại diện cho bộ sưu tập.
5. Chuyển trạng thái sang **Đã xuất bản (Published)** và nhấn **Lưu thay đổi**.

---

## 3. Cập nhật Bảng giá & Câu hỏi thường gặp (Services)

1. Vào mục **Gói dịch vụ (Services)**.
2. Chọn gói chụp cần chỉnh sửa (ví dụ: *Gói Gia đình Tự nhiên*):
   - Chỉnh sửa **Giá khởi điểm (VNĐ)** (ví dụ: `4500000` sẽ hiển thị là `Từ 4.500.000 ₫`).
   - Soạn thảo mô tả chi tiết bằng **Markdown 2 cột** (gõ bên trái, xem trước trực tiếp bên phải). Hệ thống tự động lưu nháp vào trình duyệt để tránh mất bài khi lỡ đóng tab.
   - Thêm/xóa các quyền lợi trong **Danh sách bao gồm (Inclusions)** và **Câu hỏi thường gặp (FAQs)**.

---

## 4. Xử lý Lời nhắn Đặt lịch của Khách hàng (Inquiries)

1. Khi khách gửi form liên hệ trên website, biểu tượng **Chuông thông báo** ở góc phải trên cùng của Admin sẽ hiện số lượng tin nhắn mới.
2. Vào mục **Lời nhắn (Inquiries)** → bấm vào dòng tin nhắn để mở ngăn chi tiết (**Drawer**):
   - Trạng thái sẽ tự động chuyển từ **Mới (`new`)** sang **Đã đọc (`read`)**.
   - Ghi chú lịch hẹn hoặc yêu cầu riêng của gia đình vào ô **Ghi chú nội bộ** và nhấn **Lưu ghi chú**.
   - Nhấn nút **Trả lời qua Email** để mở ứng dụng mail với tiêu đề và địa chỉ khách được điền sẵn.
   - Nhấn **Xuất CSV** nếu cần tải danh sách khách hàng về mở trên Microsoft Excel.
