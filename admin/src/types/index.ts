export type Role = 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order: number;
  isVisible: boolean;
  galleryCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorCredit {
  role: string;
  name: string;
  url?: string;
}

export interface Gallery {
  _id: string;
  title: string;
  slug: string;
  category: Category | string;
  location?: string;
  eventDate?: string;
  description?: string;
  vendors?: VendorCredit[];
  coverImage?: string;
  status: 'draft' | 'published';
  isUnlisted: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
  imageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImageItem {
  _id: string;
  gallery: string | Gallery;
  url: string;
  storageKey: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  alt?: string;
  caption?: string;
  isFeatured: boolean;
  order: number;
  focalPoint?: {
    x: number;
    y: number;
  };
  createdAt?: string;
}

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  heroImage?: string;
  content: string;
  priceFrom?: number;
  inclusions: string[];
  faqs: ServiceFAQ[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationItem {
  _id: string;
  name: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  popularSpotsVi: string[];
  popularSpotsEn: string[];
  tipsVi: string;
  tipsEn: string;
  coverImage?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  eventDate?: string;
  location?: string;
  adultsCount?: number;
  childrenInfo?: string;
  message: string;
  source?: string;
  status: InquiryStatus;
  internalNote?: string;
  lang?: 'vi' | 'en';
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscriber {
  _id: string;
  email: string;
  createdAt?: string;
}

export interface MenuItemConfig {
  label: string;
  path: string;
  order: number;
  isVisible: boolean;
}

export interface Settings {
  _id?: string;
  siteName: string;
  logo?: string;
  tagline?: string;
  bio?: string;
  heroImages: string[];
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    x?: string;
    threads?: string;
  };
  contactEmail: string;
  serviceAreas: string[];
  menu?: MenuItemConfig[];
  defaultSeo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  notifications?: {
    emailOnInquiry: boolean;
  };
}

export type AnalyticsPeriod = '7d' | '30d' | '3m' | '12m';

export interface DailyViewItem {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export interface DailyInquiryItem {
  date: string;
  count: number;
}

export interface ServiceBreakdownItem {
  serviceType: string;
  count: number;
}

export interface TopGalleryItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  views: number;
}

export interface TopReferrerItem {
  referrer: string;
  count: number;
}

export interface AnalyticsResponseData {
  range: AnalyticsPeriod;
  summary: {
    totalPageviews: number;
    uniqueVisitors: number;
    totalInquiries: number;
    conversionRate: number;
    totalGalleries?: number;
    totalSubscribers?: number;
  };
  dailyViews: DailyViewItem[];
  dailyInquiries: DailyInquiryItem[];
  serviceBreakdown: ServiceBreakdownItem[];
  topGalleries: TopGalleryItem[];
  topReferrers: TopReferrerItem[];
}

export interface AnalyticsSummary {
  todayViews: number;
  weekViews: number;
  monthViews: number;
  totalInquiries: number;
  newInquiries: number;
  totalGalleries: number;
  totalImages: number;
  viewsOverTime: { date: string; views: number }[];
  popularGalleries: { title: string; views: number; slug: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
