import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type AdminLang = 'vi' | 'en';

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: Theme;
  lang: AdminLang;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setLang: (lang: AdminLang) => void;
  toggleLang: () => void;
}

const THEME_STORAGE_KEY = 'chinphotos_admin_theme';
const SIDEBAR_STORAGE_KEY = 'chinphotos_admin_sidebar_collapsed';
const LANG_STORAGE_KEY = 'chinphotos_admin_lang';

const applyThemeToDocument = (theme: Theme) => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
};

const getInitialSidebarCollapsed = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
};

const getInitialLang = (): AdminLang => {
  if (typeof window === 'undefined') return 'vi';
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  return saved === 'en' ? 'en' : 'vi';
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: getInitialSidebarCollapsed(),
  mobileSidebarOpen: false,
  theme: getInitialTheme(),
  lang: getInitialLang(),

  toggleSidebarCollapsed: () => {
    set((state) => {
      const next = !state.sidebarCollapsed;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return { sidebarCollapsed: next };
    });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },

  toggleMobileSidebar: () => {
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen }));
  },

  setMobileSidebar: (open: boolean) => {
    set({ mobileSidebarOpen: open });
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyThemeToDocument(theme);
    set({ theme });
  },

  setLang: (lang: AdminLang) => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    set({ lang });
  },

  toggleLang: () => {
    set((state) => {
      const next: AdminLang = state.lang === 'vi' ? 'en' : 'vi';
      localStorage.setItem(LANG_STORAGE_KEY, next);
      document.documentElement.lang = next;
      return { lang: next };
    });
  },
}));

if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (useUiStore.getState().theme === 'system') {
      applyThemeToDocument('system');
    }
  });
}
