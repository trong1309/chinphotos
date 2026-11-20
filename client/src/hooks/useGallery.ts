import { useQuery } from '@tanstack/react-query';
import { getGalleryBySlug } from '../services/galleries.service';
import { GalleryDetailData } from '../types';

export const useGallery = (slug?: string) => {
  return useQuery<GalleryDetailData>({
    queryKey: ['gallery', slug],
    queryFn: () => {
      if (!slug) throw new Error('Gallery slug is required');
      return getGalleryBySlug(slug);
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      // Don't retry if 404 (e.g. draft gallery)
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

export default useGallery;
