import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Category, Item, DEFAULT_ITEMS } from '@/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ItemStore {
  items: Item[]
  searchQuery: string
  activeCategory: Category | 'all'
  initialized: boolean
  toasts: Toast[]
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void
  addItems: (items: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>[]) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  deleteItem: (id: string) => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: Category | 'all') => void
  initDefaultData: () => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useItemStore = create<ItemStore>()(
  persist(
    (set, get) => ({
      items: [],
      searchQuery: '',
      activeCategory: 'all' as Category | 'all',
      initialized: false,
      toasts: [],

      addToast: (message, type = 'success') => {
        const id = generateId()
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }))
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }))
        }, 2500)
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      addItem: (item) => {
        const now = Date.now()
        set((state) => ({
          items: [
            {
              ...item,
              id: generateId(),
              createdAt: now,
              updatedAt: now,
            },
            ...state.items,
          ],
        }))
        get().addToast(`已添加「${item.name}」`)
      },

      addItems: (items) => {
        const now = Date.now()
        const newItems = items.map((item, index) => ({
          ...item,
          id: generateId() + '-' + index,
          createdAt: now + index,
          updatedAt: now + index,
        }))
        set((state) => ({
          items: [...newItems, ...state.items],
        }))
        get().addToast(`已添加 ${items.length} 个物品`)
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: Date.now() }
              : item
          ),
        }))
        get().addToast('物品已更新', 'info')
      },

      deleteItem: (id) => {
        const item = get().items.find((i) => i.id === id)
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
        if (item) {
          get().addToast(`已删除「${item.name}」`, 'error')
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveCategory: (category) => set({ activeCategory: category }),

      initDefaultData: () => {
        const { initialized } = get()
        if (!initialized) {
          const now = Date.now()
          const defaultItems = DEFAULT_ITEMS.map((item, index) => ({
            ...item,
            id: generateId() + '-default-' + index,
            createdAt: now - (DEFAULT_ITEMS.length - index) * 60000,
            updatedAt: now - (DEFAULT_ITEMS.length - index) * 60000,
          }))
          set({ items: defaultItems, initialized: true })
        }
      },
    }),
    {
      name: 'shouna-guanjia-items',
      partialize: (state) => ({
        items: state.items,
        initialized: state.initialized,
      }),
    }
  )
)
