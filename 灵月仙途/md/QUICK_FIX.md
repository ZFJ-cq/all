# 🚀 快速修复指南 - 3 分钟解决问题

## ⚡ 最快解决方法（30 秒）

### 步骤 1：打开调试工具
```
访问：http://localhost:8080/debug-all-in-one.html
```

### 步骤 2：一键修复
点击这三个按钮（按顺序）：
1. 🔧 **修复 Token**
2. 🔄 **同步数据**
3. 📥 **加载角色数据**

### 步骤 3：验证
刷新宗门页面，问题解决！✅

---

## 🛠️ 如果上面的方法不行

### 方法 A：使用自动修复脚本（1 分钟）

1. 打开任意游戏页面（如 index.html）
2. 按 **F12** 打开开发者工具
3. 在控制台粘贴以下内容并回车：

```javascript
// 复制 auto-fix-script.js 的全部内容
// 访问：http://localhost:8080/auto-fix-script.js
```

4. 脚本会自动诊断和修复
5. 刷新页面

### 方法 B：手动修复（2 分钟）

1. 按 **F12** 打开开发者工具
2. 在控制台依次执行：

```javascript
// 1. 清除不一致的数据
localStorage.removeItem('userId');
localStorage.removeItem('roleId');
localStorage.removeItem('currentRoleId');
localStorage.removeItem('selectedCharacterId');

// 2. 重新登录
window.location.href = 'login.html';
```

3. 在登录页重新登录
4. 问题解决！✅

### 方法 C：完全清除（最后手段）

```javascript
// 在控制台执行
localStorage.clear();
window.location.href = 'login.html';
```

---

## 📋 验证是否修复成功

### 检查清单
- [ ] 控制台没有警告信息
- [ ] Token 存在
- [ ] userId 存在
- [ ] roleId 存在
- [ ] 可以正常访问宗门页面

### 验证命令
```javascript
// 在控制台执行
console.log('Token:', localStorage.getItem('token') ? '✓' : '✗');
console.log('userId:', localStorage.getItem('userId') || '✗');
console.log('roleId:', localStorage.getItem('roleId') || '✗');
```

---

## 🎯 常见问题

### Q: 修复后还有警告？
**A**: 刷新页面，或者清除浏览器缓存（Ctrl+Shift+Delete）

### Q: 无法访问调试工具？
**A**: 确保本地服务器正在运行（通常是 http://localhost:8080）

### Q: 修复后无法登录？
**A**: 检查后端服务是否运行正常

---

## 💡 推荐做法

**日常使用**：
- 不要手动清除 localStorage
- 使用游戏内的清除数据功能
- 定期使用调试工具检查

**开发者**：
- 统一使用 TokenManager
- 引入 token-sync.js 自动同步
- 在页面跳转前同步 Token

---

## 📞 还是不行？

1. **截图**控制台日志
2. **截图**调试工具诊断结果
3. **联系**开发团队

---

**记住这个 URL**：`debug-all-in-one.html`
它是你的万能修复工具！🔧
