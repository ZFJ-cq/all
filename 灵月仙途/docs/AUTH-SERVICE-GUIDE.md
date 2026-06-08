# AuthService 使用指南

## 概述

AuthService 是一个统一的用户认证与信息服务，为所有页面提供：
- ✅ Token 管理和验证
- ✅ 自动获取用户信息
- ✅ 登录状态检查
- ✅ 认证失败自动跳转

## 已自动添加的页面

以下页面已自动添加 AuthService 支持：

### 主要页面
- index.html (修炼主页)
- cultivation.html
- skills/skills.html
- character/character.html
- inventory/inventory.html
- equipment/equipment.html
- tasks/tasks.html
- shop.html
- leaderboard.html
- restaurant.html
- fuben.html
- body-training.html
- test-center.html
- checkin.html
- mail.html
- achievements.html

### 地图和世界
- map/map.html
- word/world.html
- home/zhongtian.html

### 社交和交易
- trade/trade.html
- partner/partner.html
- social/social.html
- friends.html
- news/news-list.html

### 宗门和公会
- clan/my-clan.html
- clan/clan.html
- clan/members.html
- clan/tasks.html
- clan/contribution.html
- clan/shop.html
- clan/buildings.html
- guild/index.html
- guild/liandan.html
- guild/forge.html
- guild/cave.html

### 其他
- avatar-shop/avatar-shop.html
- techniques/techniques.html
- settings/settings.html
- combat/combat.html
- assets/assets.html
- beast-island/index.html
- body-cultivation/index.html

## 使用方法

### 1. 基础使用（自动获取用户信息）

在页面加载时自动获取用户信息：

```javascript
// 在页面的 script 中添加
document.addEventListener('DOMContentLoaded', async () => {
  // 等待 AuthService 加载
  if (window.AuthService) {
    // 获取用户信息
    const userInfo = await window.AuthService.loadUserInfo();
    
    if (userInfo) {
      console.log('用户信息:', userInfo);
      // 更新页面显示
    } else {
      console.warn('未能获取用户信息');
    }
  }
});
```

### 2. 监听用户信息加载完成

```javascript
// 监听用户信息加载完成事件
window.addEventListener('user-info-loaded', (e) => {
  const userInfo = e.detail;
  console.log('用户信息已加载:', userInfo);
  // 更新页面 UI
});
```

### 3. 手动检查登录状态

```javascript
// 检查 Token 是否有效
if (window.AuthService.checkAuth()) {
  // 已登录，执行业务逻辑
} else {
  // 未登录，会跳转到登录页
}
```

### 4. 获取当前用户信息

```javascript
// 同步获取（如果已经加载）
const userInfo = window.AuthService.getUserInfo();

// 异步获取（总是最新的）
const userInfo = await window.AuthService.loadUserInfo();
```

### 5. 发起带认证的 API 请求

```javascript
// 使用 AuthService.fetch 自动携带 Token
const response = await window.AuthService.fetch('http://localhost:8088/api/some-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' })
});

if (response) {
  const data = await response.json();
  console.log('API 响应:', data);
}
```

## 自动认证流程

AuthService 会在以下情况自动处理认证：

1. **页面加载时**
   - 检查 Token 是否存在
   - 验证 Token 格式
   - 自动获取用户信息

2. **API 请求失败时**
   - 检测到 401 错误
   - 自动清理 Token
   - 跳转到登录页

3. **Token 过期时**
   - 自动检测无效 Token
   - 清理本地存储
   - 重定向到登录页

## 配置选项

可以通过 `AuthService.init()` 传入配置：

```javascript
AuthService.init({
  requireAuth: true,        // 是否需要登录（默认 true）
  autoRefresh: true,        // 是否自动刷新用户信息（默认 true）
  redirectOnAuthFail: true  // 认证失败是否自动跳转（默认 true）
});
```

## 特殊页面处理

以下页面**不需要**添加 AuthService：

- login.html (登录页)
- register.html (注册页)
- character-create/*.html (角色创建页面)
- start/*.html (启动页面)
- admin/*.html (管理后台)

这些页面有自己独立的认证逻辑。

## 错误处理

AuthService 会自动处理以下错误：

1. **Token 不存在**
   - 输出警告日志
   - 跳转到登录页

2. **Token 格式无效**
   - 清除无效 Token
   - 跳转到登录页

3. **API 请求失败（401）**
   - 清理所有登录数据
   - 跳转到登录页

4. **网络错误**
   - 输出错误日志
   - 不自动跳转（等待重试）

## 调试技巧

在浏览器控制台中：

```javascript
// 查看当前 Token
localStorage.getItem('token');

// 查看当前用户信息
window.AuthService.getUserInfo();

// 手动刷新用户信息
await window.AuthService.loadUserInfo();

// 检查认证状态
window.AuthService.checkAuth();

// 清除 Token（测试用）
localStorage.removeItem('token');
```

## 注意事项

1. **Token 持久化**
   - AuthService 与 TokenManager 配合使用
   - Token 会自动备份和恢复
   - 不需要手动处理 Token 存储

2. **角色 ID**
   - 使用 `getCurrentRoleId()` 获取当前角色 ID
   - 会自动从多个来源同步角色 ID
   - 与 RoleSync 配合使用

3. **跨页面共享**
   - 用户信息在每个页面独立加载
   - 可以通过 localStorage 共享
   - 推荐使用统一的 API 获取

## 示例代码

### 完整示例（在页面中使用）

```html
<script>
document.addEventListener('DOMContentLoaded', async () => {
  // 等待 AuthService 可用
  if (!window.AuthService) {
    console.error('AuthService 未加载');
    return;
  }
  
  try {
    // 获取用户信息
    const userInfo = await window.AuthService.loadUserInfo();
    
    if (!userInfo) {
      console.warn('未获取到用户信息');
      return;
    }
    
    // 更新页面显示
    document.getElementById('playerName').textContent = userInfo.name;
    document.getElementById('realm').textContent = userInfo.realm;
    document.getElementById('spiritStones').textContent = userInfo.spiritStones;
    
    console.log('用户信息加载成功');
  } catch (error) {
    console.error('加载用户信息失败:', error);
  }
});
</script>
```

## 相关文件

- `/js/auth-service.js` - 认证服务主文件
- `/js/token-manager.js` - Token 管理器
- `/js/role-sync.js` - 角色同步器
- `/js/common.js` - 公共工具函数

## 更新日志

### v1.0.0 (2026-04-09)
- ✅ 初始版本
- ✅ 统一的 Token 管理
- ✅ 自动获取用户信息
- ✅ 认证失败自动跳转
- ✅ 批量添加到所有主要页面
