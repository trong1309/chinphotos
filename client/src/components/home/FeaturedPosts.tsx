import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePosts } from '../../hooks/usePosts';
import { Post } from '../../types';

export const FeaturedPosts: React.FC = () => {
  const { data, isLoading, isError } = usePosts({ limit: 3 });
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return <FeaturedPostsSkeleton />;
  }

  const posts = data?.items;

  if (isError || !posts || posts.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (i18n.language.startsWith('vi')) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <section
      className="py-24 sm:py-32 px-6 sm:px-8 bg-cream-100/50 dark:bg-cream-950/60 transition-colors border-b border-neutral-200/60 dark:border-neutral-800/80"
      aria-label="Journal Articles"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent-700 dark:text-accent-400 font-semibold mb-2">
              {t('journal.subtitle')}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 dark:text-cream-100 font-normal tracking-tight">
              {t('journal.title')}
            </h2>
          </div>
          <Link
            to="/journal"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-neutral-700 dark:text-cream-200 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
          >
            <span>{t('journal.viewAll')}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: Post) => {
            const coverImage =
              post.coverImage ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80';
            const dateStr = formatDate(post.publishedAt || post.createdAt);

            return (
              <article
                key={post._id}
                className="group flex flex-col bg-white dark:bg-cream-900/40 rounded-sm overflow-hidden border border-neutral-200/70 dark:border-neutral-800/80 hover:shadow-lg transition-all duration-300"
              >
                {/* Visual Cover */}
                <Link
                  to={`/journal/${post.slug}`}
                  className="relative aspect-[16/10] overflow-hidden bg-neutral-900 block"
                  aria-label={`Read story: ${post.title}`}
                >
                  <img
                    src={coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {post.category && (
                    <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest rounded-sm font-mono">
                      {post.category}
                    </div>
                  )}
                </Link>

                {/* Article Info */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {dateStr && (
                      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </div>
                    )}

                    <h3 className="font-serif text-xl sm:text-2xl text-neutral-900 dark:text-cream-100 font-normal leading-snug mb-3 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                      <Link to={`/journal/${post.slug}`}>{post.title}</Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-light line-clamp-3 leading-relaxed mb-6">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/journal/${post.slug}`}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900 dark:text-cream-100 hover:text-accent-600 dark:hover:text-accent-400 transition-colors pt-4 border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <span>{t('journal.readStory')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const FeaturedPostsSkeleton: React.FC = () => (
  <section className="py-24 sm:py-32 px-6 sm:px-8 bg-cream-100/50 dark:bg-cream-950/60">
    <div className="max-w-7xl mx-auto">
      <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-3" />
      <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[16/10] bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedPosts;
