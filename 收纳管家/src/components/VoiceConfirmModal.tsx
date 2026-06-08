import { useState, useEffect } from 'react'
import { ParsedItem, CATEGORY_CONFIG, UNIT_OPTIONS } from '@/types'
import { X, Check, MapPin, Sparkles, MinusCircle } from 'lucide-react'

interface VoiceConfirmModalProps {
  isOpen: boolean
  items: ParsedItem[]
  onConfirm: (items: ParsedItem[]) => void
  onClose: () => void
}

export default function VoiceConfirmModal({ isOpen, items, onConfirm, onClose }: VoiceConfirmModalProps) {
  const [editingItems, setEditingItems] = useState<ParsedItem[]>([])

  useEffect(() => {
    if (isOpen && items.length > 0) {
      setEditingItems([...items])
    }
  }, [isOpen, items])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const updateItem = (index: number, field: keyof ParsedItem, value: string | number) => {
    setEditingItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const removeItem = (index: number) => {
    setEditingItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    onConfirm(editingItems.filter((item) => item.name.trim()))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />

      <div className="relative w-full max-w-md max-h-[80vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <div>
              <h2 className="text-base font-bold text-gray-800">语音识别结果</h2>
              <p className="text-xs text-gray-400 mt-0.5">共识别到 {editingItems.length} 个物品，请确认后入库</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 overflow-y-auto max-h-[50vh]">
          {editingItems.map((item, index) => {
            const config = CATEGORY_CONFIG[item.category]
            return (
              <div
                key={index}
                className="bg-surface rounded-2xl p-4 border border-gray-100 relative"
              >
                <button
                  onClick={() => removeItem(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <MinusCircle size={16} />
                </button>

                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{config.emoji}</span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="物品名称"
                      className="col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="数量"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="w-20 px-2 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value as typeof item.category)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>

                    <div className="col-span-2 relative">
                      <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={item.location}
                        onChange={(e) => updateItem(index, 'location', e.target.value)}
                        placeholder="存放位置"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={editingItems.length === 0}
            className={`flex-1 py-3.5 rounded-2xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              editingItems.length > 0
                ? 'bg-gradient-to-r from-primary to-blue-500 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]'
                : 'bg-gray-200 cursor-not-allowed text-gray-400'
            }`}
          >
            <Check size={17} />
            确认入库 ({editingItems.length})
          </button>
        </div>
      </div>
    </div>
  )
}
