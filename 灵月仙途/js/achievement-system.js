/**
 * 灵月仙途 - 成就称号系统核心模块
 * 包含：事件总线、成就配置、条件判定、属性计算、数据持久化
 */

// ==================== 数据结构定义 ====================

/**
 * 成就配置数据结构
 * @typedef {Object} AchievementConfig
 * @property {number} id - 成就 ID
 * @property {string} name - 成就名称
 * @property {string} description - 成就描述
 * @property {string} module - 所属模块：cultivation(修炼)、sect(宗门)、skill(技能)、world(世界)
 * @property {string} conditionType - 条件类型：reach_level, collect_item, kill_count, complete_task 等
 * @property {string} operator - 操作符：>=, ==, >, <, <=
 * @property {number} threshold - 阈值
 * @property {Object} rewardAttributes - 奖励属性字典 {attack: 10, defense: 5}
 * @property {string} title - 奖励称号名称
 * @property {string} rarity - 稀有度：common, rare, epic, legendary
 * @property {string} icon - 图标
 * @property {boolean} hidden - 是否隐藏成就
 */

/**
 * 玩家成就数据
 * @typedef {Object} PlayerTitleData
 * @property {Array<number>} unlockedAchievements - 已解锁成就 ID 列表
 * @property {Object} achievementProgress - 成就进度 {achievementId: progress}
 * @property {number|null} equippedTitleId - 当前佩戴的称号 ID（单称号）
 * @property {Array<number>} claimedRewards - 已领取奖励的成就 ID
 * @property {boolean} hasUnclaimed - 是否有未领取的成就（红点标记）
 */

// ==================== 事件总线系统（Event Bus） ====================

/**
 * 事件总线 - 实现观察者模式
 * 用于解耦各模块与成就系统
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // 返回取消订阅函数
    return () => {
      this.off(eventName, callback);
    };
  }

  /**
   * 取消订阅
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(
      cb => cb !== callback
    );
  }

  /**
   * 发布事件
   * @param {string} eventName - 事件名称
   * @param {any} data - 事件数据
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    
    // 异步执行，避免阻塞主线程
    setTimeout(() => {
      this.events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件 ${eventName} 回调执行失败:`, error);
        }
      });
    }, 0);
  }

  /**
   * 清空事件
   * @param {string} eventName - 事件名称，不传则清空所有
   */
  clear(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
  }
}

// 创建全局事件总线实例
window.gameEventBus = new EventBus();

// ==================== 成就条件判定引擎 ====================

/**
 * 成就条件检查器
 * 支持多种条件类型的通用检查逻辑
 */
class AchievementConditionChecker {
  constructor() {
    this.operators = {
      '>=': (current, threshold) => current >= threshold,
      '==': (current, threshold) => current === threshold,
      '>': (current, threshold) => current > threshold,
      '<': (current, threshold) => current < threshold,
      '<=': (current, threshold) => current <= threshold,
      '!=': (current, threshold) => current !== threshold
    };
  }

  /**
   * 检查条件是否满足
   * @param {number} currentValue - 当前值
   * @param {string} operator - 操作符
   * @param {number} threshold - 阈值
   * @returns {boolean} 是否满足条件
   */
  check(currentValue, operator, threshold) {
    const op = this.operators[operator] || this.operators['>='];
    return op(currentValue, threshold);
  }

  /**
   * 计算进度百分比
   * @param {number} currentValue - 当前值
   * @param {number} threshold - 阈值
   * @returns {number} 进度百分比 (0-100)
   */
  calculateProgress(currentValue, threshold) {
    if (threshold <= 0) return 100;
    return Math.min(Math.round((currentValue / threshold) * 100), 100);
  }
}

window.achievementConditionChecker = new AchievementConditionChecker();

// ==================== 属性计算系统 ====================

/**
 * 属性加成管理器
 * 负责称号属性的累加计算和动态应用
 */
class TitleAttributeManager {
  constructor() {
    // 基础属性映射
    this.attributeMap = {
      attack: '攻击力',
      defense: '防御力',
      health: '生命值',
      mana: '法力值',
      qi: '气血',
      strength: '力量',
      agility: '敏捷',
      intelligence: '悟性',
      critical: '暴击率',
      dodge: '闪避率',
      cultivation: '修炼速度'
    };
  }

  /**
   * 应用称号属性加成
   * @param {Object} baseAttributes - 基础属性
   * @param {Object} titleBonuses - 称号加成
   * @returns {Object} 最终属性
   */
  applyBonuses(baseAttributes, titleBonuses) {
    const finalAttributes = { ...baseAttributes };

    for (const [attr, value] of Object.entries(titleBonuses)) {
      if (!finalAttributes[attr]) {
        finalAttributes[attr] = 0;
      }

      // 百分比加成 vs 固定值加成
      if (typeof value === 'string' && value.includes('%')) {
        const percent = parseFloat(value) / 100;
        finalAttributes[attr] = finalAttributes[attr] * (1 + percent);
      } else {
        finalAttributes[attr] = finalAttributes[attr] + Number(value);
      }
    }

    return finalAttributes;
  }

  /**
   * 移除称号属性加成
   * @param {Object} currentAttributes - 当前属性
   * @param {Object} titleBonuses - 称号加成
   * @returns {Object} 移除后的属性
   */
  removeBonuses(currentAttributes, titleBonuses) {
    const attributes = { ...currentAttributes };

    for (const [attr, value] of Object.entries(titleBonuses)) {
      if (!attributes[attr]) continue;

      if (typeof value === 'string' && value.includes('%')) {
        const percent = parseFloat(value) / 100;
        attributes[attr] = attributes[attr] / (1 + percent);
      } else {
        attributes[attr] = attributes[attr] - Number(value);
      }
    }

    return attributes;
  }

  /**
   * 获取属性名称（中文）
   * @param {string} attr - 属性键
   * @returns {string} 属性名称
   */
  getAttributeName(attr) {
    return this.attributeMap[attr] || attr;
  }
}

window.titleAttributeManager = new TitleAttributeManager();

// ==================== 成就管理核心逻辑 ====================

/**
 * 成就系统管理器
 * 统一管理成就解锁、佩戴、奖励领取等核心功能
 */
class AchievementSystem {
  constructor() {
    this.achievements = []; // 成就配置列表
    this.playerData = null; // 玩家成就数据
    this.eventBus = window.gameEventBus;
    this.conditionChecker = window.achievementConditionChecker;
    this.attributeManager = window.titleAttributeManager;
    this.storageKey = 'achievement_player_data';
    this.configStorageKey = 'achievement_config';
    
    this.initialize();
  }

  /**
   * 初始化系统
   */
  async initialize() {
    await this.loadAchievementConfig();
    this.loadPlayerData();
    this.registerEventListeners();
    console.log('✅ 成就系统初始化完成');
  }

  /**
   * 加载成就配置（从本地存储或服务器）
   */
  async loadAchievementConfig() {
    // 优先从本地存储读取
    const cached = localStorage.getItem(this.configStorageKey);
    if (cached) {
      try {
        this.achievements = JSON.parse(cached);
        console.log(`📦 从缓存加载 ${this.achievements.length} 个成就配置`);
        return;
      } catch (e) {
        console.error('解析成就配置失败:', e);
      }
    }

    // 从服务器加载（预留 API 接口）
    try {
      const response = await fetch(`${typeof window.getApiBaseUrl === 'function' ? window.getApiBaseUrl() : (window.APP_CONFIG?.API_BASE_URL || 'http://localhost:8088/api')}/achievements/config`);
      if (response.ok) {
        this.achievements = await response.json();
        localStorage.setItem(this.configStorageKey, JSON.stringify(this.achievements));
        console.log(`📥 从服务器加载 ${this.achievements.length} 个成就配置`);
        return;
      }
    } catch (error) {
      console.log('从服务器加载失败，使用默认配置');
    }

    // 使用默认配置
    this.achievements = this.getDefaultAchievements();
    localStorage.setItem(this.configStorageKey, JSON.stringify(this.achievements));
  }

  /**
   * 加载玩家成就数据
   */
  loadPlayerData() {
    const roleId = this.getCurrentRoleId();
    if (!roleId) {
      console.warn('⚠️ 未找到角色 ID，无法加载成就数据');
      this.playerData = null;
      return;
    }

    const storageKey = `${this.storageKey}_${roleId}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        this.playerData = JSON.parse(saved);
        console.log('📦 加载玩家成就数据成功');
      } catch (e) {
        console.error('解析玩家数据失败:', e);
        this.playerData = this.createDefaultPlayerData();
      }
    } else {
      this.playerData = this.createDefaultPlayerData();
      this.savePlayerData();
    }
  }

  /**
   * 保存玩家成就数据
   */
  savePlayerData() {
    if (!this.playerData) return;
    
    const roleId = this.getCurrentRoleId();
    if (!roleId) return;

    const storageKey = `${this.storageKey}_${roleId}`;
    localStorage.setItem(storageKey, JSON.stringify(this.playerData));
  }

  /**
   * 创建默认玩家数据
   * @returns {PlayerTitleData}
   */
  createDefaultPlayerData() {
    return {
      unlockedAchievements: [],
      achievementProgress: {},
      equippedTitleId: null,
      claimedRewards: [],
      hasUnclaimed: false,
      lastSyncTime: Date.now()
    };
  }

  /**
   * 注册事件监听器
   * 监听四大模块的事件
   */
  registerEventListeners() {
    // 修炼模块事件
    this.eventBus.on('OnRealmBreakthrough', (data) => this.handleRealmBreakthrough(data));
    this.eventBus.on('OnCultivationComplete', (data) => this.handleCultivationComplete(data));
    this.eventBus.on('OnQiIncrease', (data) => this.handleQiIncrease(data));

    // 宗门模块事件
    this.eventBus.on('OnSectContributionChange', (data) => this.handleSectContributionChange(data));
    this.eventBus.on('OnSectTaskComplete', (data) => this.handleSectTaskComplete(data));
    this.eventBus.on('OnSectLevelUp', (data) => this.handleSectLevelUp(data));

    // 技能模块事件
    this.eventBus.on('OnSkillLevelUp', (data) => this.handleSkillLevelUp(data));
    this.eventBus.on('OnTechniqueLearned', (data) => this.handleTechniqueLearned(data));
    this.eventBus.on('OnSkillComboUnlock', (data) => this.handleSkillComboUnlock(data));

    // 世界模块事件
    this.eventBus.on('OnMapExplore', (data) => this.handleMapExplore(data));
    this.eventBus.on('OnEncounterTrigger', (data) => this.handleEncounterTrigger(data));
    this.eventBus.on('OnDungeonClear', (data) => this.handleDungeonClear(data));
    this.eventBus.on('OnWorldEventParticipate', (data) => this.handleWorldEventParticipate(data));
    this.eventBus.on('OnMonsterKill', (data) => this.handleMonsterKill(data));

    // 通用事件
    this.eventBus.on('OnLogin', (data) => this.handleLogin(data));
    this.eventBus.on('OnItemCollect', (data) => this.handleItemCollect(data));
    this.eventBus.on('OnTaskComplete', (data) => this.handleTaskComplete(data));
  }

  /**
   * 获取当前角色 ID
   * @returns {string|null}
   */
  getCurrentRoleId() {
    return localStorage.getItem('roleId') || 
           localStorage.getItem('currentRoleId') || 
            window.APP_CONFIG?.currentRoleId;
  }

  /**
   * 更新成就进度
   * @param {string} conditionType - 条件类型
   * @param {number} value - 当前值
   */
  updateProgress(conditionType, value) {
    if (!this.playerData) return;

    let changed = false;

    this.achievements.forEach(achievement => {
      if (achievement.conditionType !== conditionType) return;
      if (this.playerData.unlockedAchievements.includes(achievement.id)) return;

      const currentProgress = this.playerData.achievementProgress[achievement.id] || 0;
      const newProgress = Math.max(currentProgress, value);

      if (newProgress > currentProgress) {
        this.playerData.achievementProgress[achievement.id] = newProgress;
        changed = true;

        // 检查是否满足解锁条件
        if (this.conditionChecker.check(
          newProgress,
          achievement.operator || '>=',
          achievement.threshold
        )) {
          this.unlockAchievement(achievement.id);
        }
      }
    });

    if (changed) {
      this.savePlayerData();
      this.notifyProgressUpdate();
    }
  }

  /**
   * 解锁成就
   * @param {number} achievementId - 成就 ID
   * @returns {Object} 解锁信息
   */
  unlockAchievement(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return null;

    if (this.playerData.unlockedAchievements.includes(achievementId)) {
      return null; // 已经解锁
    }

    // 添加到已解锁列表
    this.playerData.unlockedAchievements.push(achievementId);
    this.playerData.hasUnclaimed = true; // 标记红点

    // 保存数据
    this.savePlayerData();

    // 发布解锁事件
    this.eventBus.emit('OnAchievementUnlocked', {
      achievementId,
      achievement,
      timestamp: Date.now()
    });

    console.log(`🏆 解锁成就：${achievement.name}`);

    return {
      achievementId,
      name: achievement.name,
      description: achievement.description,
      title: achievement.title,
      rewardAttributes: achievement.rewardAttributes
    };
  }

  /**
   * 佩戴称号
   * @param {number} achievementId - 成就 ID
   * @returns {boolean} 是否成功
   */
  equipTitle(achievementId) {
    if (!this.playerData) return false;

    // 检查是否已解锁
    if (!this.playerData.unlockedAchievements.includes(achievementId)) {
      console.warn('⚠️ 成就未解锁，无法佩戴');
      return false;
    }

    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.rewardAttributes) {
      console.warn('⚠️ 该成就没有称号属性');
      return false;
    }

    // 卸下旧称号（如果有）
    if (this.playerData.equippedTitleId) {
      this.unequipTitle();
    }

    // 佩戴新称号
    this.playerData.equippedTitleId = achievementId;
    this.savePlayerData();

    // 应用属性加成
    this.applyTitleBonuses(achievement);

    console.log(`📿 佩戴称号：${achievement.title}`);

    return true;
  }

  /**
   * 卸下称号
   * @returns {boolean} 是否成功
   */
  unequipTitle() {
    if (!this.playerData || !this.playerData.equippedTitleId) return false;

    const achievement = this.achievements.find(a => a.id === this.playerData.equippedTitleId);
    if (achievement) {
      // 移除属性加成
      this.removeTitleBonuses(achievement);
    }

    this.playerData.equippedTitleId = null;
    this.savePlayerData();

    console.log('🔓 已卸下称号');
    return true;
  }

  /**
   * 应用称号属性加成
   * @param {Object} achievement - 成就配置
   */
  applyTitleBonuses(achievement) {
    if (!achievement.rewardAttributes) return;

    // 获取当前角色属性
    const role = window.store?.getState()?.role || {};
    const baseAttributes = role.attributes || {};

    // 计算最终属性
    const finalAttributes = this.attributeManager.applyBonuses(
      baseAttributes,
      achievement.rewardAttributes
    );

    // 更新角色属性
    if (window.store) {
      window.store.setState(prev => ({
        role: {
          ...prev.role,
          attributes: finalAttributes
        }
      }));
    }

    // 同步到 localStorage（供其他模块使用）
    localStorage.setItem('role_attributes_bonus', JSON.stringify({
      titleId: achievement.id,
      titleName: achievement.title,
      bonuses: achievement.rewardAttributes,
      finalAttributes
    }));

    console.log('✨ 称号属性已应用:', achievement.rewardAttributes);
  }

  /**
   * 移除称号属性加成
   * @param {Object} achievement - 成就配置
   */
  removeTitleBonuses(achievement) {
    if (!achievement.rewardAttributes) return;

    // 获取当前角色属性（包含加成）
    const role = window.store?.getState()?.role || {};
    const currentAttributes = role.attributes || {};

    // 移除加成
    const baseAttributes = this.attributeManager.removeBonuses(
      currentAttributes,
      achievement.rewardAttributes
    );

    // 更新角色属性
    if (window.store) {
      window.store.setState(prev => ({
        role: {
          ...prev.role,
          attributes: baseAttributes
        }
      }));
    }

    // 清除 localStorage
    localStorage.removeItem('role_attributes_bonus');

    console.log('❌ 称号属性已移除');
  }

  /**
   * 领取成就奖励
   * @param {number} achievementId - 成就 ID
   * @returns {Object} 奖励信息
   */
  claimReward(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return null;

    // 检查是否已解锁
    if (!this.playerData.unlockedAchievements.includes(achievementId)) {
      console.warn('⚠️ 成就未解锁');
      return null;
    }

    // 检查是否已领取
    if (this.playerData.claimedRewards.includes(achievementId)) {
      console.warn('⚠️ 奖励已领取');
      return null;
    }

    // 标记为已领取
    this.playerData.claimedRewards.push(achievementId);
    
    // 检查是否还有未领取的奖励
    const unclaimedCount = this.playerData.unlockedAchievements.filter(
      id => !this.playerData.claimedRewards.includes(id)
    ).length;
    this.playerData.hasUnclaimed = unclaimedCount > 0;

    this.savePlayerData();

    // 自动佩戴称号（如果还没有佩戴）
    if (!this.playerData.equippedTitleId && achievement.rewardAttributes) {
      this.equipTitle(achievementId);
    }

    console.log(`🎁 领取成就奖励：${achievement.name}`);

    return {
      achievementId,
      title: achievement.title,
      rewardAttributes: achievement.rewardAttributes
    };
  }

  /**
   * 获取玩家当前属性加成（用于 UI 展示）
   * @returns {Object} 属性加成信息
   */
  getCurrentBonuses() {
    if (!this.playerData || !this.playerData.equippedTitleId) {
      return null;
    }

    const achievement = this.achievements.find(a => a.id === this.playerData.equippedTitleId);
    if (!achievement) return null;

    return {
      titleId: achievement.id,
      titleName: achievement.title,
      bonuses: achievement.rewardAttributes,
      icon: achievement.icon
    };
  }

  /**
   * 获取成就详情
   * @param {number} achievementId - 成就 ID
   * @returns {Object} 成就详情
   */
  getAchievementDetail(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return null;

    const progress = this.playerData?.achievementProgress[achievementId] || 0;
    const isUnlocked = this.playerData?.unlockedAchievements.includes(achievementId);
    const isClaimed = this.playerData?.claimedRewards.includes(achievementId);

    return {
      ...achievement,
      progress,
      isUnlocked,
      isClaimed,
      progressPercent: this.conditionChecker.calculateProgress(
        progress,
        achievement.threshold
      )
    };
  }

  /**
   * 获取所有成就（用于 UI 展示）
   * @returns {Array} 成就列表
   */
  getAllAchievements() {
    return this.achievements.map(achievement => {
      const progress = this.playerData?.achievementProgress[achievement.id] || 0;
      const isUnlocked = this.playerData?.unlockedAchievements.includes(achievement.id);
      const isClaimed = this.playerData?.claimedRewards.includes(achievement.id);

      return {
        ...achievement,
        progress,
        isUnlocked,
        isClaimed,
        progressPercent: this.conditionChecker.calculateProgress(
          progress,
          achievement.threshold
        )
      };
    });
  }

  /**
   * 获取统计数据
   * @returns {Object} 统计数据
   */
  getStatistics() {
    const total = this.achievements.length;
    const unlocked = this.playerData?.unlockedAchievements.length || 0;
    const claimed = this.playerData?.claimedRewards.length || 0;
    const completionRate = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return {
      total,
      unlocked,
      claimed,
      completionRate,
      hasUnclaimed: this.playerData?.hasUnclaimed || false
    };
  }

  /**
   * 通知进度更新（用于 UI 刷新）
   */
  notifyProgressUpdate() {
    this.eventBus.emit('OnAchievementProgressUpdate', {
      statistics: this.getStatistics()
    });
  }

  // ==================== 事件处理方法 ====================

  handleRealmBreakthrough(data) {
    // data: { roleId, oldRealm, newRealm, timestamp }
    this.updateProgress('realm_breakthrough', 1);
    // 累计突破次数
    const currentCount = this.playerData?.achievementProgress['total_breakthroughs'] || 0;
    this.updateProgress('total_breakthroughs', currentCount + 1);
  }

  handleCultivationComplete(data) {
    // data: { roleId, cultivationCount, qiGain }
    this.updateProgress('cultivation_count', data.cultivationCount || 1);
  }

  handleQiIncrease(data) {
    // data: { roleId, currentQi }
    this.updateProgress('qi_accumulation', data.currentQi || 0);
  }

  handleSectContributionChange(data) {
    // data: { roleId, contribution, totalContribution }
    this.updateProgress('sect_contribution', data.totalContribution || 0);
  }

  handleSectTaskComplete(data) {
    // data: { roleId, taskId, count }
    const currentCount = this.playerData?.achievementProgress['sect_tasks'] || 0;
    this.updateProgress('sect_tasks', currentCount + (data.count || 1));
  }

  handleSectLevelUp(data) {
    // data: { roleId, level }
    this.updateProgress('sect_level', data.level || 0);
  }

  handleSkillLevelUp(data) {
    // data: { roleId, skillId, level }
    const currentCount = this.playerData?.achievementProgress['skill_upgrades'] || 0;
    this.updateProgress('skill_upgrades', currentCount + 1);
    
    // 检查是否达到高等级
    if (data.level >= 10) {
      this.updateProgress('max_level_skills', 1);
    }
  }

  handleTechniqueLearned(data) {
    // data: { roleId, techniqueId, count }
    const currentCount = this.playerData?.achievementProgress['techniques_learned'] || 0;
    this.updateProgress('techniques_learned', currentCount + (data.count || 1));
  }

  handleSkillComboUnlock(data) {
    // data: { roleId, comboId }
    this.updateProgress('skill_combos', 1);
  }

  handleMapExplore(data) {
    // data: { roleId, mapId, explorePercent }
    this.updateProgress('map_exploration', data.explorePercent || 0);
  }

  handleEncounterTrigger(data) {
    // data: { roleId, encounterId, success }
    if (data.success) {
      this.updateProgress('successful_encounters', 1);
    }
  }

  handleDungeonClear(data) {
    // data: { roleId, dungeonId, difficulty }
    const currentCount = this.playerData?.achievementProgress['dungeons_cleared'] || 0;
    this.updateProgress('dungeons_cleared', currentCount + 1);
  }

  handleWorldEventParticipate(data) {
    // data: { roleId, eventId, contribution }
    this.updateProgress('world_events', 1);
  }

  handleMonsterKill(data) {
    // data: { roleId, monsterId, count }
    const currentCount = this.playerData?.achievementProgress['monster_kills'] || 0;
    this.updateProgress('monster_kills', currentCount + (data.count || 1));
  }

  handleLogin(data) {
    // data: { roleId, loginDays, totalLogins }
    this.updateProgress('login_days', data.totalLogins || 1);
  }

  handleItemCollect(data) {
    // data: { roleId, itemId, count, itemType }
    const currentCount = this.playerData?.achievementProgress['items_collected'] || 0;
    this.updateProgress('items_collected', currentCount + (data.count || 1));
  }

  handleTaskComplete(data) {
    // data: { roleId, taskId, count }
    const currentCount = this.playerData?.achievementProgress['tasks_completed'] || 0;
    this.updateProgress('tasks_completed', currentCount + (data.count || 1));
  }

  /**
   * 获取默认成就配置（示例数据）
   * @returns {Array<AchievementConfig>}
   */
  getDefaultAchievements() {
    return [
      // 修炼模块成就
      {
        id: 1001,
        name: "初入仙途",
        description: "首次登录游戏，踏上修仙之路",
        module: "cultivation",
        conditionType: "login_days",
        operator: ">=",
        threshold: 1,
        rewardAttributes: { attack: 10, defense: 10 },
        title: "修仙者",
        rarity: "common",
        icon: "🌟",
        hidden: false
      },
      {
        id: 1002,
        name: "修炼达人",
        description: "累计完成 100 次修炼",
        module: "cultivation",
        conditionType: "cultivation_count",
        operator: ">=",
        threshold: 100,
        rewardAttributes: { attack: 50, defense: 50, qi: 100 },
        title: "苦修者",
        rarity: "rare",
        icon: "🧘",
        hidden: false
      },
      {
        id: 1003,
        name: "金丹大道",
        description: "境界突破至金丹期",
        module: "cultivation",
        conditionType: "realm_breakthrough",
        operator: ">=",
        threshold: 5,
        rewardAttributes: { attack: 200, defense: 150, intelligence: 10 },
        title: "金丹真人",
        rarity: "epic",
        icon: "🔮",
        hidden: false
      },
      {
        id: 1004,
        name: "灵气满溢",
        description: "累计积累 10000 点灵气",
        module: "cultivation",
        conditionType: "qi_accumulation",
        operator: ">=",
        threshold: 10000,
        rewardAttributes: { qi: 500, mana: 500, cultivation: "5%" },
        title: "聚灵仙君",
        rarity: "legendary",
        icon: "💫",
        hidden: false
      },

      // 宗门模块成就
      {
        id: 2001,
        name: "宗门新秀",
        description: "累计获得 1000 点宗门贡献",
        module: "sect",
        conditionType: "sect_contribution",
        operator: ">=",
        threshold: 1000,
        rewardAttributes: { defense: 100, sect_reputation: 10 },
        title: "宗门精英",
        rarity: "rare",
        icon: "🏯",
        hidden: false
      },
      {
        id: 2002,
        name: "勤勉弟子",
        description: "完成 50 次宗门任务",
        module: "sect",
        conditionType: "sect_tasks",
        operator: ">=",
        threshold: 50,
        rewardAttributes: { attack: 80, defense: 80 },
        title: "勤勉真人",
        rarity: "rare",
        icon: "📜",
        hidden: false
      },
      {
        id: 2003,
        name: "一派长老",
        description: "宗门等级达到 10 级",
        module: "sect",
        conditionType: "sect_level",
        operator: ">=",
        threshold: 10,
        rewardAttributes: { attack: 150, defense: 150, intelligence: 15 },
        title: "宗门长老",
        rarity: "epic",
        icon: "👑",
        hidden: false
      },

      // 技能模块成就
      {
        id: 3001,
        name: "博学多才",
        description: "累计学习 10 门功法",
        module: "skill",
        conditionType: "techniques_learned",
        operator: ">=",
        threshold: 10,
        rewardAttributes: { intelligence: 20, mana: 300 },
        title: "博学者",
        rarity: "rare",
        icon: "📚",
        hidden: false
      },
      {
        id: 3002,
        name: "登峰造极",
        description: "将一门技能修炼至满级",
        module: "skill",
        conditionType: "max_level_skills",
        operator: ">=",
        threshold: 1,
        rewardAttributes: { attack: 100, critical: "5%", intelligence: 10 },
        title: "宗师",
        rarity: "epic",
        icon: "⚡",
        hidden: false
      },
      {
        id: 3003,
        name: "融会贯通",
        description: "解锁 5 个技能组合",
        module: "skill",
        conditionType: "skill_combos",
        operator: ">=",
        threshold: 5,
        rewardAttributes: { attack: 120, defense: 120, critical: "3%" },
        title: "通悟真君",
        rarity: "legendary",
        icon: "🌈",
        hidden: false
      },

      // 世界模块成就
      {
        id: 4001,
        name: "斩妖除魔",
        description: "累计击败 1000 只妖兽",
        module: "world",
        conditionType: "monster_kills",
        operator: ">=",
        threshold: 1000,
        rewardAttributes: { attack: 200, critical: "5%" },
        title: "降妖师",
        rarity: "epic",
        icon: "⚔️",
        hidden: false
      },
      {
        id: 4002,
        name: "踏遍山河",
        description: "探索度达到 80%",
        module: "world",
        conditionType: "map_exploration",
        operator: ">=",
        threshold: 80,
        rewardAttributes: { agility: 30, dodge: "5%", movement: "10%" },
        title: "云游散仙",
        rarity: "legendary",
        icon: "🗺️",
        hidden: false
      },
      {
        id: 4003,
        name: "秘境征服者",
        description: "通关 20 次副本",
        module: "world",
        conditionType: "dungeons_cleared",
        operator: ">=",
        threshold: 20,
        rewardAttributes: { attack: 150, defense: 150, health: 1000 },
        title: "秘境之王",
        rarity: "epic",
        icon: "🏆",
        hidden: false
      },
      {
        id: 4004,
        name: "天命之人",
        description: "参与 10 次世界事件",
        module: "world",
        conditionType: "world_events",
        operator: ">=",
        threshold: 10,
        rewardAttributes: { intelligence: 25, luck: 20, cultivation: "10%" },
        title: "天命仙尊",
        rarity: "legendary",
        icon: "🌟",
        hidden: false
      },

      // 隐藏成就
      {
        id: 9001,
        name: "神秘成就",
        description: "??? 达成条件未知 ???",
        module: "special",
        conditionType: "secret",
        operator: ">=",
        threshold: 999,
        rewardAttributes: { attack: 999, defense: 999, intelligence: 99 },
        title: "？？？",
        rarity: "legendary",
        icon: "❓",
        hidden: true
      }
    ];
  }
}

// 创建全局成就系统实例
window.achievementSystem = new AchievementSystem();

console.log('🎮 成就称号系统模块已加载');
