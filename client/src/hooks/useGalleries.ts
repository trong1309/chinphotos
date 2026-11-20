import { useQuery } from '@tanstack/react-query';
import { getGalleries, GetGalleriesParams } from '../services/galleries.service';
import { PaginatedData, Gallery } from '../types';

export const useGalleries = (params?: GetGalleriesParams) => {
  return useQuery<PaginatedData<Gallery>>({
    queryKey: ['galleries', params],
    queryFn: () => getGalleries(params),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGalleries;
