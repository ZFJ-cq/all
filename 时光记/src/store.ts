import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { DateItem, AppSettings, ToastMessage, CustomCategory } from '@/types';
import { DEFAULT_SETTINGS, CATEGORIES } from '@/types';
import { loadDates, saveDates, loadSettings, saveSettings } from '@/utils/storage';
import { getDaysDiff } from '@/utils/dateCalc';

interface AppState {
  dates: DateItem[];
  settings: AppSettings;
  toasts: ToastMessage[];
  editingItem: DateItem | null;
  showAddModal: boolean;
  showSettings: boolean;
  showStatistics: boolean;
  confirmAction: { message: string; onConfirm: () => void } | null;
  selectedIds: string[];
  batchMode: boolean;

  // Actions
  init: () => void;
  reset: () => void;
  addDate: (item: Omit<DateItem, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'pinned' | 'completed'>) => void;
  updateDate: (id: string, updates: Partial<DateItem>) => void;
  deleteDate: (id: string) => void;
  togglePin: (id: string) => void;
  toggleComplete: (id: string) => void;
  reorderDates: (activeId: string, overId: string) => void;
  deleteExpired: () => void;
  deleteSelected: (ids: string[]) => void;

  updateSettings: (updates: Partial<AppSettings>) => void;
  setFilterCategory: (category: string) => void;

  setEditingItem: (item: DateItem | null) => void;
  setShowAddModal: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowStatistics: (show: boolean) => void;
  setConfirmAction: (action: { message: string; onConfirm: () => void } | null) => void;

  selectDate: (id: string) => void;
  toggleBatchMode: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  batchUpdateCategory: (category: string) => void;
  batchToggleComplete: () => void;

  addCustomCategory: (label: string) => CustomCategory;
  removeCustomCategory: (id: string) => void;
  getAllCategories: () => { id: string; label: string; color: string }[];
  getCategoryLabel: (categoryId: string) => string;
  getCategoryColor: (categoryId: string) => string;

  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  getFilteredDates: () => DateItem[];
}

export const useStore = create<AppState>((set, get) => ({
  dates: [],
  settings: { ...DEFAULT_SETTINGS },
  toasts: [],
  editingItem: null,
  showAddModal: false,
  showSettings: false,
  showStatistics: false,
  confirmAction: null,
  selectedIds: [],
  batchMode: false,

  init: () => {
    const dates = loadDates();
    const settings = loadSettings();
    set({ dates, settings });
  },

  reset: () => {
    set({
      dates: [],
      settings: { ...DEFAULT_SETTINGS },
      toasts: [],
      editingItem: null,
      showAddModal: false,
  showSettings: false,
  showStatistics: false,
  confirmAction: null,
      selectedIds: [],
      batchMode: false,
    });
    saveDates([]);
    saveSettings({ ...DEFAULT_SETTINGS });
  },

  addDate: (item) => {
    const dates = get().dates;
    const newItem: DateItem = {
      ...item,
      id: uuidv4(),
      order: dates.length,
      pinned: false,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newDates = [...dates, newItem];
    saveDates(newDates);
    set({ dates: newDates });
    get().addToast('添加成功');
  },

  updateDate: (id, updates) => {
    const newDates = get().dates.map((d) =>
      d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d
    );
    saveDates(newDates);
    set({ dates: newDates });
    get().addToast('更新成功');
  },

  deleteDate: (id) => {
    const newDates = get().dates.filter((d) => d.id !== id);
    saveDates(newDates);
    set({ dates: newDates });
    get().addToast('已删除');
  },

  togglePin: (id) => {
    const newDates = get().dates.map((d) =>
      d.id === id ? { ...d, pinned: !d.pinned, updatedAt: Date.now() } : d
    );
    saveDates(newDates);
    set({ dates: newDates });
  },

  toggleComplete: (id) => {
    const newDates = get().dates.map((d) =>
      d.id === id ? { ...d, completed: !d.completed, updatedAt: Date.now() } : d
    );
    saveDates(newDates);
    set({ dates: newDates });
  },

  reorderDates: (activeId, overId) => {
    const dates = get().dates;
    const activeIndex = dates.findIndex((d) => d.id === activeId);
    const overIndex = dates.findIndex((d) => d.id === overId);
    if (activeIndex === -1 || overIndex === -1) return;

    const newDates = [...dates];
    const [moved] = newDates.splice(activeIndex, 1);
    newDates.splice(overIndex, 0, moved);
    const reordered = newDates.map((d, i) => ({ ...d, order: i }));
    saveDates(reordered);
    set({ dates: reordered });
  },

  deleteExpired: () => {
    const newDates = get().dates.filter((d) => {
      if (d.type === 'countdown') return getDaysDiff(d.date) >= 0;
      return true;
    });
    saveDates(newDates);
    set({ dates: newDates });
    get().addToast(`已清除 ${get().dates.length - newDates.length} 条过期日期`);
  },

  deleteSelected: (ids) => {
    const newDates = get().dates.filter((d) => !ids.includes(d.id));
    saveDates(newDates);
    set({ dates: newDates });
    get().addToast(`已删除 ${ids.length} 条日期`);
  },

  updateSettings: (updates) => {
    const newSettings = { ...get().settings, ...updates };
    saveSettings(newSettings);
    set({ settings: newSettings });
  },

  setFilterCategory: (category) => {
    get().updateSettings({ filterCategory: category });
  },

  setEditingItem: (item) => set({ editingItem: item }),
  setShowAddModal: (show) => set({ showAddModal: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowStatistics: (show) => set({ showStatistics: show }),
  setConfirmAction: (action) => set({ confirmAction: action }),

  selectDate: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  toggleBatchMode: () => {
    const { batchMode } = get();
    if (batchMode) {
      set({ batchMode: false, selectedIds: [] });
    } else {
      set({ batchMode: true, selectedIds: [] });
    }
  },

  selectAll: () => {
    const filteredDates = get().getFilteredDates();
    set({ selectedIds: filteredDates.map((d) => d.id) });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  batchUpdateCategory: (category) => {
    const { selectedIds, dates } = get();
    const newDates = dates.map((d) =>
      selectedIds.includes(d.id) ? { ...d, category, updatedAt: Date.now() } : d
    );
    saveDates(newDates);
    set({ dates: newDates, selectedIds: [] });
    get().addToast(`已修改 ${selectedIds.length} 条日期的分类`);
  },

  batchToggleComplete: () => {
    const { selectedIds, dates } = get();
    const allCompleted = selectedIds.every((id) => {
      const item = dates.find((d) => d.id === id);
      return item?.completed;
    });
    const newDates = dates.map((d) =>
      selectedIds.includes(d.id) ? { ...d, completed: !allCompleted, updatedAt: Date.now() } : d
    );
    saveDates(newDates);
    set({ dates: newDates, selectedIds: [] });
    get().addToast(`已${allCompleted ? '标记为未完成' : '标记为完成'} ${selectedIds.length} 条日期`);
  },

  addCustomCategory: (label: string): CustomCategory => {
    const id = `custom_${uuidv4().slice(0, 8)}`;
    const colors = ['#C4B5D4', '#B5D4C4', '#D4C4B5', '#B5C4D4', '#D4B5C4', '#C4D4B5', '#D4D4B5', '#B5B5D4'];
    const colorIndex = get().settings.customCategories.length % colors.length;
    const newCat: CustomCategory = { id, label, color: colors[colorIndex] };
    const newCategories = [...get().settings.customCategories, newCat];
    get().updateSettings({ customCategories: newCategories });
    return newCat;
  },

  removeCustomCategory: (id: string) => {
    const newCategories = get().settings.customCategories.filter((c) => c.id !== id);
    get().updateSettings({ customCategories: newCategories });
  },

  getAllCategories: () => {
    const { customCategories } = get().settings;
    return [...CATEGORIES, ...customCategories];
  },

  getCategoryLabel: (categoryId: string) => {
    const builtIn = CATEGORIES.find((c) => c.id === categoryId);
    if (builtIn) return builtIn.label;
    const custom = get().settings.customCategories.find((c) => c.id === categoryId);
    if (custom) return custom.label;
    // Fallback: check if date has customCategoryName
    return categoryId;
  },

  getCategoryColor: (categoryId: string) => {
    const builtIn = CATEGORIES.find((c) => c.id === categoryId);
    if (builtIn) return builtIn.color;
    const custom = get().settings.customCategories.find((c) => c.id === categoryId);
    if (custom) return custom.color;
    return '#9B9BB0';
  },

  addToast: (message, type = 'success') => {
    const id = uuidv4();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 2500);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  getFilteredDates: () => {
    const { dates, settings } = get();
    let filtered = [...dates];

    // Filter by category
    if (settings.filterCategory && settings.filterCategory !== 'all') {
      filtered = filtered.filter((d) => d.category === settings.filterCategory);
    }

    // Hide expired
    if (settings.hideExpired) {
      filtered = filtered.filter((d) => {
        if (d.type === 'countdown') return getDaysDiff(d.date) >= 0;
        return true;
      });
    }

    // Search filter (after category filter, before sort)
    if (settings.searchQuery.trim()) {
      const query = settings.searchQuery.trim().toLowerCase();
      filtered = filtered.filter((d) =>
        d.title.toLowerCase().includes(query) ||
        d.note.toLowerCase().includes(query)
      );
    }

    // Sort
    const pinned = filtered.filter((d) => d.pinned);
    const unpinned = filtered.filter((d) => !d.pinned);

    const sortFn = (a: DateItem, b: DateItem): number => {
      switch (settings.sortBy) {
        case 'nearest': {
          const diffA = Math.abs(getDaysDiff(a.date));
          const diffB = Math.abs(getDaysDiff(b.date));
          return settings.sortOrder === 'asc' ? diffA - diffB : diffB - diffA;
        }
        case 'created':
          return settings.sortOrder === 'asc'
            ? a.createdAt - b.createdAt
            : b.createdAt - a.createdAt;
        case 'category': {
          const catA = get().getCategoryLabel(a.category);
          const catB = get().getCategoryLabel(b.category);
          return settings.sortOrder === 'asc'
            ? catA.localeCompare(catB)
            : catB.localeCompare(catA);
        }
        default:
          return 0;
      }
    };

    pinned.sort(sortFn);
    unpinned.sort(sortFn);

    return [...pinned, ...unpinned];
  },
}));
