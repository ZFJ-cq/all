import { useStore } from '@/store';
import { CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

export default function CategoryFilter() {
  const { settings, setFilterCategory } = useStore();
  const allCategories = [...CATEGORIES, ...settings.customCategories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setFilterCategory(cat.id)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium font-body transition-all duration-200',
            settings.filterCategory === cat.id
              ? 'text-white shadow-sm'
              : 'bg-white/60 dark:bg-surface-card-dark/60 text-text-secondary dark:text-text-secondary-dark hover:bg-white/80 dark:hover:bg-surface-card-dark/80'
          )}
          style={
            settings.filterCategory === cat.id
              ? { backgroundColor: cat.color }
              : undefined
          }
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
