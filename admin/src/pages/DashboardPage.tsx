import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorState } from '../components/common/ErrorState';
import { StatCard } from '../components/dashboard/StatCard';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { ViewsInquiriesChart } from '../components/dashboard/ViewsInquiriesChart';
import { RecentInquiriesCard } from '../components/dashboard/RecentInquiriesCard';
import { TopGalleriesCard } from '../components/dashboard/TopGalleriesCard';
import analyticsService from '../services/analytics.service';
import inquiriesService from '../services/inquiries.service';
import { useUiStore } from '../stores/ui.store';
import { AnalyticsPeriod } from '../types';
import { Eye, Mail, Image, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang } = useUiStore();
  const isVi = lang === 'vi';
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
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn: () => analyticsService.getAnalytics(range),
    staleTime: 60 * 1000,
  });

  const {
    data: inquiriesData,
    isLoading: isInquiriesLoading,
    refetch: refetchInquiries,
  } = useQuery({
    queryKey: ['admin', 'inquiries', 'recent'],
    queryFn: () => inquiriesService.getInquiries({ page: 1, limit: 5 }),
    staleTime: 60 * 1000,
  });

  const handleRefresh = () => {
    refetchAnalytics();
    refetchInquiries();
  };

  if (isAnalyticsError) {
    return (
      <div className="py-8">
        <ErrorState
          title={isVi ? 'Không thể tải dữ liệu Tổng quan' : 'Failed to load Dashboard data'}
          message={
            isVi
              ? 'Đã có lỗi khi kết nối với máy chủ hoặc cơ sở dữ liệu. Vui lòng thử lại.'
              : 'An error occurred while connecting to the server. Please try again.'
          }
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  const summary = analyticsData?.summary;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isVi ? 'Tổng quan Studio' : 'Studio Overview'}
        description={
          isVi
            ? 'Theo dõi hoạt động, lưu lượng truy cập và yêu cầu đặt lịch theo thời gian thực'
            : 'Monitor real-time studio traffic, galleries, and client booking inquiries'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <PeriodSelector value={range} onChange={handlePeriodChange} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              aria-label={isVi ? 'Làm mới dữ liệu' : 'Refresh data'}
            >
              {isVi ? 'Làm mới' : 'Refresh'}
            </Button>
          </div>
        }
      />

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isVi ? 'Tổng lượt xem' : 'Total Pageviews'}
          value={
            summary?.totalPageviews
              ? summary.totalPageviews.toLocaleString(isVi ? 'vi-VN' : 'en-US')
              : '0'
          }
          icon={<Eye className="h-5 w-5" />}
          isLoading={isAnalyticsLoading}
        />
        <StatCard
          title={isVi ? 'Yêu cầu đặt lịch' : 'Client Inquiries'}
          value={summary?.totalInquiries ?? 0}
          icon={<Mail className="h-5 w-5" />}
          isLoading={isAnalyticsLoading}
        />
        <StatCard
          title={isVi ? 'Bộ sưu tập đã đăng' : 'Published Galleries'}
          value={summary?.totalGalleries ?? 0}
          icon={<Image className="h-5 w-5" />}
          isLoading={isAnalyticsLoading}
        />
        <StatCard
          title={isVi ? 'Tỷ lệ chuyển đổi' : 'Conversion Rate'}
          value={summary ? `${summary.conversionRate}%` : '0%'}
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={isAnalyticsLoading}
        />
      </div>

      {/* Main Chart */}
      <ViewsInquiriesChart
        dailyViews={analyticsData?.dailyViews || []}
        dailyInquiries={analyticsData?.dailyInquiries || []}
        isLoading={isAnalyticsLoading}
      />

      {/* 2-Column Split: Recent Inquiries & Top Galleries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInquiriesCard
          inquiries={inquiriesData?.items || []}
          isLoading={isInquiriesLoading}
        />
        <TopGalleriesCard
          galleries={analyticsData?.topGalleries || []}
          isLoading={isAnalyticsLoading}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
