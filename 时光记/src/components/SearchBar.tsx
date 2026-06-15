import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '@/store';

export default function SearchBar() {
  const { settings, updateSettings } = useStore();
  const [inputValue, setInputValue] = useState(settings.searchQuery);

  // 防抖更新 store
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== settings.searchQuery) {
        updateSettings({ searchQuery: inputValue });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, settings.searchQuery, updateSettings]);

  // 同步外部 store 变化（如 reset）
  useEffect(() => {
    if (settings.searchQuery !== inputValue) {
      setInputValue(settings.searchQuery);
    }
  }, [settings.searchQuery]);

  const handleClear = useCallback(() => {
    setInputValue('');
    updateSettings({ searchQuery: '' });
  }, [updateSettings]);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-text-secondary dark:text-text-secondary-dark pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="搜索标题或备注..."
          className={`
            w-full pl-9 pr-9 py-2.5 rounded-xl
            bg-[#F5F0EB] dark:bg-[#252540]
            text-text-primary dark:text-text-primary-dark
            placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50
            text-sm font-body
            border border-transparent
            focus:outline-none focus:border-morandi-coral/30 focus:ring-1 focus:ring-morandi-coral/20
            transition-all duration-200
            shadow-sm
          `}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded-full
              text-text-secondary dark:text-text-secondary-dark
              hover:text-text-primary dark:hover:text-text-primary-dark
              hover:bg-black/5 dark:hover:bg-white/10
              transition-colors"
            title="清除搜索"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
