import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { CATEGORIES } from '@/types';
import type { DateItem } from '@/types';
import { getDaysDiff, getDaysLabel } from '@/utils/dateCalc';
import { cn } from '@/lib/utils';

type CalendarMode = 'month' | 'week';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getWeekRange(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function getCategoryColor(category: string): string {
  const cat = CATEGORIES.find((c) => c.id === category);
  return cat?.color ?? '#9B9BB0';
}

export default function CalendarView() {
  const { getFilteredDates, setEditingItem, setShowAddModal } = useStore();
  const filteredDates = getFilteredDates();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Build a map of dateKey -> DateItem[]
  const dateEventsMap = useMemo(() => {
    const map: Record<string, DateItem[]> = {};
    filteredDates.forEach((item) => {
      if (!map[item.date]) {
        map[item.date] = [];
      }
      map[item.date].push(item);
    });
    return map;
  }, [filteredDates]);

  // Month view: build grid cells
  const monthCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    const cells: { dateKey: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({ dateKey: formatDateKey(y, m, day), day, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ dateKey: formatDateKey(currentYear, currentMonth, d), day: d, isCurrentMonth: true });
    }

    // Next month leading days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({ dateKey: formatDateKey(y, m, d), day: d, isCurrentMonth: false });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Week view: 7 days
  const weekDays = useMemo(() => {
    return getWeekRange(currentDate).map((d) => ({
      date: d,
      dateKey: formatDateKey(d.getFullYear(), d.getMonth(), d.getDate()),
    }));
  }, [currentDate]);

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (calendarMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else {
        d.setDate(d.getDate() - 7);
      }
      return d;
    });
    setSelectedDate(null);
  }, [calendarMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (calendarMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else {
        d.setDate(d.getDate() + 7);
      }
      return d;
    });
    setSelectedDate(null);
  }, [calendarMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }, []);

  const monthTitle = `${currentYear}年${currentMonth + 1}月`;

  const selectedEvents = selectedDate ? (dateEventsMap[selectedDate] ?? []) : [];

  const handleEventClick = (item: DateItem) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Month/Week toggle */}
          <div className="flex rounded-lg overflow-hidden border border-black/5 dark:border-white/10">
            <button
              onClick={() => setCalendarMode('month')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                calendarMode === 'month'
                  ? 'bg-morandi-coral text-white'
                  : 'bg-white dark:bg-surface-card-dark text-text-secondary dark:text-text-secondary-dark hover:bg-black/3 dark:hover:bg-white/5'
              )}
            >
              月
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                calendarMode === 'week'
                  ? 'bg-morandi-coral text-white'
                  : 'bg-white dark:bg-surface-card-dark text-text-secondary dark:text-text-secondary-dark hover:bg-black/3 dark:hover:bg-white/5'
              )}
            >
              周
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-surface-card-dark border border-black/5 dark:border-white/10 text-text-secondary dark:text-text-secondary-dark hover:bg-black/3 dark:hover:bg-white/5 transition-colors"
          >
            今天
          </button>
          <button
            onClick={navigatePrev}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
          <h2 className="font-display font-bold text-lg text-text-primary dark:text-text-primary-dark min-w-[100px] text-center">
            {monthTitle}
          </h2>
          <button
            onClick={navigateNext}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium text-text-secondary dark:text-text-secondary-dark py-2"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {calendarMode === 'month' ? (
        <div className="grid grid-cols-7 gap-1">
          {monthCells.map((cell, idx) => {
            const events = dateEventsMap[cell.dateKey] ?? [];
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedDate;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(cell.dateKey === selectedDate ? null : cell.dateKey)}
                className={cn(
                  'relative flex flex-col items-center justify-start p-1.5 min-h-[64px] rounded-xl transition-all',
                  cell.isCurrentMonth
                    ? 'text-text-primary dark:text-text-primary-dark'
                    : 'text-text-secondary/40 dark:text-text-secondary-dark/40',
                  isToday && 'bg-morandi-coral/10',
                  isSelected && 'ring-2 ring-morandi-coral/50 bg-morandi-coral/5',
                  !isSelected && cell.isCurrentMonth && 'hover:bg-black/3 dark:hover:bg-white/5',
                  !isToday && !isSelected && 'bg-white/50 dark:bg-surface-card-dark/50'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium leading-none w-7 h-7 flex items-center justify-center rounded-full',
                    isToday && 'bg-morandi-coral text-white'
                  )}
                >
                  {cell.day}
                </span>
                {/* Event dots */}
                {events.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-1 flex-wrap justify-center">
                    {events.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(ev.category) }}
                      />
                    ))}
                    {events.length > 3 && (
                      <span className="text-[9px] text-text-secondary dark:text-text-secondary-dark leading-none">
                        +{events.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Week view */
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(({ date, dateKey }) => {
            const events = dateEventsMap[dateKey] ?? [];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey === selectedDate ? null : dateKey)}
                className={cn(
                  'flex flex-col items-center p-2 min-h-[120px] rounded-xl transition-all',
                  isToday && 'bg-morandi-coral/10',
                  isSelected && 'ring-2 ring-morandi-coral/50 bg-morandi-coral/5',
                  !isSelected && 'hover:bg-black/3 dark:hover:bg-white/5',
                  !isToday && !isSelected && 'bg-white/50 dark:bg-surface-card-dark/50'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium leading-none w-7 h-7 flex items-center justify-center rounded-full mb-1',
                    isToday && 'bg-morandi-coral text-white'
                  )}
                >
                  {date.getDate()}
                </span>
                {/* Event list in week view */}
                <div className="w-full flex flex-col gap-0.5 mt-1">
                  {events.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] leading-tight truncate px-1 py-0.5 rounded"
                      style={{ backgroundColor: getCategoryColor(ev.category) + '30', color: getCategoryColor(ev.category) }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <span className="text-[10px] text-text-secondary dark:text-text-secondary-dark text-center">
                      +{events.length - 3} 更多
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected date events panel */}
      {selectedDate && (
        <div className="mt-4 bg-white dark:bg-surface-card-dark rounded-2xl border border-black/5 dark:border-white/5 p-4 animate-scale-in">
          <h3 className="font-display font-bold text-base text-text-primary dark:text-text-primary-dark mb-3">
            {selectedDate} 的事件
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark py-4 text-center">
              当天暂无事件
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedEvents.map((item) => {
                const days = getDaysDiff(item.date);
                const catColor = getCategoryColor(item.category);
                const catLabel = CATEGORIES.find((c) => c.id === item.category)?.label ?? '自定义';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleEventClick(item)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark transition-colors text-left w-full"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: catColor + '20', color: catColor }}
                        >
                          {catLabel}
                        </span>
                        <span className="text-[10px] text-text-secondary dark:text-text-secondary-dark">
                          {item.type === 'countdown' ? '倒计时' : '纪念日'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary dark:text-text-secondary-dark shrink-0">
                      {getDaysLabel(item.type, days)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
