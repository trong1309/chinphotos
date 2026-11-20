import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Globe,
  Share2,
  User as UserIcon,
  Shield,
  Bell,
  Palette,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { settingsService } from '../services/settings.service';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useUiStore, Theme } from '../stores/ui.store';
import { useToastStore } from '../stores/toast.store';
import { Settings, MenuItemConfig } from '../types';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Textarea,
  Switch,
  FormField,
  Skeleton,
  ErrorState,
  IconButton,
} from '../components/common';
import { useConfirm } from '../hooks/useConfirm';

type SettingsTab =
  | 'general'
  | 'social-seo'
  | 'profile'
  | 'security'
  | 'notifications'
  | 'appearance';

const DEFAULT_MENU: MenuItemConfig[] = [
  { label: 'Work', path: '/work', order: 1, isVisible: true },
  { label: 'Portfolio', path: '/portfolio', order: 2, isVisible: true },
  { label: 'Details', path: '/details', order: 3, isVisible: true },
  { label: 'About', path: '/about', order: 4, isVisible: true },
  { label: 'Contact', path: '/contact', order: 5, isVisible: true },
];

const SectionCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const isValidOptionalUrl = (val: string): boolean => {
  if (!val.trim()) return true;
  if (val.startsWith('/')) return true;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const evaluatePasswordStrength = (
  pwd: string,
): { score: number; label: string; colorClass: string } => {
  if (!pwd) return { score: 0, label: 'Chưa nhập', colorClass: 'bg-slate-200 dark:bg-slate-700' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) {
    return { score: 1, label: 'Yếu (Weak)', colorClass: 'bg-red-500' };
  }
  if (score <= 3) {
    return { score: 2, label: 'Trung bình (Medium)', colorClass: 'bg-amber-500' };
  }
  return { score: 3, label: 'Mạnh (Strong)', colorClass: 'bg-emerald-500' };
};

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { addToast } = useToastStore();
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useUiStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Query Settings
  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  // --- TAB 1: GENERAL STATE ---
  const [siteName, setSiteName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [logo, setLogo] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [newHeroUrl, setNewHeroUrl] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>(DEFAULT_MENU);
  const [generalDirty, setGeneralDirty] = useState(false);

  // --- TAB 2: SOCIAL & SEO STATE ---
  const [social, setSocial] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    x: '',
    threads: '',
  });
  const [defaultSeo, setDefaultSeo] = useState({
    title: '',
    description: '',
    ogImage: '',
  });
  const [socialSeoErrors, setSocialSeoErrors] = useState<Record<string, string>>({});
  const [socialSeoDirty, setSocialSeoDirty] = useState(false);

  // --- TAB 3: PROFILE STATE ---
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileDirty, setProfileDirty] = useState(false);

  // --- TAB 4: SECURITY STATE ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [securityErrors, setSecurityErrors] = useState<Record<string, string>>({});

  // --- TAB 5: NOTIFICATIONS STATE ---
  const [emailOnInquiry, setEmailOnInquiry] = useState(true);
  const [notificationsDirty, setNotificationsDirty] = useState(false);

  // --- TAB 6: APPEARANCE STATE ---
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>(() => {
    const saved = localStorage.getItem('chinphotos_admin_table_density');
    return saved === 'compact' ? 'compact' : 'comfortable';
  });
  const [accentColor, setAccentColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose'>(() => {
    const saved = localStorage.getItem('chinphotos_admin_accent');
    if (saved === 'emerald' || saved === 'amber' || saved === 'rose') return saved;
    return 'indigo';
  });

  // Sync fetched settings into local tab states
  useEffect(() => {
    if (!settings) return;
    setSiteName(settings.siteName || 'chinphotos');
    setTagline(settings.tagline || '');
    setBio(settings.bio || '');
    setLogo(settings.logo || '');
    setContactEmail(settings.contactEmail || '');
    setHeroImages(settings.heroImages || []);
    setServiceAreas(settings.serviceAreas || []);
    setMenuItems(
      settings.menu && settings.menu.length > 0
        ? [...settings.menu]
            .filter((m) => m.path !== '/shop' && m.path !== '/journal')
            .sort((a, b) => a.order - b.order)
        : DEFAULT_MENU,
    );
    setGeneralDirty(false);

    setSocial({
      instagram: settings.social?.instagram || '',
      facebook: settings.social?.facebook || '',
      tiktok: settings.social?.tiktok || '',
      youtube: settings.social?.youtube || '',
      x: settings.social?.x || '',
      threads: settings.social?.threads || '',
    });
    setDefaultSeo({
      title: settings.defaultSeo?.title || '',
      description: settings.defaultSeo?.description || '',
      ogImage: settings.defaultSeo?.ogImage || '',
    });
    setSocialSeoDirty(false);

    setEmailOnInquiry(settings.notifications?.emailOnInquiry ?? true);
    setNotificationsDirty(false);
  }, [settings]);

  // Sync user into profile tab state
  useEffect(() => {
    if (!user) return;
    setProfileName(user.name || '');
    setProfileAvatar(user.avatar || '');
    setProfileDirty(false);
  }, [user]);

  const securityDirty = Boolean(currentPassword || newPassword || confirmPassword);

  const isCurrentTabDirty = (): boolean => {
    switch (activeTab) {
      case 'general':
        return generalDirty;
      case 'social-seo':
        return socialSeoDirty;
      case 'profile':
        return profileDirty;
      case 'security':
        return securityDirty;
      case 'notifications':
        return notificationsDirty;
      default:
        return false;
    }
  };

  const handleTabSwitch = async (nextTab: SettingsTab) => {
    if (nextTab === activeTab) return;
    if (isCurrentTabDirty()) {
      const ok = await confirm({
        title: 'Thay đổi chưa được lưu',
        message:
          'Bạn có thay đổi chưa lưu trong tab hiện tại. Nếu chuyển tab, các thay đổi này sẽ không được tự động lưu. Bạn có chắc muốn chuyển tab?',
        confirmText: 'Chuyển tab',
        cancelText: 'Ở lại',
        variant: 'danger',
      });
      if (!ok) return;
    }
    setActiveTab(nextTab);
  };

  // Mutations
  const settingsMutation = useMutation({
    mutationFn: (payload: Partial<Settings>) => settingsService.updateSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
      addToast({ message: 'Đã lưu cài đặt hệ thống', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Không thể lưu cài đặt. Vui lòng thử lại.', type: 'error' });
    },
  });

  const profileMutation = useMutation({
    mutationFn: (payload: { name: string; avatar?: string }) =>
      authService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setProfileDirty(false);
      addToast({ message: 'Đã cập nhật hồ sơ quản trị viên', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Không thể cập nhật hồ sơ', type: 'error' });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(payload),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityErrors({});
      addToast({ message: 'Đã đổi mật khẩu thành công', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra', type: 'error' });
    },
  });

  // Save Handlers
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      addToast({ message: 'Tên website không được để trống', type: 'error' });
      return;
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      addToast({ message: 'Email liên hệ không hợp lệ', type: 'error' });
      return;
    }
    settingsMutation.mutate(
      {
        siteName: siteName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        logo: logo.trim(),
        contactEmail: contactEmail.trim(),
        heroImages,
        serviceAreas,
        menu: menuItems.map((item, idx) => ({ ...item, order: idx + 1 })),
      },
      {
        onSuccess: () => setGeneralDirty(false),
      },
    );
  };

  const handleSaveSocialSeo = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    (Object.keys(social) as Array<keyof typeof social>).forEach((key) => {
      if (!isValidOptionalUrl(social[key])) {
        errors[key] = 'URL không hợp lệ (bắt đầu bằng https:// hoặc http://)';
      }
    });
    if (!isValidOptionalUrl(defaultSeo.ogImage)) {
      errors.ogImage = 'URL ảnh OG không hợp lệ';
    }
    setSocialSeoErrors(errors);
    if (Object.keys(errors).length > 0) {
      addToast({ message: 'Vui lòng kiểm tra lại các đường dẫn URL', type: 'error' });
      return;
    }

    settingsMutation.mutate(
      {
        social,
        defaultSeo,
      },
      {
        onSuccess: () => setSocialSeoDirty(false),
      },
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      addToast({ message: 'Tên hiển thị không được để trống', type: 'error' });
      return;
    }
    if (!isValidOptionalUrl(profileAvatar)) {
      addToast({ message: 'URL ảnh đại diện không hợp lệ', type: 'error' });
      return;
    }
    profileMutation.mutate({
      name: profileName.trim(),
      avatar: profileAvatar.trim(),
    });
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPassword) {
      errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    if (newPassword.length < 8) {
      errs.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    }
    if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }
    setSecurityErrors(errs);
    if (Object.keys(errs).length > 0) return;

    passwordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    settingsMutation.mutate(
      {
        notifications: { emailOnInquiry },
      },
      {
        onSuccess: () => setNotificationsDirty(false),
      },
    );
  };

  // Hero image helpers
  const addHeroImage = () => {
    const trimmed = newHeroUrl.trim();
    if (!trimmed) return;
    if (!isValidOptionalUrl(trimmed)) {
      addToast({ message: 'URL ảnh không hợp lệ', type: 'error' });
      return;
    }
    setHeroImages((prev) => [...prev, trimmed]);
    setNewHeroUrl('');
    setGeneralDirty(true);
  };

  const removeHeroImage = (idx: number) => {
    setHeroImages((prev) => prev.filter((_, i) => i !== idx));
    setGeneralDirty(true);
  };

  const moveHeroImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= heroImages.length) return;
    const copy = [...heroImages];
    const moved = copy[idx];
    const dest = copy[target];
    if (moved === undefined || dest === undefined) return;
    copy[idx] = dest;
    copy[target] = moved;
    setHeroImages(copy);
    setGeneralDirty(true);
  };

  // Service areas helpers
  const addServiceArea = () => {
    const trimmed = newAreaInput.trim();
    if (!trimmed) return;
    if (!serviceAreas.includes(trimmed)) {
      setServiceAreas((prev) => [...prev, trimmed]);
      setGeneralDirty(true);
    }
    setNewAreaInput('');
  };

  const removeServiceArea = (area: string) => {
    setServiceAreas((prev) => prev.filter((a) => a !== area));
    setGeneralDirty(true);
  };

  // Menu helpers
  const moveMenuItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= menuItems.length) return;
    const copy = [...menuItems];
    const moved = copy[idx];
    const dest = copy[target];
    if (moved === undefined || dest === undefined) return;
    copy[idx] = dest;
    copy[target] = moved;
    setMenuItems(copy);
    setGeneralDirty(true);
  };

  const updateMenuItem = (idx: number, patch: Partial<MenuItemConfig>) => {
    setMenuItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
    setGeneralDirty(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải cài đặt hệ thống"
        message="Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode; dirty?: boolean }> = [
    { id: 'general', label: 'Chung (General)', icon: <Globe className="w-4 h-4" />, dirty: generalDirty },
    { id: 'social-seo', label: 'Mạng xã hội & SEO', icon: <Share2 className="w-4 h-4" />, dirty: socialSeoDirty },
    { id: 'profile', label: 'Hồ sơ (Profile)', icon: <UserIcon className="w-4 h-4" />, dirty: profileDirty },
    { id: 'security', label: 'Bảo mật (Security)', icon: <Shield className="w-4 h-4" />, dirty: securityDirty },
    { id: 'notifications', label: 'Thông báo', icon: <Bell className="w-4 h-4" />, dirty: notificationsDirty },
    { id: 'appearance', label: 'Giao diện (Appearance)', icon: <Palette className="w-4 h-4" /> },
  ];

  const pwdStrength = evaluatePasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt hệ thống (Settings)"
        description="Quản lý thông tin thương hiệu chinphotos, mạng xã hội, SEO mặc định, tài khoản và giao diện Admin."
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSwitch(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.dirty && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-500"
                  title="Có thay đổi chưa lưu"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <SectionCard
            title="Thông tin Studio & Thương hiệu"
            description="Tên thương hiệu, khẩu hiệu, giới thiệu ngắn và email liên hệ chính."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Tên Website / Studio" required>
                <Input
                  value={siteName}
                  onChange={(e) => {
                    setSiteName(e.target.value);
                    setGeneralDirty(true);
                  }}
                  placeholder="chinphotos"
                />
              </FormField>

              <FormField label="Email nhận liên hệ">
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    setGeneralDirty(true);
                  }}
                  placeholder="hello@chinphotos.vn"
                />
              </FormField>

              <FormField label="Khẩu hiệu (Tagline)" className="md:col-span-2">
                <Input
                  value={tagline}
                  onChange={(e) => {
                    setTagline(e.target.value);
                    setGeneralDirty(true);
                  }}
                  placeholder="Nhiếp ảnh Gia đình & Tuổi thơ tự nhiên tại TP. Hồ Chí Minh"
                />
              </FormField>

              <FormField
                label="URL Logo"
                className="md:col-span-2"
                helperText="Để trống nếu dùng chữ thương hiệu mặc định"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={logo}
                      onChange={(e) => {
                        setLogo(e.target.value);
                        setGeneralDirty(true);
                      }}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  {logo && (
                    <img
                      src={logo}
                      alt="Logo preview"
                      className="w-10 h-10 rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1"
                    />
                  )}
                </div>
              </FormField>

              <FormField label="Giới thiệu ngắn (Bio)" className="md:col-span-2">
                <Textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setGeneralDirty(true);
                  }}
                  placeholder="Giới thiệu triết lý nhiếp ảnh của studio..."
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            title="Ảnh Hero Trang chủ (Hero Images)"
            description="Danh sách các ảnh hiển thị ở đầu trang chủ. Có thể sắp xếp thứ tự ưu tiên."
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={newHeroUrl}
                    onChange={(e) => setNewHeroUrl(e.target.value)}
                    placeholder="Dán URL ảnh Hero mới (https://...)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHeroImage();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={addHeroImage}
                >
                  Thêm ảnh
                </Button>
              </div>

              {heroImages.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center">
                  Chưa có ảnh Hero nào được cấu hình.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {heroImages.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="group relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900"
                    >
                      <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                        <img
                          src={imgUrl}
                          alt={`Hero ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                          #{idx + 1} · {imgUrl}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <IconButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label="Lên"
                            disabled={idx === 0}
                            onClick={() => moveHeroImage(idx, -1)}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </IconButton>
                          <IconButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label="Xuống"
                            disabled={idx === heroImages.length - 1}
                            onClick={() => moveHeroImage(idx, 1)}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </IconButton>
                          <IconButton
                            type="button"
                            size="sm"
                            variant="danger"
                            aria-label="Xóa ảnh"
                            onClick={() => removeHeroImage(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="Khu vực phục vụ (Service Areas)"
              description="Các khu vực chụp ảnh chính tại TP.HCM và lân cận."
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      placeholder="VD: Thảo Điền, Quận 1, Phú Mỹ Hưng..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addServiceArea();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={addServiceArea}
                  >
                    Thêm
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeServiceArea(area)}
                        className="text-indigo-400 hover:text-red-500 transition-colors"
                        aria-label={`Xóa ${area}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Menu điều hướng (Navigation Menu)"
              description="Thứ tự và trạng thái hiển thị các mục trên thanh điều hướng Client."
            >
              <div className="space-y-2">
                {menuItems.map((item, idx) => (
                  <div
                    key={`${item.path}-${idx}`}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-400 w-4">
                        {idx + 1}.
                      </span>
                      <Input
                        value={item.label}
                        onChange={(e) => updateMenuItem(idx, { label: e.target.value })}
                        className="max-w-[140px]"
                      />
                      <span className="text-xs font-mono text-slate-400 truncate">
                        {item.path}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isVisible}
                        onCheckedChange={(checked) =>
                          updateMenuItem(idx, { isVisible: checked })
                        }
                      />
                      <IconButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label="Lên"
                        disabled={idx === 0}
                        onClick={() => moveMenuItem(idx, -1)}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </IconButton>
                      <IconButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label="Xuống"
                        disabled={idx === menuItems.length - 1}
                        onClick={() => moveMenuItem(idx, 1)}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!generalDirty}
              isLoading={settingsMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu cài đặt chung
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: SOCIAL & SEO */}
      {activeTab === 'social-seo' && (
        <form onSubmit={handleSaveSocialSeo} className="space-y-6">
          <SectionCard
            title="Liên kết mạng xã hội (Social Links)"
            description="Đường dẫn tới các trang mạng xã hội chính thức của studio."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/chinphotos' },
                  { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/chinphotos' },
                  { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@chinphotos' },
                  { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@chinphotos' },
                  { key: 'x', label: 'X (Twitter) URL', placeholder: 'https://x.com/chinphotos' },
                  { key: 'threads', label: 'Threads URL', placeholder: 'https://threads.net/@chinphotos' },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <FormField key={key} label={label} error={socialSeoErrors[key]}>
                  <Input
                    value={social[key]}
                    onChange={(e) => {
                      setSocial((prev) => ({ ...prev, [key]: e.target.value }));
                      setSocialSeoDirty(true);
                    }}
                    placeholder={placeholder}
                  />
                </FormField>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="SEO Mặc định (Default SEO & OpenGraph)"
            description="Thẻ tiêu đề, mô tả và ảnh đại diện khi chia sẻ liên kết trang chủ lên mạng xã hội."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <FormField label="Tiêu đề SEO mặc định (Meta Title)">
                  <Input
                    value={defaultSeo.title}
                    onChange={(e) => {
                      setDefaultSeo((prev) => ({ ...prev, title: e.target.value }));
                      setSocialSeoDirty(true);
                    }}
                    placeholder="chinphotos — Nhiếp ảnh Gia đình & Tuổi thơ tại TP.HCM"
                  />
                </FormField>

                <FormField label="Mô tả SEO mặc định (Meta Description)">
                  <Textarea
                    rows={3}
                    value={defaultSeo.description}
                    onChange={(e) => {
                      setDefaultSeo((prev) => ({ ...prev, description: e.target.value }));
                      setSocialSeoDirty(true);
                    }}
                    placeholder="Lưu giữ khoảnh khắc tự nhiên, chân thật của gia đình và bé yêu..."
                  />
                </FormField>

                <FormField label="Ảnh chia sẻ OpenGraph (OG Image URL)" error={socialSeoErrors.ogImage}>
                  <Input
                    value={defaultSeo.ogImage}
                    onChange={(e) => {
                      setDefaultSeo((prev) => ({ ...prev, ogImage: e.target.value }));
                      setSocialSeoDirty(true);
                    }}
                    placeholder="https://images.unsplash.com/..."
                  />
                </FormField>
              </div>

              {/* Live Social Share Card Preview */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Xem trước thẻ chia sẻ (OG Preview)
                </div>
                <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {defaultSeo.ogImage ? (
                    <img
                      src={defaultSeo.ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[11px] uppercase text-slate-400">chinphotos.vn</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {defaultSeo.title || siteName || 'chinphotos'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {defaultSeo.description || tagline || 'Chưa có mô tả SEO mặc định.'}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!socialSeoDirty}
              isLoading={settingsMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu Mạng xã hội & SEO
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
          <SectionCard
            title="Hồ sơ Quản trị viên (Admin Profile)"
            description="Cập nhật tên hiển thị và ảnh đại diện của tài khoản quản trị."
          >
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center overflow-hidden shrink-0">
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {(profileName || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {profileName || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || 'admin@example.com'} · Quản trị viên
                  </p>
                </div>
              </div>

              <FormField label="Tên hiển thị" required>
                <Input
                  value={profileName}
                  onChange={(e) => {
                    setProfileName(e.target.value);
                    setProfileDirty(true);
                  }}
                  placeholder="Chin Photos Admin"
                />
              </FormField>

              <FormField
                label="Địa chỉ Email (Chỉ đọc)"
                helperText="Email đăng nhập không thể thay đổi trực tiếp"
              >
                <Input value={user?.email || 'admin@example.com'} disabled readOnly />
              </FormField>

              <FormField label="URL Ảnh đại diện (Avatar URL)">
                <Input
                  value={profileAvatar}
                  onChange={(e) => {
                    setProfileAvatar(e.target.value);
                    setProfileDirty(true);
                  }}
                  placeholder="https://images.unsplash.com/..."
                />
              </FormField>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!profileDirty}
              isLoading={profileMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu hồ sơ
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="space-y-6 max-w-2xl">
          <SectionCard
            title="Đổi mật khẩu (Change Password)"
            description="Sử dụng mật khẩu mạnh tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
          >
            <div className="space-y-4">
              <FormField
                label="Mật khẩu hiện tại"
                required
                error={securityErrors.currentPassword}
              >
                <div className="relative">
                  <Input
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Hiện/ẩn mật khẩu hiện tại"
                  >
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>

              <FormField
                label="Mật khẩu mới"
                required
                error={securityErrors.newPassword}
              >
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label="Hiện/ẩn mật khẩu mới"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  <div className="space-y-1">
                    <div className="flex gap-1.5 h-1.5">
                      {[1, 2, 3].map((bar) => (
                        <div
                          key={bar}
                          className={`flex-1 rounded-full transition-colors ${
                            pwdStrength.score >= bar
                              ? pwdStrength.colorClass
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Độ mạnh mật khẩu: <span className="font-medium">{pwdStrength.label}</span>
                    </p>
                  </div>
                </div>
              </FormField>

              <FormField
                label="Xác nhận mật khẩu mới"
                required
                error={securityErrors.confirmPassword}
              >
                <div className="relative">
                  <Input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Hiện/ẩn xác nhận mật khẩu"
                  >
                    {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!securityDirty}
              isLoading={passwordMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-6 max-w-2xl">
          <SectionCard
            title="Cài đặt Thông báo (Notifications)"
            description="Quản lý cách hệ thống gửi thông báo khi có khách hàng gửi lời nhắn mới."
          >
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Nhận email khi có lời nhắn đặt lịch mới (Inquiry)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tự động gửi thông báo qua SMTP tới địa chỉ {contactEmail || 'email liên hệ'} ngay khi khách gửi form.
                </p>
              </div>
              <Switch
                checked={emailOnInquiry}
                onCheckedChange={(checked) => {
                  setEmailOnInquiry(checked);
                  setNotificationsDirty(true);
                }}
              />
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!notificationsDirty}
              isLoading={settingsMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu cài đặt thông báo
            </Button>
          </div>
        </form>
      )}

      {/* TAB 6: APPEARANCE */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 max-w-3xl">
          <SectionCard
            title="Chế độ Giao diện (Theme Mode)"
            description="Thay đổi chế độ sáng/tối cho bảng điều khiển Admin. Áp dụng ngay lập tức."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'light', label: 'Sáng (Light)', icon: <Sun className="w-4 h-4" />, desc: 'Giao diện nền sáng rõ ràng' },
                  { id: 'dark', label: 'Tối (Dark)', icon: <Moon className="w-4 h-4" />, desc: 'Dịu mắt khi làm việc ban đêm' },
                  { id: 'system', label: 'Hệ thống (System)', icon: <Laptop className="w-4 h-4" />, desc: 'Đồng bộ theo cài đặt máy tính' },
                ] as Array<{ id: Theme; label: string; icon: React.ReactNode; desc: string }>
              ).map((option) => {
                const selected = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setTheme(option.id);
                      addToast({ message: `Đã chuyển chế độ giao diện: ${option.label}`, type: 'success' });
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
                        {option.icon}
                      </span>
                      {selected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {option.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {option.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Mật độ bảng dữ liệu & Màu nhấn (Density & Accent)"
            description="Tùy chỉnh khoảng cách hiển thị bảng dữ liệu và màu chủ đạo trong trình quản trị."
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Mật độ bảng dữ liệu (Table Density)
                </p>
                <div className="flex gap-3">
                  {(
                    [
                      { id: 'comfortable', label: 'Thoải mái (Comfortable)' },
                      { id: 'compact', label: 'Thu gọn (Compact)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTableDensity(item.id);
                        localStorage.setItem('chinphotos_admin_table_density', item.id);
                        addToast({ message: `Đã chọn mật độ hiển thị: ${item.label}`, type: 'success' });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        tableDensity === item.id
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Màu nhấn (Accent Color)
                </p>
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { id: 'indigo', label: 'Indigo (Mặc định)', swatch: 'bg-indigo-600' },
                      { id: 'emerald', label: 'Emerald', swatch: 'bg-emerald-600' },
                      { id: 'amber', label: 'Amber', swatch: 'bg-amber-600' },
                      { id: 'rose', label: 'Rose', swatch: 'bg-rose-600' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setAccentColor(c.id);
                        localStorage.setItem('chinphotos_admin_accent', c.id);
                        addToast({ message: `Đã lưu màu nhấn: ${c.label}`, type: 'success' });
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                        accentColor === c.id
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.swatch}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
