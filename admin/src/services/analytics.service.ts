import api from './http/api';
import {
  AnalyticsPeriod,
  AnalyticsResponseData,
  ApiResponse,
  DailyViewItem,
  DailyInquiryItem,
  ServiceBreakdownItem,
  TopGalleryItem,
  TopReferrerItem,
} from '../types';
import { mockDelay, initialMockGalleries } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

// Helper to generate mock daily data
function generateMockDailyData(range: AnalyticsPeriod): {
  views: DailyViewItem[];
  inquiries: DailyInquiryItem[];
} {
  const views: DailyViewItem[] = [];
  const inquiries: DailyInquiryItem[] = [];
  const now = new Date();

  let days = 30;
  if (range === '7d') days = 7;
  if (range === '3m') days = 90;
  if (range === '12m') days = 365;

  const step = range === '12m' ? 30 : range === '3m' ? 7 : 1;
  const count = Math.ceil(days / step);

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * step);
    const dateStr = d.toISOString().split('T')[0]!;

    const baseViews = 25 + Math.floor(Math.sin(i / 2) * 15) + (i % 5) * 8;
    const uv = Math.max(5, Math.floor(baseViews * 0.7));
    const inq = Math.floor(baseViews * 0.06);

    views.push({
      date: dateStr,
      views: baseViews,
      uniqueVisitors: uv,
    });

    inquiries.push({
      date: dateStr,
      count: inq,
    });
  }

  return { views, inquiries };
}

export const analyticsService = {
  getAnalytics: async (range: AnalyticsPeriod = '30d'): Promise<AnalyticsResponseData> => {
    if (isMock) {
      await mockDelay(350);
      const { views, inquiries } = generateMockDailyData(range);

      const totalPageviews = views.reduce((acc, v) => acc + v.views, 0);
      const uniqueVisitors = views.reduce((acc, v) => acc + v.uniqueVisitors, 0);
      const totalInquiries = inquiries.reduce((acc, i) => acc + i.count, 0);
      const conversionRate =
        totalPageviews > 0
          ? parseFloat(((totalInquiries / totalPageviews) * 100).toFixed(2))
          : 0;

      const serviceBreakdown: ServiceBreakdownItem[] = [
        { serviceType: 'Family Portraits', count: Math.round(totalInquiries * 0.45) },
        { serviceType: 'Childhood & Baby', count: Math.round(totalInquiries * 0.3) },
        { serviceType: 'Home Lifestyle', count: Math.round(totalInquiries * 0.15) },
        { serviceType: 'Maternity', count: Math.round(totalInquiries * 0.1) },
      ];

      const topGalleries: TopGalleryItem[] = initialMockGalleries.slice(0, 5).map((g, idx) => ({
        id: g._id,
        title: g.title,
        slug: g.slug,
        coverImage: g.coverImage || '',
        views: Math.round(totalPageviews * (0.35 - idx * 0.06)),
      }));

      const topReferrers: TopReferrerItem[] = [
        { referrer: 'Instagram Bio Link', count: Math.round(totalPageviews * 0.38) },
        { referrer: 'Google Organic Search', count: Math.round(totalPageviews * 0.28) },
        { referrer: 'Facebook Page & Groups', count: Math.round(totalPageviews * 0.18) },
        { referrer: 'Direct / Word of mouth', count: Math.round(totalPageviews * 0.11) },
        { referrer: 'Zalo / WhatsApp', count: Math.round(totalPageviews * 0.05) },
      ];

      return {
        range,
        summary: {
          totalPageviews,
          uniqueVisitors,
          totalInquiries,
          conversionRate,
          totalGalleries: initialMockGalleries.length,
          totalSubscribers: 142,
        },
        dailyViews: views,
        dailyInquiries: inquiries,
        serviceBreakdown,
        topGalleries,
        topReferrers,
      };
    }

    // HTTP Real Backend
    const [analyticsRes, galleriesRes] = await Promise.allSettled([
      api.get<ApiResponse<AnalyticsResponseData>>(`/analytics/summary?range=${range}`),
      api.get<ApiResponse<unknown>>('/galleries?limit=1'),
    ]);

    if (analyticsRes.status === 'rejected') {
      throw analyticsRes.reason;
    }

    const data = analyticsRes.value.data.data;

    let totalGalleries = 0;
    if (galleriesRes.status === 'fulfilled' && galleriesRes.value.data.data) {
      const gData = galleriesRes.value.data.data as { pagination?: { total?: number } };
      if (typeof gData.pagination?.total === 'number') {
        totalGalleries = gData.pagination.total;
      }
    }

    return {
      ...data,
      summary: {
        ...data.summary,
        totalGalleries,
        totalSubscribers: data.summary.totalSubscribers ?? 0,
      },
    };
  },

  exportToCSV: (filename: string, headers: string[], rows: (string | number)[][]): void => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default analyticsService;
