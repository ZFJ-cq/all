# Token 不一致问题修复指南

## 📋 问题描述

在访问宗门页面或其他页面时，控制台出现以下警告：
```
⚠️ TokenManager: 有 userId/roleId 但没有 Token - 数据不一致！
⚠️ TokenManager: 检测到数据不一致，尝试从备份恢复...
```

## 🔍 问题原因

1. **多个 Token 管理模块共存**：
   - `token-manager.js` - 使用 localStorage 存储
   - `auth-manager.js` - 也使用 localStorage 存储
   - 两个模块之间没有同步机制

2. **页面加载顺序问题**：
   - TokenManager 在页面加载时自动初始化
   - 如果先检查 token 完整性，但 token 还没从其他模块恢复，就会报错

3. **数据不一致**：
   - userId/roleId 存在，但 token 被清除或过期
   - 或者 token 存储在 auth-manager 中，但 token-manager 读取不到

## ✅ 解决方案

### 方法一：使用修复工具（推荐）

1. **打开修复工具页面**
   ```
   访问：http://localhost:8080/fix-token-tool.html
   ```

2. **运行诊断**
   - 点击"运行诊断"按钮
   - 查看诊断结果

3. **修复 Token**
   - 如果诊断发现问题，点击"修复 Token"
   - 工具会自动从备份或其他模块恢复 token

4. **同步数据**
   - 点击"同步所有数据"确保所有字段一致

### 方法二：手动修复

1. **打开浏览器开发者工具**（F12）

2. **检查 localStorage**
   ```javascript
   console.log('token:', localStorage.getItem('token'));
   console.log('userId:', localStorage.getItem('userId'));
   console.log('roleId:', localStorage.getItem('roleId'));
   console.log('currentRoleId:', localStorage.getItem('currentRoleId'));
   ```

3. **如果 token 不存在但有 userId/roleId**
   ```javascript
   // 清除不一致的数据
   localStorage.removeItem('userId');
   localStorage.removeItem('roleId');
   localStorage.removeItem('currentRoleId');
   localStorage.removeItem('selectedCharacterId');
   
   // 重新登录
   window.location.href = 'login.html';
   ```

4. **如果 token 在 auth-manager 中**
   ```javascript
   // 从 AuthManager 获取 token
   const token = window.AuthManager.getToken();
   if (token) {
     localStorage.setItem('token', token);
     console.log('Token 已恢复');
   }
   ```

### 方法三：重新登录

最简单的方法：

1. 访问 `clear-token.html` 清除所有数据
2. 重新登录

## 🛠️ 已实施的代码修复

### 1. 改进 TokenManager 的恢复逻辑

修改了 `js/token-manager.js` 中的 `_checkAndRestoreToken()` 方法：

```javascript
_checkAndRestoreToken() {
  const status = this.validateTokenIntegrity();
  
  if (!status.hasToken && (status.hasUserId || status.hasRoleId)) {
    console.warn('⚠️ TokenManager: 检测到数据不一致，尝试从备份恢复...');
    const restored = this._restoreFromBackup();
    
    // 如果从备份恢复失败，尝试从 AuthManager 恢复
    if (!restored && window.AuthManager) {
      const authToken = window.AuthManager.getToken();
      if (authToken) {
        console.log('✅ TokenManager: 从 AuthManager 恢复 Token');
        this.saveToken(authToken, localStorage.getItem('userId'), localStorage.getItem('roleId'));
      }
    }
    
    // 如果仍然没有 token，清理不一致的数据
    if (!localStorage.getItem('token')) {
      console.warn('⚠️ TokenManager: 无法恢复 Token，清理不一致的数据');
      localStorage.removeItem('userId');
      localStorage.removeItem('roleId');
      localStorage.removeItem('currentRoleId');
      localStorage.removeItem('selectedCharacterId');
    }
  }
}
```

### 2. 简化日志输出

修改了 `validateTokenIntegrity()` 方法，只在必要时输出日志，减少控制台噪音。

## 📝 使用修复工具的步骤

1. **打开修复工具页面**
   - 访问 `fix-token-tool.html`

2. **查看当前状态**
   - 查看"当前存储状态"部分
   - 了解 token、userId、roleId 等字段的存在情况

3. **运行诊断**
   - 点击"运行诊断"按钮
   - 查看诊断结果，了解存在的问题

4. **执行修复**
   - 根据诊断结果，点击相应的修复按钮
   - "修复 Token" - 尝试从备份或 AuthManager 恢复 token
   - "同步所有数据" - 同步所有角色 ID 字段
   - "清理不一致数据" - 清除没有 token 的 userId/roleId

5. **验证修复**
   - 刷新状态，确认数据已修复
   - 访问宗门页面，检查是否还有警告

## 🔧 预防措施

### 开发者注意事项

1. **统一使用 TokenManager**
   ```javascript
   // 保存 token
   window.TokenUtils.save(token, userId, roleId);
   
   // 获取 token
   const token = window.TokenUtils.get();
   ```

2. **在页面跳转前同步 token**
   ```javascript
   // 跳转前
   if (window.TokenSync) {
     window.TokenSync.sync();
   }
   window.location.href = 'target-page.html';
   ```

3. **在所有页面引入 token-sync.js**
   ```html
   <script src="js/token-sync.js"></script>
   <script src="js/token-manager.js"></script>
   ```

### 用户注意事项

1. **不要手动清除 localStorage**
2. **使用游戏内的"清除数据"功能**
3. **定期使用修复工具检查**

## 📞 需要帮助？

如果以上方法都无法解决问题：

1. **打开浏览器开发者工具**（F12）
2. **查看控制台日志**
3. **截图并反馈给开发团队**

## 🎯 快速修复流程

```
发现问题 → 打开 fix-token-tool.html → 运行诊断 → 修复 Token → 同步数据 → 验证修复
```

## ✅ 验证清单

- [ ] 打开修复工具页面
- [ ] 运行诊断，查看问题
- [ ] 执行修复操作
- [ ] 刷新状态，确认修复
- [ ] 访问宗门页面，检查控制台
- [ ] 确认没有警告信息

祝游戏愉快！🎮
