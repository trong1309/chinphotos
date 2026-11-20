import { useQuery } from '@tanstack/react-query';
import { getServices, getServiceBySlug } from '../services/services.service';
import { Service } from '../types';

export const useServices = () => {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: getServices,
    staleTime: 5 * 60 * 1000,
  });
};

export const useService = (slug?: string) => {
  return useQuery<Service>({
    queryKey: ['service', slug],
    queryFn: () => {
      if (!slug) throw new Error('Service slug is required');
      return getServiceBySlug(slug);
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
};

export default useServices;
