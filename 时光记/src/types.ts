export interface DateItem {
  id: string;
  title: string;
  type: 'countdown' | 'anniversary';
  date: string;
  category: string;
  customCategoryName?: string;
  note: string;
  pinned: boolean;
  completed: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface CustomCategory {
  id: string;
  label: string;
  color: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'custom';
  customBg: string;
  viewMode: 'grid' | 'list' | 'calendar';
  sortBy: 'nearest' | 'created' | 'category';
  sortOrder: 'asc' | 'desc';
  hideExpired: boolean;
  cardSize: 'small' | 'medium' | 'large';
  notificationEnabled: boolean;
  notificationDays: '1' | '3' | 'none';
  filterCategory: string;
  searchQuery: string;
  customCategories: CustomCategory[];
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export const CATEGORIES = [
  { id: 'all', label: '全部', color: '#9B9BB0' },
  { id: 'birthday', label: '生日', color: '#E8B4B8' },
  { id: 'holiday', label: '节日', color: '#A8C5DA' },
  { id: 'work', label: '工作', color: '#B8C9A3' },
  { id: 'life', label: '生活', color: '#D4B8A0' },
  { id: 'love', label: '恋爱', color: '#D4919A' },
  { id: 'custom', label: '自定义', color: '#C4B5D4' },
] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  customBg: '',
  viewMode: 'grid',
  sortBy: 'nearest',
  sortOrder: 'asc',
  hideExpired: false,
  cardSize: 'medium',
  notificationEnabled: false,
  notificationDays: '1',
  filterCategory: 'all',
  searchQuery: '',
  customCategories: [],
};
