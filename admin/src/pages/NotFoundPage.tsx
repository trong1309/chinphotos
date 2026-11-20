import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-bold tracking-tight text-slate-300 dark:text-slate-700 mb-4">
        404
      </h1>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
        Không tìm thấy trang yêu cầu
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        Đường dẫn không tồn tại trong hệ thống quản trị hoặc bạn không có quyền truy cập.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-600 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về trang tổng quan</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
