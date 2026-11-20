import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { DailyViewItem, DailyInquiryItem } from '../../types';
import analyticsService from '../../services/analytics.service';
import { Download, Table as TableIcon, BarChart2 } from 'lucide-react';

export interface ViewsInquiriesChartProps {
  dailyViews: DailyViewItem[];
  dailyInquiries: DailyInquiryItem[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

interface MergedDataPoint {
  date: string;
  views: number;
  uniqueVisitors: number;
  inquiries: number;
}

export const ViewsInquiriesChart: React.FC<ViewsInquiriesChartProps> = ({
  dailyViews,
  dailyInquiries,
  isLoading = false,
  title = 'Lượt xem & Yêu cầu theo thời gian',
  description = 'Tương quan giữa số lượt ghé thăm và số lượng yêu cầu nhận được',
}) => {
  const [showTable, setShowTable] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-72 w-full" />
      </Card>
    );
  }

  // Merge views and inquiries by date
  const inquiriesMap = new Map<string, number>();
  dailyInquiries.forEach((item) => inquiriesMap.set(item.date, item.count));

  const chartData: MergedDataPoint[] = dailyViews.map((item) => ({
    date: item.date,
    views: item.views,
    uniqueVisitors: item.uniqueVisitors,
    inquiries: inquiriesMap.get(item.date) || 0,
  }));

  const handleExportCSV = () => {
    analyticsService.exportToCSV(
      'chinphotos_views_inquiries',
      ['Ngày', 'Lượt xem', 'Khách duy nhất', 'Yêu cầu (Inquiries)'],
      chartData.map((d) => [d.date, d.views, d.uniqueVisitors, d.inquiries]),
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTable((prev) => !prev)}
            leftIcon={showTable ? <BarChart2 className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
          >
            {showTable ? 'Xem biểu đồ' : 'Bảng số liệu'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Xuất CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu thống kê"
            description="Chưa có lượt xem nào được ghi nhận trong khoảng thời gian đã chọn."
          />
        ) : showTable ? (
          /* Accessible Table View for Screen Readers & Exact Numbers */
          <div className="max-h-80 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-850 font-semibold uppercase text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Ngày</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Lượt xem</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Khách duy nhất</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Inquiries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {chartData.map((row) => (
                  <tr key={row.date} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                    <td className="px-4 py-2 font-medium">{row.date}</td>
                    <td className="px-4 py-2 text-right">{row.views}</td>
                    <td className="px-4 py-2 text-right">{row.uniqueVisitors}</td>
                    <td className="px-4 py-2 text-right font-semibold text-brand-600 dark:text-brand-400">
                      {row.inquiries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Interactive Recharts Graph */
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B07B52" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B07B52" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(val: string) => {
                    const parts = val.split('-');
                    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-800 dark:bg-stone-900 text-xs">
                          <p className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                            {label}
                          </p>
                          <div className="space-y-1">
                            <p className="text-stone-600 dark:text-stone-300 flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-brand-500" />
                                Lượt xem:
                              </span>
                              <strong className="text-stone-900 dark:text-stone-100">
                                {payload[0]?.value}
                              </strong>
                            </p>
                            <p className="text-stone-600 dark:text-stone-300 flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-stone-400" />
                                Khách duy nhất:
                              </span>
                              <strong className="text-stone-900 dark:text-stone-100">
                                {payload[0]?.payload?.uniqueVisitors}
                              </strong>
                            </p>
                            <p className="text-stone-600 dark:text-stone-300 flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                Inquiries:
                              </span>
                              <strong className="text-amber-600 dark:text-amber-400">
                                {payload[1]?.value}
                              </strong>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  name="Lượt xem (Views)"
                  dataKey="views"
                  stroke="#B07B52"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#viewsGradient)"
                />
                <Bar
                  yAxisId="right"
                  name="Yêu cầu (Inquiries)"
                  dataKey="inquiries"
                  fill="#D97706"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
