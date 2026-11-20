import { Request, Response } from 'express';
import { z } from 'zod';
import Location from '../models/location.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';

const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  titleVi: z.string().min(1, 'Vietnamese title is required'),
  titleEn: z.string().min(1, 'English title is required'),
  descriptionVi: z.string().min(1, 'Vietnamese description is required'),
  descriptionEn: z.string().min(1, 'English description is required'),
  popularSpotsVi: z.array(z.string()).default([]),
  popularSpotsEn: z.array(z.string()).default([]),
  tipsVi: z.string().default(''),
  tipsEn: z.string().default(''),
  coverImage: z.string().default(''),
  order: z.number().default(1),
});

const updateLocationSchema = createLocationSchema.partial();

export const DEFAULT_HCMC_LOCATIONS = [
  {
    name: 'Ho Chi Minh City',
    slug: 'ho-chi-minh-city',
    titleVi: 'Chụp Ảnh Gia Đình & Em Bé Tại TP. Hồ Chí Minh',
    titleEn: 'Natural Family & Kids Photography in Ho Chi Minh City',
    descriptionVi:
      'TP. Hồ Chí Minh mang vẻ đẹp giao thoa giữa nét cổ kính yên bình và nhịp sống trẻ trung, hiện đại. chinphotos cung cấp dịch vụ chụp ảnh gia đình và trẻ em tự nhiên trên toàn địa bàn TP.HCM với ánh sáng dịu êm, cảm xúc chân thật và phong cách thanh lịch.',
    descriptionEn:
      'Ho Chi Minh City offers a wonderful blend of heritage architecture and vibrant, sunlit parks. chinphotos creates intimate, authentic family and childhood portrait sessions across HCMC with natural light and timeless aesthetics.',
    popularSpotsVi: [
      'Bến Bạch Đằng & Công viên bờ sông Sài Gòn',
      'Thảo Cầm Viên Sài Gòn',
      'Khu đô thị Sala Thủ Thiêm',
      'Khu đô thị Phú Mỹ Hưng',
      'Bán đảo Thanh Đa',
    ],
    popularSpotsEn: [
      'Bach Dang Riverside Park',
      'Saigon Zoo & Botanical Gardens',
      'Sala Urban Park, Thu Thiem',
      'Phu My Hung Green Spaces',
      'Thanh Da Peninsula',
    ],
    tipsVi:
      'Thời điểm chụp lý tưởng nhất tại Sài Gòn là vào sáng sớm từ 6:30 - 8:30 hoặc chiều tà từ 16:00 - 17:30 khi nắng vàng óng ả và tiết trời dịu mát, rất dễ chịu cho các bé nhỏ.',
    tipsEn:
      'The optimal lighting hours in Saigon are early morning (6:30 - 8:30 AM) or late golden hour (4:00 - 5:30 PM), ensuring gentle sunshine and comfortable temperatures for young children.',
    coverImage: 'http://localhost:5000/uploads/1792256040074-597d2a53-large.webp',
    order: 1,
  },
  {
    name: 'Thu Duc',
    slug: 'thu-duc',
    titleVi: 'Chụp Ảnh Gia Đình Tại TP. Thủ Đức & Thảo Điền',
    titleEn: 'Family Photography in Thu Duc City & Thao Dien',
    descriptionVi:
      'TP. Thủ Đức nổi bật với những công viên sinh thái rộng mở, bến du thuyền thơ mộng và các góc phố xanh mát tại Thảo Điền. Đây là không gian lý tưởng cho các buổi dã ngoại chụp ảnh ngoài trời thư thả của gia đình.',
    descriptionEn:
      'Thu Duc City features expansive green parks, breezy riverfront promenades, and leafy streets around Thao Dien. Ideal for relaxed outdoor family picnics and playful childhood moments.',
    popularSpotsVi: [
      'Công viên Sala Đại Quang Minh',
      'Bến tàu thủy Thủ Thiêm Waterbus',
      'Khu biệt thự ven sông Thảo Điền',
      'Công viên bờ sông Sài Gòn (ngay chân cầu Ba Son)',
    ],
    popularSpotsEn: [
      'Sala Eco-Park Thu Thiem',
      'Thu Thiem Waterbus Station',
      'Thao Dien Riverside Promenades',
      'Ba Son Bridge Riverside Promenade',
    ],
    tipsVi:
      'Khu vực Sala và Thảo Điền có nhiều bãi cỏ xanh mịn và lối đi dạo an toàn, bé có thể thoải mái chạy nhảy và thả diều cùng ba mẹ.',
    tipsEn:
      'Sala and Thao Dien boast well-manicured lawns and car-free pedestrian paths where kids can run freely and fly kites with parents.',
    coverImage: 'http://localhost:5000/uploads/1792256042966-bac41d4a-large.webp',
    order: 2,
  },
  {
    name: 'Quan 1',
    slug: 'quan-1',
    titleVi: 'Chụp Ảnh Ngoại Cảnh Gia Đình Tại Quận 1',
    titleEn: 'Heritage Family Photography in District 1',
    descriptionVi:
      'Quận 1 lưu giữ linh hồn Sài Gòn với những hàng cây cổ thụ trăm tuổi, Thảo Cầm Viên rợp bóng mát và những kiến trúc di sản đầy cảm xúc. Phù hợp cho các gia đình yêu thích vẻ đẹp cổ điển, hoài niệm.',
    descriptionEn:
      'District 1 captures the timeless soul of Saigon with century-old shade trees, the historic Botanical Gardens, and iconic French colonial architecture.',
    popularSpotsVi: [
      'Thảo Cầm Viên Sài Gòn (Vườn hoa & cây cổ thụ)',
      'Công viên Tao Đàn',
      'Bưu điện Thành phố & Nhà thờ Đức Bà',
      'Đường sách Nguyễn Văn Bình',
    ],
    popularSpotsEn: [
      'Saigon Botanical Gardens & Greenhouses',
      'Tao Dan Shaded Park',
      'Saigon Central Post Office',
      'Nguyen Van Binh Book Street',
    ],
    tipsVi:
      'Thảo Cầm Viên vào sáng sớm các ngày trong tuần rất yên tĩnh, bóng cây xanh mát che chở bé khỏi nắng gắt.',
    tipsEn:
      'Saigon Zoo on weekday mornings is delightfully tranquil, with lush canopies protecting children from harsh heat.',
    coverImage: 'http://localhost:5000/uploads/1792256041024-9ba4f658-large.webp',
    order: 3,
  },
  {
    name: 'Quan 7',
    slug: 'quan-7',
    titleVi: 'Chụp Ảnh Gia Đình Tự Nhiên Tại Quận 7 & Phú Mỹ Hưng',
    titleEn: 'Outdoor Family Photography in District 7 & Phu My Hung',
    descriptionVi:
      'Quận 7 và khu đô thị Phú Mỹ Hưng nổi tiếng với không gian thoáng đãng, nhiều hồ nước, cầu đi bộ uốn lượn và những khu vườn hoa rực rỡ quanh năm.',
    descriptionEn:
      'District 7 and Phu My Hung are celebrated for breezy canals, picturesque pedestrian bridges, tranquil lakes, and beautifully manicured blooming gardens.',
    popularSpotsVi: [
      'Cầu Ánh Sao & Hồ Bán Nguyệt',
      'Công viên Hoa Anh Đào (Chong Nonsi / Midtown)',
      'Khu đồi cỏ công viên bờ sông Panorama',
      'Các con phố yên tĩnh tại khu Tân Phong',
    ],
    popularSpotsEn: [
      'Starlight Bridge & Crescent Lake',
      'Sakura Park Midtown',
      'Panorama Riverside Meadow',
      'Tan Phong Tree-Lined Avenues',
    ],
    tipsVi:
      'Quanh Hồ Bán Nguyệt rất thoáng gió từ sông thổi vào, hoàng hôn xuống tạo nên màu nước lấp lánh như tranh vẽ.',
    tipsEn:
      'The Crescent Lake area enjoys fresh river breezes, with golden hour reflecting breathtakingly across the open water.',
    coverImage: 'http://localhost:5000/uploads/1792256040074-597d2a53-large.webp',
    order: 4,
  },
  {
    name: 'Binh Thanh',
    slug: 'binh-thanh',
    titleVi: 'Chụp Ảnh Gia Đình Dã Ngoại Tại Bình Thạnh & Thanh Đa',
    titleEn: 'Rustic Family Sessions in Binh Thanh & Thanh Da',
    descriptionVi:
      'Bình Thạnh mang nét độc đáo hiếm có: một bên là nhịp sống hiện đại ven Landmark 81, một bên là không gian làng quê thanh bình mộc mạc trên bán đảo Thanh Đa.',
    descriptionEn:
      'Binh Thanh offers a unique contrast: world-class modern riverfront parks beside Landmark 81 and the quiet countryside charm of Thanh Da Peninsula.',
    popularSpotsVi: [
      'Bán đảo Thanh Đa (Đồng cỏ sông nước mộc mạc)',
      'Công viên Landmark 81 ven sông Sài Gòn',
      'Khu du lịch Văn Thánh / Bình Quới',
    ],
    popularSpotsEn: [
      'Thanh Da Peninsula Meadows',
      'Landmark 81 Central Riverside Park',
      'Van Thanh & Binh Quoi Green Grounds',
    ],
    tipsVi:
      'Thanh Đa rất thích hợp cho phong cách chụp vintage, dã ngoại nông trại mộc mạc và chân thật.',
    tipsEn:
      'Thanh Da is quintessential for rustic, pastoral family stories with earthy tones and open grasslands.',
    coverImage: 'http://localhost:5000/uploads/1792256041999-287988c0-large.webp',
    order: 5,
  },
  {
    name: 'Phu Nhuan',
    slug: 'phu-nhuan',
    titleVi: 'Chụp Ảnh Em Bé & Gia Đình Tại Phú Nhuận',
    titleEn: 'Charming Family & Baby Portraits in Phu Nhuan',
    descriptionVi:
      'Phú Nhuận sở hữu công viên Gia Định - lá phổi xanh lớn bậc nhất thành phố cùng nhiều quán cà phê ấm cúng và những con ngõ bình yên đậm chất Sài Gòn.',
    descriptionEn:
      'Phu Nhuan is home to Gia Dinh Park—one of the largest urban green canopies in the city—alongside charming intimate cafes and cozy neighborhoods.',
    popularSpotsVi: [
      'Công viên Gia Định (Khu rừng mát rượi & bãi cỏ lớn)',
      'Khu bờ kè kênh Nhiêu Lộc rợp bóng bằng lăng',
      'Các studio & quán cafe ánh sáng tự nhiên tại Phú Nhuận',
    ],
    popularSpotsEn: [
      'Gia Dinh Shady Urban Forest & Lawns',
      'Nhieu Loc Canal Tree-Lined Boulevard',
      'Natural Light Daylight Studios & Cafes',
    ],
    tipsVi:
      'Công viên Gia Định có tán cây rậm rạp giúp ánh sáng tản đều, chụp ảnh các bé ở đây rất êm dịu cho mắt và da.',
    tipsEn:
      'Gia Dinh Park offers extensive tree shade that diffuses midday sunlight, creating soft, flattering tones for baby portraits.',
    coverImage: 'http://localhost:5000/uploads/1792256041024-9ba4f658-large.webp',
    order: 6,
  },
];

export const seedLocationsIfEmpty = async (): Promise<void> => {
  const count = await Location.countDocuments();
  if (count === 0) {
    await Location.insertMany(DEFAULT_HCMC_LOCATIONS);
  }
};

export const getLocations = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const locations = await Location.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: locations,
      message: 'Locations retrieved successfully',
    });
  },
);

export const getLocationBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;

    const location = await Location.findOne({ slug: slug?.toLowerCase() });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    res.status(200).json({
      success: true,
      data: location,
      message: 'Location retrieved successfully',
    });
  },
);

export const createLocation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = createLocationSchema.parse(req.body);

    const slug = body.slug
      ? await generateUniqueSlug(Location, body.slug)
      : await generateUniqueSlug(Location, body.name);

    const location = await Location.create({
      ...body,
      slug,
    });

    res.status(201).json({
      success: true,
      data: location,
      message: 'Location created successfully',
    });
  },
);

export const updateLocation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updateLocationSchema.parse(req.body);

    const location = await Location.findById(id);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    if (body.slug && body.slug !== location.slug) {
      body.slug = await generateUniqueSlug(Location, body.slug, id);
    }

    Object.assign(location, body);
    await location.save();

    res.status(200).json({
      success: true,
      data: location,
      message: 'Location updated successfully',
    });
  },
);

export const deleteLocation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const location = await Location.findByIdAndDelete(id);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Location deleted successfully',
    });
  },
);
