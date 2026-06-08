# 🔧 灵月仙途 - 调试工具使用指南

## 📋 问题现象

在宗门页面或其他页面，控制台出现警告：
```
⚠️ TokenManager: 有 userId/roleId 但没有 Token - 数据不一致！
```

## 🛠️ 调试工具

### 方法一：使用综合调试工具（推荐）

1. **打开调试工具页面**
   ```
   访问：http://localhost:8080/debug-all-in-one.html
   ```

2. **查看存储状态**
   - 自动显示所有 localStorage 数据
   - Token、userId、roleId 等一目了然

3. **运行诊断**
   - 切换到 "Token 诊断" 标签页
   - 点击 "🔬 运行诊断" 按钮
   - 查看诊断结果

4. **修复问题**
   - 点击 "🔧 修复 Token" - 自动恢复 Token
   - 点击 "🔄 同步数据" - 同步所有角色 ID
   - 点击 "🗑️ 清除 Token" - 清除所有 Token 数据

5. **测试 API**
   - 切换到 "API 测试" 标签页
   - 测试获取角色列表
   - 测试获取角色资产
   - 测试认证头

### 方法二：使用自动修复脚本

1. **打开任意游戏页面**

2. **按 F12 打开开发者工具**

3. **在控制台粘贴并运行脚本**
   ```javascript
   // 复制 auto-fix-script.js 的全部内容
   // 粘贴到控制台，按回车执行
   ```

4. **查看输出**
   - 脚本会自动诊断问题
   - 自动尝试修复
   - 显示修复结果

### 方法三：手动修复

1. **打开浏览器开发者工具**（F12）

2. **在控制台执行以下命令**

#### 检查存储状态
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('userId:', localStorage.getItem('userId'));
console.log('roleId:', localStorage.getItem('roleId'));
console.log('currentRoleId:', localStorage.getItem('currentRoleId'));
```

#### 同步角色 ID
```javascript
const roleId = localStorage.getItem('roleId') || localStorage.getItem('currentRoleId');
if (roleId) {
  localStorage.setItem('roleId', roleId);
  localStorage.setItem('currentRoleId', roleId);
  localStorage.setItem('selectedCharacterId', roleId);
  console.log('✅ 角色 ID 已同步');
}
```

#### 从备份恢复 Token
```javascript
const backup = localStorage.getItem('_token_backup_');
if (backup) {
  try {
    const backupData = JSON.parse(backup);
    if (backupData.token) {
      localStorage.setItem('token', backupData.token);
      console.log('✅ Token 已从备份恢复');
    }
  } catch (e) {
    console.error('❌ 备份解析失败:', e);
  }
}
```

#### 清除所有数据（最后手段）
```javascript
localStorage.clear();
console.log('✅ 所有数据已清除，请重新登录');
window.location.href = 'login.html';
```

##  快速修复流程

### 方案 A：使用调试工具（最简单）
```
1. 打开 debug-all-in-one.html
2. 点击 "运行诊断"
3. 点击 "修复 Token"
4. 点击 "同步数据"
5. 刷新页面
```

### 方案 B：使用自动脚本
```
1. 打开游戏页面
2. 按 F12
3. 粘贴 auto-fix-script.js 内容
4. 按回车执行
5. 刷新页面
```

### 方案 C：手动修复
```
1. 按 F12
2. 执行检查命令
3. 根据情况执行相应修复命令
4. 刷新页面
```

## 📊 诊断检查清单

### Token 检查
- [ ] Token 是否存在
- [ ] Token 格式是否正确
- [ ] Token 是否过期

### 用户数据检查
- [ ] userId 是否存在
- [ ] username 是否存在

### 角色数据检查
- [ ] roleId 是否存在
- [ ] currentRoleId 是否存在
- [ ] selectedCharacterId 是否存在
- [ ] 三个角色 ID 是否一致

### API 检查
- [ ] 获取角色列表 API 是否正常
- [ ] 获取角色资产 API 是否正常
- [ ] Authorization 头是否正确

## 🔍 常见问题

### Q1: Token 不存在怎么办？
**解决**：
1. 使用调试工具的 "修复 Token" 功能
2. 或运行自动修复脚本
3. 如果都无法恢复，需要重新登录

### Q2: 角色 ID 不一致怎么办？
**解决**：
1. 使用调试工具的 "同步数据" 功能
2. 或执行同步命令：
   ```javascript
   const roleId = localStorage.getItem('roleId');
   localStorage.setItem('currentRoleId', roleId);
   localStorage.setItem('selectedCharacterId', roleId);
   ```

### Q3: API 请求失败怎么办？
**解决**：
1. 检查 Token 是否存在
2. 检查 userId 是否存在
3. 检查 roleId 是否存在
4. 检查后端服务是否运行

### Q4: 修复后还是有问题怎么办？
**解决**：
1. 清除所有数据
2. 重新登录
3. 如果还有问题，联系开发团队

## 📝 修复后的验证

### 验证步骤
1. **刷新页面**
2. **打开控制台**（F12）
3. **检查是否还有警告**
4. **访问宗门页面**
5. **确认功能正常**

### 验证命令
```javascript
// 检查最终状态
console.log('最终状态:');
console.log('Token:', localStorage.getItem('token') ? '存在 ✓' : '不存在 ✗');
console.log('userId:', localStorage.getItem('userId') || '不存在');
console.log('roleId:', localStorage.getItem('roleId') || '不存在');
console.log('currentRoleId:', localStorage.getItem('currentRoleId') || '不存在');
```

## 🎮 预防建议

### 开发者
1. 统一使用 TokenManager 管理 Token
2. 在页面跳转前同步 Token
3. 引入 token-sync.js 自动同步

### 用户
1. 不要手动清除 localStorage
2. 使用游戏内的清除数据功能
3. 定期使用调试工具检查

## 📞 需要帮助？

如果以上方法都无法解决问题：

1. **截图控制台日志**
2. **截图调试工具的诊断结果**
3. **联系开发团队**

## 🎯 推荐做法

**最简单有效的方法**：
1. 打开 `debug-all-in-one.html`
2. 按照工具提示操作
3. 修复后刷新页面

**最快速的修复**：
```javascript
// 在控制台执行
localStorage.clear();
window.location.href = 'login.html';
// 重新登录
```

祝游戏愉快！🎮
