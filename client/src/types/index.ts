export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  x?: string;
  threads?: string;
}

export interface MenuItem {
  label: string;
  path: string;
  order: number;
  isVisible: boolean;
}

export interface DefaultSeo {
  title: string;
  description: string;
  ogImage?: string;
}

export interface Settings {
  _id?: string;
  siteName: string;
  logo?: string;
  tagline?: string;
  bio?: string;
  heroImages: string[];
  social: SocialLinks;
  contactEmail: string;
  serviceAreas: string[];
  menu: MenuItem[];
  shopEnabled: boolean;
  defaultSeo: DefaultSeo;
  notifications?: {
    emailOnInquiry: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
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

export interface FAQ {
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
  faqs: FAQ[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImage {
  _id: string;
  gallery:
    | {
        _id: string;
        title: string;
        slug: string;
        status: string;
      }
    | string;
  url: string;
  storageKey: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  alt?: string;
  caption?: string;
  isFeatured: boolean;
  order: number;
  createdAt?: string;
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
  category:
    | {
        _id: string;
        name: string;
        slug: string;
      }
    | string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryDetailData {
  gallery: Gallery;
  images: GalleryImage[];
  navigation: {
    prev: { title: string; slug: string; coverImage?: string } | null;
    next: { title: string; slug: string; coverImage?: string } | null;
  };
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


