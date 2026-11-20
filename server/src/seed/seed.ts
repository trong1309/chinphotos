import bcrypt from 'bcryptjs';
import env from '../config/env';
import { connectDB } from '../config/db';
import {
  User,
  Category,
  Gallery,
  Image,
  Post,
  Service,
  Inquiry,
  Subscriber,
  PageView,
  Settings,
  Location,
} from '../models';

export const runSeed = async (): Promise<void> => {
  console.log('[seed] Connecting to database...');
  await connectDB();

  console.log('[seed] Cleaning existing collections and removing synthetic sample data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Gallery.deleteMany({}),
    Image.deleteMany({}),
    Post.deleteMany({}),
    Service.deleteMany({}),
    Inquiry.deleteMany({}),
    Subscriber.deleteMany({}),
    PageView.deleteMany({}),
    Settings.deleteMany({}),
    Location.deleteMany({}),
  ]);

  // 1. Seed Admin User (default: admin@example.com / Admin@123)
  console.log('[seed] Seeding admin user...');
  const salt = await bcrypt.genSalt(12);
  const adminPassword =
    env.ADMIN_PASSWORD === 'change_me_strong' ? 'Admin@123' : env.ADMIN_PASSWORD;
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const admin = await User.create({
    email: env.ADMIN_EMAIL,
    passwordHash,
    name: 'chinphotos Admin',
    avatar: '',
    role: 'admin',
  });
  console.log(`[seed] Admin created: ${admin.email}`);

  // 2. Seed Core Categories (structure only, no fake galleries)
  console.log('[seed] Seeding core categories...');
  const categoriesData = [
    {
      name: 'Gia đình',
      slug: 'family',
      description:
        'Những khoảnh khắc gắn kết đong đầy yêu thương và nụ cười ấm áp của cả gia đình.',
      coverImage:
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=85',
      order: 1,
      isVisible: true,
    },
    {
      name: 'Tuổi thơ & Em bé',
      slug: 'kids',
      description:
        'Ghi lại vẻ đẹp thơ ngây, ánh mắt trong trẻo và từng bước phát triển tự nhiên của bé.',
      coverImage:
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85',
      order: 2,
      isVisible: true,
    },
    {
      name: 'Ngoại cảnh Sài Gòn',
      slug: 'outdoor',
      description:
        'Những buổi dã ngoại chan hòa ánh nắng, bãi cỏ xanh và không gian mở tại TP. Hồ Chí Minh.',
      coverImage:
        'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1400&q=85',
      order: 3,
      isVisible: true,
    },
    {
      name: 'Tổ ấm Tại nhà',
      slug: 'at-home',
      description:
        'Khoảnh khắc thân thương, bình yên và thoải mái nhất ngay trong chính ngôi nhà của bạn.',
      coverImage:
        'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=1400&q=85',
      order: 4,
      isVisible: true,
    },
  ];

  await Category.create(categoriesData);

  // 3. Seed Core Services (structure for /details & /services/:slug)
  console.log('[seed] Seeding core photography services...');
  const servicesData = [
    {
      title: 'Gói Gia đình Trọn vẹn',
      slug: 'family-sessions',
      summary:
        'Gói chụp ảnh gia đình trọn vẹn dành cho 3 đến 8 thành viên tại nhà hoặc ngoại cảnh ở TP. Hồ Chí Minh.',
      heroImage:
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=85',
      content:
        'Dành từ 90 đến 120 phút ghi lại trọn vẹn sự gắn kết, tiếng cười và những cái ôm ấm áp của cả gia đình trong không gian quen thuộc hoặc điểm hẹn yêu thích.',
      priceFrom: 3500000,
      inclusions: [
        '90 đến 120 phút chụp ảnh thoải mái',
        'Địa điểm linh hoạt tại nhà hoặc ngoại cảnh TP.HCM',
        'Toàn bộ file gốc đã chỉnh sáng và màu sắc cơ bản',
        '45 ảnh chỉnh sửa tỉ mỉ, tinh tế từng chi tiết',
        'Online gallery riêng tư tải ảnh chất lượng cao không giới hạn',
        'Tư vấn bảng màu trang phục và kịch bản vui chơi cho bé',
      ],
      faqs: [
        {
          q: 'Gia đình có cần tự chuẩn bị đạo cụ gì không?',
          a: 'Không cần thiết ạ. Chúng tôi khuyến khích gia đình mang theo những món đồ gắn bó thật sự như sách truyện con thích, gấu bông hoặc một ít bánh ngọt nhẹ.',
        },
        {
          q: 'Nếu hôm chụp trời mưa thì thế nào?',
          a: 'Nếu chụp ngoại cảnh và gặp thời tiết xấu, chúng tôi sẽ linh hoạt hỗ trợ gia đình đổi sang lịch chụp phù hợp khác mà không phát sinh phụ phí.',
        },
        {
          q: 'Bao lâu sau buổi chụp gia đình sẽ nhận được ảnh?',
          a: 'Gia đình sẽ nhận được một số ảnh xem trước (sneak peek) trong vòng 48 giờ và trọn bộ ảnh hoàn thiện sau 7 - 10 ngày làm việc.',
        },
      ],
      order: 1,
    },
    {
      title: 'Chân dung Tuổi thơ',
      slug: 'kids-portraits',
      summary:
        'Bộ ảnh chân dung lưu giữ từng cột mốc phát triển, nụ cười hồn nhiên và vẻ đáng yêu của bé.',
      heroImage:
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=85',
      content:
        'Tập trung hoàn toàn vào biểu cảm trong trẻo của bé, từ những ánh mắt tò mò, cái nhíu mày đáng yêu đến nụ cười rạng rỡ nhất.',
      priceFrom: 2200000,
      inclusions: [
        '60 phút chụp thảnh thơi theo nhịp sinh hoạt của bé',
        'Không gian studio ánh sáng tự nhiên hoặc công viên xanh',
        '30 ảnh chỉnh sửa master nét và màu sắc trong trẻo',
        'Toàn bộ file ảnh gốc chất lượng cao',
        'Bộ quà tặng 10 ảnh in cao cấp cỡ 13x18cm',
      ],
      faqs: [
        {
          q: 'Bé rất nhút nhát và sợ người lạ, studio có xử lý được không?',
          a: 'Nhiếp ảnh gia của chinphotos luôn dành 15-20 phút đầu để làm quen, trò chuyện và cùng chơi với bé trước khi bấm máy, tạo không khí an tâm tuyệt đối.',
        },
        {
          q: 'Độ tuổi nào phù hợp nhất cho gói chụp này?',
          a: 'Gói Chân dung Tuổi thơ phù hợp cho các bé từ 6 tháng tuổi (đã biết ngồi vững) cho đến 12 tuổi.',
        },
      ],
      order: 2,
    },
    {
      title: 'Gói Chụp Nhanh (Mini Session)',
      slug: 'mini-sessions',
      summary:
        'Buổi chụp nhanh gọn 45 phút, phù hợp để ghi dấu một mốc kỷ niệm nhỏ hoặc cập nhật ảnh gia đình định kỳ.',
      heroImage:
        'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1600&q=85',
      content:
        'Gọn gàng, súc tích và tràn ngập niềm vui. Lựa chọn lý tưởng cho các gia đình muốn có bộ ảnh đẹp nhanh chóng mà không làm bé mệt.',
      priceFrom: 1500000,
      inclusions: [
        '45 phút chụp năng động',
        '1 địa điểm chọn lọc tại TP. Hồ Chí Minh',
        '20 ảnh hoàn thiện chất lượng cao',
        'Toàn bộ file gốc sau buổi chụp',
        'Trả ảnh nhanh trong vòng 5 ngày',
      ],
      faqs: [
        {
          q: 'Gói Mini Session áp dụng cho tối đa bao nhiêu người?',
          a: 'Gói Mini Session tối ưu nhất cho gia đình nhỏ từ 3 đến 4 thành viên (ba mẹ và 1-2 bé).',
        },
      ],
      order: 3,
    },
  ];

  await Service.create(servicesData);

  // 4. Seed Studio Settings (Singleton for chinphotos)
  console.log('[seed] Seeding studio settings (chinphotos)...');
  await Settings.create({
    siteName: 'chinphotos',
    logo: '',
    tagline: 'Nhiếp ảnh Gia đình & Tuổi thơ Tự nhiên',
    bio: 'Lưu giữ những khoảnh khắc gắn kết chân thật, nụ cười thơ ngây và niềm hạnh phúc bình dị của gia đình tại TP. Hồ Chí Minh.',
    heroImages: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=85',
      'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=2000&q=85',
      'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=2000&q=85',
    ],
    social: {
      instagram: 'https://instagram.com/chinphotos',
      tiktok: 'https://tiktok.com/@chinphotos',
      youtube: '',
      facebook: 'https://facebook.com/chinphotos',
      x: '',
      threads: '',
    },
    contactEmail: 'hello@chinphotos.vn',
    serviceAreas: ['TP. Hồ Chí Minh', 'Thảo Điền', 'Phú Mỹ Hưng'],
    menu: [
      { label: 'Work', path: '/work', order: 1, isVisible: true },
      { label: 'Portfolio', path: '/portfolio', order: 2, isVisible: true },
      { label: 'About', path: '/about', order: 3, isVisible: true },
      { label: 'Details', path: '/details', order: 4, isVisible: true },
      { label: 'Contact', path: '/contact', order: 5, isVisible: true },
    ],
    shopEnabled: false,
    defaultSeo: {
      title: 'chinphotos | Nhiếp ảnh Gia đình & Trẻ em TP.HCM',
      description:
        'Studio nhiếp ảnh gia đình và trẻ em phong cách tự nhiên, hiện đại tại TP. Hồ Chí Minh.',
      ogImage:
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85',
    },
    notifications: {
      emailOnInquiry: true,
    },
  });

  console.log(
    '✅ [seed] Clean initialization completed! Zero fake galleries, inquiries, subscribers, or synthetic pageviews.',
  );
};

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('[seed] Done! Exiting process.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[seed] Error while seeding:', err);
      process.exit(1);
    });
}
