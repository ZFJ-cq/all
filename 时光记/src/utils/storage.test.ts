import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadDates, saveDates, loadSettings, saveSettings, exportData, importData } from './storage';
import { DEFAULT_SETTINGS } from '@/types';

describe('storage', () => {
  const DATES_KEY = 'timekeeper_dates';
  const SETTINGS_KEY = 'timekeeper_settings';
  
  beforeEach(() => {
    localStorage.clear();
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  describe('loadDates', () => {
    it('should return empty array when no data', () => {
      expect(loadDates()).toEqual([]);
    });
    
    it('should return parsed dates when data exists', () => {
      const dates = [{ id: '1', title: 'Test', type: 'countdown' as const, date: '2026-06-10', category: 'life', note: '', pinned: false, completed: false, order: 0, createdAt: 123, updatedAt: 123 }];
      localStorage.setItem(DATES_KEY, JSON.stringify(dates));
      expect(loadDates()).toEqual(dates);
    });
    
    it('should return empty array when data is invalid JSON', () => {
      localStorage.setItem(DATES_KEY, 'invalid json');
      expect(loadDates()).toEqual([]);
    });
  });
  
  describe('saveDates', () => {
    it('should save dates to localStorage', () => {
      const dates = [{ id: '1', title: 'Test', type: 'countdown' as const, date: '2026-06-10', category: 'life', note: '', pinned: false, completed: false, order: 0, createdAt: 123, updatedAt: 123 }];
      saveDates(dates);
      expect(JSON.parse(localStorage.getItem(DATES_KEY) || '[]')).toEqual(dates);
    });
  });
  
  describe('loadSettings', () => {
    it('should return default settings when no data', () => {
      expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    });
    
    it('should return merged settings when data exists', () => {
      const customSettings = { theme: 'dark' as const };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(customSettings));
      const settings = loadSettings();
      expect(settings.theme).toBe('dark');
      expect(settings.viewMode).toBe(DEFAULT_SETTINGS.viewMode);
    });
    
    it('should return default settings when data is invalid JSON', () => {
      localStorage.setItem(SETTINGS_KEY, 'invalid json');
      expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    });
  });
  
  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const settings = { ...DEFAULT_SETTINGS, theme: 'dark' as const };
      saveSettings(settings);
      expect(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')).toEqual(settings);
    });
  });
  
  describe('importData', () => {
    it('should parse valid JSON file', async () => {
      const data = {
        dates: [{ id: '1', title: 'Test', type: 'countdown' as const, date: '2026-06-10', category: 'life', note: '', pinned: false, completed: false, order: 0, createdAt: 123, updatedAt: 123 }],
        settings: { theme: 'dark' as const }
      };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const file = new File([blob], 'test.json', { type: 'application/json' });
      const result = await importData(file);
      expect(result.dates).toEqual(data.dates);
      expect(result.settings.theme).toBe('dark');
    });
    
    it('should reject invalid JSON', async () => {
      const blob = new Blob(['invalid json'], { type: 'application/json' });
      const file = new File([blob], 'test.json', { type: 'application/json' });
      await expect(importData(file)).rejects.toThrow('文件解析失败');
    });
    
    it('should reject missing dates array', async () => {
      const blob = new Blob([JSON.stringify({ settings: {} })], { type: 'application/json' });
      const file = new File([blob], 'test.json', { type: 'application/json' });
      await expect(importData(file)).rejects.toThrow('无效的数据格式');
    });
  });
});
