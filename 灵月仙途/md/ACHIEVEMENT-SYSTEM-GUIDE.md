# 成就称号系统 - 完整使用指南

## 📚 目录

1. [系统概述](#系统概述)
2. [架构设计](#架构设计)
3. [前端集成](#前端集成)
4. [后端集成](#后端集成)
5. [使用示例](#使用示例)
6. [API 接口](#api 接口)
7. [常见问题](#常见问题)

---

## 系统概述

### 核心功能

- **成就解锁**: 实时监听游戏事件，自动解锁成就
- **称号佩戴**: 单称号佩戴系统，提供永久属性加成
- **事件驱动**: 基于观察者模式的事件总线，零轮询
- **数据持久化**: 前端 localStorage + 后端数据库双重存储
- **UI 展示**: 精美的成就殿堂界面，支持红点提示

### 四大模块覆盖

| 模块 | 事件类型 | 示例成就 |
|------|---------|---------|
| 修炼 (Cultivation) | 境界突破、修炼完成、灵气积累 | 初入仙途、金丹大道 |
| 宗门 (Sect) | 贡献变化、任务完成、等级提升 | 宗门新秀、一派长老 |
| 技能 (Skill) | 技能升级、功法学习、组合解锁 | 博学多才、登峰造极 |
| 世界 (World) | 地图探索、奇遇触发、副本通关 | 斩妖除魔、踏遍山河 |

---

## 架构设计

### 设计模式

1. **观察者模式 (Observer Pattern)**
   - 事件总线 (`EventBus`) 解耦各模块
   - 成就系统订阅事件，自动更新进度

2. **策略模式 (Strategy Pattern)**
   - 条件判定引擎支持多种操作符
   - 可扩展的条件类型检查器

3. **单例模式 (Singleton Pattern)**
   - 全局唯一的成就系统实例
   - 统一的状态管理

### 核心类图

```
┌─────────────────────────────────────────┐
│         EventBus (事件总线)              │
│  - on(eventName, callback)              │
│  - emit(eventName, data)                │
│  - off(eventName, callback)             │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      AchievementSystem (成就系统)        │
│  - achievements: Array                  │
│  - playerData: PlayerTitleData          │
│  - updateProgress(type, value)          │
│  - unlockAchievement(id)                │
│  - equipTitle(id)                       │
│  - claimReward(id)                      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   ConditionChecker (条件判定引擎)        │
│  - check(current, operator, threshold)  │
│  - calculateProgress(current, max)      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  TitleAttributeManager (属性管理器)      │
│  - applyBonuses(base, bonuses)          │
│  - removeBonuses(current, bonuses)      │
└─────────────────────────────────────────┘
```

---

## 前端集成

### 1. 引入核心文件

在 HTML 页面的 `<head>` 标签中添加：

```html
<!-- 成就系统核心模块 -->
<script src="/js/achievement-system.js"></script>
<script src="/js/achievement-events.js"></script>
<script src="/js/achievement-ui.js"></script>
```

### 2. 在各模块中发射事件

#### 修炼模块示例

```javascript
// 在 cultivation.html 或相关 JS 文件中
function onRealmBreakthrough(oldRealm, newRealm) {
  // 原有逻辑...
  
  // 发射成就事件
  window.CultivationEventEmitter.emitRealmBreakthrough({
    roleId: window.APP_CONFIG.currentRoleId,
    oldRealm: oldRealm,
    newRealm: newRealm
  });
}

function onCultivationComplete(qiGain) {
  // 原有逻辑...
  
  const currentCount = parseInt(localStorage.getItem('cultivation_count') || '0');
  window.CultivationEventEmitter.emitCultivationComplete({
    roleId: window.APP_CONFIG.currentRoleId,
    cultivationCount: currentCount + 1,
    qiGain: qiGain
  });
}
```

#### 宗门模块示例

```javascript
// 在 clan/ 模块中
function addSectContribution(amount) {
  // 原有逻辑...
  
  window.SectEventEmitter.emitSectContributionChange({
    roleId: window.APP_CONFIG.currentRoleId,
    contribution: amount,
    totalContribution: player.totalContribution
  });
}
```

#### 技能模块示例

```javascript
// 在 skills 相关模块中
function onSkillLevelUp(skillId, newLevel) {
  // 原有逻辑...
  
  window.SkillEventEmitter.emitSkillLevelUp({
    roleId: window.APP_CONFIG.currentRoleId,
    skillId: skillId,
    level: newLevel
  });
}
```

#### 世界模块示例

```javascript
// 在地图/副本模块中
function onMonsterKilled(monsterId, count) {
  // 原有逻辑...
  
  window.WorldEventEmitter.emitMonsterKill({
    roleId: window.APP_CONFIG.currentRoleId,
    monsterId: monsterId,
    count: count
  });
}
```

### 3. 在成就页面使用

更新 `achievements.html`，替换原有的模拟数据：

```javascript
// 加载成就
async function loadAchievements() {
  try {
    const roleId = localStorage.getItem('roleId');
    if (!roleId) {
      showToast('请先选择角色', 'error');
      return;
    }

    // 等待成就系统初始化
    await waitForAchievementSystem();

    // 从成就系统获取数据
    const achievements = window.achievementSystem.getAllAchievements();
    const statistics = window.achievementSystem.getStatistics();

    // 渲染 UI
    renderAchievements(achievements);
    updateStats(statistics);
    
    // 更新红点
    window.AchievementRedDot.update(statistics.hasUnclaimed);
  } catch (error) {
    console.error('加载成就失败:', error);
  }
}

// 显示详情
function showDetail(achievementId) {
  const achievement = window.achievementSystem.getAchievementDetail(achievementId);
  if (achievement) {
    window.AchievementDetailModal.show(achievement);
  }
}
```

### 4. 监听成就解锁通知

```javascript
// 在页面加载时注册监听器
window.gameEventBus.on('OnAchievementUnlocked', (data) => {
  const { achievement } = data;
  window.AchievementUINotification.showUnlockNotification({
    name: achievement.name,
    description: achievement.description,
    title: achievement.title,
    rewardAttributes: achievement.rewardAttributes,
    icon: achievement.icon
  });
  
  // 更新红点
  window.AchievementRedDot.update(true);
});
```

---

## 后端集成

### 1. 数据库表结构

需要更新 `achievement` 表，添加以下字段：

```sql
ALTER TABLE achievement ADD COLUMN module_type VARCHAR(100);
ALTER TABLE achievement ADD COLUMN condition_type VARCHAR(50);
ALTER TABLE achievement ADD COLUMN operator VARCHAR(10);
ALTER TABLE achievement ADD COLUMN threshold INT;
ALTER TABLE achievement ADD COLUMN reward_attributes VARCHAR(255);
ALTER TABLE achievement ADD COLUMN title VARCHAR(50);
ALTER TABLE achievement ADD COLUMN rarity VARCHAR(20);
ALTER TABLE achievement ADD COLUMN icon VARCHAR(10);
ALTER TABLE achievement ADD COLUMN hidden BOOLEAN DEFAULT FALSE;
```

更新 `role_achievement` 表：

```sql
ALTER TABLE role_achievement ADD COLUMN is_equipped BOOLEAN DEFAULT FALSE;
```

### 2. 初始化成就数据

```sql
-- 修炼模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, condition, status, sort_order)
VALUES 
('初入仙途', 'login', 'cultivation', 'login_days', '>=', 1, 
 '{"attack":10,"defense":10}', '修仙者', 'common', '🌟', FALSE, '登录游戏 1 天', 1, 1),
('修炼达人', 'cultivate', 'cultivation', 'cultivation_count', '>=', 100, 
 '{"attack":50,"defense":50,"qi":100}', '苦修者', 'rare', '🧘', FALSE, '累计完成 100 次修炼', 1, 2);

-- 宗门模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, condition, status, sort_order)
VALUES 
('宗门新秀', 'sect', 'sect', 'sect_contribution', '>=', 1000, 
 '{"defense":100}', '宗门精英', 'rare', '🏯', FALSE, '累计获得 1000 点宗门贡献', 1, 10);

-- 技能模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, condition, status, sort_order)
VALUES 
('博学多才', 'skill', 'skill', 'techniques_learned', '>=', 10, 
 '{"intelligence":20,"mana":300}', '博学者', 'rare', '📚', FALSE, '累计学习 10 门功法', 1, 20);

-- 世界模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, condition, status, sort_order)
VALUES 
('斩妖除魔', 'world', 'world', 'monster_kills', '>=', 1000, 
 '{"attack":200,"critical":"5%"}', '降妖师', 'epic', '⚔️', FALSE, '累计击败 1000 只妖兽', 1, 30);
```

### 3. 后端事件触发（可选）

如果需要在后端触发成就更新，可以创建一个事件服务：

```java
@Service
public class AchievementEventService {
    
    @Autowired
    private RoleAchievementRepository roleAchievementRepository;
    
    @Autowired
    private AchievementRepository achievementRepository;
    
    /**
     * 更新成就进度
     */
    @Transactional
    public void updateProgress(Long roleId, String conditionType, int value) {
        // 查找相关成就
        List<Achievement> achievements = achievementRepository
            .findByConditionTypeAndStatus(conditionType, 1);
        
        for (Achievement achievement : achievements) {
            RoleAchievement roleAchievement = roleAchievementRepository
                .findByRoleIdAndAchievementId(roleId, achievement.getId())
                .orElse(new RoleAchievement());
            
            if (roleAchievement.getId() == null) {
                roleAchievement.setRoleId(roleId);
                roleAchievement.setAchievementId(achievement.getId());
                roleAchievement.setProgress(0);
                roleAchievement.setStatus("in_progress");
            }
            
            // 更新进度
            int newProgress = Math.max(roleAchievement.getProgress(), value);
            roleAchievement.setProgress(newProgress);
            
            // 检查是否完成
            if (newProgress >= achievement.getThreshold() && 
                !"completed".equals(roleAchievement.getStatus()) && 
                !"claimed".equals(roleAchievement.getStatus())) {
                roleAchievement.setStatus("completed");
                roleAchievement.setCompletedTime(LocalDateTime.now());
            }
            
            roleAchievementRepository.save(roleAchievement);
        }
    }
}
```

---

## 使用示例

### 示例 1: 在修炼页面集成

```javascript
// cultivation.html 或 cultivation.js

// 修炼完成时
function completeCultivation() {
  // 原有修炼逻辑...
  const qiGain = calculateQiGain();
  player.qi += qiGain;
  
  // 更新修炼次数
  const currentCount = parseInt(localStorage.getItem('cultivation_count') || '0') + 1;
  localStorage.setItem('cultivation_count', currentCount);
  
  // 发射成就事件
  window.CultivationEventEmitter.emitCultivationComplete({
    roleId: window.APP_CONFIG.currentRoleId,
    cultivationCount: currentCount,
    qiGain: qiGain
  });
  
  // 发射灵气增加事件
  window.CultivationEventEmitter.emitQiIncrease({
    roleId: window.APP_CONFIG.currentRoleId,
    currentQi: player.qi
  });
}

// 境界突破时
function breakthrough() {
  const oldRealm = player.realm;
  // 突破逻辑...
  player.realm = newRealm;
  
  // 发射成就事件
  window.CultivationEventEmitter.emitRealmBreakthrough({
    roleId: window.APP_CONFIG.currentRoleId,
    oldRealm: oldRealm,
    newRealm: player.realm
  });
}
```

### 示例 2: 在宗门页面集成

```javascript
// clan/tasks.js

// 完成宗门任务
function completeSectTask(taskId) {
  // 原有任务完成逻辑...
  const contributionGain = task.reward.contribution;
  player.totalContribution += contributionGain;
  
  // 发射成就事件
  window.SectEventEmitter.emitSectTaskComplete({
    roleId: window.APP_CONFIG.currentRoleId,
    taskId: taskId,
    count: 1
  });
  
  window.SectEventEmitter.emitSectContributionChange({
    roleId: window.APP_CONFIG.currentRoleId,
    contribution: contributionGain,
    totalContribution: player.totalContribution
  });
}
```

### 示例 3: 在战斗页面集成

```javascript
// combat/combat.js

// 击败怪物后
function onMonsterDefeated(monster) {
  // 原有战利品分配逻辑...
  
  // 更新击杀计数
  const currentKills = parseInt(localStorage.getItem('monster_kills') || '0') + 1;
  localStorage.setItem('monster_kills', currentKills);
  
  // 发射成就事件
  window.WorldEventEmitter.emitMonsterKill({
    roleId: window.APP_CONFIG.currentRoleId,
    monsterId: monster.id,
    count: currentKills
  });
}
```

---

## API 接口

### 前端 API

```javascript
// 成就系统
window.achievementSystem.getAllAchievements()          // 获取所有成就
window.achievementSystem.getAchievementDetail(id)      // 获取成就详情
window.achievementSystem.getStatistics()               // 获取统计数据
window.achievementSystem.equipTitle(id)                // 佩戴称号
window.achievementSystem.unequipTitle()                // 卸下称号
window.achievementSystem.claimReward(id)               // 领取奖励

// 事件发射器
window.CultivationEventEmitter.emitRealmBreakthrough(data)
window.CultivationEventEmitter.emitCultivationComplete(data)
window.SectEventEmitter.emitSectContributionChange(data)
window.SkillEventEmitter.emitSkillLevelUp(data)
window.WorldEventEmitter.emitMonsterKill(data)

// UI 组件
window.AchievementUINotification.showUnlockNotification(data)
window.AchievementRedDot.update(hasUnclaimed)
window.AchievementDetailModal.show(achievement)
```

### 后端 API

```
GET    /api/achievement                    # 获取所有成就配置
GET    /api/achievement/role/{roleId}      # 获取角色成就进度
POST   /api/achievement/progress           # 更新成就进度
POST   /api/achievement/claim/{id}         # 领取成就奖励
POST   /api/achievement/equip/{id}         # 佩戴称号
POST   /api/achievement/unequip/{id}       # 卸下称号
GET    /api/achievement/role/{roleId}/equipped  # 获取佩戴的称号
POST   /api/achievement/role/{roleId}/init    # 初始化角色成就数据
```

---

## 常见问题

### Q1: 成就进度不更新？

**检查清单**:
1. 确认事件发射器已正确调用
2. 检查条件类型是否匹配
3. 查看浏览器控制台错误日志
4. 确认 `window.achievementSystem` 已初始化

### Q2: 称号属性不生效？

**解决方案**:
1. 检查成就是否有 `rewardAttributes` 字段
2. 确认已成功领取奖励
3. 查看 `window.store` 中角色属性是否更新
4. 检查属性名称是否匹配（attack, defense 等）

### Q3: 红点提示不显示？

**排查步骤**:
1. 确认 `hasUnclaimed` 标志正确设置
2. 检查目标元素是否存在（ID 为 `achievement-menu-item`）
3. 确保 `AchievementRedDot.update()` 被调用

### Q4: 如何添加新的成就？

**方法 1 - 数据库添加**:
```sql
INSERT INTO achievement (...) VALUES (...);
```

**方法 2 - 代码添加**:
在 `achievement-system.js` 的 `getDefaultAchievements()` 方法中添加配置。

### Q5: 如何自定义条件类型？

1. 在 `AchievementConditionChecker` 中添加新的检查逻辑
2. 在事件处理器中更新对应的进度
3. 在成就配置中使用新的 `conditionType`

---

## 扩展建议

### 性能优化

1. **批量更新**: 多个成就进度更新时，合并保存操作
2. **防抖处理**: 高频事件（如击杀计数）使用防抖
3. **懒加载**: 成就 UI 组件按需加载

### 功能增强

1. **成就分享**: 添加分享功能到社交平台
2. **成就排行榜**: 展示全服玩家成就完成度
3. **限时成就**: 添加时间限制的成就
4. **成就链**: 前置成就依赖系统

### 视觉优化

1. **粒子特效**: 解锁时的特殊效果
2. **音效**: 成就解锁提示音
3. **动画**: 更流畅的过渡动画

---

## 总结

本成就称号系统采用事件驱动架构，具有良好的可扩展性和性能。通过观察者模式实现模块解耦，支持四大核心玩法模块的实时监听。系统提供完整的前后端实现，包括数据结构、核心逻辑、UI 组件和 API 接口。

**关键特性**:
- ✅ 事件驱动，零轮询
- ✅ 单称号佩戴，属性加成
- ✅ 红点提示，解锁通知
- ✅ 数据持久化，前后端同步
- ✅ 精美的 UI 展示

**下一步**:
1. 在各模块中集成事件发射器
2. 配置成就数据到数据库
3. 测试各类型成就的解锁流程
4. 根据游戏需求调整成就配置

祝开发顺利！🎮✨
