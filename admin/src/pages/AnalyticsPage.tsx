import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorState } from '../components/common/ErrorState';
import { StatCard } from '../components/dashboard/StatCard';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { ViewsInquiriesChart } from '../components/dashboard/ViewsInquiriesChart';
import { TopGalleriesCard } from '../components/dashboard/TopGalleriesCard';
import { ServiceBreakdownChart } from '../components/analytics/ServiceBreakdownChart';
import { ReferrersChart } from '../components/analytics/ReferrersChart';
import analyticsService from '../services/analytics.service';
import { AnalyticsPeriod } from '../types';
import { Eye, Users, Mail, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const range = (searchParams.get('range') as AnalyticsPeriod) || '30d';

  const handlePeriodChange = (newRange: AnalyticsPeriod) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newRange === '30d') {
        next.delete('range');
      } else {
        next.set('range', newRange);
      }
      return next;
    });
  };

  const {
    data: analyticsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn: () => analyticsService.getAnalytics(range),
    staleTime: 60 * 1000,
  });

  const handleExportAll = () => {
    if (!analyticsData) return;
    analyticsService.exportToCSV(
      `chinphotos_analytics_${range}`,
      ['Ngày', 'Lượt xem (Views)', 'Khách duy nhất (Unique Visitors)'],
      analyticsData.dailyViews.map((d) => [d.date, d.views, d.uniqueVisitors]),
    );
  };

  if (isError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Không thể tải dữ liệu Thống kê"
          message="Đã có lỗi khi kết nối với máy chủ hoặc cơ sở dữ liệu. Vui lòng thử lại."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const summary = analyticsData?.summary;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Thống kê & Phân tích chi tiết"
        description="Đo lường hiệu quả chuyển đổi, mức độ quan tâm của khách hàng và các nguồn truy cập"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <PeriodSelector value={range} onChange={handlePeriodChange} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              aria-label="Làm mới dữ liệu"
            >
              Làm mới
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportAll}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Xuất báo cáo
            </Button>
          </div>
        }
      />

      {/* 4 Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng lượt xem"
          value={summary?.totalPageviews ? summary.totalPageviews.toLocaleString('vi-VN') : '0'}
          icon={<Eye className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Khách xem duy nhất"
          value={summary?.uniqueVisitors ? summary.uniqueVisitors.toLocaleString('vi-VN') : '0'}
          icon={<Users className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Yêu cầu chụp ảnh"
          value={summary?.totalInquiries ?? 0}
          icon={<Mail className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={summary ? `${summary.conversionRate}%` : '0%'}
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={isLoading}
        />
      </div>

      {/* Primary Trend Chart */}
      <ViewsInquiriesChart
        dailyViews={analyticsData?.dailyViews || []}
        dailyInquiries={analyticsData?.dailyInquiries || []}
        isLoading={isLoading}
        title="Lưu lượng truy cập & Tỷ lệ gửi yêu cầu"
        description="Biểu đồ so sánh lượng khách truy cập và tỷ lệ gửi form liên hệ qua các mốc thời gian"
      />

      {/* 2-Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceBreakdownChart
          data={analyticsData?.serviceBreakdown || []}
          isLoading={isLoading}
        />
        <ReferrersChart
          data={analyticsData?.topReferrers || []}
          isLoading={isLoading}
        />
      </div>

      {/* Top Galleries Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopGalleriesCard
          galleries={analyticsData?.topGalleries || []}
          isLoading={isLoading}
        />
        {/* Subscriber & Engagement Summary */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
              Bản tin & Khách hàng tiềm năng
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">
              Số lượng gia đình đã đăng ký nhận tư vấn và ưu đãi mùa chụp ảnh
            </p>

            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block mb-1">
                  Người đăng ký nhận tin
                </span>
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {summary?.totalSubscribers ?? 0}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">
                  Danh sách email thực tế
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block mb-1">
                  Tỷ lệ chuyển đổi
                </span>
                <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {summary ? `${summary.conversionRate}%` : '0%'}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">
                  Yêu cầu trên lượt xem
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
            Dữ liệu được cập nhật tự động sau mỗi phiên xem trang hoặc đăng ký từ khách ghé thăm.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
