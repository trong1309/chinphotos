import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/categories.service';
import { Category } from '../types';

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
};

export default useCategories;
