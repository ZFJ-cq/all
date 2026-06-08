# 全局状态管理集成清单

## ✅ 已完成集成的页面

### 核心游戏页面
- ✅ [index.html](file:///Users/macbook/前端项目/灵月仙途/index.html) - 首页
- ✅ [cultivation.html](file:///Users/macbook/前端项目/灵月仙途/cultivation.html) - 修炼页面
- ✅ [skills/skills.html](file:///Users/macbook/前端项目/灵月仙途/skills/skills.html) - 技能页面
- ✅ [body-cultivation/index.html](file:///Users/macbook/前端项目/灵月仙途/body-cultivation/index.html) - 锻体页面

### 角色相关页面
- ✅ [character/character.html](file:///Users/macbook/前端项目/灵月仙途/character/character.html) - 角色页面
- ✅ [equipment/equipment.html](file:///Users/macbook/前端项目/灵月仙途/equipment/equipment.html) - 装备页面
- ✅ [partner/partner.html](file:///Users/macbook/前端项目/灵月仙途/partner/partner.html) - 伴侣页面

### 宗门页面
- ✅ [clan/clan-list.html](file:///Users/macbook/前端项目/灵月仙途/clan/clan-list.html) - 宗门列表
- ✅ [clan/clan-home.html](file:///Users/macbook/前端项目/灵月仙途/clan/clan-home.html) - 宗门主页
- ✅ [clan/my-clan.html](file:///Users/macbook/前端项目/灵月仙途/clan/my-clan.html) - 我的宗门

### 世界地图页面
- ✅ [word/world.html](file:///Users/macbook/前端项目/灵月仙途/word/world.html) - 云游/世界地图

### 其他页面
- ✅ [news/news-list.html](file:///Users/macbook/前端项目/灵月仙途/news/news-list.html) - 仙途快讯
- ✅ [trade/trade.html](file:///Users/macbook/前端项目/灵月仙途/trade/trade.html) - 交易行

## 📦 已集成的核心脚本

所有页面已按顺序引入以下脚本：

```html
<script src="../js/token-manager.js"></script>
<script src="../js/role-sync.js"></script>
<script src="../js/character-store.js"></script>
<script src="../js/character-service.js"></script>
```

### 脚本功能说明

1. **token-manager.js** - Token 持久化管理
   - 自动备份 Token
   - 从备份恢复 Token
   - 防止 Token 丢失

2. **role-sync.js** - 角色 ID 同步
   - 统一所有角色 ID 字段
   - 确保数据一致性

3. **character-store.js** - 全局状态管理
   - 单一事实来源
   - 多标签页同步
   - 定时心跳/自动校准

4. **character-service.js** - 统一数据服务
   - 乐观更新
   - 悲观回滚
   - 请求缓存

## 🎯 解决的问题

### 之前的问题
- ❌ 宗门列表页面 401 错误
- ❌ 云游页面 Token 不存在
- ❌ 不同页面角色数据不一致
- ❌ 多标签页数据不同步

### 现在的效果
- ✅ 所有页面 Token 持久化
- ✅ 所有页面角色 ID 统一
- ✅ 数据实时同步
- ✅ 多标签页数据互通

## 📊 集成效果验证

### 验证步骤

1. **清除所有数据**
   ```
   - 打开浏览器开发者工具
   - Application → Local Storage
   - 清除所有数据
   ```

2. **重新登录**
   ```
   - 访问 http://localhost:8000/login.html
   - 输入用户名和密码
   - 登录
   ```

3. **选择角色**
   ```
   - 访问 http://localhost:8000/start/start.html
   - 选择角色
   - 进入洞府
   ```

4. **验证各页面**
   ```
   - 访问首页：http://localhost:8000/index.html
   - 访问技能页面：http://localhost:8000/skills/skills.html
   - 访问修炼页面：http://localhost:8000/cultivation.html
   - 访问宗门列表：http://localhost:8000/clan/clan-list.html
   - 访问云游页面：http://localhost:8000/word/world.html
   ```

5. **检查控制台日志**
   ```
   应该看到：
   ✅ TokenManager: Token 存在
   ✅ RoleSync: 统一使用角色 ID XXX
   ✅ RoleSync: 同步完成
   ✅ [/role/XXX] Token: 存在
   ✅ [/role/XXX] Authorization Header: 已设置
   ```

## 🔧 使用指南

### 在页面中获取角色数据

```javascript
// 方法 1：从 CharacterStore 获取
const state = window.characterStore.getState();
const roleId = state.basic.roleId;
const roleName = state.basic.roleName;

// 方法 2：使用 CharacterService
const characterData = await window.CharacterService.getCharacterData();
```

### 监听状态变化

```javascript
// 订阅状态变化
window.characterStore.subscribe((type, payload, state) => {
  console.log('状态变化:', type, payload);
  
  // 根据类型更新 UI
  if (type === 'sync_complete') {
    updateUI(state);
  }
});
```

### 执行操作

```javascript
// 开始修炼
await window.CharacterService.startMeditation(15);

// 开始云游
await window.CharacterService.startTravel();

// 领取云游收益
await window.CharacterService.collectTravelRewards();

// 宗门捐赠
await window.CharacterService.sectDonate(100);
```

## 📝 注意事项

### 1. 脚本加载顺序
```html
<!-- 正确顺序 -->
<script src="../js/token-manager.js"></script>
<script src="../js/role-sync.js"></script>
<script src="../js/character-store.js"></script>
<script src="../js/character-service.js"></script>
<script src="../js/api-service.js"></script>
```

### 2. 初始化时机
```javascript
// 页面加载时自动初始化
window.addEventListener('DOMContentLoaded', async () => {
  // CharacterStore 会自动初始化
  // 可以订阅状态变化
  window.characterStore.subscribe((type, payload) => {
    // 处理状态变化
  });
});
```

### 3. 错误处理
```javascript
try {
  await window.CharacterService.startMeditation(15);
} catch (error) {
  // CharacterService 已自动回滚
  // 只需处理 UI 错误提示
  showToast('修炼失败：' + error.message, 'error');
}
```

## 🎉 总结

现在《灵月仙途》的所有主要页面都已集成全局状态管理系统：

- ✅ **Token 持久化**：所有页面 Token 不丢失
- ✅ **角色同步**：所有页面显示同一个角色
- ✅ **数据统一**：单一事实来源
- ✅ **实时同步**：多标签页数据自动同步
- ✅ **乐观更新**：UI 即时响应
- ✅ **错误回滚**：失败自动恢复

**无论用户在哪个页面，数据都是实时、准确、统一的！** 🎊
