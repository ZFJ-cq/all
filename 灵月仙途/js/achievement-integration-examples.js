/**
 * 灵月仙途 - 成就系统集成示例
 * 
 * 本文件展示如何在各个模块中快速集成成就系统
 */

// ==================== 示例 1: 修炼模块集成 ====================

/**
 * 在 cultivation.html 或 cultivation.js 中
 */
const CultivationModule = {
  // 修炼完成
  completeCultivation() {
    console.log('开始修炼...');
    
    // 原有修炼逻辑
    const qiGain = this.calculateQiGain();
    player.qi += qiGain;
    
    // 【新增】更新修炼次数并触发成就事件
    const currentCount = parseInt(localStorage.getItem('cultivation_count') || '0') + 1;
    localStorage.setItem('cultivation_count', currentCount);
    
    // 发射成就事件（自动通知成就系统）
    if (window.CultivationEventEmitter) {
      window.CultivationEventEmitter.emitCultivationComplete({
        roleId: window.APP_CONFIG.currentRoleId,
        cultivationCount: currentCount,
        qiGain: qiGain
      });
      
      // 同时发射灵气增加事件
      window.CultivationEventEmitter.emitQiIncrease({
        roleId: window.APP_CONFIG.currentRoleId,
        currentQi: player.qi
      });
    }
    
    console.log(`修炼完成，获得 ${qiGain} 点灵气`);
  },
  
  // 境界突破
  breakthrough(newRealm) {
    const oldRealm = player.realm;
    
    // 原有突破逻辑
    player.realm = newRealm;
    
    // 【新增】发射突破事件
    if (window.CultivationEventEmitter) {
      window.CultivationEventEmitter.emitRealmBreakthrough({
        roleId: window.APP_CONFIG.currentRoleId,
        oldRealm: oldRealm,
        newRealm: newRealm
      });
    }
    
    console.log(`突破成功！从 ${oldRealm} 突破至 ${newRealm}`);
  },
  
  calculateQiGain() {
    // 计算灵气获取量的逻辑
    return 100;
  }
};


// ==================== 示例 2: 宗门模块集成 ====================

/**
 * 在 clan/tasks.js 或相关文件中
 */
const SectTaskSystem = {
  // 完成宗门任务
  completeTask(taskId) {
    const task = this.getTask(taskId);
    
    // 原有任务完成逻辑
    player.totalContribution += task.reward.contribution;
    player.exp += task.reward.exp;
    
    // 【新增】发射成就事件
    if (window.SectEventEmitter) {
      window.SectEventEmitter.emitSectTaskComplete({
        roleId: window.APP_CONFIG.currentRoleId,
        taskId: taskId,
        count: 1
      });
      
      window.SectEventEmitter.emitSectContributionChange({
        roleId: window.APP_CONFIG.currentRoleId,
        contribution: task.reward.contribution,
        totalContribution: player.totalContribution
      });
    }
    
    console.log(`完成任务：${task.name}, 获得贡献 ${task.reward.contribution}`);
  },
  
  // 宗门等级提升
  levelUp(newLevel) {
    const oldLevel = player.sectLevel;
    player.sectLevel = newLevel;
    
    // 【新增】发射等级提升事件
    if (window.SectEventEmitter) {
      window.SectEventEmitter.emitSectLevelUp({
        roleId: window.APP_CONFIG.currentRoleId,
        level: newLevel
      });
    }
    
    console.log(`宗门等级提升：${oldLevel} -> ${newLevel}`);
  },
  
  getTask(taskId) {
    // 获取任务信息
    return {
      name: '采集灵草',
      reward: { contribution: 50, exp: 100 }
    };
  }
};


// ==================== 示例 3: 技能模块集成 ====================

/**
 * 在 skills/skill-system.js 中
 */
const SkillSystem = {
  // 技能升级
  levelUpSkill(skillId) {
    const skill = this.getSkill(skillId);
    const oldLevel = skill.level;
    const newLevel = oldLevel + 1;
    
    // 原有升级逻辑
    skill.level = newLevel;
    this.updateSkillAttributes(skill);
    
    // 【新增】发射成就事件
    if (window.SkillEventEmitter) {
      window.SkillEventEmitter.emitSkillLevelUp({
        roleId: window.APP_CONFIG.currentRoleId,
        skillId: skillId,
        level: newLevel
      });
    }
    
    console.log(`技能 ${skill.name} 升级：${oldLevel} -> ${newLevel}`);
  },
  
  // 学习新功法
  learnTechnique(techniqueId) {
    // 原有学习逻辑
    player.techniques.push(techniqueId);
    
    // 【新增】发射学习事件
    if (window.SkillEventEmitter) {
      window.SkillEventEmitter.emitTechniqueLearned({
        roleId: window.APP_CONFIG.currentRoleId,
        techniqueId: techniqueId,
        count: player.techniques.length
      });
    }
    
    console.log(`学会新功法：${techniqueId}`);
  },
  
  // 解锁技能组合
  unlockSkillCombo(comboId) {
    // 原有解锁逻辑
    player.skillCombos.push(comboId);
    
    // 【新增】发射组合解锁事件
    if (window.SkillEventEmitter) {
      window.SkillEventEmitter.emitSkillComboUnlock({
        roleId: window.APP_CONFIG.currentRoleId,
        comboId: comboId
      });
    }
    
    console.log(`解锁技能组合：${comboId}`);
  },
  
  getSkill(skillId) {
    return { name: '基础剑法', level: 5 };
  },
  
  updateSkillAttributes(skill) {
    // 更新技能属性
  }
};


// ==================== 示例 4: 世界模块集成 ====================

/**
 * 在 world/combat.js 或 map/exploration.js 中
 */
const WorldModule = {
  // 击败怪物
  onMonsterKilled(monster) {
    // 原有战利品分配逻辑
    const expGain = monster.exp;
    player.exp += expGain;
    
    // 更新击杀计数
    const currentKills = parseInt(localStorage.getItem('monster_kills') || '0') + 1;
    localStorage.setItem('monster_kills', currentKills);
    
    // 【新增】发射击杀事件
    if (window.WorldEventEmitter) {
      window.WorldEventEmitter.emitMonsterKill({
        roleId: window.APP_CONFIG.currentRoleId,
        monsterId: monster.id,
        count: currentKills
      });
    }
    
    console.log(`击败 ${monster.name}, 累计击杀 ${currentKills} 只`);
  },
  
  // 探索地图
  exploreMap(mapId, explorePercent) {
    // 原有探索逻辑
    player.exploredMaps[mapId] = explorePercent;
    
    // 【新增】发射探索事件
    if (window.WorldEventEmitter) {
      window.WorldEventEmitter.emitMapExplore({
        roleId: window.APP_CONFIG.currentRoleId,
        mapId: mapId,
        explorePercent: explorePercent
      });
    }
    
    console.log(`探索地图 ${mapId}, 进度 ${explorePercent}%`);
  },
  
  // 触发奇遇
  triggerEncounter(encounterId, success) {
    // 原有奇遇逻辑
    if (success) {
      this.giveEncounterReward(encounterId);
    }
    
    // 【新增】发射奇遇事件
    if (window.WorldEventEmitter) {
      window.WorldEventEmitter.emitEncounterTrigger({
        roleId: window.APP_CONFIG.currentRoleId,
        encounterId: encounterId,
        success: success
      });
    }
    
    console.log(`触发奇遇 ${encounterId}, 结果：${success ? '成功' : '失败'}`);
  },
  
  // 通关副本
  clearDungeon(dungeonId, difficulty) {
    // 原有通关逻辑
    const clearCount = parseInt(localStorage.getItem('dungeons_cleared') || '0') + 1;
    localStorage.setItem('dungeons_cleared', clearCount);
    
    // 【新增】发射副本通关事件
    if (window.WorldEventEmitter) {
      window.WorldEventEmitter.emitDungeonClear({
        roleId: window.APP_CONFIG.currentRoleId,
        dungeonId: dungeonId,
        difficulty: difficulty
      });
    }
    
    console.log(`通关副本 ${dungeonId}, 难度 ${difficulty}`);
  },
  
  // 参与世界事件
  participateWorldEvent(eventId, contribution) {
    // 原有事件参与逻辑
    player.worldEventContribution += contribution;
    
    // 【新增】发射世界事件参与事件
    if (window.WorldEventEmitter) {
      window.WorldEventEmitter.emitWorldEventParticipate({
        roleId: window.APP_CONFIG.currentRoleId,
        eventId: eventId,
        contribution: contribution
      });
    }
    
    console.log(`参与世界事件 ${eventId}, 贡献 ${contribution}`);
  },
  
  giveEncounterReward(encounterId) {
    // 发放奇遇奖励
  }
};


// ==================== 示例 5: 通用模块集成 ====================

/**
 * 在登录、任务等通用场景中使用
 */
const GeneralModule = {
  // 玩家登录
  onPlayerLogin() {
    const roleId = window.APP_CONFIG.currentRoleId;
    const totalLogins = parseInt(localStorage.getItem('total_logins') || '0') + 1;
    localStorage.setItem('total_logins', totalLogins);
    
    // 计算登录天数（简单实现）
    const lastLoginDate = localStorage.getItem('last_login_date');
    const today = new Date().toDateString();
    let loginDays = parseInt(localStorage.getItem('login_days') || '0');
    
    if (lastLoginDate !== today) {
      loginDays++;
      localStorage.setItem('login_days', loginDays);
      localStorage.setItem('last_login_date', today);
    }
    
    // 【新增】发射登录事件
    if (window.GeneralEventEmitter) {
      window.GeneralEventEmitter.emitLogin({
        roleId: roleId,
        loginDays: loginDays,
        totalLogins: totalLogins
      });
    }
    
    console.log(`欢迎回来！累计登录 ${totalLogins} 次，连续登录 ${loginDays} 天`);
  },
  
  // 收集物品
  collectItem(itemId, count, itemType) {
    // 原有物品收集逻辑
    player.inventory.add(itemId, count);
    
    // 更新收集计数
    const totalCollected = parseInt(localStorage.getItem('items_collected') || '0') + count;
    localStorage.setItem('items_collected', totalCollected);
    
    // 【新增】发射收集事件
    if (window.GeneralEventEmitter) {
      window.GeneralEventEmitter.emitItemCollect({
        roleId: window.APP_CONFIG.currentRoleId,
        itemId: itemId,
        count: count,
        itemType: itemType
      });
    }
    
    console.log(`获得物品 ${itemId} x${count}`);
  },
  
  // 完成任务
  completeTask(taskId) {
    // 原有任务完成逻辑
    const task = this.getTask(taskId);
    this.giveTaskReward(task);
    
    // 更新任务完成计数
    const totalTasks = parseInt(localStorage.getItem('tasks_completed') || '0') + 1;
    localStorage.setItem('tasks_completed', totalTasks);
    
    // 【新增】发射任务完成事件
    if (window.GeneralEventEmitter) {
      window.GeneralEventEmitter.emitTaskComplete({
        roleId: window.APP_CONFIG.currentRoleId,
        taskId: taskId,
        count: totalTasks
      });
    }
    
    console.log(`完成任务 ${taskId}`);
  },
  
  getTask(taskId) {
    return { id: taskId, name: '测试任务' };
  },
  
  giveTaskReward(task) {
    // 发放任务奖励
  }
};


// ==================== 示例 6: 成就页面使用 ====================

/**
 * 在 achievements.html 中使用
 */
const AchievementPage = {
  async init() {
    // 等待成就系统初始化
    await this.waitForAchievementSystem();
    
    // 加载成就数据
    this.loadAchievements();
    
    // 注册事件监听
    this.registerEventListeners();
    
    // 更新红点
    this.updateRedDot();
  },
  
  waitForAchievementSystem() {
    return new Promise((resolve) => {
      if (window.achievementSystem) {
        resolve();
        return;
      }
      
      const checkInterval = setInterval(() => {
        if (window.achievementSystem) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // 超时处理
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  },
  
  loadAchievements() {
    const achievements = window.achievementSystem.getAllAchievements();
    const statistics = window.achievementSystem.getStatistics();
    
    // 渲染成就列表
    this.renderAchievementGrid(achievements);
    
    // 更新统计
    this.updateStatistics(statistics);
  },
  
  renderAchievementGrid(achievements) {
    const grid = document.getElementById('achievementGrid');
    if (!grid) return;
    
    let html = '';
    achievements.forEach(achievement => {
      html += `
        <div class="achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'} ${achievement.rarity}"
             onclick="AchievementPage.showDetail(${achievement.id})">
          <div class="achievement-icon">${achievement.isUnlocked ? achievement.icon : '🔒'}</div>
          <div class="achievement-name">${achievement.isUnlocked ? achievement.name : '???'}</div>
          <div class="achievement-rarity">${this.getRarityText(achievement.rarity)}</div>
        </div>
      `;
    });
    
    grid.innerHTML = html;
  },
  
  updateStatistics(statistics) {
    document.getElementById('totalAchievements').textContent = statistics.total;
    document.getElementById('unlockedAchievements').textContent = statistics.unlocked;
    document.getElementById('completionRate').textContent = statistics.completionRate + '%';
  },
  
  showDetail(achievementId) {
    const achievement = window.achievementSystem.getAchievementDetail(achievementId);
    if (achievement) {
      window.AchievementDetailModal.show(achievement);
    }
  },
  
  registerEventListeners() {
    // 监听成就解锁
    window.gameEventBus.on('OnAchievementUnlocked', (data) => {
      const { achievement } = data;
      
      // 显示解锁通知
      window.AchievementUINotification.showUnlockNotification({
        name: achievement.name,
        description: achievement.description,
        title: achievement.title,
        rewardAttributes: achievement.rewardAttributes,
        icon: achievement.icon
      });
      
      // 刷新页面
      setTimeout(() => this.loadAchievements(), 1000);
      
      // 更新红点
      this.updateRedDot();
    });
    
    // 监听进度更新
    window.gameEventBus.on('OnAchievementProgressUpdate', (data) => {
      console.log('成就进度更新:', data.statistics);
    });
  },
  
  updateRedDot() {
    const statistics = window.achievementSystem.getStatistics();
    window.AchievementRedDot.update(statistics.hasUnclaimed);
  },
  
  getRarityText(rarity) {
    const map = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说'
    };
    return map[rarity] || rarity;
  }
};

// 页面加载时初始化
if (window.location.pathname.includes('achievements.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    AchievementPage.init();
  });
}


// ==================== 示例 7: 在现有页面添加成就菜单红点 ====================

/**
 * 在主页面或导航栏中使用
 */
function setupAchievementMenu() {
  // 确保成就系统已加载
  if (!window.achievementSystem) {
    console.warn('成就系统未加载，跳过红点设置');
    return;
  }
  
  // 创建或获取成就菜单项
  let menuItem = document.getElementById('achievement-menu-item');
  
  if (!menuItem) {
    // 如果没有菜单项，可以创建一个（根据实际 UI 结构调整）
    menuItem = document.createElement('div');
    menuItem.id = 'achievement-menu-item';
    menuItem.innerHTML = '🏆 成就';
    menuItem.style.cssText = 'cursor: pointer; position: relative;';
    menuItem.onclick = () => window.location.href = '/achievements.html';
    
    // 添加到导航栏（根据实际情况调整）
    const nav = document.querySelector('.main-nav');
    if (nav) {
      nav.appendChild(menuItem);
    }
  }
  
  // 更新红点状态
  const statistics = window.achievementSystem.getStatistics();
  window.AchievementRedDot.update(statistics.hasUnclaimed);
  
  // 监听成就解锁，动态更新红点
  window.gameEventBus.on('OnAchievementUnlocked', () => {
    window.AchievementRedDot.showOnElement('achievement-menu-item');
  });
}

// 在页面加载时调用
document.addEventListener('DOMContentLoaded', setupAchievementMenu);


console.log('✅ 成就系统集成示例已加载');
