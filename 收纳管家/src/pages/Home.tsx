import { useState, useCallback, useEffect } from 'react'
import { useItemStore } from '@/store'
import { Item, ParsedItem } from '@/types'
import { parseVoiceInput } from '@/utils/nlp'
import StatsBar from '@/components/StatsBar'
import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import ItemList from '@/components/ItemList'
import VoiceButton from '@/components/VoiceButton'
import VoiceConfirmModal from '@/components/VoiceConfirmModal'
import AddItemModal from '@/components/AddItemModal'
import EditItemModal from '@/components/EditItemModal'
import ToastContainer from '@/components/ToastContainer'
import { Plus, House } from 'lucide-react'

export default function Home() {
  const addItem = useItemStore((s) => s.addItem)
  const addItems = useItemStore((s) => s.addItems)
  const updateItem = useItemStore((s) => s.updateItem)
  const initDefaultData = useItemStore((s) => s.initDefaultData)
  const initialized = useItemStore((s) => s.initialized)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])

  useEffect(() => {
    if (!initialized) {
      initDefaultData()
    }
  }, [initialized, initDefaultData])

  const handleVoiceResult = useCallback((text: string) => {
    const items = parseVoiceInput(text)
    if (items.length > 0) {
      setParsedItems(items)
      setConfirmOpen(true)
    }
  }, [])

  const handleConfirm = useCallback((items: ParsedItem[]) => {
    if (items.length === 1) {
      addItem(items[0])
    } else {
      addItems(items)
    }
  }, [addItem, addItems])

  const handleManualAdd = useCallback((item: { name: string; quantity: number; unit: string; location: string; category: ParsedItem['category'] }) => {
    addItem(item)
  }, [addItem])

  const handleEditSave = useCallback((id: string, updates: Partial<Item>) => {
    updateItem(id, updates)
  }, [updateItem])

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <header className="mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-md shadow-primary/20">
                <House size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">收纳管家</h1>
                <p className="text-[11px] text-gray-400">说出物品，轻松清点</p>
              </div>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="w-10 h-10 rounded-2xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all active:scale-95"
            >
              <Plus size={20} className="text-primary" />
            </button>
          </div>
        </header>

        <StatsBar />
        <SearchBar />
        <CategoryTabs />
        <ItemList onEditItem={setEditItem} />
      </div>

      <VoiceButton onResult={handleVoiceResult} />
      <VoiceConfirmModal
        isOpen={confirmOpen}
        items={parsedItems}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />
      <AddItemModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleManualAdd}
      />
      <EditItemModal
        isOpen={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleEditSave}
      />
      <ToastContainer />
    </div>
  )
}
