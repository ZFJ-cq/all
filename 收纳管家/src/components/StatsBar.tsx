import { useItemStore } from '@/store'
import { Package, Grid3X3, TrendingUp } from 'lucide-react'

export default function StatsBar() {
  const items = useItemStore((s) => s.items)
  const categories = new Set(items.map((i) => i.category))
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary to-blue-500 rounded-3xl px-5 py-5 mb-5 shadow-lg shadow-primary/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-medium tracking-wider uppercase">物品种类</p>
              <p className="text-xl font-bold text-white leading-tight">{items.length}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-white/15" />

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-medium tracking-wider uppercase">物品总数</p>
              <p className="text-xl font-bold text-white leading-tight">{totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Grid3X3 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-white/60 font-medium tracking-wider uppercase">分类</p>
            <p className="text-xl font-bold text-white leading-tight">{categories.size}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
