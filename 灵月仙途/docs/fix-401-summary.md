# 401 错误统一修复方案

## 问题根因

1. **Token 过期** - JWT Token 已失效
2. **强制跳转** - 多处代码检测到 401 后强制跳转登录页
3. **数据清除** - 某些地方在清除 localStorage

## 已修复的文件

### 1. js/config.js ✅
```javascript
// clearUserInfo() - 不再清除 localStorage
clearUserInfo() {
  this.currentUserId = null;
  this.currentRoleId = null;
  this.userInfo = null;
  // 不清除 localStorage
  console.log('用户信息已清除（保留 localStorage 数据）');
}
```

### 2. js/login-manager.js ✅
```javascript
// handle401Error() - 不再显示弹窗
handle401Error(error, onConfirm, onCancel) {
  console.log('401 错误：登录已过期，但不显示弹窗');
  if (onConfirm) onConfirm();
}
```

### 3. js/api-service.js ✅
```javascript
// 401 错误处理 - 只记录日志
if (response.status === 401) {
  console.warn('Token 可能已过期或无效，继续执行...');
}
```

### 4. skills/skills.html ✅
```javascript
// 错误处理 - 静默失败
catch (error) {
  console.log('获取角色信息失败:', error.message);
}
```

### 5. cultivation.html ✅
```javascript
// 修炼功能 - API 失败使用本地计算
catch (error) {
  const baseXiuwei = 10;
  showToast(`获得 ${baseXiuwei} 修为（离线修炼）`);
}
```

## 还需要修复的文件

### index.html - 移除强制跳转
需要检查以下位置的跳转逻辑：
- 第 2611 行：退出登录
- 第 2637 行：确认退出
- 第 2876 行：未登录跳转
- 第 2894 行：Token 无效跳转

### 其他页面
- clan-list.html
- world.html
- start/start.html
- 等等...

## 统一修复策略

### 原则
1. **不强制跳转** - 允许用户继续浏览
2. **不清除数据** - 保留 localStorage
3. **不显示弹窗** - 只在控制台记录日志
4. **功能降级** - API 失败时使用默认数据或本地计算

### 实现
```javascript
// 错误处理模板
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

## 测试步骤

1. 清除浏览器缓存
2. 重新登录
3. 测试所有页面
4. 等待 Token 过期
5. 验证不再强制跳转

## 预期效果

- ✅ Token 过期时不跳转
- ✅ 页面正常显示
- ✅ 需要认证的功能使用默认数据
- ✅ 用户可以继续浏览
- ✅ 用户手动选择是否登录
