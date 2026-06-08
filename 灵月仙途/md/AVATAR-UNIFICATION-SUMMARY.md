# 头像统一化改造总结

## ✅ 已完成的页面

### 1. **index.html** (首页)
- ✅ 引入 `js/game-utils.js`
- ✅ 引入 `js/character-store.js` 和 `js/character-service.js`
- ✅ 使用 `window.GameUtils.setAvatar()` 统一设置头像
- ✅ 从数据库获取角色数据

**修改位置**:
- 第 1153-1160 行：添加 script 引用
- 第 2800、2905 行：使用统一工具设置头像

### 2. **character/character.html** (角色页面)
- ✅ 引入 `js/game-utils.js`
- ✅ 完全重写 JavaScript 部分
- ✅ 从数据库获取所有属性数据
- ✅ 使用 `window.GameUtils.setAvatar()` 设置头像
- ✅ 使用 `apiService.getUserProfile()` 获取真实属性
- ✅ 使用 `apiService.getAssets()` 获取物品

**关键改进**:
- 移除所有硬编码默认值
- 所有数据从后端 API 获取
- 使用统一工具函数

### 3. **cultivation.html** (修炼页面)
- ✅ 引入 `js/game-utils.js`
- ✅ 引入 `js/role-sync.js`
- ✅ 简化 `setAvatarBySpiritRoot()` 函数，调用统一工具
- ✅ 删除重复的头像映射逻辑

**修改位置**:
- 第 783-788 行：添加 script 引用
- 第 1218-1221 行：使用统一工具

### 4. **skills/skills.html** (技能页面)
- ✅ 引入 `js/game-utils.js`
- ✅ 引入 `js/character-store.js` 和 `js/character-service.js`
- ✅ 使用 `window.GameUtils.setAvatar()` 设置头像
- ✅ 删除旧的 `getAvatarBySpiritRoot()` 函数

**修改位置**:
- 第 625-632 行：添加 script 引用
- 第 714 行：使用统一工具
- 第 752-759 行：删除旧函数

## 📁 新增文件

### `js/game-utils.js`
统一的工具函数库，提供：

```javascript
window.GameUtils = {
  // 根据灵根获取头像
  getAvatarBySpiritRoot(spiritRoot) -> String
  
  // 设置头像元素
  setAvatar(element, spiritRoot) -> Void
  
  // 格式化数字（千分位）
  formatNumber(num) -> String
  
  // 格式化百分比
  formatPercent(value, decimals) -> String
  
  // 安全获取对象属性
  safeGet(obj, path, defaultValue) -> Any
}
```

## 🎨 头像映射规则

| 灵根类型 | 头像图标 |
|---------|---------|
| 金灵根 | ⚡ |
| 木灵根 | 🌿 |
| 水灵根 | 💧 |
| 火灵根 | 🔥 |
| 土灵根 | ⛰️ |
| 雷灵根 | ⚡ |
| 冰灵根 | ❄️ |
| 风灵根 | 🌪️ |
| 光灵根 | ✨ |
| 暗灵根 | 🌑 |
| 五行灵根/五灵根 | 🌈 |
| 天灵根 | 🌟 |
| 混沌灵根 | 🌀 |
| 变异灵根 | 💫 |
| 默认 | 🧙‍️ |

## 📊 数据获取方式

### 从数据库获取的数据

| 数据类型 | API 方法 | 说明 |
|---------|---------|------|
| 角色基本信息 | `apiService.getRole(userId)` | 角色列表 |
| 角色详细属性 | `apiService.getUserProfile(roleId)` | 攻击、防御、速度等 |
| 角色资产/物品 | `apiService.getAssets(roleId)` | 背包物品 |
| 角色装备 | TODO | 待实现 |

### 移除的硬编码数据

- ❌ 默认气血：87257
- ❌ 默认灵力：12450
- ❌ 默认攻击：23578
- ❌ 默认防御：3513
- ❌ 默认速度：2224
- ❌ 默认暴击：15.2%
- ❌ 默认闪避：8.5%
- ❌ 默认悟性：88
- ❌ 默认战力：28500

## 🔧 使用方式

### 在其他页面中引入

```html
<!-- 在 </body> 前添加 -->
<script src="js/game-utils.js"></script>
```

### 设置头像

```javascript
// 方法 1：直接设置
window.GameUtils.setAvatar(
  document.getElementById('charAvatar'), 
  roleData.spiritRoot
);

// 方法 2：获取图标
const avatar = window.GameUtils.getAvatarBySpiritRoot('火灵根');
// 返回：🔥
```

### 格式化数据

```javascript
// 格式化数字
window.GameUtils.formatNumber(1234567);
// 返回："1,234,567"

// 格式化百分比
window.GameUtils.formatPercent(15.256, 1);
// 返回："15.3%"
```

## ✅ 统一化效果

### 改造前
- ❌ 各页面头像实现不一致
- ❌ 硬编码默认数据
- ❌ 重复的工具函数
- ❌ 数据不同步

### 改造后
- ✅ 所有页面使用统一的头像映射
- ✅ 所有数据从数据库获取
- ✅ 单一工具函数库
- ✅ 数据一致性保证

## 🚀 下一步建议

1. **装备系统**
   - 实现装备数据从数据库获取
   - 添加装备显示和更换功能

2. **性能优化**
   - 添加数据缓存机制
   - 实现头像预加载

3. **错误处理**
   - 添加 API 失败降级策略
   - 实现离线模式支持

4. **其他页面**
   - clan/clan-list.html
   - partner/partner.html
   - trade/trade.html
   - 等页面也可以应用相同的统一化方案

## 📝 维护说明

### 添加新的灵根类型

编辑 `js/game-utils.js`：

```javascript
const avatarMap = {
  // ... 现有灵根
  '新灵根': '🆕'  // 添加新映射
};
```

### 修改默认头像

编辑 `js/game-utils.js` 中的 `getAvatarBySpiritRoot()` 函数：

```javascript
return avatarMap[spiritRoot] || '🧙‍️';  // 修改默认值
```

### 添加新的工具函数

在 `js/game-utils.js` 中添加：

```javascript
window.GameUtils = {
  // ... 现有函数
  newUtilityFunction(param) {
    // 实现
  }
};
```

---

**最后更新**: 2026-03-24  
**维护者**: 开发团队
