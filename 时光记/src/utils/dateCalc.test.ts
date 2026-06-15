import { describe, it, expect, vi } from 'vitest';
import { getDaysDiff, isExpired, formatDisplayDate, getDaysLabel, getDaysNumber, getYearAnniversary } from './dateCalc';

describe('dateCalc', () => {
  const originalDate = Date;
  
  const setMockDate = (year: number, month: number, day: number) => {
    vi.useFakeTimers();
    const mockDate = new Date(year, month - 1, day);
    vi.setSystemTime(mockDate);
  };
  
  const restoreDate = () => {
    vi.useRealTimers();
  };
  
  describe('getDaysDiff', () => {
    it('should return 0 for today', () => {
      setMockDate(2026, 6, 10);
      expect(getDaysDiff('2026-06-10')).toBe(0);
      restoreDate();
    });
    
    it('should return positive days for future date', () => {
      setMockDate(2026, 6, 10);
      expect(getDaysDiff('2026-06-15')).toBe(5);
      restoreDate();
    });
    
    it('should return negative days for past date', () => {
      setMockDate(2026, 6, 10);
      expect(getDaysDiff('2026-06-05')).toBe(-5);
      restoreDate();
    });
    
    it('should handle year boundary', () => {
      setMockDate(2026, 12, 31);
      expect(getDaysDiff('2027-01-01')).toBe(1);
      restoreDate();
    });
  });
  
  describe('isExpired', () => {
    it('should return false for today', () => {
      setMockDate(2026, 6, 10);
      expect(isExpired('2026-06-10')).toBe(false);
      restoreDate();
    });
    
    it('should return false for future date', () => {
      setMockDate(2026, 6, 10);
      expect(isExpired('2026-06-15')).toBe(false);
      restoreDate();
    });
    
    it('should return true for past date', () => {
      setMockDate(2026, 6, 10);
      expect(isExpired('2026-06-05')).toBe(true);
      restoreDate();
    });
  });
  
  describe('formatDisplayDate', () => {
    it('should format date correctly', () => {
      expect(formatDisplayDate('2026-06-10')).toBe('2026/06/10');
    });
    
    it('should handle single digit month and day', () => {
      expect(formatDisplayDate('2026-01-05')).toBe('2026/01/05');
    });
  });
  
  describe('getDaysLabel', () => {
    it('should return correct label for countdown future', () => {
      expect(getDaysLabel('countdown', 5)).toBe('还有 5 天');
    });
    
    it('should return correct label for countdown today', () => {
      expect(getDaysLabel('countdown', 0)).toBe('就是今天');
    });
    
    it('should return correct label for countdown past', () => {
      expect(getDaysLabel('countdown', -5)).toBe('已过 5 天');
    });
    
    it('should return correct label for anniversary past', () => {
      expect(getDaysLabel('anniversary', 5)).toBe('已过 5 天');
    });
    
    it('should return correct label for anniversary future', () => {
      expect(getDaysLabel('anniversary', -5)).toBe('还有 5 天');
    });
  });
  
  describe('getDaysNumber', () => {
    it('should return positive number for countdown future', () => {
      expect(getDaysNumber('countdown', 5)).toBe(5);
    });
    
    it('should return absolute value for countdown past', () => {
      expect(getDaysNumber('countdown', -5)).toBe(5);
    });
    
    it('should return absolute value for anniversary', () => {
      expect(getDaysNumber('anniversary', -5)).toBe(5);
      expect(getDaysNumber('anniversary', 5)).toBe(5);
    });
  });
  
  describe('getYearAnniversary', () => {
    it('should calculate years correctly before birthday', () => {
      setMockDate(2026, 5, 10);
      expect(getYearAnniversary('2020-06-15')).toBe(5);
      restoreDate();
    });
    
    it('should calculate years correctly on birthday', () => {
      setMockDate(2026, 6, 15);
      expect(getYearAnniversary('2020-06-15')).toBe(6);
      restoreDate();
    });
    
    it('should calculate years correctly after birthday', () => {
      setMockDate(2026, 7, 10);
      expect(getYearAnniversary('2020-06-15')).toBe(6);
      restoreDate();
    });
  });
});
