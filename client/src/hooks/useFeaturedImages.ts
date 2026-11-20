import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeaturedImages } from '../services/images.service';
import { PaginatedData, GalleryImage } from '../types';

export const useFeaturedImages = (limit = 24) => {
  return useInfiniteQuery<PaginatedData<GalleryImage>, Error>({
    queryKey: ['featured-images', limit],
    queryFn: ({ pageParam = 1 }) =>
      getFeaturedImages({ page: pageParam as number, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export default useFeaturedImages;
