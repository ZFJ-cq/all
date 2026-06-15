import { useState, useRef, useEffect } from 'react';
import { CheckSquare, Trash2, FolderInput, X, CheckCheck } from 'lucide-react';
import { useStore } from '@/store';
import { CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

export default function BatchActionBar() {
  const {
    selectedIds,
    batchMode,
    selectAll,
    clearSelection,
    toggleBatchMode,
    deleteSelected,
    batchUpdateCategory,
    batchToggleComplete,
    setConfirmAction,
    getFilteredDates,
    settings,
  } = useStore();

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const filteredDates = getFilteredDates();
  const allSelected = selectedIds.length > 0 && selectedIds.length === filteredDates.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setShowCategoryMenu(false);
      }
    }
    if (showCategoryMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryMenu]);

  if (!batchMode) return null;

  const hasSelection = selectedIds.length > 0;

  const handleBatchDelete = () => {
    if (!hasSelection) return;
    setConfirmAction({
      message: `确定删除选中的 ${selectedIds.length} 条日期吗？`,
      onConfirm: () => {
        deleteSelected(selectedIds);
        clearSelection();
      },
    });
  };

  const handleBatchCategory = (category: string) => {
    if (!hasSelection) return;
    batchUpdateCategory(category);
    setShowCategoryMenu(false);
  };

  const handleBatchToggleComplete = () => {
    if (!hasSelection) return;
    batchToggleComplete();
  };

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const handleExit = () => {
    clearSelection();
    toggleBatchMode();
  };

  const categoryOptions = [...CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'custom'), ...settings.customCategories];

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 animate-slide-up',
      )}
    >
      <div className="bg-white/95 dark:bg-surface-card-dark/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          {/* Selection info */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-body text-text-secondary dark:text-text-secondary-dark">
              已选中 <span className="font-bold text-morandi-coral">{selectedIds.length}</span> 项
            </span>
            <button
              onClick={handleExit}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="退出批量模式"
            >
              <X className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Select All / Deselect */}
            <button
              onClick={handleSelectAll}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body transition-colors whitespace-nowrap',
                allSelected
                  ? 'bg-morandi-coral/10 text-morandi-coral dark:text-morandi-coral'
                  : 'bg-black/5 dark:bg-white/5 text-text-primary dark:text-text-primary-dark hover:bg-black/8 dark:hover:bg-white/8'
              )}
            >
              <CheckCheck className="w-4 h-4" />
              {allSelected ? '取消全选' : '全选'}
            </button>

            {/* Batch Delete */}
            <button
              onClick={handleBatchDelete}
              disabled={!hasSelection}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body transition-colors whitespace-nowrap',
                hasSelection
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : 'bg-black/3 dark:bg-white/3 text-text-secondary/50 dark:text-text-secondary-dark/50 cursor-not-allowed'
              )}
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>

            {/* Batch Category */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => hasSelection && setShowCategoryMenu(!showCategoryMenu)}
                disabled={!hasSelection}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body transition-colors whitespace-nowrap',
                  hasSelection
                    ? 'bg-morandi-blue/10 text-morandi-blue-dark dark:text-morandi-blue-light hover:bg-morandi-blue/20'
                    : 'bg-black/3 dark:bg-white/3 text-text-secondary/50 dark:text-text-secondary-dark/50 cursor-not-allowed'
                )}
              >
                <FolderInput className="w-4 h-4" />
                修改分类
              </button>
              {showCategoryMenu && hasSelection && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-surface-card-dark rounded-xl shadow-modal border border-black/5 dark:border-white/5 py-1 min-w-[140px] animate-scale-in">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleBatchCategory(cat.id)}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors text-text-primary dark:text-text-primary-dark hover:bg-black/3 dark:hover:bg-white/5"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Batch Toggle Complete */}
            <button
              onClick={handleBatchToggleComplete}
              disabled={!hasSelection}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body transition-colors whitespace-nowrap',
                hasSelection
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'bg-black/3 dark:bg-white/3 text-text-secondary/50 dark:text-text-secondary-dark/50 cursor-not-allowed'
              )}
            >
              <CheckSquare className="w-4 h-4" />
              完成切换
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
