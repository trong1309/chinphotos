import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface TableStateOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export function useTableState(options: TableStateOptions = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'desc',
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const p = parseInt(searchParams.get('page') || '', 10);
    return isNaN(p) || p < 1 ? defaultPage : p;
  }, [searchParams, defaultPage]);

  const pageSize = useMemo(() => {
    const ps = parseInt(searchParams.get('pageSize') || '', 10);
    return isNaN(ps) || ps < 1 ? defaultPageSize : ps;
  }, [searchParams, defaultPageSize]);

  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || defaultSortBy;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder;

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPage === defaultPage) {
          next.delete('page');
        } else {
          next.set('page', String(newPage));
        }
        return next;
      });
    },
    [setSearchParams, defaultPage],
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPageSize === defaultPageSize) {
          next.delete('pageSize');
        } else {
          next.set('pageSize', String(newPageSize));
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams, defaultPageSize],
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!newSearch) {
          next.delete('search');
        } else {
          next.set('search', newSearch);
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const setSorting = useCallback(
    (newSortBy: string, newSortOrder?: 'asc' | 'desc') => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const currentSortBy = next.get('sortBy') || defaultSortBy;
        const currentSortOrder = next.get('sortOrder') || defaultSortOrder;

        let targetOrder: 'asc' | 'desc' = 'asc';
        if (newSortOrder) {
          targetOrder = newSortOrder;
        } else if (currentSortBy === newSortBy) {
          targetOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        }

        next.set('sortBy', newSortBy);
        next.set('sortOrder', targetOrder);
        return next;
      });
    },
    [setSearchParams, defaultSortBy, defaultSortOrder],
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === undefined || value === null || value === '' || value === 'all') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setSorting,
    setFilter,
    resetFilters,
    searchParams,
  };
}
