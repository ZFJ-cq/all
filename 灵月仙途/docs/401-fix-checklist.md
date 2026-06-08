# 401 错误全面修复清单

## 已修复的核心文件 ✅

### 1. js/config.js
- [x] clearUserInfo() 不再清除 localStorage
- [x] clearUserInfo() 不再调用 roleStore.logout()

### 2. js/login-manager.js
- [x] handle401Error() 不再显示弹窗
- [x] 取消按钮不再清除数据

### 3. js/api-service.js
- [x] 401 错误只记录日志
- [x] 不调用 LoginManager
- [x] 不弹窗，不跳转

### 4. index.html (修炼页面)
- [x] 移除 renderUI() 中的强制跳转
- [x] 添加 showDefaultPage() 函数
- [x] 未登录时显示默认页面

### 5. skills/skills.html
- [x] loadCharacter() 静默失败
- [x] loadSkills() 使用默认数据
- [x] loadRoleSkills() 静默失败

### 6. cultivation.html (修炼页面)
- [x] executeCultivationCycle() API 失败使用本地计算
- [x] 基础修为：10 点/30 秒
- [x] 显示"离线修炼"提示

### 7. clan/clan-list.html
- [x] loadClansFromDatabase() 不显示错误状态
- [x] showEmptyState() 显示友好提示
- [x] 未登录时显示"请先登录"

## 待修复的文件 📋

### 8. world/world.html
- [ ] 检查是否有强制跳转
- [ ] 检查是否有错误弹窗
- [ ] 添加 401 错误处理

### 9. assets/assets.html
- [ ] 检查是否有强制跳转
- [ ] 检查是否有错误弹窗
- [ ] 添加 401 错误处理

### 10. body-training.html
- [ ] 检查是否有强制跳转
- [ ] 检查是否有错误弹窗
- [ ] 添加 401 错误处理

### 11. friends.html
- [ ] 检查是否有强制跳转
- [ ] 检查是否有错误弹窗
- [ ] 添加 401 错误处理

### 12. character/character.html
- [ ] 检查是否有强制跳转
- [ ] 检查是否有错误弹窗
- [ ] 添加 401 错误处理

### 13. start/start.html
- [ ] 检查是否有强制跳转
- [ ] 检查是否有错误弹窗
- [ ] 添加 401 错误处理

## 统一修复策略 🎯

### 原则
1. **不强制跳转** - 允许用户继续浏览
2. **不清除数据** - 保留 localStorage
3. **不显示弹窗** - 只在控制台记录日志
4. **功能降级** - API 失败时使用默认数据或本地计算

### 错误处理模板
```javascript
try {
  const data = await apiService.get('/endpoint');
  // 使用数据
} catch (error) {
  // 只记录日志，不弹窗，不跳转
  console.log('API 调用失败:', error.message);
  // 使用默认数据或本地计算
  useDefaultData();
}
```

### 空状态提示模板
```javascript
function showEmptyState() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // 未登录状态
    return `
      🔐
      请先登录
      登录后可以使用此功能
    `;
  } else {
    // 已登录但无数据
    return `
      📭
      暂无数据
      请稍后再试
    `;
  }
}
```

## 测试步骤 🧪

### 1. 清除缓存并刷新
按 `Ctrl+Shift+R` 或 `Cmd+Shift+R`

### 2. 重新登录
访问 `http://localhost:8000/login.html`

### 3. 测试所有页面
- [x] 修炼页面 (index.html)
- [x] 功法页面 (skills/skills.html)
- [x] 修炼页面 (cultivation.html)
- [x] 宗门页面 (clan/clan-list.html)
- [ ] 世界页面 (world/world.html)
- [ ] 资产页面 (assets/assets.html)
- [ ] 炼体页面 (body-training.html)
- [ ] 好友页面 (friends.html)
- [ ] 角色页面 (character/character.html)

### 4. 验证效果
- [ ] 不再强制跳转登录页
- [ ] 不再显示红叉错误
- [ ] 显示友好的空状态提示
- [ ] 用户可以继续浏览
- [ ] 需要认证的功能使用默认数据

## 预期效果 ✨

### 修复前
```
Token 过期
  ↓
API 返回 401
  ↓
显示错误弹窗 ❌
  ↓
强制跳转登录页 ❌
  ↓
用户无法使用 ❌
```

### 修复后
```
Token 过期
  ↓
API 返回 401
  ↓
控制台记录日志 ✅
  ↓
页面正常显示 ✅
  ↓
显示友好提示 ✅
  ↓
用户可以继续浏览 ✅
  ↓
用户手动选择是否登录 ✅
```

## 下一步行动 📝

1. [x] 创建 global-401-handler.js
2. [x] 修复核心文件
3. [x] 修复主要页面
4. [ ] 修复其他页面
5. [ ] 测试所有页面
6. [ ] 更新文档
