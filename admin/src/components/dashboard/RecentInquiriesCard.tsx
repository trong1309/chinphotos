import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Inquiry } from '../../types';
import { ArrowRight, Mail, Phone, Calendar } from 'lucide-react';

export interface RecentInquiriesCardProps {
  inquiries: Inquiry[];
  isLoading?: boolean;
}

export const RecentInquiriesCard: React.FC<RecentInquiriesCardProps> = ({
  inquiries,
  isLoading = false,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Yêu cầu gần đây</CardTitle>
          <CardDescription>Những khách hàng mới liên hệ hoặc đặt lịch</CardDescription>
        </div>
        <Link
          to="/inquiries"
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
        ) : inquiries.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Chưa có yêu cầu nào"
              description="Hộp thư yêu cầu chụp ảnh hiện đang trống."
            />
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {inquiries.slice(0, 5).map((inq) => (
              <div
                key={inq._id}
                className="p-4 hover:bg-stone-50/75 dark:hover:bg-stone-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      {inq.name}
                    </span>
                    <StatusBadge status={inq.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {inq.email}
                    </span>
                    {inq.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {inq.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-xs shrink-0">
                  <span className="font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                    {inq.serviceType || 'Chung'}
                  </span>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {inq.createdAt
                      ? new Date(inq.createdAt).toLocaleDateString('vi-VN')
                      : 'Mới đây'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
