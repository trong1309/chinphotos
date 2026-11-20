import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { TopReferrerItem } from '../../types';
import analyticsService from '../../services/analytics.service';
import { Download, Table as TableIcon, Globe } from 'lucide-react';

export interface ReferrersChartProps {
  data: TopReferrerItem[];
  isLoading?: boolean;
}

export const ReferrersChart: React.FC<ReferrersChartProps> = ({
  data,
  isLoading = false,
}) => {
  const [showTable, setShowTable] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-60 mb-6" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  const cleanLabel = (url: string) => {
    if (!url) return 'Trực tiếp / Không rõ';
    try {
      if (url.includes('instagram.com')) return 'Instagram';
      if (url.includes('facebook.com')) return 'Facebook';
      if (url.includes('google.com')) return 'Google Tìm kiếm';
      if (url.includes('zalo.me')) return 'Zalo';
      if (url.includes('/portfolio/')) return 'Trang Bộ sưu tập';
      if (url.includes('/contact')) return 'Trang Liên hệ';
      if (url.includes('/about')) return 'Trang Giới thiệu';
      if (url.includes('localhost') || url.includes('chinphotos')) return 'Nội bộ website';
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleExportCSV = () => {
    analyticsService.exportToCSV(
      'chinphotos_traffic_referrers',
      ['Nguồn truy cập', 'Lượt truy cập', 'Tỷ lệ %'],
      data.map((item) => [
        cleanLabel(item.referrer),
        item.count,
        total > 0 ? `${((item.count / total) * 100).toFixed(1)}%` : '0%',
      ]),
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle>Nguồn truy cập (Referrers)</CardTitle>
          <CardDescription>Các kênh mang lại lưu lượng xem portfolio nhiều nhất</CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTable((prev) => !prev)}
            leftIcon={<TableIcon className="h-3.5 w-3.5" />}
          >
            {showTable ? 'Thanh tiến độ' : 'Bảng'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {data.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu nguồn khách"
            description="Chưa có thông tin giới thiệu lượt xem trong kỳ này."
          />
        ) : showTable ? (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-850 font-semibold uppercase text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Nguồn</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Lượt</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Tỷ trọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {data.map((item) => {
                  const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={item.referrer} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                      <td className="px-4 py-2 font-medium truncate max-w-[200px]" title={item.referrer}>
                        {cleanLabel(item.referrer)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{item.count}</td>
                      <td className="px-4 py-2 text-right text-stone-500">{percent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3.5 py-1">
            {data.slice(0, 6).map((item, idx) => {
              const percent = Math.round((item.count / maxCount) * 100);
              const share = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';

              return (
                <div key={item.referrer || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 truncate max-w-[220px]" title={item.referrer}>
                      <Globe className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {cleanLabel(item.referrer)}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 font-medium shrink-0">
                      <strong className="text-stone-900 dark:text-stone-100">{item.count}</strong> lượt ({share}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
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
