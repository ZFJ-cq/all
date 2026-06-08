import { useItemStore } from '@/store'
import { Item } from '@/types'
import ItemCard from './ItemCard'
import { Inbox, Mic } from 'lucide-react'

interface ItemListProps {
  onEditItem: (item: Item) => void
}

export default function ItemList({ onEditItem }: ItemListProps) {
  const items = useItemStore((s) => s.items)
  const searchQuery = useItemStore((s) => s.searchQuery)
  const activeCategory = useItemStore((s) => s.activeCategory)

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-5 shadow-inner">
          {searchQuery ? (
            <Inbox size={40} className="text-gray-300" />
          ) : (
            <Mic size={40} className="text-accent/40" />
          )}
        </div>
        <p className="text-base font-semibold text-gray-500 mb-1">
          {searchQuery ? '没有找到匹配的物品' : '还没有物品'}
        </p>
        <p className="text-sm text-gray-400 text-center max-w-[200px]">
          {searchQuery ? '试试其他关键词' : '点击下方麦克风，说出物品名称即可录入'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-36">
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
        >
          <ItemCard item={item} onEdit={onEditItem} />
        </div>
      ))}
    </div>
  )
}
