# 全局状态管理集成指南

## 📚 概述

《灵月仙途》现已实现**单一事实来源 (Single Source of Truth)** 的全局状态管理系统，确保：

- ✅ **数据统一**：所有模块读取同一套角色核心数据
- ✅ **实时同步**：多标签页、多模块数据自动同步
- ✅ **乐观更新**：UI 即时响应，后台自动校准
- ✅ **错误处理**：自动重试、悲观回滚

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    业务模块层                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 宗门 │  │ 云游 │  │ 仙途 │  │ 修炼 │  │ 功法 │       │
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘       │
└─────┼─────────┼─────────┼─────────┼─────────┼───────────┘
      │         │         │         │         │
┌─────┴─────────┴─────────┴─────────┴─────────┴───────────┐
│               CharacterService (统一数据服务)              │
│  - getCharacterData()   - startMeditation()              │
│  - startTravel()        - sectDonate()                   │
│  - collectRewards()     - autoSync()                     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│            CharacterStore (全局状态管理)                  │
│  - 单一事实来源 (Single Source of Truth)                 │
│  - 多标签页同步 (BroadcastChannel)                       │
│  - 定时心跳/自动校准 (Ticker)                            │
│  - 状态变更通知 (Pub/Sub)                                │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│              API Service / LocalStorage                  │
└─────────────────────────────────────────────────────────┘
```

## 📦 核心数据结构

```javascript
{
  // 基础信息
  basic: {
    roleId: '45',
    roleName: '李逍遥',
    userId: '1',
    username: '张三',
    gender: 1,
    spiritRoot: 'fire'
  },
  
  // 修炼状态
  cultivation: {
    realm: '炼气期',
    realmLevel: 6,
    experience: 1500,
    maxExperience: 2000,
    cultivationRate: 15, // 每秒修为
    isMeditating: true,
    meditationStartTime: 1234567890000,
    lastSyncTime: 1234567890000
  },
  
  // 资产信息
  assets: {
    spiritStones: 10000,
    contribution: 500,
    travelPoints: 200,
    vip: 3
  },
  
  // 战斗属性
  attributes: {
    hp: 1500,
    maxHp: 1500,
    mp: 800,
    maxMp: 800,
    attack: 150,
    defense: 80,
    speed: 15,
    crit: 0.05,
    dodge: 0.03
  },
  
  // 状态标识
  status: {
    isTraveling: false,
    travelingStartTime: null,
    isSectDonating: false,
    lastActionTime: null
  }
}
```

## 🚀 快速开始

### 1. 在页面中引入

```html
<!-- 在 </body> 前引入 -->
<script src="js/character-store.js"></script>
<script src="js/character-service.js"></script>
<script>
  // 页面加载时初始化
  window.addEventListener('DOMContentLoaded', async () => {
    // 初始化全局状态管理
    await window.characterStore.init();
    
    // 订阅状态变化
    window.characterStore.subscribe((type, payload, state) => {
      console.log('状态变化:', type, payload);
      
      // 根据类型更新 UI
      switch(type) {
        case 'sync_complete':
          updateUI(state);
          break;
        case 'cultivation_progress':
          updateCultivationProgress(payload);
          break;
      }
    });
  });
</script>
```

### 2. 获取角色数据

```javascript
// 方法 1：从 CharacterStore 直接获取（推荐）
const state = window.characterStore.getState();
const roleName = state.basic.roleName;
const realm = state.cultivation.realm;

// 方法 2：使用 CharacterService（自动缓存和同步）
const characterData = await window.CharacterService.getCharacterData();
console.log('角色数据:', characterData);

// 方法 3：强制刷新
const freshData = await window.CharacterService.getCharacterData(true);
```

### 3. 监听状态变化

```javascript
// 订阅所有状态变化
const unsubscribe = window.characterStore.subscribe((type, payload, state) => {
  console.log('收到通知:', type, payload);
  
  // 更新 UI
  updateUI(state);
});

// 取消订阅（页面卸载时）
window.addEventListener('unload', () => {
  unsubscribe();
});
```

## 🎯 模块集成示例

### 修炼模块

```javascript
// cultivation.html
class CultivationModule {
  async init() {
    // 订阅状态变化
    window.characterStore.subscribe((type, payload, state) => {
      if (type === 'cultivation_progress') {
        this.updateProgress(payload);
      }
    });
    
    // 加载初始数据
    await this.loadCultivationData();
  }
  
  async loadCultivationData() {
    const state = window.characterStore.getState();
    const isMeditating = state.cultivation.isMeditating;
    const rate = state.cultivation.cultivationRate;
    
    if (isMeditating) {
      this.startCountdown();
    }
  }
  
  async startMeditation() {
    try {
      // 使用 CharacterService（乐观更新）
      await window.CharacterService.startMeditation(15);
      
      // UI 立即响应
      this.showMeditationUI();
    } catch (error) {
      // 错误处理（CharacterService 已自动回滚）
      alert('修炼失败：' + error.message);
    }
  }
  
  async stopMeditation() {
    try {
      await window.CharacterService.stopMeditation();
      this.hideMeditationUI();
    } catch (error) {
      alert('停止修炼失败：' + error.message);
    }
  }
  
  updateProgress(payload) {
    const { elapsed, gainedExp, rate } = payload;
    document.getElementById('exp-gained').textContent = gainedExp;
  }
}

// 使用
const cultivationModule = new CultivationModule();
cultivationModule.init();
```

### 云游模块

```javascript
// travel.html
class TravelModule {
  async init() {
    // 订阅状态变化
    window.characterStore.subscribe((type, payload, state) => {
      if (type === 'travel_progress') {
        this.updateTravelProgress(payload);
      }
      
      // 资产变化
      if (type === 'state_patched' && payload.assets) {
        this.updateAssets(payload.assets);
      }
    });
    
    // 定时领取收益（每 30 秒）
    this.autoCollectInterval = setInterval(() => {
      window.CharacterService.autoCollectTravelRewards();
    }, 30000);
  }
  
  async startTravel() {
    try {
      await window.CharacterService.startTravel();
      this.showTravelUI();
    } catch (error) {
      alert('云游失败：' + error.message);
    }
  }
  
  async collectRewards() {
    try {
      const result = await window.CharacterService.collectTravelRewards();
      this.showRewards(result.rewards);
    } catch (error) {
      alert('领取收益失败：' + error.message);
    }
  }
  
  updateTravelProgress(payload) {
    const { elapsed } = payload;
    document.getElementById('travel-time').textContent = 
      this.formatTime(elapsed);
  }
  
  updateAssets(assets) {
    // 更新资产显示
    document.getElementById('spirit-stones').textContent = 
      window.characterStore.state.assets.spiritStones;
  }
}
```

### 宗门模块

```javascript
// sect.html
class SectModule {
  async init() {
    // 订阅状态变化
    window.characterStore.subscribe((type, payload, state) => {
      if (type === 'state_updated' || type === 'state_patched') {
        this.updateContribution();
      }
    });
    
    await this.loadSectData();
  }
  
  async loadSectData() {
    const state = window.characterStore.getState();
    const contribution = state.assets.contribution;
    
    document.getElementById('contribution').textContent = contribution;
  }
  
  async donate(amount) {
    try {
      await window.CharacterService.sectDonate(amount);
      
      // UI 立即更新（乐观更新）
      const newContribution = window.characterStore.state.assets.contribution;
      document.getElementById('contribution').textContent = newContribution;
      
      showToast('捐赠成功！', 'success');
    } catch (error) {
      showToast('捐赠失败：' + error.message, 'error');
    }
  }
  
  updateContribution() {
    const contribution = window.characterStore.state.assets.contribution;
    document.getElementById('contribution').textContent = contribution;
  }
}
```

## 🔄 多标签页同步

### 工作原理

1. **标签页 A** 发生数据变更（如云游获得奖励）
2. **CharacterService** 更新本地状态
3. **BroadcastChannel** 发送消息到其他标签页
4. **标签页 B、C、D** 收到消息
5. 自动调用 `syncData()` 同步数据
6. UI 自动更新

### 示例场景

```
场景：用户在标签页 1 开始修炼

标签页 1 (修炼页面):
  1. 用户点击"开始修炼"
  2. CharacterService.startMeditation()
  3. 乐观更新本地状态
  4. 调用后端 API
  5. 广播消息："开始修炼"
  6. UI 显示修炼中

标签页 2 (首页):
  1. 收到广播消息
  2. 自动同步数据
  3. 更新修炼状态显示
  4. UI 显示"修炼中"

标签页 3 (云游页面):
  1. 收到广播消息
  2. 自动同步数据
  3. 检测到互斥状态
  4. 禁用"开始云游"按钮
```

## ⚠️ 注意事项

### 1. 状态互斥

```javascript
// 修炼和云游互斥
if (window.characterStore.state.cultivation.isMeditating) {
  // 正在修炼，不能云游
  disableTravelButton();
}

if (window.characterStore.state.status.isTraveling) {
  // 正在云游，不能修炼
  disableMeditationButton();
}
```

### 2. 数据一致性

```javascript
// ❌ 错误：直接修改 localStorage
localStorage.setItem('roleId', '45');

// ✅ 正确：使用 CharacterStore
window.characterStore._patchState({
  basic: { roleId: '45' }
});
```

### 3. 内存管理

```javascript
// 页面卸载时取消订阅
window.addEventListener('unload', () => {
  // 如果有自定义订阅，需要取消
  if (this.unsubscribe) {
    this.unsubscribe();
  }
});
```

### 4. 错误处理

```javascript
try {
  await window.CharacterService.startMeditation(15);
} catch (error) {
  // CharacterService 已自动回滚
  // 只需处理 UI 错误提示
  showToast('修炼失败：' + error.message, 'error');
}
```

## 📊 API 参考

### CharacterStore

| 方法 | 说明 | 示例 |
|------|------|------|
| `init()` | 初始化 Store | `await characterStore.init()` |
| `getState()` | 获取完整状态 | `const state = characterStore.getState()` |
| `getModuleState(name)` | 获取模块状态 | `characterStore.getModuleState('cultivation')` |
| `subscribe(fn)` | 订阅状态变化 | `characterStore.subscribe(callback)` |
| `syncData(force)` | 同步数据 | `await characterStore.syncData()` |
| `startMeditation(rate)` | 开始修炼 | `characterStore.startMeditation(15)` |
| `stopMeditation()` | 停止修炼 | `characterStore.stopMeditation()` |
| `startTravel()` | 开始云游 | `characterStore.startTravel()` |
| `stopTravel()` | 停止云游 | `characterStore.stopTravel()` |
| `updateAssets(delta)` | 更新资产 | `characterStore.updateAssets({spiritStones: 100})` |
| `logout()` | 登出 | `characterStore.logout()` |

### CharacterService

| 方法 | 说明 | 示例 |
|------|------|------|
| `getCharacterData(force)` | 获取角色数据 | `await CharacterService.getCharacterData()` |
| `startMeditation(rate)` | 开始修炼 | `await CharacterService.startMeditation(15)` |
| `stopMeditation()` | 停止修炼 | `await CharacterService.stopMeditation()` |
| `startTravel()` | 开始云游 | `await CharacterService.startTravel()` |
| `stopTravel()` | 停止云游 | `await CharacterService.stopTravel()` |
| `collectTravelRewards()` | 领取云游收益 | `await CharacterService.collectTravelRewards()` |
| `sectDonate(amount)` | 宗门捐赠 | `await CharacterService.sectDonate(100)` |
| `autoCollectTravelRewards()` | 自动领取收益 | `CharacterService.autoCollectTravelRewards()` |

## 🎯 最佳实践

### 1. 始终使用 CharacterStore

```javascript
// ❌ 不要这样
const roleId = localStorage.getItem('roleId');

// ✅ 应该这样
const roleId = window.characterStore.state.basic.roleId;
```

### 2. 使用 CharacterService 进行数据操作

```javascript
// ❌ 不要直接调用 API
await apiService.post('/cultivation/start', { roleId, rate });

// ✅ 使用 CharacterService
await CharacterService.startMeditation(rate);
```

### 3. 订阅必要的状态变化

```javascript
// ✅ 只订阅需要的变化
characterStore.subscribe((type, payload) => {
  if (type === 'cultivation_progress') {
    // 只处理修炼进度
  }
});
```

### 4. 定期同步数据

```javascript
// CharacterStore 已自动实现（30 秒间隔）
// 如需手动同步
setInterval(() => {
  CharacterService.getCharacterData(true);
}, 60000); // 1 分钟
```

## 🔧 调试工具

```javascript
// 查看当前状态
console.log(window.characterStore.getState());

// 查看缓存数据
console.log(CharacterService.requestCache);

// 手动同步
await window.characterStore.syncData(true);

// 清除缓存
CharacterService.clearCache();

// 查看监听器
console.log(window.characterStore.listeners);
```

## 📝 总结

通过 CharacterStore 和 CharacterService，我们实现了：

1. ✅ **单一事实来源** - 所有数据来自 CharacterStore
2. ✅ **实时同步** - 多标签页、多模块自动同步
3. ✅ **乐观更新** - UI 即时响应，后台自动校准
4. ✅ **错误处理** - 自动重试、悲观回滚
5. ✅ **易于集成** - 统一的 API 接口

现在，无论用户在哪个页面，看到的数据都是**实时、准确、统一**的！
