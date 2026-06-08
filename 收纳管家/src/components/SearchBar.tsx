import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useItemStore } from '@/store'

export default function SearchBar() {
  const searchQuery = useItemStore((s) => s.searchQuery)
  const setSearchQuery = useItemStore((s) => s.setSearchQuery)
  const activeCategory = useItemStore((s) => s.activeCategory)
  const setActiveCategory = useItemStore((s) => s.setActiveCategory)

  return (
    <div className="relative mb-4">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索物品名称或存放位置..."
        className="w-full pl-11 pr-20 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-12 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X size={14} className="text-gray-500" />
        </button>
      )}
      <button
        onClick={() => setActiveCategory(activeCategory === 'all' ? 'kitchen' : 'all')}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        title="筛选分类"
      >
        <SlidersHorizontal size={16} className="text-gray-400" />
      </button>
    </div>
  )
}
