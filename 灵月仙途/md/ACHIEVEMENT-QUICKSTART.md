# 成就称号系统 - 5 分钟快速开始

## 🚀 快速集成步骤

### 步骤 1: 引入核心文件（1 分钟）

在你的 HTML 页面（如 `index.html` 或 `achievements.html`）的 `<head>` 标签中添加：

```html
<!-- 成就系统核心模块 -->
<script src="/js/achievement-system.js"></script>
<script src="/js/achievement-events.js"></script>
<script src="/js/achievement-ui.js"></script>
```

### 步骤 2: 在各模块中添加事件发射（2 分钟）

找到你现有的代码，在关键位置添加事件发射：

#### 修炼模块（cultivation.html 或 cultivation.js）

```javascript
// 在修炼完成函数中
function completeCultivation() {
  // 原有逻辑...
  
  // 【新增】添加这两行
  const count = parseInt(localStorage.getItem('cultivation_count') || '0') + 1;
  localStorage.setItem('cultivation_count', count);
  
  window.CultivationEventEmitter.emitCultivationComplete({
    roleId: window.APP_CONFIG.currentRoleId,
    cultivationCount: count
  });
}

// 在境界突破函数中
function breakthrough(newRealm) {
  const oldRealm = player.realm;
  // 原有逻辑...
  
  // 【新增】添加这个
  window.CultivationEventEmitter.emitRealmBreakthrough({
    roleId: window.APP_CONFIG.currentRoleId,
    oldRealm: oldRealm,
    newRealm: newRealm
  });
}
```

#### 战斗模块（combat/combat.js）

```javascript
// 在击败怪物后
function onMonsterDefeated(monster) {
  // 原有逻辑...
  
  // 【新增】添加这些
  const kills = parseInt(localStorage.getItem('monster_kills') || '0') + 1;
  localStorage.setItem('monster_kills', kills);
  
  window.WorldEventEmitter.emitMonsterKill({
    roleId: window.APP_CONFIG.currentRoleId,
    monsterId: monster.id,
    count: kills
  });
}
```

#### 宗门模块（clan/tasks.js）

```javascript
// 在完成宗门任务后
function completeTask(taskId) {
  // 原有逻辑...
  
  // 【新增】添加这些
  window.SectEventEmitter.emitSectTaskComplete({
    roleId: window.APP_CONFIG.currentRoleId,
    taskId: taskId,
    count: 1
  });
}
```

### 步骤 3: 更新成就页面（1 分钟）

打开 `achievements.html`，找到 `<script>` 标签部分，替换 `loadAchievements` 函数：

```javascript
// 替换原有的 loadAchievements 函数
async function loadAchievements() {
  try {
    const roleId = localStorage.getItem('roleId');
    if (!roleId) {
      showToast('请先选择角色', 'error');
      return;
    }

    // 等待成就系统初始化
    if (!window.achievementSystem) {
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (window.achievementSystem) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(resolve, 3000);
      });
    }

    // 从成就系统获取数据
    const achievements = window.achievementSystem.getAllAchievements();
    const statistics = window.achievementSystem.getStatistics();

    // 渲染成就
    renderAchievements(achievements);
    updateStats(statistics);
    
    // 更新红点
    window.AchievementRedDot.update(statistics.hasUnclaimed);
  } catch (error) {
    console.error('加载成就失败:', error);
    showToast('加载失败', 'error');
  }
}

// 替换 showDetail 函数
function showDetail(achievementId) {
  const achievement = window.achievementSystem.getAchievementDetail(achievementId);
  if (achievement) {
    window.AchievementDetailModal.show(achievement);
  }
}
```

### 步骤 4: 测试（1 分钟）

1. 打开浏览器开发者工具（F12）
2. 访问你的游戏页面
3. 在控制台检查是否有错误
4. 进行几次修炼或战斗
5. 访问 `achievements.html` 查看成就进度

## ✅ 验证清单

- [ ] 核心 JS 文件已引入
- [ ] 各模块已添加事件发射器
- [ ] 成就页面已更新
- [ ] 控制台无错误
- [ ] 成就进度正常更新
- [ ] 解锁成就时有弹窗通知

## 🎯 核心 API 速查

### 发射事件（在各模块中）

```javascript
// 修炼
window.CultivationEventEmitter.emitRealmBreakthrough(data);
window.CultivationEventEmitter.emitCultivationComplete(data);

// 宗门
window.SectEventEmitter.emitSectTaskComplete(data);
window.SectEventEmitter.emitSectContributionChange(data);

// 技能
window.SkillEventEmitter.emitSkillLevelUp(data);

// 世界
window.WorldEventEmitter.emitMonsterKill(data);
window.WorldEventEmitter.emitDungeonClear(data);
```

### 成就系统操作

```javascript
// 获取所有成就
window.achievementSystem.getAllAchievements();

// 获取成就详情
window.achievementSystem.getAchievementDetail(id);

// 佩戴称号
window.achievementSystem.equipTitle(id);

// 卸下称号
window.achievementSystem.unequipTitle();

// 领取奖励
window.achievementSystem.claimReward(id);

// 获取统计数据
window.achievementSystem.getStatistics();
```

### UI 组件

```javascript
// 显示解锁通知
window.AchievementUINotification.showUnlockNotification(data);

// 更新红点
window.AchievementRedDot.update(hasUnclaimed);

// 显示详情弹窗
window.AchievementDetailModal.show(achievement);
```

## 📝 最小化集成示例

如果你只想快速测试，只需添加**一行代码**：

```javascript
// 在任何页面加载后调用
window.CultivationEventEmitter.emitCultivationComplete({
  roleId: window.APP_CONFIG.currentRoleId,
  cultivationCount: 1
});
```

然后访问 `achievements.html`，你会看到"修炼达人"成就的进度变化！

## 🔧 常见问题快速修复

### 问题 1: 成就系统未定义

**症状**: 控制台显示 `Cannot read property 'getAllAchievements' of undefined`

**解决**: 确保在访问 `window.achievementSystem` 之前已经加载了 `achievement-system.js`

```javascript
// 等待成就系统加载
if (!window.achievementSystem) {
  console.log('等待成就系统初始化...');
  // 稍后再试
}
```

### 问题 2: 事件发射后进度不更新

**症状**: 调用了 `emit` 但成就进度不变

**解决**: 
1. 检查 `conditionType` 是否匹配
2. 确认 `roleId` 正确
3. 查看浏览器控制台的错误日志

### 问题 3: 红点不显示

**症状**: 有新成就但红点不亮

**解决**: 
```javascript
// 手动更新红点
window.AchievementRedDot.showOnElement('achievement-menu-item');
```

## 📚 下一步

完成快速集成后，你可以：

1. **查看详细文档**: 阅读 `ACHIEVEMENT-SYSTEM-GUIDE.md` 了解完整功能
2. **配置成就数据**: 在数据库中添加更多成就
3. **自定义 UI**: 调整成就页面的样式和布局
4. **集成更多事件**: 在更多游戏场景中添加成就触发

## 🎉 完成！

现在你已经成功集成了成就称号系统！

- ✅ 成就进度自动更新
- ✅ 解锁时有精美弹窗
- ✅ 红点提示新成就
- ✅ 可佩戴称号获得属性加成

祝你开发顺利！如有问题，请查看详细文档。
