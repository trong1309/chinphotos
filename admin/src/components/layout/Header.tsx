import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  User,
  LogOut,
  Settings as SettingsIcon,
  Globe,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useUiStore, Theme } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { CommandPalette } from './CommandPalette';

export const Header: React.FC<{ unreadInquiriesCount?: number }> = ({
  unreadInquiriesCount = 0,
}) => {
  const navigate = useNavigate();
  const { toggleMobileSidebar, theme, setTheme, lang, toggleLang } = useUiStore();
  const { user, logout } = useAuthStore();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const isVi = lang === 'vi';

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const themeIcons: Record<Theme, React.ElementType> = {
    light: Sun,
    dark: Moon,
    system: Laptop,
  };
  const ThemeCurrentIcon = themeIcons[theme];

  return (
    <>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        {/* Left: Mobile Toggle & Quick Search Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100 lg:hidden focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Ctrl+K Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isVi ? 'Tìm nhanh...' : 'Quick search...'}
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Sleek Language Switcher (VI / EN) */}
          <button
            type="button"
            onClick={toggleLang}
            title={isVi ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
            aria-label="Toggle language"
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-brand-500 transition-transform duration-500 group-hover:rotate-180" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/inquiries')}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            title={isVi ? 'Hộp thư yêu cầu' : 'Client Inquiries'}
            aria-label="View Inquiries"
          >
            <Bell className="w-4 h-4" />
            {unreadInquiriesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadInquiriesCount > 99 ? '99+' : unreadInquiriesCount}
              </span>
            )}
          </button>

          {/* Theme Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors focus:outline-none"
                aria-label="Select Theme"
              >
                <ThemeCurrentIcon className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="w-36 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 text-xs font-medium"
              >
                <DropdownMenu.Item
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer outline-none ${
                    theme === 'light'
                      ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Chế độ Sáng' : 'Light Mode'}</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Chế độ Tối' : 'Dark Mode'}</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setTheme('system')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer outline-none ${
                    theme === 'system'
                      ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Theo hệ thống' : 'System'}</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* User Profile Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="User account"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] || 'A'
                  )}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden md:inline truncate max-w-[120px]">
                  {user?.name || 'Admin'}
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="w-48 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 text-xs"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user?.name || (isVi ? 'Quản trị viên' : 'Studio Administrator')}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                </div>

                <DropdownMenu.Item
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer outline-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isVi ? 'Hồ sơ & Tài khoản' : 'Profile & Account'}</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer outline-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isVi ? 'Cài đặt hệ thống' : 'System Settings'}</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer outline-none text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đăng xuất' : 'Sign Out'}</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
    </>
  );
};

export default Header;
