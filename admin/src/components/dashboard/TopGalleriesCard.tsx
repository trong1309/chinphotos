import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { TopGalleryItem } from '../../types';
import { ArrowRight, Eye, Image as ImageIcon } from 'lucide-react';

export interface TopGalleriesCardProps {
  galleries: TopGalleryItem[];
  isLoading?: boolean;
}

export const TopGalleriesCard: React.FC<TopGalleriesCardProps> = ({
  galleries,
  isLoading = false,
}) => {
  const maxViews = Math.max(...galleries.map((g) => g.views), 1);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Top bộ sưu tập</CardTitle>
          <CardDescription>Những album ảnh có lượng tương tác cao nhất</CardDescription>
        </div>
        <Link
          to="/galleries"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          Xem tất cả
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="p-5 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : galleries.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Chưa có số liệu"
              description="Chưa có bộ sưu tập nào được xem trong kỳ này."
            />
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {galleries.slice(0, 5).map((gal, idx) => {
              const percent = Math.round((gal.views / maxViews) * 100);

              return (
                <div
                  key={gal.id || `gal-${idx}`}
                  className="p-4 hover:bg-stone-50/75 dark:hover:bg-stone-850/50 transition-colors flex items-center gap-3.5"
                >
                  <span className="font-bold text-xs text-stone-400 w-4 text-center">
                    #{idx + 1}
                  </span>

                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    {gal.coverImage ? (
                      <img
                        src={gal.coverImage}
                        alt={gal.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-400">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {gal.title}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0">
                        <Eye className="h-3 w-3 text-brand-500" />
                        {gal.views.toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
