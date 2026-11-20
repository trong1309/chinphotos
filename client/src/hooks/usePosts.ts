import { useQuery } from '@tanstack/react-query';
import { getPosts, GetPostsParams } from '../services/posts.service';
import { PaginatedData, Post } from '../types';

export const usePosts = (params?: GetPostsParams) => {
  return useQuery<PaginatedData<Post>>({
    queryKey: ['posts', params],
    queryFn: () => getPosts(params),
    staleTime: 5 * 60 * 1000,
  });
};

export default usePosts;
