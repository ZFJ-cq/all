import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStore } from './store';

describe('store', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.getState().reset();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  describe('addDate', () => {
    it('should add a new date', () => {
      const { addDate } = useStore.getState();
      expect(useStore.getState().dates.length).toBe(0);
      
      addDate({ title: 'Test', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      
      const newDates = useStore.getState().dates;
      expect(newDates.length).toBe(1);
      expect(newDates[0].title).toBe('Test');
      expect(newDates[0].type).toBe('countdown');
      expect(newDates[0].pinned).toBe(false);
      expect(newDates[0].completed).toBe(false);
      expect(newDates[0].createdAt).toBeDefined();
    });
  });
  
  describe('updateDate', () => {
    it('should update an existing date', () => {
      const { addDate, updateDate } = useStore.getState();
      addDate({ title: 'Test', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      
      const id = useStore.getState().dates[0].id;
      updateDate(id, { title: 'Updated', category: 'work' });
      
      const updated = useStore.getState().dates[0];
      expect(updated.title).toBe('Updated');
      expect(updated.category).toBe('work');
      expect(updated.updatedAt).toBeGreaterThanOrEqual(updated.createdAt);
    });
  });
  
  describe('deleteDate', () => {
    it('should delete a date', () => {
      const { addDate, deleteDate } = useStore.getState();
      addDate({ title: 'Test', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      
      expect(useStore.getState().dates.length).toBe(1);
      
      const id = useStore.getState().dates[0].id;
      deleteDate(id);
      
      expect(useStore.getState().dates.length).toBe(0);
    });
  });
  
  describe('togglePin', () => {
    it('should toggle pinned status', () => {
      const { addDate, togglePin } = useStore.getState();
      addDate({ title: 'Test', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      
      const id = useStore.getState().dates[0].id;
      expect(useStore.getState().dates[0].pinned).toBe(false);
      
      togglePin(id);
      expect(useStore.getState().dates[0].pinned).toBe(true);
      
      togglePin(id);
      expect(useStore.getState().dates[0].pinned).toBe(false);
    });
  });
  
  describe('toggleComplete', () => {
    it('should toggle completed status', () => {
      const { addDate, toggleComplete } = useStore.getState();
      addDate({ title: 'Test', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      
      const id = useStore.getState().dates[0].id;
      expect(useStore.getState().dates[0].completed).toBe(false);
      
      toggleComplete(id);
      expect(useStore.getState().dates[0].completed).toBe(true);
      
      toggleComplete(id);
      expect(useStore.getState().dates[0].completed).toBe(false);
    });
  });
  
  describe('reorderDates', () => {
    it('should reorder dates', () => {
      const { addDate, reorderDates } = useStore.getState();
      addDate({ title: 'First', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      addDate({ title: 'Second', type: 'countdown', date: '2026-06-16', category: 'life', note: '' });
      addDate({ title: 'Third', type: 'countdown', date: '2026-06-17', category: 'life', note: '' });
      
      const dates = useStore.getState().dates;
      const firstId = dates[0].id;
      const thirdId = dates[2].id;
      
      reorderDates(firstId, thirdId);
      
      const reordered = useStore.getState().dates;
      expect(reordered[0].title).toBe('Second');
      expect(reordered[1].title).toBe('Third');
      expect(reordered[2].title).toBe('First');
    });
  });
  
  describe('deleteExpired', () => {
    it('should delete expired countdown dates', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 10));
      
      const { addDate, deleteExpired } = useStore.getState();
      addDate({ title: 'Future', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      addDate({ title: 'Expired', type: 'countdown', date: '2026-06-05', category: 'life', note: '' });
      addDate({ title: 'Anniversary', type: 'anniversary', date: '2026-06-05', category: 'life', note: '' });
      
      expect(useStore.getState().dates.length).toBe(3);
      
      deleteExpired();
      
      const remaining = useStore.getState().dates;
      expect(remaining.length).toBe(2);
      expect(remaining[0].title).toBe('Future');
      expect(remaining[1].title).toBe('Anniversary');
      
      vi.useRealTimers();
    });
  });
  
  describe('getFilteredDates', () => {
    it('should filter by category', () => {
      const { addDate, updateSettings, getFilteredDates } = useStore.getState();
      addDate({ title: 'Work', type: 'countdown', date: '2026-06-15', category: 'work', note: '' });
      addDate({ title: 'Life', type: 'countdown', date: '2026-06-16', category: 'life', note: '' });
      addDate({ title: 'Work 2', type: 'countdown', date: '2026-06-17', category: 'work', note: '' });
      
      updateSettings({ filterCategory: 'work' });
      const filtered = getFilteredDates();
      expect(filtered.length).toBe(2);
      expect(filtered.every(d => d.category === 'work')).toBe(true);
    });
    
    it('should hide expired dates when setting is enabled', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 10));
      
      const { addDate, updateSettings, getFilteredDates } = useStore.getState();
      addDate({ title: 'Future', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      addDate({ title: 'Expired', type: 'countdown', date: '2026-06-05', category: 'life', note: '' });
      
      updateSettings({ hideExpired: true });
      const filtered = getFilteredDates();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Future');
      
      vi.useRealTimers();
    });
    
    it('should sort by nearest', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 10));
      
      const { addDate, updateSettings, getFilteredDates } = useStore.getState();
      addDate({ title: '5 days', type: 'countdown', date: '2026-06-15', category: 'life', note: '' });
      addDate({ title: '10 days', type: 'countdown', date: '2026-06-20', category: 'life', note: '' });
      addDate({ title: '2 days', type: 'countdown', date: '2026-06-12', category: 'life', note: '' });
      
      updateSettings({ sortBy: 'nearest', sortOrder: 'asc' });
      const sorted = getFilteredDates();
      expect(sorted[0].title).toBe('2 days');
      expect(sorted[1].title).toBe('5 days');
      expect(sorted[2].title).toBe('10 days');
      
      vi.useRealTimers();
    });
  });
});
