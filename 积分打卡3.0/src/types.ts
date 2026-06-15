export interface Task {
  id: string;
  name: string;
  points: number;
  type: 'fixed' | 'temporary';
  createdAt: string;
  deadline?: string; // 可选截止时间，格式 "HH:MM"，超过此时间不可打卡
  tag?: string;
}

export interface CheckinRecord {
  id: string;
  taskId: string;
  taskName: string;
  taskType: string;
  date: string;
  checkinTime: string;
  completed: boolean;
  pointsEarned: number;
  isRetro?: boolean;
}

export interface ExchangeRecord {
  id: string;
  tier: number;
  pointsCost: number;
  exchangedAt: string;
  note?: string;
  usedAt?: string; // 使用时间，有值表示已使用
}

export interface ExchangeItem {
  id: string;
  points: number;
  label: string;
}

export const DEFAULT_EXCHANGE_ITEMS: Omit<ExchangeItem, 'id'>[] = [
  { points: 100, label: '95折优惠' },
  { points: 300, label: '9折优惠' },
  { points: 500, label: '8折优惠' },
];

export interface AppConfig {
  lastVisitDate: string;
  startDate: string;
  totalPointsSpent: number; // 累计消耗积分（清空记录后不返还）
  nickname?: string; // 用户昵称
}

export interface StreakInfo {
  current: number;       // 当前连续打卡天数
  longest: number;       // 历史最长连续天数
  lastCheckinDate: string; // 最后打卡日期
  isBroken: boolean;     // 是否断签
  brokenStreak: number;  // 断签前的连续天数
}

export interface BackupData {
  version: number;
  exportedAt: string;
  tasks: Task[];
  checkins: Record<string, CheckinRecord[]>;
  exchanges: ExchangeRecord[];
  exchangeItems: ExchangeItem[];
  config: AppConfig;
  pets?: Pet[];
  achievements?: string[];
}

// 宠物类型
export type PetSpecies = 'cat' | 'dog' | 'rabbit' | 'hamster' | 'fish' | 'bird' | 'dragon' | 'turtle' | 'penguin' | 'fox' | 'bear' | 'deer' | 'unicorn';

// 宠物信息
export interface Pet {
  id: string;
  species: PetSpecies;
  name: string;
  level: number;
  exp: number;
  hunger: number;       // 饱食度 0-100
  mood: number;         // 心情 0-100
  adoptedAt: string;    // 领养时间
  lastFedAt?: string;   // 上次喂养时间
  dailyInteractions?: Record<string, string>; // 每日互动记录 { interactionId: date }
}

// 宠物商店商品
export interface PetShopItem {
  id: string;
  species: PetSpecies;
  name: string;
  price: number;        // 购买所需积分
  emoji: string;        // 显示emoji
  description: string;  // 描述
}

// 喂养食物
export interface PetFood {
  id: string;
  name: string;
  price: number;        // 喂养消耗积分
  hungerRestore: number; // 恢复饱食度
  moodRestore: number;   // 恢复心情
  expGain: number;       // 获得经验
  emoji: string;
}

// 升级所需经验表（等级 -> 所需经验）
export const PET_LEVEL_EXP: Record<number, number> = {
  1: 0,
  2: 30,
  3: 80,
  4: 150,
  5: 250,
  6: 400,
  7: 600,
  8: 850,
  9: 1200,
  10: 1600,
};

// 宠物商店默认商品
export const DEFAULT_PET_SHOP_ITEMS: Omit<PetShopItem, 'id'>[] = [
  { species: 'cat', name: '小橘猫', price: 250, emoji: '🐱', description: '温顺可爱的小橘猫' },
  { species: 'dog', name: '柴犬', price: 400, emoji: '🐶', description: '忠诚活泼的柴犬' },
  { species: 'rabbit', name: '小白兔', price: 300, emoji: '🐰', description: '软萌的小白兔' },
  { species: 'hamster', name: '仓鼠', price: 200, emoji: '🐹', description: '圆滚滚的小仓鼠' },
  { species: 'fish', name: '锦鲤', price: 500, emoji: '🐟', description: '带来好运的锦鲤' },
  { species: 'bird', name: '鹦鹉', price: 350, emoji: '🦜', description: '聪明伶俐的鹦鹉' },
  { species: 'dragon', name: '小火龙', price: 1000, emoji: '🐉', description: '传说中的小火龙' },
  { species: 'turtle', name: '小海龟', price: 225, emoji: '🐢', description: '悠然自得的小海龟' },
  { species: 'penguin', name: '企鹅', price: 600, emoji: '🐧', description: '憨态可掬的企鹅' },
  { species: 'fox', name: '小狐狸', price: 450, emoji: '🦊', description: '机灵可爱的小狐狸' },
  { species: 'bear', name: '小熊', price: 425, emoji: '🐻', description: '憨厚可爱的小熊' },
  { species: 'deer', name: '小鹿', price: 550, emoji: '🦌', description: '优雅灵动的小鹿' },
  { species: 'unicorn', name: '独角兽', price: 1500, emoji: '🦄', description: '神秘梦幻的独角兽' },
];

// 喂养食物列表
export const PET_FOODS: PetFood[] = [
  { id: 'food-basic', name: '普通粮', price: 5, hungerRestore: 20, moodRestore: 5, expGain: 5, emoji: '🍚' },
  { id: 'food-premium', name: '优质粮', price: 15, hungerRestore: 40, moodRestore: 15, expGain: 15, emoji: '🥩' },
  { id: 'food-luxury', name: '豪华大餐', price: 30, hungerRestore: 70, moodRestore: 30, expGain: 30, emoji: '🍖' },
  { id: 'food-snack', name: '小零食', price: 3, hungerRestore: 10, moodRestore: 20, expGain: 3, emoji: '🍪' },
  { id: 'food-toy', name: '玩具', price: 10, hungerRestore: 0, moodRestore: 40, expGain: 10, emoji: '🧸' },
];

// 成就定义
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'checkin' | 'pet' | 'exchange' | 'special';
}

export const ACHIEVEMENTS: Achievement[] = [
  // 打卡成就
  { id: 'first-checkin', name: '初出茅庐', description: '完成第一次打卡', emoji: '🌟', category: 'checkin' },
  { id: 'streak-7', name: '坚持不懈', description: '连续打卡7天', emoji: '🔥', category: 'checkin' },
  { id: 'streak-30', name: '习惯养成', description: '连续打卡30天', emoji: '💪', category: 'checkin' },
  { id: 'streak-100', name: '百炼成钢', description: '连续打卡100天', emoji: '👑', category: 'checkin' },
  { id: 'total-100', name: '积少成多', description: '累计打卡100次', emoji: '📊', category: 'checkin' },
  { id: 'total-500', name: '打卡达人', description: '累计打卡500次', emoji: '🏅', category: 'checkin' },
  // 宠物成就
  { id: 'first-pet', name: '初识萌宠', description: '领养第一只宠物', emoji: '🐾', category: 'pet' },
  { id: 'pet-3', name: '小小动物园', description: '领养3只宠物', emoji: '🏡', category: 'pet' },
  { id: 'pet-5', name: '宠物收藏家', description: '领养5只宠物', emoji: '🎪', category: 'pet' },
  { id: 'pet-max-level', name: '满级宠物', description: '宠物达到10级', emoji: '⭐', category: 'pet' },
  // 兑换成就
  { id: 'first-exchange', name: '初次兑换', description: '完成第一次兑换', emoji: '🎁', category: 'exchange' },
  { id: 'exchange-10', name: '兑换达人', description: '累计兑换10次', emoji: '🛍️', category: 'exchange' },
  // 特殊成就
  { id: 'points-1000', name: '千分俱乐部', description: '累计获得1000积分', emoji: '💰', category: 'special' },
  { id: 'points-5000', name: '积分大亨', description: '累计获得5000积分', emoji: '💎', category: 'special' },
  { id: 'all-daily', name: '今日满分', description: '一天内完成所有任务', emoji: '🏆', category: 'special' },
];

// 宠物互动
export interface PetInteraction {
  id: string;
  name: string;
  moodRestore: number;   // 恢复心情
  expGain: number;       // 获得经验
  emoji: string;
  description: string;
}

export const PET_INTERACTIONS: PetInteraction[] = [
  { id: 'interact-stroke', name: '抚摸', moodRestore: 15, expGain: 2, emoji: '🤗', description: '轻轻抚摸，增加亲密度' },
  { id: 'interact-play', name: '玩耍', moodRestore: 25, expGain: 5, emoji: '🎾', description: '一起玩耍，快乐加倍' },
  { id: 'interact-talk', name: '聊天', moodRestore: 10, expGain: 1, emoji: '💬', description: '和宠物说说话' },
  { id: 'interact-sing', name: '唱歌', moodRestore: 20, expGain: 3, emoji: '🎵', description: '给宠物唱首歌' },
];
