import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Image as ImageIcon,
  FolderTree,
  MapPin,
  Sparkles,
  Inbox,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { lang } = useUiStore();
  const isVi = lang === 'vi';
  const [query, setQuery] = useState('');

  const commands = [
    {
      label: isVi ? 'Tổng quan Studio' : 'Studio Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: isVi ? 'Quản lý Bộ sưu tập' : 'Manage Galleries',
      path: '/galleries',
      icon: ImageIcon,
    },
    {
      label: isVi ? 'Quản lý Danh mục' : 'Manage Categories',
      path: '/categories',
      icon: FolderTree,
    },
    {
      label: isVi ? 'Quản lý Khu vực TP.HCM' : 'Manage Locations',
      path: '/locations',
      icon: MapPin,
    },
    {
      label: isVi ? 'Quản lý Gói dịch vụ' : 'Manage Services',
      path: '/services',
      icon: Sparkles,
    },
    {
      label: isVi ? 'Quản lý Lời nhắn khách hàng' : 'Client Inquiries',
      path: '/inquiries',
      icon: Inbox,
    },
    {
      label: isVi ? 'Báo cáo Thống kê truy cập' : 'Traffic Analytics',
      path: '/analytics',
      icon: BarChart3,
    },
    {
      label: isVi ? 'Cài đặt hệ thống & SEO' : 'System & SEO Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isVi
                ? 'Tìm nhanh trang hoặc thao tác... (Ctrl+K)'
                : 'Search pages or actions... (Ctrl+K)'
            }
            autoFocus
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {isVi
                ? 'Không tìm thấy lệnh hoặc trang phù hợp.'
                : 'No matching pages or commands found.'}
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.path}
                  onClick={() => handleSelect(cmd.path)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">{cmd.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
