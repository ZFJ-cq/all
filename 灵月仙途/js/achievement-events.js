/**
 * 灵月仙途 - 各模块事件发射器
 * 用于在各模块中方便地发布事件到成就系统
 */

// ==================== 修炼模块事件发射器 ====================
window.CultivationEventEmitter = {
  /**
   * 境界突破事件
   * @param {Object} data - { roleId, oldRealm, newRealm, timestamp }
   */
  emitRealmBreakthrough(data) {
    window.gameEventBus.emit('OnRealmBreakthrough', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 修炼完成事件
   * @param {Object} data - { roleId, cultivationCount, qiGain }
   */
  emitCultivationComplete(data) {
    window.gameEventBus.emit('OnCultivationComplete', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 灵气增加事件
   * @param {Object} data - { roleId, currentQi }
   */
  emitQiIncrease(data) {
    window.gameEventBus.emit('OnQiIncrease', {
      ...data,
      timestamp: Date.now()
    });
  }
};

// ==================== 宗门模块事件发射器 ====================
window.SectEventEmitter = {
  /**
   * 宗门贡献变化事件
   * @param {Object} data - { roleId, contribution, totalContribution }
   */
  emitSectContributionChange(data) {
    window.gameEventBus.emit('OnSectContributionChange', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 宗门任务完成事件
   * @param {Object} data - { roleId, taskId, count }
   */
  emitSectTaskComplete(data) {
    window.gameEventBus.emit('OnSectTaskComplete', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 宗门等级提升事件
   * @param {Object} data - { roleId, level }
   */
  emitSectLevelUp(data) {
    window.gameEventBus.emit('OnSectLevelUp', {
      ...data,
      timestamp: Date.now()
    });
  }
};

// ==================== 技能模块事件发射器 ====================
window.SkillEventEmitter = {
  /**
   * 技能升级事件
   * @param {Object} data - { roleId, skillId, level }
   */
  emitSkillLevelUp(data) {
    window.gameEventBus.emit('OnSkillLevelUp', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 功法学习事件
   * @param {Object} data - { roleId, techniqueId, count }
   */
  emitTechniqueLearned(data) {
    window.gameEventBus.emit('OnTechniqueLearned', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 技能组合解锁事件
   * @param {Object} data - { roleId, comboId }
   */
  emitSkillComboUnlock(data) {
    window.gameEventBus.emit('OnSkillComboUnlock', {
      ...data,
      timestamp: Date.now()
    });
  }
};

// ==================== 世界模块事件发射器 ====================
window.WorldEventEmitter = {
  /**
   * 地图探索事件
   * @param {Object} data - { roleId, mapId, explorePercent }
   */
  emitMapExplore(data) {
    window.gameEventBus.emit('OnMapExplore', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 奇遇触发事件
   * @param {Object} data - { roleId, encounterId, success }
   */
  emitEncounterTrigger(data) {
    window.gameEventBus.emit('OnEncounterTrigger', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 副本通关事件
   * @param {Object} data - { roleId, dungeonId, difficulty }
   */
  emitDungeonClear(data) {
    window.gameEventBus.emit('OnDungeonClear', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 世界事件参与事件
   * @param {Object} data - { roleId, eventId, contribution }
   */
  emitWorldEventParticipate(data) {
    window.gameEventBus.emit('OnWorldEventParticipate', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 击败妖兽事件
   * @param {Object} data - { roleId, monsterId, count }
   */
  emitMonsterKill(data) {
    window.gameEventBus.emit('OnMonsterKill', {
      ...data,
      timestamp: Date.now()
    });
  }
};

// ==================== 通用事件发射器 ====================
window.GeneralEventEmitter = {
  /**
   * 登录事件
   * @param {Object} data - { roleId, loginDays, totalLogins }
   */
  emitLogin(data) {
    window.gameEventBus.emit('OnLogin', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 物品收集事件
   * @param {Object} data - { roleId, itemId, count, itemType }
   */
  emitItemCollect(data) {
    window.gameEventBus.emit('OnItemCollect', {
      ...data,
      timestamp: Date.now()
    });
  },

  /**
   * 任务完成事件
   * @param {Object} data - { roleId, taskId, count }
   */
  emitTaskComplete(data) {
    window.gameEventBus.emit('OnTaskComplete', {
      ...data,
      timestamp: Date.now()
    });
  }
};

console.log('📡 事件发射器模块已加载');
