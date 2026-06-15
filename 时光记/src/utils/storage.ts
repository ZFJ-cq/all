import type { DateItem, AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

const DATES_KEY = 'timekeeper_dates';
const SETTINGS_KEY = 'timekeeper_settings';

export function loadDates(): DateItem[] {
  try {
    const data = localStorage.getItem(DATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDates(dates: DateItem[]): void {
  localStorage.setItem(DATES_KEY, JSON.stringify(dates));
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportData(dates: DateItem[], settings: AppSettings): void {
  const data = { dates, settings, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `时光记_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<{ dates: DateItem[]; settings: AppSettings }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.dates || !Array.isArray(data.dates)) {
          reject(new Error('无效的数据格式'));
          return;
        }
        resolve({
          dates: data.dates,
          settings: data.settings ? { ...DEFAULT_SETTINGS, ...data.settings } : { ...DEFAULT_SETTINGS },
        });
      } catch {
        reject(new Error('文件解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
