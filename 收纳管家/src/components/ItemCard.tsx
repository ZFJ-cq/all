import { useState, useRef, useCallback } from 'react'
import { Item, CATEGORY_CONFIG } from '@/types'
import { MapPin, Trash2, Edit3 } from 'lucide-react'
import { useItemStore } from '@/store'

interface ItemCardProps {
  item: Item
  onEdit: (item: Item) => void
}

const ACTION_WIDTH = 80

export default function ItemCard({ item, onEdit }: ItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [offset, setOffset] = useState(0)
  const offsetRef = useRef(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)
  const isScrolling = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const deleteItem = useItemStore((s) => s.deleteItem)
  const config = CATEGORY_CONFIG[item.category]

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = false
    isScrolling.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isScrolling.current) return

    const diffX = e.touches[0].clientX - touchStartX.current
    const diffY = e.touches[0].clientY - touchStartY.current

    if (!isSwiping.current && !isScrolling.current) {
      if (Math.abs(diffY) > Math.abs(diffX)) {
        isScrolling.current = true
        return
      }
      if (Math.abs(diffX) > 5) {
        isSwiping.current = true
      }
    }

    if (!isSwiping.current) return

    e.preventDefault()

    const baseOffset = offsetRef.current
    let newOffset = baseOffset + diffX

    if (newOffset > 0) newOffset = 0
    if (newOffset < -ACTION_WIDTH) newOffset = -ACTION_WIDTH

    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${newOffset}px)`
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) return

    if (cardRef.current) {
      const currentTransform = cardRef.current.style.transform
      const match = currentTransform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/)
      if (match) {
        const currentOffset = parseFloat(match[1])
        if (currentOffset < -ACTION_WIDTH / 2) {
          offsetRef.current = -ACTION_WIDTH
          setOffset(-ACTION_WIDTH)
          cardRef.current.style.transform = `translateX(${-ACTION_WIDTH}px)`
        } else {
          offsetRef.current = 0
          setOffset(0)
          cardRef.current.style.transform = 'translateX(0px)'
        }
      }
    }
  }

  const resetSwipe = useCallback(() => {
    offsetRef.current = 0
    setOffset(0)
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0px)'
    }
  }, [])

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => deleteItem(item.id), 250)
  }

  const showActions = offset < -ACTION_WIDTH / 2

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ${isDeleting ? 'opacity-0 scale-95 h-0 mb-3' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={cardRef}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 transition-transform duration-200 hover:shadow-md active:scale-[0.98]"
        style={{ transform: `translateX(${offset}px)` }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: config.color + '15' }}
          >
            {config.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-gray-800 truncate">
                {item.name}
              </h3>
              <span className="shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1 rounded-xl text-sm font-bold bg-primary-50 text-primary">
                {item.quantity}
                <span className="text-[10px] font-medium opacity-60">{item.unit}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 truncate">{item.location}</span>
              </div>
              <span
                className="shrink-0 inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{
                  backgroundColor: config.color + '12',
                  color: config.color,
                }}
              >
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-1.5 pr-2">
          <button
            onClick={() => { onEdit(item); resetSwipe() }}
            className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors active:scale-95"
          >
            <Edit3 size={17} />
          </button>
          <button
            onClick={handleDelete}
            className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors active:scale-95"
          >
            <Trash2 size={17} />
          </button>
        </div>
      )}
    </div>
  )
}
