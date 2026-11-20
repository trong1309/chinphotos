import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../services/settings.service';
import { Settings } from '../types';

export const useSettings = () => {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export default useSettings;
