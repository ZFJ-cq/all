import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pin, Pencil, Trash2, Check, GripVertical, CheckSquare } from 'lucide-react';
import type { DateItem } from '@/types';
import { getDaysDiff, getDaysNumber, getDaysLabel, formatDisplayDate, isExpired } from '@/utils/dateCalc';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

interface DateCardProps {
  item: DateItem;
  batchMode?: boolean;
  isSelected?: boolean;
  searchQuery?: string;
  isList?: boolean;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-morandi-coral/20 text-inherit rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function DateCard({ item, batchMode = false, isSelected = false, searchQuery = '', isList = false }: DateCardProps) {
  const { togglePin, setEditingItem, setShowAddModal, setConfirmAction, deleteDate, selectDate, getCategoryLabel, getCategoryColor } = useStore();
  const days = getDaysDiff(item.date);
  const daysNum = getDaysNumber(item.type, days);
  const daysLabel = getDaysLabel(item.type, days);
  const expired = isExpired(item.date);
  const catLabel = getCategoryLabel(item.category);
  const catColor = getCategoryColor(item.category);
  const isCountdown = item.type === 'countdown';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmAction({
      message: `确定删除「${item.title}」吗？`,
      onConfirm: () => deleteDate(item.id),
    });
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(item.id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectDate(item.id);
  };

  const topBarColor = isCountdown ? 'bg-morandi-blue' : 'bg-morandi-pink';
  const numColor = isCountdown ? 'text-morandi-blue-dark dark:text-morandi-blue-light' : 'text-morandi-pink-dark dark:text-morandi-pink-light';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-card bg-white dark:bg-surface-card-dark shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden',
        isList ? 'hover:scale-[1.01]' : 'hover:scale-[1.02]',
        'cursor-default',
        isDragging && 'opacity-50 scale-105 shadow-card-hover z-50',
        expired && 'opacity-70',
        item.completed && 'opacity-60',
        isSelected && batchMode && 'ring-2 ring-morandi-coral/60 shadow-card-hover'
      )}
    >
      {/* Top color bar - thin in list mode */}
      <div className={cn(isList ? 'h-0.5' : 'h-1', topBarColor)} />

      {/* Batch mode checkbox */}
      {batchMode && (
        <button
          onClick={handleSelect}
          className={cn(
            'absolute top-3 left-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-morandi-coral border-morandi-coral text-white'
              : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-surface-card-dark/80 hover:border-morandi-coral/60'
          )}
        >
          {isSelected && <CheckSquare className="w-4 h-4" />}
        </button>
      )}

      <div className={cn(isList ? 'px-4 py-3 flex items-center gap-4' : 'p-4 pb-3')}>
        {/* List mode: horizontal layout */}
        {isList ? (
          <>
            {/* Drag handle */}
            {!batchMode && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-0.5 -m-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity touch-none flex-shrink-0"
              >
                <GripVertical className="w-4 h-4 text-text-secondary" />
              </div>
            )}

            {/* Core number */}
            <div className="flex items-baseline gap-1.5 flex-shrink-0 min-w-[80px]">
              <span className={cn('font-display font-extrabold text-2xl leading-none', numColor)}>
                {daysNum}
              </span>
              <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body whitespace-nowrap">
                {daysLabel}
              </span>
            </div>

            {/* Title & meta */}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-display font-bold text-sm truncate',
                'text-text-primary dark:text-text-primary-dark',
                item.completed && 'line-through'
              )}>
                {highlightText(item.title, searchQuery)}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark font-body">
                  {formatDisplayDate(item.date)}
                </span>
                {catLabel && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium text-white"
                    style={{ backgroundColor: catColor }}
                  >
                    {catLabel}
                  </span>
                )}
                {expired && item.type === 'countdown' && (
                  <span className="text-[9px] text-text-secondary dark:text-text-secondary-dark">已过期</span>
                )}
                {item.completed && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-green-600 dark:text-green-400">
                    <Check className="w-2 h-2" /> 已完成
                  </span>
                )}
              </div>
            </div>

            {/* Action icons */}
            {!batchMode && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={handlePin}
                  className={cn(
                    'p-1 rounded-md transition-colors',
                    item.pinned
                      ? 'text-morandi-coral'
                      : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                  )}
                  title={item.pinned ? '取消置顶' : '置顶'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
                  title="编辑"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-red-500 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Grid mode: vertical layout */}
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Drag handle - hidden in batch mode */}
                {!batchMode && (
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-0.5 -m-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity touch-none"
                >
                  <GripVertical className="w-4 h-4 text-text-secondary" />
                </div>
                )}

                <h3 className={cn(
                  'font-display font-bold text-base truncate',
                  'text-text-primary dark:text-text-primary-dark',
                  item.completed && 'line-through'
                )}>
                  {highlightText(item.title, searchQuery)}
                </h3>
              </div>

              {/* Action icons - show on hover, hidden in batch mode */}
              {!batchMode && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={handlePin}
                  className={cn(
                    'p-1 rounded-md transition-colors',
                    item.pinned
                      ? 'text-morandi-coral'
                      : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                  )}
                  title={item.pinned ? '取消置顶' : '置顶'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
                  title="编辑"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-red-500 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              )}
            </div>

            {/* Core number */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className={cn('font-display font-extrabold text-4xl leading-none', numColor)}>
                {daysNum}
              </span>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark font-body">
                {daysLabel}
              </span>
            </div>

            {/* Date & Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body">
                {formatDisplayDate(item.date)}
              </span>
              {catLabel && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                  style={{ backgroundColor: catColor }}
                >
                  {catLabel}
                </span>
              )}
              {expired && item.type === 'countdown' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-300/50 dark:bg-gray-600/50 text-text-secondary dark:text-text-secondary-dark">
                  已过期
                </span>
              )}
              {item.completed && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <Check className="w-2.5 h-2.5" /> 已完成
                </span>
              )}
            </div>

            {/* Note preview */}
            {item.note && (
              <p className="mt-2 text-xs text-text-secondary dark:text-text-secondary-dark font-body line-clamp-1">
                {highlightText(item.note, searchQuery)}
              </p>
            )}
          </>
        )}
      </div>

      {/* Pinned indicator */}
      {item.pinned && (
        <div className="absolute top-1 right-2">
          <Pin className="w-3 h-3 text-morandi-coral fill-morandi-coral" />
        </div>
      )}
    </div>
  );
}
