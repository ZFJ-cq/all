import { Category, CATEGORY_CONFIG } from '@/types'
import { useItemStore } from '@/store'
import {
  ChefHat,
  Bed,
  Sofa,
  Bath,
  BookOpen,
  Package,
  Box,
  LayoutGrid,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  ChefHat,
  Bed,
  Sofa,
  Bath,
  BookOpen,
  Package,
  Box,
}

const ALL_CATEGORIES = (Object.keys(CATEGORY_CONFIG) as Category[]).map((key) => ({
  key,
  ...CATEGORY_CONFIG[key],
}))

export default function CategoryTabs() {
  const activeCategory = useItemStore((s) => s.activeCategory)
  const setActiveCategory = useItemStore((s) => s.setActiveCategory)
  const items = useItemStore((s) => s.items)

  const getCount = (cat: Category | 'all') => {
    if (cat === 'all') return items.length
    return items.filter((i) => i.category === cat).length
  }

  return (
    <div className="mb-5 overflow-x-auto scrollbar-hide -mx-1 px-1">
      <div className="flex gap-2 min-w-max pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            activeCategory === 'all'
              ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <LayoutGrid size={15} />
          全部
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            activeCategory === 'all' ? 'bg-white/20' : 'bg-gray-100'
          }`}>
            {getCount('all')}
          </span>
        </button>
        {ALL_CATEGORIES.map(({ key, label, icon, color }) => {
          const IconComponent = ICON_MAP[icon]
          const count = getCount(key)
          if (count === 0 && activeCategory !== key) return null
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === key
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
              style={activeCategory === key ? { backgroundColor: color, boxShadow: `0 4px 14px ${color}40` } : {}}
            >
              {IconComponent && <IconComponent size={15} />}
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === key ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
