import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ServiceBreakdownItem } from '../../types';
import analyticsService from '../../services/analytics.service';
import { Download, Table as TableIcon, PieChart as PieIcon } from 'lucide-react';

export interface ServiceBreakdownChartProps {
  data: ServiceBreakdownItem[];
  isLoading?: boolean;
}

const COLORS = ['#B07B52', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777'];

export const ServiceBreakdownChart: React.FC<ServiceBreakdownChartProps> = ({
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

  const handleExportCSV = () => {
    analyticsService.exportToCSV(
      'chinphotos_service_breakdown',
      ['Loại dịch vụ', 'Số lượng yêu cầu', 'Tỷ lệ %'],
      data.map((item) => [
        item.serviceType,
        item.count,
        total > 0 ? `${((item.count / total) * 100).toFixed(1)}%` : '0%',
      ]),
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle>Nhu cầu theo loại dịch vụ</CardTitle>
          <CardDescription>Tỷ trọng các gói chụp ảnh được khách hàng quan tâm</CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTable((prev) => !prev)}
            leftIcon={showTable ? <PieIcon className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
          >
            {showTable ? 'Biểu đồ' : 'Bảng'}
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
            title="Chưa có dữ liệu dịch vụ"
            description="Chưa nhận được yêu cầu nào trong kỳ này."
          />
        ) : showTable ? (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-850 font-semibold uppercase text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Dịch vụ</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Số yêu cầu</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {data.map((item, idx) => {
                  const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={item.serviceType || idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                      <td className="px-4 py-2 font-medium flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        {item.serviceType}
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
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="serviceType"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      const val = Number(item?.value || 0);
                      const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                      return (
                        <div className="rounded-lg border border-stone-200 bg-white p-2.5 shadow-lg text-xs dark:border-stone-800 dark:bg-stone-900">
                          <p className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                            {item?.name}
                          </p>
                          <p className="text-stone-600 dark:text-stone-300">
                            Số yêu cầu: <strong>{val}</strong> ({pct}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
