# AuthService 快速参考

##  快速开始

### 1. 在页面中获取用户信息
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const userInfo = await window.AuthService.loadUserInfo();
  if (userInfo) {
    console.log('用户信息:', userInfo);
  }
});
```

### 2. 监听用户信息加载
```javascript
window.addEventListener('user-info-loaded', (e) => {
  const user = e.detail;
  document.getElementById('name').textContent = user.name;
});
```

### 3. 检查登录状态
```javascript
if (window.AuthService.checkAuth()) {
  // 已登录，执行业务逻辑
}
```

### 4. 发起 API 请求
```javascript
const response = await window.AuthService.fetch(
  'http://localhost:8088/api/endpoint',
  { method: 'POST', body: JSON.stringify(data) }
);
```

## 📋 常用 API

| 方法 | 说明 | 返回 |
|------|------|------|
| `getToken()` | 获取 Token | string |
| `getCurrentRoleId()` | 获取角色 ID | string |
| `loadUserInfo()` | 加载用户信息 | Promise<Object> |
| `getUserInfo()` | 获取已缓存的用户信息 | Object |
| `checkAuth()` | 检查认证状态 | boolean |
| `fetch(url, options)` | 发起带认证的请求 | Promise<Response> |
| `redirectToLogin()` | 跳转到登录页 | void |
| `handleAuthFail()` | 处理认证失败 | void |

## 🔧 配置选项

```javascript
AuthService.init({
  requireAuth: true,        // 是否需要登录
  autoRefresh: true,        // 是否自动刷新用户信息
  redirectOnAuthFail: true  // 认证失败是否跳转
});
```

## 📁 已添加的页面

✅ 41 个主要业务页面已自动支持认证

核心页面：
- index.html, cultivation.html, skills/skills.html
- character/character.html, inventory/inventory.html
- equipment/equipment.html, trade/trade.html

功能页面：
- shop.html, leaderboard.html, restaurant.html
- fuben.html, body-training.html, test-center.html
- checkin.html, mail.html, achievements.html

场景页面：
- word/world.html, map/map.html
- clan/*.html, guild/*.html

## 🛠️ 调试命令

浏览器控制台：
```javascript
// 查看 Token
localStorage.getItem('token')

// 查看用户信息
window.AuthService.getUserInfo()

// 刷新用户信息
await window.AuthService.loadUserInfo()

// 检查认证
window.AuthService.checkAuth()
```

## ⚠️ 注意事项

1. **特殊页面不需要添加**：
   - login.html（登录页）
   - register.html（注册页）
   - character-create/*.html（角色创建）
   - admin/*.html（管理后台）

2. **Token 管理**：
   - 与 TokenManager 配合使用
   - 自动备份和恢复
   - 无需手动处理存储

3. **错误处理**：
   - 401 自动跳转登录页
   - 网络错误不自动跳转
   - 控制台会输出详细日志

## 📖 详细文档

- [AUTH-SERVICE-GUIDE.md](./AUTH-SERVICE-GUIDE.md) - 完整使用指南
- [AUTH-SERVICE-SUMMARY.md](./AUTH-SERVICE-SUMMARY.md) - 更新总结

---
版本：v1.0.0 | 更新：2026-04-09
