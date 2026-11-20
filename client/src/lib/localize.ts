import { Category, Service } from '../types';

const CATEGORY_EN_MAP: Record<string, { name: string; description: string }> = {
  family: {
    name: 'Family Stories',
    description:
      'Heartfelt moments of connection, warm embraces, and candid laughter with your loved ones.',
  },
  kids: {
    name: 'Childhood & Kids',
    description:
      'Capturing pure innocence, curious eyes, and every natural milestone as your little ones grow.',
  },
  outdoor: {
    name: 'Saigon Outdoor',
    description:
      'Sunlit picnics, open green meadows, and breezy golden-hour walks across Ho Chi Minh City.',
  },
  'at-home': {
    name: 'Intimate At-Home',
    description:
      'Cozy, unhurried documentary sessions inside the familiar comfort of your own home.',
  },
};

const SERVICE_EN_MAP: Record<
  string,
  { title: string; summary: string; inclusions: string[] }
> = {
  'family-sessions': {
    title: 'Full Family Session',
    summary:
      'A complete 90–120 minute storytelling session for 3 to 8 family members at home or an outdoor location in Ho Chi Minh City.',
    inclusions: [
      '90 to 120 minutes of unhurried photography',
      'Flexible at-home or outdoor location in HCMC',
      'All high-resolution color-graded original files',
      '45 finely retouched master photographs',
      'Private online gallery with unlimited downloads',
      'Wardrobe color palette & session styling guide',
    ],
  },
  'kids-portraits': {
    title: 'Childhood Portraits',
    summary:
      'A gentle portrait session dedicated to your child’s milestones, playful expressions, and genuine personality.',
    inclusions: [
      '60 minutes paced around your child’s rhythm',
      'Natural-light studio or lush green park setting',
      '30 finely retouched high-resolution portraits',
      'All high-resolution original digital files',
      'Complimentary set of 10 fine-art prints (13×18cm)',
    ],
  },
  'mini-sessions': {
    title: 'Mini Session',
    summary:
      'A focused, joyful 45-minute session ideal for seasonal family updates or celebrating a petite milestone.',
    inclusions: [
      '45 minutes of lively, candid photography',
      '1 curated location in Ho Chi Minh City',
      '20 finely retouched high-resolution photographs',
      'All original digital files included',
      'Express 5-day gallery turnaround',
    ],
  },
};

export const localizeTagline = (tagline: string | undefined, isVi: boolean): string => {
  if (!tagline) {
    return isVi
      ? 'Nhiếp ảnh Gia đình & Tuổi thơ Tự nhiên'
      : 'Natural Family & Childhood Photography';
  }
  if (tagline.includes('·')) {
    const parts = tagline.split('·').map((s) => s.trim());
    return (isVi ? parts[0] : parts[1] || parts[0]) || tagline;
  }
  if (!isVi && tagline === 'Nhiếp ảnh Gia đình & Tuổi thơ Tự nhiên') {
    return 'Natural Family & Childhood Photography';
  }
  return tagline;
};

export const localizeBio = (bio: string | undefined, isVi: boolean, fallback: string): string => {
  if (!bio) return fallback;
  if (
    !isVi &&
    bio.startsWith('Lưu giữ những khoảnh khắc gắn kết chân thật')
  ) {
    return fallback;
  }
  return bio;
};

export const localizeCategory = (
  category: Category,
  isVi: boolean,
): { name: string; description: string; badge: string } => {
  if (isVi) {
    const viBadgeMap: Record<string, string> = {
      family: 'GIA ĐÌNH',
      kids: 'TUỔI THƠ',
      outdoor: 'NGOẠI CẢNH',
      'at-home': 'TẠI NHÀ',
    };
    return {
      name: category.name,
      description: category.description || '',
      badge: viBadgeMap[category.slug] || category.name.toUpperCase(),
    };
  }

  const enData = CATEGORY_EN_MAP[category.slug];
  return {
    name: enData?.name || category.name,
    description: enData?.description || category.description || '',
    badge: category.slug.replace(/-/g, ' ').toUpperCase(),
  };
};

export const localizeService = (
  service: Service,
  isVi: boolean,
): { title: string; summary: string; inclusions: string[] } => {
  if (isVi) {
    return {
      title: service.title.replace(/\s*\(Mini Session\)/gi, ''),
      summary: service.summary || service.content.slice(0, 180),
      inclusions: service.inclusions || [],
    };
  }

  const enData = SERVICE_EN_MAP[service.slug];
  return {
    title: enData?.title || service.title,
    summary: enData?.summary || service.summary || service.content.slice(0, 180),
    inclusions: enData?.inclusions || service.inclusions || [],
  };
};
