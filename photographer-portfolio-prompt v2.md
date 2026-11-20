# PROMPT: Website Photographer Portfolio (Full-stack + Admin CMS + Docker + GitHub)

> **Cách dùng:** dán **Phần A (Quy tắc chung)** vào đầu mỗi lần chat với AI coding agent, rồi dán lần lượt **từng Task ở Phần D**. Chạy xong phần **Kiểm tra** của task nào mới sang task tiếp theo. Không gộp nhiều task trong một lần.
>
> Phần B (tổng quan) và Phần C (cấu trúc, API, schema) là tài liệu tham chiếu, agent đọc một lần ở Task 0.

---

## A. QUY TẮC CHUNG (dán đầu mỗi lần chat)

```
Bạn là senior full-stack engineer, đang xây website photographer portfolio gồm:
client/ (site công khai), admin/ (CMS), server/ (API) và MongoDB, tất cả chạy bằng Docker.
Đọc file PROMPT này để biết cấu trúc, API, schema. Chỉ làm ĐÚNG phạm vi task hiện tại, không làm trước task sau.

Stack cố định
- Cả client và admin: React 18 + Vite + TypeScript (strict: true, noUncheckedIndexedAccess: true),
  Tailwind CSS v3, React Router v6, TanStack Query v5, Axios, React Hook Form + Zod, Lucide React
- client thêm: Framer Motion, react-masonry-css, yet-another-react-lightbox, react-helmet-async
- admin thêm: Zustand (CHỈ cho UI state: sidebar, theme, toast), Recharts, Radix UI primitives
  (Dialog, DropdownMenu, Tabs, Select, Switch) + Tailwind, @dnd-kit, react-markdown, date-fns
- server: Node 20 + Express + TypeScript, MongoDB 7 + Mongoose, JWT cookie httpOnly, zod, sharp, Multer, Nodemailer
- KHÔNG dùng Bootstrap, KHÔNG Material UI

Quy tắc code
- Không dùng `any`; props luôn có type; không duplicate code (tách component/hook dùng chung)
- Không hard-code URL/secret; mọi cấu hình qua biến môi trường
- Mock data (nếu có) chỉ nằm trong thư mục data/, component không import trực tiếp
- Luồng dữ liệu phía giao diện: component → hook (TanStack Query) → service → axios
- Mọi nút/menu/tab phải hoạt động thật, không đặt UI chỉ để trang trí
- Mọi danh sách có đủ 3 trạng thái: loading (skeleton), empty, error (có nút thử lại)
- Nội dung hiển thị cho khách là song ngữ vi/en (xem B.5): không hard-code chữ trong component, dùng i18n key hoặc LocalizedString
- Responsive mobile-first, light/dark mode, border radius 10–14px, animation nhẹ (150–250ms),
  tôn trọng prefers-reduced-motion
- Accessibility: focus ring, aria-label cho icon button, Esc đóng modal, thao tác được bằng bàn phím

Cuối MỖI task phải chạy và báo kết quả (trong package vừa sửa):
  npx tsc --noEmit && npx eslint . && npm run build   (và npm test nếu task có test)
Không báo "xong" nếu còn lỗi/warning. Cuối task liệt kê: file đã tạo/sửa và việc tôi cần tự làm.
```

---

## B. TỔNG QUAN

### B.1 Mục tiêu
Một website portfolio nhiếp ảnh gia hoàn chỉnh: **site công khai**, **trang Admin quản lý nội dung**, **backend API + database**, chạy bằng **Docker**, deploy lên **VPS qua GitHub Actions**.

### B.2 Hai site tham khảo (chỉ học cấu trúc và chức năng, KHÔNG sao chép chữ, ảnh, logo, thương hiệu)

| Site | Kiểu | Điểm cần học |
|---|---|---|
| nessakphotography.com | Wedding/Family photographer, editorial (chỉ học cấu trúc + phần Family, bỏ hết nội dung wedding/elopement) | Menu đơn giản (About / Portfolio / Details / Contact), hero slideshow toàn màn hình, intro cá nhân kèm ảnh tròn, lưới ảnh theo danh mục, khối dịch vụ ảnh lớn + tiêu đề + CTA, danh sách bài blog/gallery thực tế có category, khối Connect + Follow, SEO theo địa phương, trang giá/FAQ riêng từng dịch vụ |
| brandonwoelfel.com | Portfolio cá nhân tối giản | Trang chủ là lưới ảnh masonry dày đặc, click mở lightbox toàn màn hình (`?itemId=`), menu Work / About / Contact, icon mạng xã hội (Instagram, TikTok, YouTube, Facebook, X, Threads), link ngoài tuỳ chọn (photobook, preset do bên thứ ba bán) |

Kết quả: kết hợp cả hai, phong cách editorial của site 1 và lưới ảnh + lightbox của site 2. **Mục đích chính: khách xem ảnh và liên hệ để thuê chụp. Site KHÔNG bán hàng trực tiếp (không giỏ hàng, không thanh toán); mọi CTA dẫn về form liên hệ.** Thay mọi tên người, địa điểm, nội dung khác bằng **placeholder** ("Your Name", "Your City"); riêng tên thương hiệu dùng **chinphotos** (xem B.4). Ảnh mẫu dùng `picsum.photos` hoặc seed tự tạo.

### B.3 Quyết định kiến trúc (đã chốt, sửa tại đây nếu muốn đổi)
- [x] Admin là **app riêng `admin/`**, phục vụ ở đường dẫn `/admin` (bundle tách khỏi site công khai)
- [x] Ảnh upload lưu trên **volume Docker** (`STORAGE_DRIVER=local`), Cloudinary chỉ là tuỳ chọn
- [x] Backend + MongoDB chạy trong Docker, production trên **VPS** có Caddy tự cấp HTTPS
- [x] **Không có module Shop** (đã bỏ). Nếu cần dẫn khách tới photobook/preset bên thứ ba thì thêm link ngoài trong menu ở Settings (mở tab mới)
- Admin được phát triển được **không cần backend** nhờ service layer có cờ `VITE_USE_MOCK` (mock và API thật dùng chung một interface)

### B.4 Thương hiệu và nội dung (đã chốt, sửa tại đây nếu muốn đổi)
- **Tên site / thương hiệu: `chinphotos`** (dùng cho logo chữ, `siteName`, title, OG, email gửi đi, tên repo/thư mục)
- **Chuyên mục: chụp ảnh trẻ em (kid) và gia đình (family).** KHÔNG có nội dung wedding/engagement/elopement
- Danh mục mặc định (admin sửa được): `Family`, `Kids`, `Outdoor`, `At Home`
- Dịch vụ mặc định (admin sửa được): `Family Sessions`, `Kids Portraits`, `Mini Sessions`
- Loại buổi chụp trong form liên hệ: `Family`, `Kids`, `Mini session`, `Khác`
- Giọng văn và ảnh mẫu: ấm áp, tự nhiên, khoảnh khắc thật, ánh sáng đẹp; ảnh seed là ảnh phong cảnh/ẩn danh từ picsum, KHÔNG dùng ảnh người thật
- **Quyền riêng tư vì có ảnh trẻ em:** chỉ đăng ảnh khi phụ huynh đồng ý bằng văn bản; không ghi họ tên đầy đủ của trẻ trong tiêu đề, alt text, URL, caption; nút tải ảnh ở lightbox **tắt mặc định**; admin có tuỳ chọn đặt gallery ở chế độ **ẩn (unlisted)**: không hiện trong danh sách/sitemap, chỉ mở được qua link riêng
- [x] Ngôn ngữ site: **song ngữ, Tiếng Việt (mặc định) + English** (quy tắc ở B.5)
- [x] Khu vực phục vụ: **chỉ TP. Hồ Chí Minh** (`serviceAreas` mặc định = ["Ho Chi Minh City"]); múi giờ `Asia/Ho_Chi_Minh`, ngày dạng dd/MM/yyyy, giá hiển thị bằng VND, SĐT kiểm tra định dạng số Việt Nam (+84 / 0xxx)
- Trang SEO địa phương mặc định (admin sửa được): `ho-chi-minh-city`, `thu-duc`, `quan-1`, `quan-7`, `binh-thanh`, `phu-nhuan`

### B.5 Song ngữ Việt / English
- Ngôn ngữ mặc định `vi`, phụ `en`. URL: `/` = tiếng Việt, `/en/...` = English (cùng cấu trúc route). Có nút chuyển ngôn ngữ ở Header/Footer, nhớ lựa chọn, tự đoán lần đầu theo trình duyệt
- Client: `react-i18next` cho chữ giao diện (menu, nút, thông báo lỗi, form) trong `client/src/locales/{vi,en}.json`; KHÔNG hard-code chữ trong component
- Dữ liệu: mọi trường chữ hiển thị cho khách (title, description, excerpt, content, summary, tagline, bio, alt, caption, faqs, SEO title/description...) có kiểu `LocalizedString = { vi: string; en?: string }`. Slug dùng chung cho cả hai ngôn ngữ
- API: nhận `?lang=vi|en`, trả đúng ngôn ngữ; nếu thiếu bản `en` thì **fallback về `vi`**; admin gọi với `?lang=all` để nhận cả hai
- Admin: form của mọi nội dung song ngữ có Tabs **VI | EN**, hiện huy hiệu "Thiếu EN" ở danh sách khi chưa dịch; Markdown editor có 2 bản; giao diện admin chỉ cần tiếng Việt
- SEO: thẻ `hreflang` vi/en + `x-default`, `<html lang>` đúng ngôn ngữ, sitemap liệt kê cả hai bản, canonical riêng từng ngôn ngữ, Open Graph `locale` đúng
- Inquiry lưu thêm `lang`; email xác nhận gửi khách theo ngôn ngữ họ đang dùng

---

## C. TÀI LIỆU THAM CHIẾU

### C.1 Cấu trúc thư mục

```
chinphotos/
├── README.md  LICENSE  .gitignore  .editorconfig
├── .env.example                  # biến cho docker-compose
├── docker-compose.yml            # dev: mongo + server + client + admin (hot reload)
├── docker-compose.prod.yml       # prod: mongo + server + client + admin + caddy
├── package.json                  # npm workspaces: client, admin, server
├── deploy/
│   ├── Caddyfile  mongo-init.js  server-setup.sh
│   └── backup-mongo.sh  restore-mongo.sh
├── .github/
│   ├── workflows/ci.yml  deploy-server.yml  deploy-client.yml(tuỳ chọn)
│   ├── ISSUE_TEMPLATE/{bug_report.md,feature_request.md}
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/ ARCHITECTURE.md API.md DEPLOYMENT.md CONTENT-GUIDE.md ADMIN.md
│
├── client/                       # SITE CÔNG KHAI
│   ├── Dockerfile  nginx.conf  .dockerignore  .env.example
│   ├── package.json vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js index.html
│   ├── public/ {favicon.svg, robots.txt, sitemap.xml, 404.html, og-default.jpg}
│   └── src/
│       ├── main.tsx App.tsx routes.tsx index.css
│       ├── types/  lib/{api.ts,queryClient.ts,utils.ts}
│       ├── hooks/{useGalleries,usePosts,useSettings,useInView}.ts
│       ├── components/
│       │   ├── layout/{Header,MobileMenu,Footer,Layout}.tsx
│       │   ├── home/{HeroSlideshow,IntroBio,CategoryGrid,ServiceBlocks,FeaturedPosts,ConnectCTA}.tsx
│       │   ├── gallery/{MasonryGrid,LightboxViewer,CategoryFilter,ImageCard}.tsx
│       │   ├── blog/{PostCard,PostBody}.tsx
│       │   ├── forms/{ContactForm,NewsletterForm}.tsx
│       │   ├── seo/Seo.tsx
│       │   └── ui/{Button,Modal,Accordion,Spinner,SocialIcons}.tsx
│       └── pages/ Home Work Portfolio PortfolioCategory GalleryDetail About Details
│                  ServicePage LocationPage Blog BlogPost Contact NotFound
│
├── admin/                        # TRANG QUẢN TRỊ (base path /admin/)
│   ├── Dockerfile  nginx.conf  .dockerignore  .env.example   # VITE_API_URL, VITE_USE_MOCK, VITE_BASE
│   ├── package.json vite.config.ts tsconfig.json tailwind.config.ts index.html
│   └── src/
│       ├── main.tsx App.tsx router.tsx index.css
│       ├── types/            # Category, Gallery, GalleryImage, Post, Service, Inquiry, Settings, User, Paginated<T>, ListQuery
│       ├── data/             # MOCK DATA (chỉ mock service được import)
│       ├── lib/              # api.ts (axios), queryClient.ts, csv.ts, format.ts
│       ├── services/         # *.service.ts: interface chung + bản mock + bản http
│       ├── hooks/            # useGalleries..., useDebounce, useTableState, useDisclosure, useConfirm
│       ├── store/            # ui.store.ts (sidebar, theme), toast.store.ts, auth.store.ts
│       ├── components/
│       │   ├── layout/       # AdminLayout, Sidebar, Header, MobileDrawer, Breadcrumbs, ProtectedRoute
│       │   ├── common/       # Button, Input, Select, Modal, ConfirmDialog, Drawer, Tabs, DataTable, Pagination, ...
│       │   ├── dashboard/    # StatCard, TrafficChart, RecentInquiries, TopGalleries
│       │   ├── gallery/      # GalleryForm, ImageUploader, SortableImageGrid
│       │   ├── posts/        # PostForm, MarkdownEditor
│       │   └── inquiries/    # InquiryTable, InquiryDrawer
│       └── pages/ Login Dashboard Galleries GalleryDetail Categories Posts Services
│                  Inquiries Analytics Settings NotFound
│
└── server/                       # API
    ├── Dockerfile  .dockerignore  .env.example  package.json tsconfig.json
    ├── uploads/.gitkeep          # mount volume Docker
    └── src/
        ├── index.ts app.ts
        ├── config/{env.ts,db.ts,swagger.ts,cloudinary.ts(tuỳ chọn)}
        ├── models/ User Category Gallery Image Post Service Inquiry Subscriber Settings PageView
        ├── controllers/ + routes/ (mỗi resource 1 cặp) + routes/index.ts
        ├── middleware/{auth,upload,validate,rateLimit,errorHandler}.ts
        ├── services/{mail.service.ts,image.service.ts,storage/{local.ts,cloudinary.ts}}
        ├── utils/{slugify,asyncHandler}.ts
        ├── seed/seed.ts
        └── tests/{auth,gallery,inquiry,analytics}.test.ts
```

### C.2 API (base `/api`, response `{ success, data, message }`, lỗi `{ success:false, message, errors? }`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/auth/login` · `/auth/logout` | – / admin | Đăng nhập (cookie httpOnly) / đăng xuất |
| GET/PUT | `/auth/me` | admin | Xem / sửa profile |
| PATCH | `/auth/password` | admin | Đổi mật khẩu |
| GET / PUT | `/settings` | – / admin | Settings công khai / cập nhật |
| GET + CRUD | `/categories` | – / admin | Danh mục, có `galleryCount`, đổi thứ tự `PATCH /categories/reorder` |
| GET + CRUD | `/galleries`, `/galleries/:slug` | – / admin | Query: `search`, `category`, `status`, `featured`, `sort`, `page`, `limit` |
| GET | `/images` | – | Query: `featured`, `gallery`, `page`, `limit` (trang Work) |
| POST | `/images/upload` | admin | Upload nhiều ảnh (multipart) |
| PATCH | `/images/reorder` · `/images/bulk` | admin | Đổi thứ tự / thao tác hàng loạt |
| PUT/DELETE | `/images/:id` | admin | Sửa alt, featured, ảnh bìa / xoá (xoá cả file) |
| GET + CRUD | `/posts`, `/posts/:slug` | – / admin | Bài viết (admin thấy cả nháp) |
| GET + CRUD | `/services`, `/services/:slug` | – / admin | Dịch vụ |
| POST | `/inquiries` | – (5/giờ/IP) | Gửi form liên hệ |
| GET | `/inquiries` | admin | Query: `search`, `status`, `serviceType`, `from`, `to`, `sort`, `page` |
| PATCH | `/inquiries/:id` · `/inquiries/bulk` | admin | Đổi trạng thái, ghi chú / thao tác hàng loạt |
| DELETE | `/inquiries/:id` | admin | Xoá |
| POST | `/subscribers` | – | Đăng ký newsletter |
| POST | `/analytics/pageview` | – (rate limit) | Ghi lượt xem (path, referrer, gallery/post id) |
| GET | `/analytics/summary?range=7d\|30d\|3m\|12m` | admin | Số liệu Dashboard/Analytics |
| GET | `/sitemap.xml` · `/health` | – | Sitemap động / health check cho Docker và Caddy |

### C.3 Schema (Mongoose)
> Mọi trường chữ hiển thị cho khách dưới đây có kiểu `LocalizedString {vi, en?}` (xem B.5). `Inquiry` thêm trường `lang`.
- **User**: email (unique), passwordHash, name, avatar, role(`admin`)
- **Category**: name, slug, description, coverImage, order, isVisible
- **Gallery**: title, slug, category(ref), location, eventDate, description, credits[{role,name,url}] (tuỳ chọn), coverImage, status(`draft|published`), isUnlisted, isFeatured, seoTitle, seoDescription
- **Image**: gallery(ref), url, storageKey, width, height, blurDataUrl, alt, caption, isFeatured, order
- **Post**: title, slug, excerpt, content(Markdown), coverImage, category, tags[], status, publishedAt
- **Service**: title, slug, summary, heroImage, content, priceFrom, inclusions[], faqs[{q,a}], order
- **Inquiry**: name, email, phone, serviceType, eventDate, location, message, source, status(`new|read|replied|archived`), internalNote, createdAt
- **Subscriber**: email (unique), createdAt
- **PageView**: path, refType(`gallery|post|page`), refId, referrer, createdAt (TTL index 400 ngày)
- **Settings** (singleton): siteName, logo, tagline, bio, heroImages[], social{instagram,tiktok,youtube,facebook,x,threads}, contactEmail, serviceAreas[], menu[{label,url,external}], defaultSeo, notifications{emailOnInquiry}

### C.4 Biến môi trường
`server/.env.example`
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://app:app_password@mongo:27017/photographer?authSource=photographer
STORAGE_DRIVER=local
UPLOAD_DIR=/app/uploads
PUBLIC_UPLOAD_URL=http://localhost:5000/uploads
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
# Chỉ cần khi STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="chinphotos <hello@example.com>"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_strong
```
`client/.env.example`: `VITE_API_URL=http://localhost:5000/api`, `VITE_SITE_URL=http://localhost:5173`
`admin/.env.example`: `VITE_API_URL=http://localhost:5000/api`, `VITE_USE_MOCK=true`, `VITE_BASE=/`

### C.5 Bảo mật (áp dụng xuyên suốt)
- bcrypt cost 12; JWT 7 ngày; cookie `httpOnly; secure; sameSite=lax` (cùng domain qua Caddy)
- `helmet`, CORS whitelist (`CLIENT_URL`, `ADMIN_URL`), rate-limit toàn API + riêng cho login/inquiry/pageview
- Validate mọi input bằng zod; upload chỉ jpg/png/webp ≤ 15MB, kiểm tra magic bytes; sanitize Markdown
- Mongo không mở port ra internet ở production; không commit secret; admin có `noindex`

---

## D. CÁC TASK

> Mỗi task có **Prompt** (dán cho agent) và **Kiểm tra** (bạn tự tick). Thứ tự: Nền tảng → Backend → Site công khai → Admin → Triển khai.

### GIAI ĐOẠN 1: NỀN TẢNG VÀ BACKEND

#### Task 0: Khởi tạo repo, Docker dev
```
Tạo monorepo theo C.1 (npm workspaces: client, admin, server). Mỗi package: TypeScript strict, ESLint, Prettier.
Tạo docker-compose.yml dev: mongo:7 (volume, healthcheck, deploy/mongo-init.js tạo user app chỉ readWrite),
server (target dev, tsx watch, depends_on mongo healthy, mount uploads), client (5173), admin (5174, base '/').
Server chỉ cần endpoint GET /api/health. Client và admin chỉ cần trang tạm.
Tạo .gitignore, .editorconfig, .env.example các nơi, README khung. Script gốc: dev, build, lint, test, docker:up.
```
**Kiểm tra**
- [ ] `docker compose up --build` chạy một lệnh, mở `localhost:5173`, `5174`, `5000/api/health`
- [ ] Sửa file trong `server/src` thì server tự khởi động lại
- [ ] `tsc`, `eslint`, `build` sạch ở cả 3 package

#### Task 1: Backend lõi: cấu hình, model, auth
```
Trong server/: config/env.ts (validate bằng zod, thiếu biến thì dừng kèm thông báo rõ), db.ts, app.ts (helmet, cors whitelist, cookie-parser,
rate-limit, errorHandler, asyncHandler), toàn bộ model ở C.3 (trường chữ dùng LocalizedString, có helper chọn ngôn ngữ + fallback), Swagger tại /api/docs.
Auth: POST /auth/login, /auth/logout, GET/PUT /auth/me, PATCH /auth/password; middleware auth (JWT cookie) + giới hạn 5 lần sai/15 phút/IP.
Response và lỗi theo đúng chuẩn ở C.2.
```
**Kiểm tra**
- [ ] Đăng nhập sai bị 401, đúng thì có cookie httpOnly; `/auth/me` không cookie thì 401
- [ ] Sai 6 lần liên tiếp bị chặn tạm
- [ ] `/api/docs` mở được; thiếu `JWT_SECRET` thì server không khởi động

#### Task 2: Backend: CRUD, upload ảnh, inquiry, analytics
```
Làm toàn bộ endpoint ở C.2 (controller + routes + zod validate), gồm: search/filter/sort/phân trang chuẩn cho danh sách, slug tự sinh và chống trùng,
chặn xoá category còn gallery, reorder (categories, images), bulk (images, inquiries). API công khai không trả gallery nháp hay `isUnlisted` trong danh sách/sitemap (chỉ trả khi truy cập đúng slug với gallery unlisted).
Upload: Multer + sharp (WebP, tạo 3 kích thước, blurDataUrl), storage driver local ghi vào UPLOAD_DIR và phục vụ tĩnh ở /uploads, kiểm tra loại/dung lượng, xoá ảnh thì xoá cả file.
Inquiry: lưu DB, gửi mail cho chủ site và mail xác nhận cho khách (nếu chưa cấu hình SMTP thì log ra console), honeypot chống spam.
Analytics: nhận pageview, endpoint summary theo range (tổng lượt xem, khách duy nhất theo ngày, inquiry theo ngày, conversion, top gallery/post, nguồn khách).
GET /sitemap.xml động (có hreflang vi/en). Mọi GET công khai nhận ?lang=vi|en, admin dùng ?lang=all.
```
**Kiểm tra**
- [ ] Thử từng endpoint trong Swagger: tạo, sửa, xoá, phân trang, sort
- [ ] Upload ảnh xong có đủ 3 kích thước và mở được qua `/uploads/...`
- [ ] Gửi inquiry 6 lần/giờ cùng IP thì lần 6 bị chặn
- [ ] Upload file `.exe` đổi đuôi thành `.jpg` bị từ chối

#### Task 3: Seed và test backend
```
seed.ts (chạy bằng `docker compose run --rm server npm run seed`): admin từ biến môi trường, 4 category (Family, Kids, Outdoor, At Home), 12 gallery, 60 ảnh (tải picsum hoặc sinh ảnh màu bằng sharp),
10 post, 3 service (Family Sessions, Kids Portraits, Mini Sessions), 30 inquiry nhiều trạng thái, pageview 12 tháng giả lập. Seed lặp lại không bị trùng dữ liệu.
Viết test jest + supertest + mongodb-memory-server cho auth, gallery, inquiry, analytics (đường chính + lỗi).
```
**Kiểm tra**
- [ ] Chạy seed hai lần không nhân đôi dữ liệu
- [ ] `npm test -w server` xanh, có test cho trường hợp lỗi (không phải chỉ đường đi đúng)

---

### GIAI ĐOẠN 2: SITE CÔNG KHAI (client/)

#### Task 4: Khung site: layout, theme, routing, SEO
```
client/: Tailwind tokens (serif editorial Cormorant Garamond/Playfair cho tiêu đề, Inter cho body; màu trung tính kem/đen/trắng ngà + 1 màu nhấn), dark/light theo prefers-color-scheme + nút chuyển.
Layout: Header (logo, menu Work · Portfolio · About · Details · Journal · Contact (lấy từ settings.menu, hỗ trợ link ngoài mở tab mới), nút CTA nổi bật "Check availability" dẫn tới /contact (mobile nằm trong menu), icon social lấy từ GET /settings; sticky, trong suốt trên hero, đổi nền khi scroll; mobile hamburger + menu toàn màn hình; skip-to-content), Footer (Connect / Follow / copyright).
i18n (react-i18next, locales vi/en, route `/` và `/en/*`, nút chuyển ngôn ngữ, hreflang + html lang), Router (lazy load, hiệu ứng chuyển trang Framer Motion), NotFound, component Seo (title, description, OG, Twitter, JSON-LD), hook ghi pageview gửi /analytics/pageview mỗi lần đổi route.
```
**Kiểm tra**
- [ ] Đổi settings (qua Swagger) thì menu social và tên site đổi theo
- [ ] Nút "Check availability" có ở mọi trang và dẫn đúng /contact
- [ ] Mobile: hamburger mở/đóng, đóng khi chọn mục; F5 giữ theme
- [ ] Mỗi trang có `<title>` và OG riêng; mỗi lần đổi trang có 1 request pageview

#### Task 5: Trang chủ
```
Home theo thứ tự: HeroSlideshow (full-viewport, fade 5s, pause khi hover, preload ảnh đầu, tên + tagline), IntroBio (chân dung tròn, nghề + khu vực, lời chào, 2 đoạn mô tả, nút About),
CategoryGrid (mosaic không đều theo danh mục, nhãn đè lên ảnh, link /portfolio/:category), ServiceBlocks (2-3 khối ảnh lớn luân phiên trái/phải, CTA tới /services/:slug),
FeaturedPosts (3 bài mới), ConnectCTA (Connect: khu vực + email + nút Contact; Follow: icon social). Mọi nội dung lấy từ API, có skeleton.
```
**Kiểm tra**
- [ ] Slideshow tự chạy, hover thì dừng, `prefers-reduced-motion` thì không fade
- [ ] Đổi thứ tự/ẩn category trong DB thì trang chủ đổi theo
- [ ] Lighthouse trang chủ ≥ 90 (Performance, SEO, Accessibility)

#### Task 6: Work: lưới masonry và lightbox
```
/work: masonry (3 cột desktop / 2 tablet / 1-2 mobile) tất cả ảnh featured, lazy load, blur placeholder, srcset/sizes dùng 3 kích thước đã tạo, fade-in, nút "Load more" (24 ảnh/lần) hoặc infinite scroll.
LightboxViewer toàn màn hình: URL đồng bộ ?itemId=<id> (mở link trực tiếp vẫn bật lightbox đúng ảnh), phím ←/→/Esc, swipe mobile, zoom, nút tải (mặc định TẮT, bật được trong Settings), preload ảnh kế tiếp.
```
**Kiểm tra**
- [ ] Copy link khi đang mở ảnh, dán ở tab mới thì mở đúng ảnh
- [ ] Nút Back của trình duyệt đóng lightbox thay vì rời trang
- [ ] Cuộn 100 ảnh không giật; Network chỉ tải ảnh trong/gần khung nhìn

#### Task 7: Portfolio và chi tiết gallery
```
/portfolio (danh sách category), /portfolio/:category (chips lọc, lưới gallery), /gallery/:slug (tiêu đề, địa điểm, ngày, credits (nếu có), lưới ảnh + lightbox dùng lại từ Task 6, nút Prev/Next gallery).
Gallery nháp không được truy cập từ site công khai (404). Gallery `isUnlisted` không hiện trong danh sách, lọc, sitemap, prev/next; chỉ mở được khi biết link `/gallery/:slug`, trang có `noindex`.
```
**Kiểm tra**
- [ ] Mở `/gallery/<slug-của-bản-nháp>` ra 404
- [ ] Gallery unlisted: không thấy ở danh sách/sitemap nhưng mở bằng link trực tiếp được và có `noindex`
- [ ] Prev/Next ở gallery đầu và cuối xử lý đúng (ẩn hoặc quay vòng)

#### Task 8: About, Details, Service, Location
```
/about (chân dung, câu chuyện, số năm kinh nghiệm, nơi đã chụp, press/featured in, CTA), /details (quy trình 3-5 bước, bảng gói dịch vụ, FAQ Accordion, CTA),
/services/:slug (hero, mô tả, Investment, FAQ, testimonials, form liên hệ rút gọn), /locations/:slug (trang SEO theo địa phương chỉ trong TP.HCM (mặc định: ho-chi-minh-city, thu-duc, quan-1, quan-7, binh-thanh, phu-nhuan; nội dung song ngữ từ API), thêm resource "Location" tối thiểu vào server nếu cần).
JSON-LD LocalBusiness/Photographer (areaServed = Ho Chi Minh City, ngôn ngữ vi/en), FAQPage.
```
**Kiểm tra**
- [ ] FAQ mở/đóng bằng bàn phím, đúng `aria-expanded`
- [ ] Kiểm tra JSON-LD bằng Rich Results Test không báo lỗi

#### Task 9: Journal (ĐÃ BỎ THEO YÊU CẦU - Trang web tập trung xem ảnh, dịch vụ và liên hệ đặt lịch)
```
(Bỏ qua phần Nhật ký / Journal / Blog theo yêu cầu người dùng để tập trung trọn vẹn vào portfolio, chi tiết dịch vụ và liên hệ đặt lịch chụp)
```

#### Task 10: Liên hệ và newsletter
```
/contact: ContactForm (RHF + Zod: họ tên, email, SĐT (định dạng số Việt Nam), loại buổi chụp (Family / Kids / Mini session / Khác), ngày dự kiến, địa điểm, số người lớn và số trẻ + độ tuổi trẻ (không bắt buộc), lời nhắn, biết tôi từ đâu, honeypot), lỗi inline, trạng thái đang gửi, toast thành công (chữ theo ngôn ngữ đang xem, lưu `lang` vào inquiry); NewsletterForm ở Footer.
```
**Kiểm tra**
- [ ] Gửi form thì có bản ghi trong DB và log mail ra console (hoặc mail thật nếu đã cấu hình SMTP)
- [ ] Điền ô honeypot thì bị bỏ qua mà không báo lỗi lộ liễu
- [ ] Email trùng ở newsletter báo "đã đăng ký" thay vì lỗi 500

#### Task 11: SEO, hiệu năng, hoàn thiện client
```
sitemap.xml động trỏ đúng route kèm hreflang vi/en, robots.txt, 404.html, og-default; kiểm tra tiêu đề/description không trùng giữa các trang; chia bundle theo route; ảnh hero ưu tiên tải (fetchpriority);
rà accessibility (tương phản, alt, focus, heading order); rà responsive 375/768/1280px.
```
**Kiểm tra**
- [ ] Lighthouse mọi trang chính ≥ 90 cả 4 mục
- [ ] Chỉ dùng bàn phím đi hết site được; không console error/warning

---

### GIAI ĐOẠN 3: ADMIN (admin/)

#### Task 12: Admin: khung, theme, đăng nhập, service layer
```
admin/: Tailwind tokens, light/dark/system (lưu localStorage, không nháy trắng khi tải), AdminLayout: Sidebar (thu gọn trên desktop và nhớ trạng thái, drawer trên mobile đóng khi chọn mục/Esc, tooltip khi thu gọn),
Header (mở sidebar, tìm nhanh Ctrl/⌘+K để chuyển trang, đổi theme, dropdown user: Profile / Settings / Logout, chuông hiện số inquiry mới), Breadcrumbs.
Zustand: ui.store (sidebar, theme), toast.store + component Toast (success/error/info, tự tắt, xếp chồng), auth.store.
Router: /login, /dashboard, /galleries, /galleries/:id, /categories, /posts, /services, /inquiries, /analytics, /settings, 404; ProtectedRoute; trang Login (RHF + Zod).
Service layer: types (admin/src/types), mock data trong src/data (≥ 5 category, 12 gallery, 60 ảnh, 10 post, 4 service, 30 inquiry...), mỗi service có interface chung + bản mock (bộ nhớ, giả trễ 300–600ms,
hỗ trợ search/filter/sort/phân trang thật) + bản http (axios withCredentials, interceptor 401 → /login, 422/500 → toast). Chọn bản bằng VITE_USE_MOCK. Hooks TanStack Query (invalidate sau mutation).
Mỗi trang chỉ là placeholder có tiêu đề + breadcrumb.
```
**Kiểm tra**
- [ ] < 1024px: sidebar thành drawer; F5 giữ theme và trạng thái sidebar
- [ ] Chưa đăng nhập vào `/dashboard` bị đưa về `/login`
- [ ] `grep -r "data/" src/components src/pages` không ra gì (component không import mock trực tiếp)
- [ ] Đổi `VITE_USE_MOCK=false` thì đăng nhập được bằng backend Docker

#### Task 13: Admin: component dùng chung
```
components/common (type đầy đủ, dùng Radix cho phần tương tác): Button (variant/size/loading), IconButton, Input, Textarea, Select, Switch, Checkbox, FormField, StatusBadge, Card, Modal, ConfirmDialog, Drawer,
DropdownMenu, Tabs, Tooltip, Skeleton, EmptyState, ErrorState, PageHeader, SearchInput (debounce 300ms), FilterBar,
DataTable (cột cấu hình, sort theo cột, chọn nhiều dòng, mobile chuyển thành card), Pagination (đổi pageSize, nhảy trang).
Hooks: useDebounce, useTableState (search/filter/sort/page đồng bộ lên URL query), useDisclosure, useConfirm.
Trang /dev/components (chỉ khi DEV) hiển thị mọi component ở mọi trạng thái.
```
**Kiểm tra**
- [ ] Modal: Esc đóng, Tab không thoát khỏi modal, trả focus về nút mở
- [ ] Bấm tiêu đề cột đổi sort; F5 giữ search/page vì nằm trên URL
- [ ] Không warning React (key, a11y) trong console

#### Task 14: Admin: Dashboard và Analytics
```
/dashboard: 4 StatCard (Lượt xem, Inquiry mới, Gallery đã đăng, Bài viết) kèm % so với kỳ trước; bộ lọc kỳ 7 ngày / 30 ngày / 3 tháng / 12 tháng thay đổi toàn bộ số liệu;
biểu đồ Recharts lượt xem + inquiry (responsive, tooltip, màu theo theme); RecentInquiries; TopGalleries; skeleton khi tải.
/analytics (dùng chung bộ lọc kỳ): Lượt xem & khách duy nhất, Inquiry theo thời gian, Conversion (inquiry/lượt xem), Inquiry theo loại dịch vụ (bar/donut), Nguồn khách, Tăng trưởng subscriber, Top gallery/post.
Mỗi biểu đồ có tiêu đề, chú thích, trạng thái trống, nút xuất CSV, và bảng số liệu thay thế cho screen reader.
```
**Kiểm tra**
- [ ] Đổi 4 kỳ cho ra số khác nhau; số Analytics khớp Dashboard cùng kỳ
- [ ] Dark mode đọc rõ; mobile không tràn ngang
- [ ] Số liệu khớp dữ liệu seed khi chạy bằng backend thật

#### Task 15: Admin: Categories, Galleries, Images (cốt lõi)
```
Categories: CRUD, search, bật/tắt hiển thị, số gallery, kéo thả đổi thứ tự; chặn xoá category còn gallery kèm cảnh báo rõ.
Galleries (form có tab VI|EN, huy hiệu "Thiếu EN"): bảng + chế độ lưới; search, lọc category/trạng thái (nháp, đã đăng, nổi bật), sort, phân trang; thêm/sửa (RHF + Zod: title bắt buộc, slug tự sinh và kiểm tra trùng, ngày, địa điểm,
credits tuỳ chọn thêm/xoá dòng, công tắc "Ẩn (unlisted)", SEO); xoá có xác nhận.
Trong GalleryDetail: ImageUploader (kéo thả hoặc chọn nhiều file, kiểm tra loại jpg/png/webp và ≤ 15MB, tiến trình từng file, xem trước, huỷ được), SortableImageGrid (@dnd-kit có keyboard sensor, lưu thứ tự),
đặt ảnh bìa, bật featured, sửa alt, xoá từng ảnh hoặc nhiều ảnh.
```
**Kiểm tra**
- [ ] Tạo, sửa, xoá gallery cập nhật ngay danh sách và hiện đúng trên site công khai
- [ ] Upload 5 ảnh, kéo đổi thứ tự, reload vẫn giữ; thứ tự đổi theo cả trên site công khai
- [ ] File sai định dạng/quá nặng bị chặn kèm thông báo; sắp xếp ảnh được bằng bàn phím

#### Task 16: Admin: Posts và Services
```
Posts (form có tab VI|EN, Markdown 2 bản): bảng + CRUD; form có MarkdownEditor 2 cột (soạn | xem trước, sanitize), ảnh bìa, category, tags, trạng thái nháp/đã đăng, ngày đăng; tự lưu nháp vào localStorage và cảnh báo khi rời trang chưa lưu.
Services: CRUD, giá "từ", danh sách bao gồm và FAQ (thêm/xoá/kéo thả), ảnh hero, thứ tự hiển thị.
```
**Kiểm tra**
- [ ] Gõ Markdown thấy xem trước tức thì; chèn `<script>` không chạy
- [ ] Đóng tab giữa chừng, mở lại còn bản nháp
- [ ] Đổi FAQ trong admin thì site công khai đổi theo

#### Task 17: Admin: Inquiries và Settings
```
/inquiries (tin nhắn từ form liên hệ): search (tên, email, nội dung), lọc trạng thái (mới/đã đọc/đã trả lời/lưu trữ), loại dịch vụ, khoảng ngày; sort; phân trang; chọn nhiều dòng để đánh dấu/lưu trữ/xoá hàng loạt (có xác nhận);
Drawer chi tiết (toàn bộ thông tin, đổi trạng thái, ghi chú nội bộ, nút "Trả lời bằng email" mailto); mở inquiry mới thì tự thành "đã đọc" và số trên chuông giảm; Export CSV theo bộ lọc hiện tại (UTF-8 có BOM).
/settings dạng Tabs: General (tên site, tagline, logo, ảnh hero, liên hệ, khu vực phục vụ, thứ tự menu, link ngoài mở tab mới), Social & SEO (6 link social kiểm tra URL, SEO mặc định, ảnh OG),
Profile (tên, email, avatar), Security (đổi mật khẩu có kiểm tra độ mạnh, hiện/ẩn mật khẩu), Notifications (công tắc email khi có inquiry mới), Appearance (theme, mật độ bảng, màu nhấn có sẵn, áp dụng ngay và nhớ).
Mỗi tab lưu riêng, nút Save chỉ bật khi có thay đổi, toast, cảnh báo khi rời tab chưa lưu.
```
**Kiểm tra**
- [ ] Gửi form liên hệ ở site công khai thì inquiry hiện ở admin; mở ra thì thành "đã đọc"
- [ ] CSV mở bằng Excel không lỗi font tiếng Việt, đúng số dòng đang lọc
- [ ] Đổi tên site/social trong Settings thì site công khai đổi theo; đổi mật khẩu xong đăng nhập lại được

---

### GIAI ĐOẠN 4: TRIỂN KHAI

#### Task 18: Docker production và Caddy
```
Viết/hoàn thiện:
- server/Dockerfile multi-stage (deps → dev → build → runner: npm ci --omit=dev, user non-root, chown uploads, HEALTHCHECK, EXPOSE 5000, image < 250MB)
- client/Dockerfile và admin/Dockerfile (build Vite → nginx:alpine, try_files $uri /index.html, gzip, cache immutable cho /assets/; admin build với VITE_BASE=/admin/, basename Router, noindex meta + header X-Robots-Tag)
- docker-compose.prod.yml: image từ GHCR (${TAG}), restart unless-stopped; mongo bật auth, KHÔNG publish port, chỉ user app readWrite; server có healthcheck, mem_limit, log json-file 10m x3;
  caddy:2 publish 80/443; hai network public/internal (server, mongo nằm internal)
- deploy/Caddyfile:
    {$DOMAIN} {
        encode zstd gzip
        handle /api/*     { reverse_proxy server:5000 }
        handle /uploads/* { reverse_proxy server:5000 }
        handle /admin*    { reverse_proxy admin:80 }
        handle            { reverse_proxy client:80 }
    }
- deploy/server-setup.sh (cài Docker + compose, user deploy, ufw chỉ mở 22/80/443, /opt/photographer), backup-mongo.sh (mongodump gzip + tar volume uploads, giữ 14 bản, hướng dẫn cron), restore-mongo.sh
- .env.prod mẫu: DOMAIN, TAG, MONGO_INITDB_ROOT_*, MONGO_APP_PASSWORD, JWT_SECRET, CLIENT_URL, ADMIN_URL, MONGODB_URI, STORAGE_DRIVER=local, UPLOAD_DIR, PUBLIC_UPLOAD_URL
```
**Kiểm tra**
- [ ] `docker compose -f docker-compose.prod.yml up -d` trên máy thử: site ở `/`, admin ở `/admin`, API ở `/api`
- [ ] Refresh ở `/admin/galleries` không 404
- [ ] `docker compose down && up` vẫn còn dữ liệu và ảnh (volume hoạt động); `nmap` hoặc `docker ps` xác nhận Mongo không mở port ra ngoài
- [ ] Chạy script backup rồi restore sang DB trống thành công

#### Task 19: CI/CD lên GitHub
```
.github/workflows/ci.yml: push + PR vào main → setup-node 20 (cache npm) → npm ci → lint → typecheck → test → build cả client, admin, server.
deploy-server.yml: chạy sau CI trên main (hoặc workflow_dispatch) → login GHCR bằng GITHUB_TOKEN → docker/build-push-action build và push 3 image (server, client, admin) tag latest và ${{ github.sha }}, cache gha →
SSH vào VPS (appleboy/ssh-action): cd /opt/photographer; export TAG=<sha>; docker compose -f docker-compose.prod.yml pull; up -d --remove-orphans; docker image prune -f.
Secrets: VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT (tuỳ chọn). Phương án phụ trong docs/DEPLOYMENT.md: frontend ở GitHub Pages (workflow deploy-client.yml, domain api.* cho backend, cookie SameSite=None; Secure, CORS credentials).
Viết README các lệnh đẩy code:
  git init; git add .; git commit -m "feat: initial photographer portfolio"; git branch -M main
  git remote add origin https://github.com/<username>/chinphotos.git; git push -u origin main
Viết docs/DEPLOYMENT.md: checklist (thuê VPS ≥ 1GB RAM → server-setup.sh → trỏ DNS → đặt file compose/.env.prod lên VPS → GitHub Secrets → push main → kiểm tra HTTPS),
cách chạy seed lần đầu và đổi mật khẩu admin ngay, trỏ domain, backup định kỳ.
```
**Kiểm tra**
- [ ] CI xanh trên GitHub; PR có lỗi lint thì CI đỏ
- [ ] Push `main` thì image mới lên GHCR và VPS tự cập nhật, `https://<domain>` hoạt động
- [ ] Không có secret nào trong repo (`git log -p | grep -i secret` sạch)

#### Task 20: Rà soát cuối và tài liệu
```
Rà toàn bộ theo checklist: responsive (375/768/1280px) cho cả client và admin, light/dark, bàn phím, tương phản, loading/empty/error ở mọi danh sách, không console error/warning, không còn `any`,
báo danh sách code lặp có thể gộp, bundle chia theo route. Hoàn thiện README (giới thiệu, tính năng, stack, cây thư mục, cài đặt, biến môi trường, scripts, deploy, đóng góp),
docs/ARCHITECTURE.md, docs/API.md (xuất từ Swagger), docs/CONTENT-GUIDE.md (hướng dẫn chủ site thêm ảnh/bài viết), docs/ADMIN.md (cách thêm một resource mới: type → mock → service → hook → page).
```
**Kiểm tra**
- [ ] Đi hết mọi trang ở 3 độ rộng và 2 theme, không vỡ layout
- [ ] Thêm thử một resource mới theo `docs/ADMIN.md` mất dưới 30 phút
- [ ] Người chưa biết dự án làm theo README dựng được môi trường dev trong 10 phút

---

## E. TIÊU CHÍ HOÀN THÀNH TOÀN DỰ ÁN

- [ ] `docker compose up --build` dựng đủ mongo + server + client + admin chỉ bằng một lệnh, không cần cài Node/Mongo trên máy
- [ ] `docker compose run --rm server npm run seed` cho site có dữ liệu mẫu đầy đủ
- [ ] Mọi trang ở Task 4–11 và 12–17 hoạt động, responsive, không lỗi console
- [ ] Lightbox có đồng bộ URL `?itemId=`, phím tắt, swipe
- [ ] Admin: đăng nhập, upload ảnh, tạo gallery/post, sửa Settings và thấy thay đổi ngay ở site công khai
- [ ] Form liên hệ lưu DB, hiện ở admin, gửi mail (hoặc log ra console khi chưa có SMTP)
- [ ] Dữ liệu Mongo và ảnh upload còn nguyên sau `docker compose down && up`
- [ ] `docker-compose.prod.yml` chạy trên VPS có HTTPS qua Caddy, Mongo không mở port ra internet
- [ ] CI xanh, workflow deploy chạy thành công
- [ ] Có test cho auth, gallery, inquiry, analytics
- [ ] Không còn secret, nội dung hay hình ảnh bản quyền của site tham khảo
