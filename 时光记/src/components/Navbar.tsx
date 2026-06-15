import { useState } from 'react';
import { useStore } from '@/store';
import { LayoutGrid, List, Calendar, SlidersHorizontal, Settings, Clock, ArrowUpDown, Tag, BarChart3, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { settings, updateSettings, setShowSettings, setShowStatistics, batchMode, toggleBatchMode } = useStore();
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'nearest', label: '最近到期', icon: Clock },
    { value: 'created', label: '创建时间', icon: ArrowUpDown },
    { value: 'category', label: '分类排序', icon: Tag },
  ] as const;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-surface-dark/70 border-b border-black/5 dark:border-white/5">
      <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-morandi-blue to-morandi-pink flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display font-bold text-lg text-text-primary dark:text-text-primary-dark">
            时光记
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* View toggle */}
          <div className="flex items-center rounded-lg overflow-hidden border border-black/5 dark:border-white/10">
            <button
              onClick={() => updateSettings({ viewMode: 'grid' })}
              className={cn(
                'p-1.5 transition-colors',
                settings.viewMode === 'grid'
                  ? 'bg-morandi-coral text-white'
                  : 'text-text-secondary dark:text-text-secondary-dark hover:bg-black/3 dark:hover:bg-white/5'
              )}
              title="网格视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings({ viewMode: 'list' })}
              className={cn(
                'p-1.5 transition-colors',
                settings.viewMode === 'list'
                  ? 'bg-morandi-coral text-white'
                  : 'text-text-secondary dark:text-text-secondary-dark hover:bg-black/3 dark:hover:bg-white/5'
              )}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings({ viewMode: 'calendar' })}
              className={cn(
                'p-1.5 transition-colors',
                settings.viewMode === 'calendar'
                  ? 'bg-morandi-coral text-white'
                  : 'text-text-secondary dark:text-text-secondary-dark hover:bg-black/3 dark:hover:bg-white/5'
              )}
              title="日历视图"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="排序方式"
            >
              <SlidersHorizontal className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-surface-card-dark rounded-xl shadow-modal border border-black/5 dark:border-white/5 py-1 min-w-[160px] animate-scale-in">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (settings.sortBy === opt.value) {
                          updateSettings({ sortOrder: settings.sortOrder === 'asc' ? 'desc' : 'asc' });
                        } else {
                          updateSettings({ sortBy: opt.value, sortOrder: 'asc' });
                        }
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors',
                        settings.sortBy === opt.value
                          ? 'text-morandi-coral bg-morandi-coral/5'
                          : 'text-text-primary dark:text-text-primary-dark hover:bg-black/3 dark:hover:bg-white/5'
                      )}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                      {settings.sortBy === opt.value && (
                        <span className="ml-auto text-xs text-text-secondary dark:text-text-secondary-dark">
                          {settings.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Batch mode */}
          <button
            onClick={toggleBatchMode}
            className={cn(
              'p-2 rounded-lg transition-colors',
              batchMode
                ? 'bg-morandi-coral/10 text-morandi-coral'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary dark:text-text-secondary-dark'
            )}
            title={batchMode ? '退出批量操作' : '批量操作'}
          >
            <CheckSquare className="w-5 h-5" />
          </button>

          {/* Statistics */}
          <button
            onClick={() => setShowStatistics(true)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="统计分析"
          >
            <BarChart3 className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>
      </div>
    </header>
  );
}
