# Token 页面跳转丢失问题 - 修复指南

## 🔍 问题原因分析

### 1. 多个 Token 管理模块冲突
项目中同时存在 3 个 token 管理模块：
- **token-manager.js**: 使用 `localStorage` 存储
- **auth-manager.js**: 也使用 `localStorage` 存储
- **login-manager.js**: 也使用 `localStorage` 存储

### 2. 存储键名不一致
```javascript
// token-manager.js
localStorage.setItem('token', token)
localStorage.setItem('userId', userId)
localStorage.setItem('roleId', roleId)

// auth-manager.js  
localStorage.setItem('token', token)
localStorage.setItem('userId', userId)
localStorage.setItem('username', username)
localStorage.setItem('roleId', roleId)

// login-manager.js
localStorage.setItem('token', token)
localStorage.setItem('userId', userId)
localStorage.setItem('username', username)
localStorage.setItem('currentRoleId', roleId)  // ⚠️ 注意：这里是 currentRoleId
```

**问题**：`roleId` 和 `currentRoleId` 键名不一致，导致在不同页面读取时可能获取不到正确的值。

### 3. 页面跳转时没有同步机制
当用户在登录页保存 token 后，跳转到其他页面时：
1. 登录页使用 `TokenManager.saveToken()` 保存
2. 目标页面可能使用 `AuthManager.getToken()` 或 `LoginManager.getToken()` 读取
3. 如果键名不一致或数据不同步，就会读取失败

## ✅ 解决方案

### 方案一：使用 TokenSync 统一同步（推荐）

我已经创建了 [`js/token-sync.js`](file:///Users/macbook/前端项目/灵月仙途/js/token-sync.js)，它会自动同步所有 token 相关的存储。

**使用步骤**：

1. **在所有页面的 `<head>` 中添加 token-sync.js**：
```html
<!-- 在现有 token 管理模块之前引入 -->
<script src="js/token-sync.js"></script>
<script src="js/token-manager.js"></script>
<script src="js/auth-manager.js"></script>
```

2. **修改登录成功后的保存逻辑**（login.html）：
```javascript
// 原来的代码
window.TokenUtils.save(data.token, data.userId, null);

// 修改为（同时使用 TokenSync）
window.TokenUtils.save(data.token, data.userId, null);
window.TokenSync.set(data.token, {
  userId: data.userId,
  username: data.username,
  roleId: null
});
```

3. **在页面跳转前同步**（start.html 等）：
```javascript
// 在跳转前调用
window.TokenSync.sync();
window.location.href = 'target-page.html';
```

### 方案二：统一使用一个 Token 管理器

**推荐统一使用 `token-manager.js`**，因为它有备份机制。

**需要修改的地方**：

1. **login.html** - 已经正确使用 `TokenManager`
2. **start.html** - 在跳转前添加同步：
```javascript
// 在 startGame 函数中，跳转前添加
if (window.TokenManager) {
  window.TokenManager.validateTokenIntegrity(); // 验证并修复
}
window.location.href = 'loading.html';
```

3. **index.html** - 在初始化时使用 TokenManager：
```javascript
// 原来的代码
const token = localStorage.getItem('token');

// 修改为
const token = window.TokenUtils ? window.TokenUtils.get() : localStorage.getItem('token');
```

### 方案三：修复键名不一致问题

**统一所有模块使用相同的键名**：

修改 `login-manager.js`，将 `currentRoleId` 改为 `roleId`：
```javascript
// login-manager.js 第 108 行
// 原代码
localStorage.removeItem('currentRoleId');

// 修改为
localStorage.removeItem('roleId');
```

## 🛠️ 立即修复步骤

### 步骤 1：引入 TokenSync
在所有需要 token 的页面中添加：
```html
<script src="js/token-sync.js"></script>
```

### 步骤 2：修改登录页（login.html）
在登录成功的代码中（第 292 行附近）：
```javascript
// 原代码
const saved = window.TokenUtils.save(data.token, data.userId, null);

// 修改为
const saved = window.TokenUtils.save(data.token, data.userId, null);
// 同时使用 TokenSync 同步
if (window.TokenSync) {
  window.TokenSync.set(data.token, {
    userId: data.userId,
    username: data.username
  });
}
```

### 步骤 3：修改角色选择页（start/start.html）
在跳转前添加同步（第 952 行附近）：
```javascript
// 原代码
window.location.href = 'loading.html';

// 修改为
if (window.TokenSync) {
  window.TokenSync.sync();
}
window.location.href = 'loading.html';
```

### 步骤 4：修改主页（index.html）
在读取 token 时使用统一接口（第 3302 行附近）：
```javascript
// 原代码
const token = localStorage.getItem('token');

// 修改为
const token = window.TokenSync ? window.TokenSync.get() : 
              window.TokenUtils ? window.TokenUtils.get() : 
              localStorage.getItem('token');
```

## 🧪 测试方法

1. **打开诊断工具**：
   访问 `debug-token-issue.html`

2. **测试登录流程**：
   - 在登录页登录
   - 检查 localStorage 中的 token
   - 跳转到主页
   - 再次检查 token 是否存在

3. **使用浏览器开发者工具**：
   ```javascript
   // 在控制台执行
   console.log('Token:', localStorage.getItem('token'));
   console.log('userId:', localStorage.getItem('userId'));
   console.log('roleId:', localStorage.getItem('roleId'));
   console.log('currentRoleId:', localStorage.getItem('currentRoleId'));
   ```

## 📋 验证清单

- [ ] 所有页面都引入了 `token-sync.js`
- [ ] 登录成功后 token 正确保存
- [ ] 页面跳转后 token 仍然存在
- [ ] 刷新页面后 token 不丢失
- [ ] 多个标签页之间 token 同步

## 🚨 常见问题

### Q1: 为什么还是读取不到 token？
**检查**：
1. 是否所有页面都引入了 token-sync.js
2. 浏览器是否禁用了 localStorage
3. 是否在隐私模式下运行

### Q2: Token 在刷新页面后丢失？
**解决**：
- 检查 token-manager.js 的备份机制是否正常工作
- 查看控制台的 TokenSync 日志

### Q3: 多个标签页 token 不同步？
**解决**：
- TokenSync 已经监听 storage 事件
- 确保所有标签页都加载了 token-sync.js

## 📞 需要帮助？

如果问题仍未解决，请：
1. 打开 `debug-token-issue.html` 运行诊断
2. 查看浏览器控制台的日志
3. 检查 localStorage 中的存储内容
