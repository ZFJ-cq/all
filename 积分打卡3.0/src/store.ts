import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import type { Task, CheckinRecord, ExchangeRecord, ExchangeItem, AppConfig, StreakInfo, BackupData, Pet } from './types';
import { DEFAULT_EXCHANGE_ITEMS, DEFAULT_PET_SHOP_ITEMS, PET_LEVEL_EXP, PET_FOODS, PET_INTERACTIONS } from './types';

interface AppState {
  tasks: Task[];
  checkins: Record<string, CheckinRecord[]>;
  exchanges: ExchangeRecord[];
  exchangeItems: ExchangeItem[];
  config: AppConfig;
  pets: Pet[];
  achievements: string[];

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, 'name' | 'points' | 'type' | 'deadline' | 'tag'>>) => void;
  deleteTask: (id: string) => void;
  reuseTemporaryTask: (id: string) => void;

  checkin: (taskId: string, date: string, customTime?: string) => boolean;
  uncheckin: (taskId: string, date: string) => void;

  exchange: (points: number, label: string) => void;
  clearExchanges: () => void;
  markExchangeUsed: (id: string) => void;

  addExchangeItem: (item: Omit<ExchangeItem, 'id'>) => void;
  deleteExchangeItem: (id: string) => void;

  buyPet: (shopItemIndex: number) => boolean;
  feedPet: (petId: string, foodId: string) => boolean;
  interactPet: (petId: string, interactionId: string) => boolean;
  renamePet: (petId: string, name: string) => void;
  updateNickname: (name: string) => void;

  refreshDaily: () => void;

  getDayPoints: (date: string) => number;
  getIncompletePoints: (date: string) => number;
  getTodayTasks: () => { incomplete: Task[]; completed: Task[] };
  isTaskChecked: (taskId: string, date: string) => boolean;
  getDayAllRecords: (date: string) => CheckinRecord[];

  getStreakInfo: () => StreakInfo;
  renewStreak: () => boolean;
  retroCheckin: (taskId: string, date: string) => boolean;
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
  cleanupOldData: () => void;
  reorderTasks: (taskIds: string[]) => void;
  sortTasksBy: (sortBy: 'points-desc' | 'points-asc' | 'type') => void;
  resetAllData: () => void;
  checkAchievements: () => string[];
}

function today(): string {
  return formatDate(new Date());
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      checkins: {},
      exchanges: [],
      exchangeItems: DEFAULT_EXCHANGE_ITEMS.map((item, i) => ({ ...item, id: `default-${i}` })),
      config: { lastVisitDate: today(), startDate: today(), totalPointsSpent: 0 },
      pets: [],
      achievements: [],

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: genId(),
          createdAt: today(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      // 删除任务时保留历史打卡记录（积分不消失）
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          // 不再删除 checkins 中的历史记录
        }));
      },

      // 临时任务再次使用：更新 createdAt 为今天，使其重新出现在今日任务中
      reuseTemporaryTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id && t.type === 'temporary' ? { ...t, createdAt: today() } : t
          ),
        }));
      },

      checkin: (taskId, date, customTime) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return false;

        // 检查截止时间
        if (task.deadline && date === today()) {
          const now = getCurrentTime();
          if (now > task.deadline) return false; // 超过截止时间不可打卡
        }

        const dayRecords = state.checkins[date] || [];
        // 防止重复打卡
        if (dayRecords.some((r) => r.taskId === taskId && r.completed)) return false;

        const record: CheckinRecord = {
          id: genId(),
          taskId,
          taskName: task.name,
          taskType: task.type,
          date,
          checkinTime: customTime || getCurrentTime(),
          completed: true,
          pointsEarned: task.points,
        };

        // 检查是否触发连续7天奖励
        const newCheckins = {
          ...state.checkins,
          [date]: [...(state.checkins[date] || []), record],
        };
        const streakInfo = getStreakInfoWithCheckins(newCheckins);
        let bonusRecord: CheckinRecord | null = null;
        if (streakInfo.current > 0 && streakInfo.current % 7 === 0) {
          // 检查今天是否已经获得过7天奖励
          const hasBonusToday = (newCheckins[date] || []).some(
            (r) => r.taskId === 'streak-bonus' && r.completed
          );
          if (!hasBonusToday) {
            bonusRecord = {
              id: genId(),
              taskId: 'streak-bonus',
              taskName: '连续7天奖励',
              taskType: 'system',
              date,
              checkinTime: getCurrentTime(),
              completed: true,
              pointsEarned: 10,
            };
          }
        }

        if (bonusRecord) {
          set((state) => ({
            checkins: {
              ...state.checkins,
              [date]: [...(state.checkins[date] || []), record, bonusRecord!],
            },
          }));
        } else {
          set((state) => ({
            checkins: {
              ...state.checkins,
              [date]: [...(state.checkins[date] || []), record],
            },
          }));
        }

        return true;
      },

      uncheckin: (taskId, date) => {
        set((state) => {
          const dayRecords = (state.checkins[date] || []).filter(
            (r) => !(r.taskId === taskId && r.completed)
          );
          // 如果移除该任务后当天不再有普通打卡记录，也移除当天的7天连续奖励
          const hasNormalCheckin = dayRecords.some(
            (r) => r.completed && r.taskId !== 'streak-bonus'
          );
          const finalRecords = hasNormalCheckin
            ? dayRecords
            : dayRecords.filter((r) => r.taskId !== 'streak-bonus');
          const newCheckins = { ...state.checkins };
          if (finalRecords.length > 0) {
            newCheckins[date] = finalRecords;
          } else {
            delete newCheckins[date];
          }
          return { checkins: newCheckins };
        });
      },

      exchange: (points, label) => {
        const state = get();
        const totalPoints = calculateTotalPoints(state);
        if (totalPoints < points) return;

        const record: ExchangeRecord = {
          id: genId(),
          tier: points,
          pointsCost: points,
          exchangedAt: new Date().toISOString(),
          note: label ? `${points}积分兑换${label}` : undefined,
        };
        set((state) => ({
          exchanges: [...state.exchanges, record],
          config: { ...state.config, totalPointsSpent: state.config.totalPointsSpent + points },
        }));
      },

      clearExchanges: () => {
        set({ exchanges: [] });
      },

      markExchangeUsed: (id) => {
        set((state) => ({
          exchanges: state.exchanges.map((r) =>
            r.id === id && !r.usedAt ? { ...r, usedAt: new Date().toISOString() } : r
          ),
        }));
      },

      addExchangeItem: (item) => {
        const newItem: ExchangeItem = { ...item, id: genId() };
        set((state) => ({ exchangeItems: [...state.exchangeItems, newItem] }));
      },

      deleteExchangeItem: (id) => {
        set((state) => ({ exchangeItems: state.exchangeItems.filter((i) => i.id !== id) }));
      },

      buyPet: (shopItemIndex) => {
        const state = get();
        const shopItem = DEFAULT_PET_SHOP_ITEMS[shopItemIndex];
        if (!shopItem) return false;

        // 检查是否已拥有同种宠物
        if (state.pets.some((p) => p.species === shopItem.species)) return false;

        const totalPoints = calculateTotalPoints(state);
        if (totalPoints < shopItem.price) return false;

        const newPet: Pet = {
          id: genId(),
          species: shopItem.species,
          name: shopItem.name,
          level: 1,
          exp: 0,
          hunger: 80,
          mood: 80,
          adoptedAt: new Date().toISOString(),
        };

        set((state) => ({
          pets: [...state.pets, newPet],
          config: { ...state.config, totalPointsSpent: state.config.totalPointsSpent + shopItem.price },
        }));
        return true;
      },

      feedPet: (petId, foodId) => {
        const state = get();
        const food = PET_FOODS.find((f) => f.id === foodId);
        if (!food) return false;

        const pet = state.pets.find((p) => p.id === petId);
        if (!pet) return false;

        // 饱食度和心情都满时不允许喂食
        if (pet.hunger >= 100 && pet.mood >= 100) return false;

        const totalPoints = calculateTotalPoints(state);
        if (totalPoints < food.price) return false;

        // 计算新经验值和等级
        let newExp = pet.exp + food.expGain;
        let newLevel = pet.level;
        while (newLevel < 10 && newExp >= (PET_LEVEL_EXP[newLevel + 1] || Infinity)) {
          newExp -= PET_LEVEL_EXP[newLevel + 1];
          newLevel++;
        }
        // 满级后经验不再累积
        if (newLevel >= 10) newExp = PET_LEVEL_EXP[10];

        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === petId
              ? {
                  ...p,
                  hunger: Math.min(100, p.hunger + food.hungerRestore),
                  mood: Math.min(100, p.mood + food.moodRestore),
                  exp: newExp,
                  level: newLevel,
                  lastFedAt: new Date().toISOString(),
                }
              : p
          ),
          config: { ...state.config, totalPointsSpent: state.config.totalPointsSpent + food.price },
        }));
        return true;
      },

      interactPet: (petId, interactionId) => {
        const state = get();
        const interaction = PET_INTERACTIONS.find((i) => i.id === interactionId);
        if (!interaction) return false;

        const pet = state.pets.find((p) => p.id === petId);
        if (!pet) return false;

        // 心情已满时不允许互动
        if (pet.mood >= 100) return false;

        // 每日限制：每种互动每天只能用一次
        const todayStr = today();
        const dailyInteractions = pet.dailyInteractions || {};
        if (dailyInteractions[interactionId] === todayStr) return false;

        // 计算新经验值和等级
        let newExp = pet.exp + interaction.expGain;
        let newLevel = pet.level;
        while (newLevel < 10 && newExp >= (PET_LEVEL_EXP[newLevel + 1] || Infinity)) {
          newExp -= PET_LEVEL_EXP[newLevel + 1];
          newLevel++;
        }
        // 满级后经验不再累积
        if (newLevel >= 10) newExp = PET_LEVEL_EXP[10];

        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === petId
              ? {
                  ...p,
                  mood: Math.min(100, p.mood + interaction.moodRestore),
                  exp: newExp,
                  level: newLevel,
                  dailyInteractions: {
                    ...(p.dailyInteractions || {}),
                    [interactionId]: todayStr,
                  },
                }
              : p
          ),
        }));
        return true;
      },

      renamePet: (petId, name) => {
        set((state) => ({
          pets: state.pets.map((p) => (p.id === petId ? { ...p, name } : p)),
        }));
      },

      updateNickname: (name) => {
        set((state) => ({
          config: { ...state.config, nickname: name },
        }));
      },

      refreshDaily: () => {
        const state = get();
        const todayStr = today();
        if (state.config.lastVisitDate !== todayStr) {
          // 临时任务超过1天未使用则清理
          const filteredTasks = state.tasks.filter(
            (t) => t.type === 'fixed' || t.createdAt === todayStr
          );

          // 宠物饱食度/心情每日衰减
          const daysDiff = Math.max(1, Math.round(
            (new Date(todayStr).getTime() - new Date(state.config.lastVisitDate).getTime()) / 86400000
          ));
          const decayPerDay = 8;
          const totalDecay = decayPerDay * daysDiff;
          const decayedPets = state.pets.map((p) => ({
            ...p,
            hunger: Math.max(0, p.hunger - totalDecay),
            mood: Math.max(0, p.mood - totalDecay),
          }));

          set({
            tasks: filteredTasks,
            config: { ...state.config, lastVisitDate: todayStr },
            pets: decayedPets,
          });
        }
        get().cleanupOldData();
      },

      getDayPoints: (date) => {
        const state = get();
        return calculateDayPoints(state, date);
      },

      getIncompletePoints: (date) => {
        const state = get();
        const dayRecords = state.checkins[date] || [];
        const completedTaskIds = new Set(
          dayRecords.filter((r) => r.completed).map((r) => r.taskId)
        );
        const todayTasks = getTodayTaskList(state, date);
        return todayTasks
          .filter((t) => !completedTaskIds.has(t.id))
          .reduce((sum, t) => sum + t.points, 0);
      },

      getTodayTasks: () => {
        const state = get();
        const todayStr = today();
        const todayTaskList = getTodayTaskList(state, todayStr);
        const dayRecords = state.checkins[todayStr] || [];
        const completedTaskIds = new Set(
          dayRecords.filter((r) => r.completed).map((r) => r.taskId)
        );
        return {
          incomplete: todayTaskList.filter((t) => !completedTaskIds.has(t.id)),
          completed: todayTaskList.filter((t) => completedTaskIds.has(t.id)),
        };
      },

      isTaskChecked: (taskId, date) => {
        const state = get();
        const dayRecords = state.checkins[date] || [];
        return dayRecords.some((r) => r.taskId === taskId && r.completed);
      },

      getDayAllRecords: (date) => {
        const state = get();
        const dayRecords = state.checkins[date] || [];
        const completedTaskIds = new Set(
          dayRecords.filter((r) => r.completed).map((r) => r.taskId)
        );
        const dayTasks = getTodayTaskList(state, date);
        const incompleteRecords: CheckinRecord[] = dayTasks
          .filter((t) => !completedTaskIds.has(t.id))
          .map((t) => ({
            id: `incomplete-${t.id}-${date}`,
            taskId: t.id,
            taskName: t.name,
            taskType: t.type,
            date,
            checkinTime: '',
            completed: false,
            pointsEarned: t.points,
          }));
        return [...dayRecords, ...incompleteRecords];
      },

      getStreakInfo: () => {
        const state = get();
        const checkins = state.checkins;

        // 判断某天是否有完成的打卡记录
        const hasCheckin = (date: string): boolean => {
          const records = checkins[date] || [];
          return records.some((r) => r.completed);
        };

        // 从某天开始往前计算连续打卡天数
        const countStreakFrom = (startDate: string): number => {
          let count = 0;
          const d = new Date(startDate + 'T00:00:00');
          while (true) {
            const dateStr = formatDate(d);
            if (hasCheckin(dateStr)) {
              count++;
              d.setDate(d.getDate() - 1);
            } else {
              break;
            }
          }
          return count;
        };

        const todayStr = today();
        let current: number;
        let lastCheckinDate = '';
        let isBroken = false;
        let brokenStreak = 0;

        // 找到最后打卡日期
        const allDates = Object.keys(checkins).filter((d) => hasCheckin(d)).sort();
        if (allDates.length > 0) {
          lastCheckinDate = allDates[allDates.length - 1];
        }

        if (hasCheckin(todayStr)) {
          current = countStreakFrom(todayStr);
        } else {
          // 今天没有打卡，从昨天开始算
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = formatDate(yesterday);
          if (hasCheckin(yesterdayStr)) {
            current = countStreakFrom(yesterdayStr);
          } else {
            current = 0;
            // 判断是否断签：昨天和今天都没有打卡
            isBroken = true;
            // 找到断签前的连续天数
            const dayBefore = new Date();
            dayBefore.setDate(dayBefore.getDate() - 2);
            brokenStreak = countStreakFrom(formatDate(dayBefore));
          }
        }

        // 计算最长连续天数：扫描所有日期
        let longest = current;
        const sortedDates = Object.keys(checkins).sort();
        if (sortedDates.length > 0) {
          let streak = 0;
          let prevDate: Date | null = null;
          for (const dateStr of sortedDates) {
            if (!hasCheckin(dateStr)) continue;
            const curDate = new Date(dateStr + 'T00:00:00');
            if (prevDate) {
              const diff = (curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
              if (Math.round(diff) === 1) {
                streak++;
              } else {
                streak = 1;
              }
            } else {
              streak = 1;
            }
            if (streak > longest) longest = streak;
            prevDate = curDate;
          }
        }

        return {
          current,
          longest,
          lastCheckinDate,
          isBroken,
          brokenStreak,
        };
      },

      renewStreak: () => {
        const state = get();
        const streakInfo = get().getStreakInfo();
        if (!streakInfo.isBroken) return false;

        const totalPoints = calculateTotalPoints(state);
        if (totalPoints < 50) return false;

        // 扣除50积分，添加兑换记录
        const record: ExchangeRecord = {
          id: genId(),
          tier: 50,
          pointsCost: 50,
          exchangedAt: new Date().toISOString(),
          note: '续签扣费',
          usedAt: new Date().toISOString(),
        };

        // 找到缺失的那天（昨天），设置打卡记录
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        const renewRecord: CheckinRecord = {
          id: genId(),
          taskId: 'renew-streak',
          taskName: '续签',
          taskType: 'system',
          date: yesterdayStr,
          checkinTime: '续签',
          completed: true,
          pointsEarned: 0,
        };

        set((state) => ({
          exchanges: [...state.exchanges, record],
          checkins: {
            ...state.checkins,
            [yesterdayStr]: [...(state.checkins[yesterdayStr] || []), renewRecord],
          },
          config: { ...state.config, totalPointsSpent: state.config.totalPointsSpent + 50 },
        }));

        return true;
      },

      retroCheckin: (taskId, date) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return false;

        const dayRecords = state.checkins[date] || [];
        // 防止重复打卡
        if (dayRecords.some((r) => r.taskId === taskId && r.completed)) return false;

        // 补卡费用：该任务积分 × 5
        const cost = task.points * 5;

        // 检查积分是否足够
        const totalPoints = calculateTotalPoints(state);
        if (totalPoints < cost) return false;

        // 扣除积分，添加兑换记录
        const exchangeRecord: ExchangeRecord = {
          id: genId(),
          tier: cost,
          pointsCost: cost,
          exchangedAt: new Date().toISOString(),
          note: `补卡扣费：${task.name}(${task.points}分×5)`,
          usedAt: new Date().toISOString(),
        };

        const record: CheckinRecord = {
          id: genId(),
          taskId,
          taskName: task.name,
          taskType: task.type,
          date,
          checkinTime: '补卡',
          completed: true,
          pointsEarned: task.points,
          isRetro: true,
        };

        set((state) => ({
          exchanges: [...state.exchanges, exchangeRecord],
          checkins: {
            ...state.checkins,
            [date]: [...(state.checkins[date] || []), record],
          },
          config: { ...state.config, totalPointsSpent: state.config.totalPointsSpent + cost },
        }));

        return true;
      },

      exportBackup: () => {
        const state = get();
        const data: BackupData = {
          version: 4,
          exportedAt: new Date().toISOString(),
          tasks: state.tasks,
          checkins: state.checkins,
          exchanges: state.exchanges,
          exchangeItems: state.exchangeItems,
          config: state.config,
          pets: state.pets,
          achievements: state.achievements,
        };
        return JSON.stringify(data);
      },

      importBackup: (json) => {
        try {
          const data = JSON.parse(json) as BackupData;
          if (!data.tasks || !data.checkins || !data.exchanges || !data.config) {
            return false;
          }
          set({
            tasks: data.tasks,
            checkins: data.checkins,
            exchanges: data.exchanges,
            exchangeItems: data.exchangeItems || DEFAULT_EXCHANGE_ITEMS.map((item, i) => ({ ...item, id: `default-${i}` })),
            config: data.config,
            pets: data.pets || [],
            achievements: data.achievements || [],
          });
          return true;
        } catch {
          return false;
        }
      },

      cleanupOldData: () => {
        const state = get();
        const now = new Date();
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffStr = formatDate(cutoff);

        // 找出所有临时任务的ID
        const tempTaskIds = new Set(state.tasks.filter((t) => t.type === 'temporary').map((t) => t.id));

        const newCheckins: Record<string, CheckinRecord[]> = {};
        for (const [date, records] of Object.entries(state.checkins)) {
          if (date < cutoffStr) {
            // 超过90天的日期，只保留非临时任务的记录
            const nonTempRecords = records.filter((r) => !tempTaskIds.has(r.taskId));
            if (nonTempRecords.length > 0) {
              newCheckins[date] = nonTempRecords;
            }
          } else {
            newCheckins[date] = records;
          }
        }

        set({ checkins: newCheckins });
      },

      reorderTasks: (taskIds) => {
        const state = get();
        const taskMap = new Map(state.tasks.map((t) => [t.id, t]));
        const reordered: Task[] = [];
        for (const id of taskIds) {
          const task = taskMap.get(id);
          if (task) reordered.push(task);
        }
        // 添加不在 taskIds 中的任务（防止遗漏）
        for (const task of state.tasks) {
          if (!taskIds.includes(task.id)) {
            reordered.push(task);
          }
        }
        set({ tasks: reordered });
      },

      sortTasksBy: (sortBy) => {
        const state = get();
        const sorted = [...state.tasks];
        switch (sortBy) {
          case 'points-desc':
            sorted.sort((a, b) => b.points - a.points);
            break;
          case 'points-asc':
            sorted.sort((a, b) => a.points - b.points);
            break;
          case 'type':
            sorted.sort((a, b) => {
              if (a.type === b.type) return 0;
              if (a.type === 'fixed') return -1;
              return 1;
            });
            break;
        }
        set({ tasks: sorted });
      },

      resetAllData: () => {
        set({
          tasks: [],
          checkins: {},
          exchanges: [],
          exchangeItems: DEFAULT_EXCHANGE_ITEMS.map((item, i) => ({ ...item, id: `default-${i}` })),
          config: { lastVisitDate: today(), startDate: today(), totalPointsSpent: 0 },
          pets: [],
          achievements: [],
        });
      },

      checkAchievements: () => {
        const state = get();
        const unlocked = new Set(state.achievements);
        const newAchievements: string[] = [];

        // 计算统计数据
        const totalCheckins = Object.values(state.checkins).reduce(
          (sum, records) => sum + records.filter(r => r.completed && r.taskId !== 'streak-bonus' && r.taskId !== 'renew-streak').length, 0
        );
        const streakInfo = get().getStreakInfo();
        const totalEarned = Object.values(state.checkins).reduce(
          (sum, records) => sum + records.filter(r => r.completed).reduce((s, r) => s + r.pointsEarned, 0), 0
        );
        const exchangeCount = state.exchanges.length;
        const petCount = state.pets.length;
        const hasMaxLevelPet = state.pets.some(p => p.level >= 10);

        // 检查每个成就
        const checks: Record<string, boolean> = {
          'first-checkin': totalCheckins >= 1,
          'streak-7': streakInfo.current >= 7 || streakInfo.longest >= 7,
          'streak-30': streakInfo.current >= 30 || streakInfo.longest >= 30,
          'streak-100': streakInfo.current >= 100 || streakInfo.longest >= 100,
          'total-100': totalCheckins >= 100,
          'total-500': totalCheckins >= 500,
          'first-pet': petCount >= 1,
          'pet-3': petCount >= 3,
          'pet-5': petCount >= 5,
          'pet-max-level': hasMaxLevelPet,
          'first-exchange': exchangeCount >= 1,
          'exchange-10': exchangeCount >= 10,
          'points-1000': totalEarned >= 1000,
          'points-5000': totalEarned >= 5000,
          'all-daily': (() => {
            const todayStr = today();
            const todayTasks = state.tasks.filter(t => t.type === 'fixed' || t.createdAt === todayStr);
            if (todayTasks.length === 0) return false;
            const dayRecords = state.checkins[todayStr] || [];
            const completedIds = new Set(dayRecords.filter(r => r.completed).map(r => r.taskId));
            return todayTasks.every(t => completedIds.has(t.id));
          })(),
        };

        for (const [id, condition] of Object.entries(checks)) {
          if (condition && !unlocked.has(id)) {
            newAchievements.push(id);
          }
        }

        if (newAchievements.length > 0) {
          set((state) => ({
            achievements: [...state.achievements, ...newAchievements],
          }));
        }

        return newAchievements;
      },
    }),
    {
      name: 'points-checkin-storage',
      version: 4,
      storage: {
        getItem: (name) => {
          const compressed = localStorage.getItem(name);
          if (!compressed) return null;
          try {
            const decompressed = decompressFromUTF16(compressed);
            return JSON.parse(decompressed);
          } catch {
            // 兼容旧数据：尝试直接解析
            try {
              return JSON.parse(compressed);
            } catch {
              return null;
            }
          }
        },
        setItem: (name, value) => {
          const json = JSON.stringify(value);
          const compressed = compressToUTF16(json);
          localStorage.setItem(name, compressed);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          // v0 -> v1: 添加 config.totalPointsSpent
          if (persisted.config && persisted.config.totalPointsSpent === undefined) {
            const spent = (persisted.exchanges || []).reduce(
              (sum: number, r: any) => sum + (r.pointsCost || 0), 0
            );
            persisted.config.totalPointsSpent = spent;
          }
        }
        if (version < 2) {
          // v1 -> v2: 添加 exchangeItems
          if (!persisted.exchangeItems) {
            persisted.exchangeItems = DEFAULT_EXCHANGE_ITEMS.map((item: Omit<ExchangeItem, 'id'>, i: number) => ({ ...item, id: `default-${i}` }));
          }
        }
        if (version < 3) {
          // v2 -> v3: 添加 pets
          if (!persisted.pets) {
            persisted.pets = [];
          }
        }
        if (version < 4) {
          // v3 -> v4: 添加 achievements
          if (!persisted.achievements) {
            persisted.achievements = [];
          }
        }
        return persisted;
      },
    }
  )
);

function getTodayTaskList(state: AppState, date: string): Task[] {
  return state.tasks.filter((t) => t.type === 'fixed' || t.createdAt === date);
}

// 根据给定的 checkins 数据计算连续打卡信息
function getStreakInfoWithCheckins(checkins: Record<string, CheckinRecord[]>): StreakInfo {
  const hasCheckin = (date: string): boolean => {
    const records = checkins[date] || [];
    return records.some((r) => r.completed);
  };

  const countStreakFrom = (startDate: string): number => {
    let count = 0;
    const d = new Date(startDate + 'T00:00:00');
    while (true) {
      const dateStr = formatDate(d);
      if (hasCheckin(dateStr)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  };

  const todayStr = today();
  let current: number;
  let lastCheckinDate = '';
  let isBroken = false;
  let brokenStreak = 0;

  const allDates = Object.keys(checkins).filter((d) => hasCheckin(d)).sort();
  if (allDates.length > 0) {
    lastCheckinDate = allDates[allDates.length - 1];
  }

  if (hasCheckin(todayStr)) {
    current = countStreakFrom(todayStr);
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    if (hasCheckin(yesterdayStr)) {
      current = countStreakFrom(yesterdayStr);
    } else {
      current = 0;
      isBroken = true;
      const dayBefore = new Date();
      dayBefore.setDate(dayBefore.getDate() - 2);
      brokenStreak = countStreakFrom(formatDate(dayBefore));
    }
  }

  let longest = current;
  const sortedDates = Object.keys(checkins).sort();
  if (sortedDates.length > 0) {
    let streak = 0;
    let prevDate: Date | null = null;
    for (const dateStr of sortedDates) {
      if (!hasCheckin(dateStr)) continue;
      const curDate = new Date(dateStr + 'T00:00:00');
      if (prevDate) {
        const diff = (curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (Math.round(diff) === 1) {
          streak++;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      if (streak > longest) longest = streak;
      prevDate = curDate;
    }
  }

  return { current, longest, lastCheckinDate, isBroken, brokenStreak };
}

function calculateDayPoints(state: AppState, date: string): number {
  const dayRecords = state.checkins[date] || [];
  return dayRecords.filter((r) => r.completed).reduce((sum, r) => sum + r.pointsEarned, 0);
}

function calculateTotalPoints(state: AppState): number {
  let total = 0;
  for (const records of Object.values(state.checkins)) {
    total += records.filter((r) => r.completed).reduce((sum, r) => sum + r.pointsEarned, 0);
  }
  total -= state.config.totalPointsSpent || 0;
  return Math.max(0, total);
}

export function getTotalPoints(state: AppState): number {
  return calculateTotalPoints(state);
}

export function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function getWeekDates(offset: number = 0): string[] {
  const dates: string[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const baseDate = new Date(now);
  baseDate.setDate(now.getDate() + mondayOffset + offset * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

export function getMonthDates(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(formatDate(new Date(year, month, i)));
  }
  return dates;
}
