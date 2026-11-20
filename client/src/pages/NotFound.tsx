import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const title = isVi ? 'Không tìm thấy trang' : 'Page Not Found';
  const description = isVi
    ? 'Khung hình hoặc đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.'
    : 'The frame you are looking for does not exist or may have been relocated.';

  return (
    <>
      <Seo title={title} description={description} />
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
        <span className="font-serif text-8xl font-light text-neutral-300 dark:text-neutral-700 block mb-4">
          404
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-light mb-4 text-neutral-900 dark:text-cream-100">
          {title}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mb-8 text-sm font-light">
          {description}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-cream-100 dark:text-neutral-900 text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isVi ? 'Quay về Trang chủ' : 'Return Home'}</span>
        </Link>
      </div>
    </>
  );
};

export default NotFound;
