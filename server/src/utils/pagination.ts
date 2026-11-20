import { Request } from 'express';

export interface PaginationResult<T> {
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

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationOptions = (
  req: Request,
  defaultLimit = 20,
  maxLimit = 100,
): PaginationOptions => {
  const pageQuery = req.query['page'];
  const limitQuery = req.query['limit'];

  let page = 1;
  if (typeof pageQuery === 'string') {
    const parsedPage = parseInt(pageQuery, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  let limit = defaultLimit;
  if (typeof limitQuery === 'string') {
    const parsedLimit = parseInt(limitQuery, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, maxLimit);
    }
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginatedResponse = <T>(
  items: T[],
  total: number,
  options: PaginationOptions,
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / options.limit) || 1;
  return {
    items,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
      hasNextPage: options.page < totalPages,
      hasPrevPage: options.page > 1,
    },
  };
};
