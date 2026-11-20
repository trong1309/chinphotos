import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Eye, Edit3, Columns } from 'lucide-react';
import { clsx } from 'clsx';

export interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  error?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung định dạng Markdown...',
  minHeight = '220px',
  error,
}) => {
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');

  return (
    <div className="space-y-1.5">
      <div
        className={clsx(
          'rounded-xl border overflow-hidden bg-white dark:bg-stone-900 transition-colors',
          error
            ? 'border-rose-500'
            : 'border-stone-300 dark:border-stone-700 focus-within:border-brand-500',
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-xs">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Markdown
            </span>
            <span className="hidden sm:inline text-[11px]">
              Hỗ trợ **in đậm**, *in nghiêng*, danh sách (-), tiêu đề (##)
            </span>
          </div>

          <div className="inline-flex items-center rounded-lg bg-stone-200/70 dark:bg-stone-800 p-0.5">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                mode === 'edit'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900',
              )}
            >
              <Edit3 className="w-3 h-3" /> Soạn
            </button>
            <button
              type="button"
              onClick={() => setMode('split')}
              className={clsx(
                'hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                mode === 'split'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900',
              )}
            >
              <Columns className="w-3 h-3" /> 2 cột
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                mode === 'preview'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900',
              )}
            >
              <Eye className="w-3 h-3" /> Xem trước
            </button>
          </div>
        </div>

        {/* Editor & Preview Panes */}
        <div
          className={clsx(
            'grid divide-y sm:divide-y-0 sm:divide-x divide-stone-200 dark:divide-stone-800',
            mode === 'split' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1',
          )}
          style={{ minHeight }}
        >
          {(mode === 'edit' || mode === 'split') && (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full min-h-[200px] p-3.5 text-sm font-mono bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none resize-y"
            />
          )}

          {(mode === 'preview' || mode === 'split') && (
            <div className="p-3.5 text-sm text-stone-700 dark:text-stone-300 prose prose-sm dark:prose-invert max-w-none overflow-y-auto bg-stone-50/40 dark:bg-stone-900/40">
              {value.trim() ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <p className="text-xs italic text-stone-400">
                  Xem trước nội dung sẽ hiển thị tại đây...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
};
