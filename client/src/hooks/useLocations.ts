import { useQuery } from '@tanstack/react-query';
import { getLocations, getLocationBySlug } from '../services/locations.service';
import { LocationItem } from '../types';

export const useLocations = () => {
  return useQuery<LocationItem[]>({
    queryKey: ['locations'],
    queryFn: getLocations,
    staleTime: 10 * 60 * 1000,
  });
};

export const useLocation = (slug?: string) => {
  return useQuery<LocationItem>({
    queryKey: ['location', slug],
    queryFn: () => {
      if (!slug) throw new Error('Location slug is required');
      return getLocationBySlug(slug);
    },
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });
};

export default useLocations;
