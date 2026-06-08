export type Category = 'kitchen' | 'bedroom' | 'living' | 'bathroom' | 'study' | 'daily' | 'other'

export interface Item {
  id: string
  name: string
  quantity: number
  unit: string
  location: string
  category: Category
  createdAt: number
  updatedAt: number
}

export interface ParsedItem {
  name: string
  quantity: number
  unit: string
  category: Category
  location: string
}

export const CATEGORY_CONFIG: Record<Category, { label: string; icon: string; emoji: string; color: string }> = {
  kitchen: { label: '厨房', icon: 'ChefHat', emoji: '🍳', color: '#FF8C42' },
  bedroom: { label: '卧室', icon: 'Bed', emoji: '🛏️', color: '#9B59B6' },
  living: { label: '客厅', icon: 'Sofa', emoji: '🛋️', color: '#4A90E2' },
  bathroom: { label: '卫浴', icon: 'Bath', emoji: '🚿', color: '#1ABC9C' },
  study: { label: '书房', icon: 'BookOpen', emoji: '📚', color: '#34495E' },
  daily: { label: '日用品', icon: 'Package', emoji: '📦', color: '#E67E22' },
  other: { label: '其他', icon: 'Box', emoji: '📋', color: '#95A5A6' },
}

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  kitchen: ['锅', '碗', '筷', '勺', '盘', '刀', '砧板', '米', '油', '盐', '酱', '醋', '冰箱', '微波炉', '烤箱', '灶', '煲', '壶', '杯', '碟', '盆', '桶', '厨', '饭', '菜', '汤', '炒'],
  bedroom: ['床', '被', '枕', '毯', '衣柜', '床头柜', '梳妆台', '床垫', '被子', '枕头', '睡', '蚊帐', '席'],
  living: ['沙发', '茶几', '电视', '空调', '地毯', '窗帘', '柜', '桌', '椅', '凳', '灯', '花瓶', '摆件'],
  bathroom: ['毛巾', '牙刷', '沐浴', '洗发', '马桶', '花洒', '浴', '洗', '厕', '镜', '吹风机', '梳子'],
  study: ['书', '笔', '电脑', '打印机', '书架', '台灯', '文具', '文件', '打印', '墨', '纸', '尺', '橡皮'],
  daily: ['纸巾', '洗衣', '拖把', '扫帚', '垃圾', '电池', '插线板', '充电', '伞', '工具', '胶带', '剪刀', '针线'],
  other: [],
}

export const UNIT_OPTIONS = ['个', '只', '口', '把', '条', '件', '套', '双', '对', '组', '包', '箱', '瓶', '罐', '桶', '袋', '盒', '本', '张', '块', '床', '台', '部', '支', '根']

export const DEFAULT_ITEMS: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: '炒锅', quantity: 2, unit: '口', location: '厨房橱柜', category: 'kitchen' },
  { name: '汤锅', quantity: 3, unit: '个', location: '厨房橱柜', category: 'kitchen' },
  { name: '筷子', quantity: 1, unit: '套', location: '厨房抽屉', category: 'kitchen' },
  { name: '米桶', quantity: 1, unit: '个', location: '厨房角落', category: 'kitchen' },
  { name: '棉被', quantity: 3, unit: '床', location: '主卧衣柜', category: 'bedroom' },
  { name: '枕头', quantity: 4, unit: '个', location: '主卧床头', category: 'bedroom' },
  { name: '沙发', quantity: 1, unit: '组', location: '客厅中央', category: 'living' },
  { name: '毛巾', quantity: 6, unit: '条', location: '卫浴架', category: 'bathroom' },
  { name: '纸巾', quantity: 12, unit: '包', location: '储物间', category: 'daily' },
]
