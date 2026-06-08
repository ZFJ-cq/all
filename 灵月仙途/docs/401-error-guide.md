# 401 错误故障排查指南

## 问题现象

```
GET http://localhost:8088/api/role-asset/46 401 (Unauthorized)
```

## 根本原因

**后端日志显示**：
```
未认证请求：/api/role-asset/46, Authorization: 
```

说明：**Authorization Header 为空**

## 可能的原因

### 1. Token 已过期（24 小时）
**检查方法**：
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);
console.log('Token 长度:', token?.length);
```

**解决方案**：
- 重新登录获取新 token
- 或修改后端 JWT 过期时间

### 2. Token 被意外清除
**检查方法**：
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('用户 ID:', localStorage.getItem('userId'));
console.log('用户名:', localStorage.getItem('username'));
```

**可能原因**：
- 浏览器清理了 localStorage
- 其他代码清除了数据
- 浏览器扩展干扰

**解决方案**：
- 重新登录
- 检查是否有代码调用 `localStorage.clear()`

### 3. localStorage 读取失败
**检查方法**：
```javascript
try {
  const token = localStorage.getItem('token');
  console.log('读取成功:', token);
} catch (error) {
  console.error('读取失败:', error);
}
```

**可能原因**：
- 浏览器隐私模式
- localStorage 已满
- 浏览器限制

**解决方案**：
- 退出隐私模式
- 清除浏览器缓存
- 使用正常模式

### 4. 多标签页竞争条件
**现象**：
- 标签页 A 清除了 token
- 标签页 B 还在使用旧 token

**解决方案**：
- 使用 `storage` 事件监听变化
- 统一使用 LoginManager 管理

### 5. JWT 密钥不匹配
**现象**：
```
JWT signature does not match locally computed signature
```

**原因**：
- 后端密钥被修改
- 前端 token 是旧密钥生成的

**解决方案**：
1. 清除旧 token
2. 重新登录

## 诊断步骤

### 步骤 1：检查 localStorage

打开浏览器控制台，执行：
```javascript
console.log('=== 登录状态检查 ===');
console.log('Token:', localStorage.getItem('token'));
console.log('用户 ID:', localStorage.getItem('userId'));
console.log('用户名:', localStorage.getItem('username'));
console.log('角色 ID:', localStorage.getItem('currentRoleId'));
```

**正常情况**：
```
Token: eyJhbGciOiJIUzI1NiJ9...
用户 ID: 1
用户名：19123590785
角色 ID: 45
```

**异常情况**：
```
Token: null
用户 ID: null
```

### 步骤 2：检查 API 请求

打开 Network 面板，查看请求头：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**正常**：有 Bearer 前缀
**异常**：Authorization 字段为空或缺失

### 步骤 3：检查后端日志

查看后端输出的日志：
```
请求路径：/api/role-asset/46, Authorization Header: 存在
Token 验证成功 - 用户 ID: 1
```

或：
```
未认证请求：/api/role-asset/46, Authorization: 
```

### 步骤 4：验证 Token 有效性

在控制台执行：
```javascript
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

fetch(`http://localhost:8088/api/role/user/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(d => console.log('验证结果:', d))
.catch(e => console.error('验证失败:', e));
```

**成功**：
```json
{
  "code": 200,
  "data": [...]
}
```

**失败**：
```json
{
  "code": 401,
  "message": "token 已过期，请重新登录"
}
```

## 解决方案

### 方案 1：使用 LoginManager（推荐）

页面加载时自动验证：
```javascript
// index.html 已自动集成
await window.LoginManager.validateToken();
```

### 方案 2：手动清除并重新登录

访问：
```
http://localhost:8000/clear-token.html
```

点击"清除旧 Token"，然后重新登录。

### 方案 3：控制台清除

在控制台执行：
```javascript
localStorage.clear();
location.reload();
```

然后重新登录。

### 方案 4：检查代码

搜索所有清除 localStorage 的代码：
```javascript
// 查找这些调用
localStorage.removeItem
localStorage.clear
```

确保没有误调用。

## 预防措施

### 1. 使用 LoginManager 统一管理

```javascript
// ✅ 推荐
LoginManager.clearLoginInfo();

// ❌ 不推荐
localStorage.removeItem('token');
```

### 2. 页面加载时验证 Token

```javascript
// 已在 index.html 中实现
(async function initPage() {
  const isValid = await LoginManager.validateToken();
  if (!isValid) {
    // 跳转到登录页
  }
})();
```

### 3. API 请求统一处理 401

```javascript
// api-service.js 已自动处理
try {
  await apiService.get('/endpoint');
} catch (error) {
  // LoginManager 会显示对话框
}
```

### 4. 监听 storage 事件

```javascript
// 监听其他标签页的变化
window.addEventListener('storage', (e) => {
  if (e.key === 'token' && !e.newValue) {
    console.log('Token 被其他标签页清除');
    // 处理逻辑
  }
});
```

## 快速修复

### 最快方案

1. 访问：`http://localhost:8000/clear-token.html`
2. 点击"清除旧 Token"
3. 重新登录

### 开发调试方案

1. 打开控制台
2. 执行：`localStorage.clear()`
3. 刷新页面
4. 重新登录

### 生产环境方案

1. 实现 Token 刷新机制
2. 设置合理的过期时间
3. 添加刷新 Token 接口
4. 前端自动刷新 Token

## 日志分析

### 成功日志
```
Token: 存在
Authorization Header: 已设置
Token 验证成功 - 用户 ID: 1
成功获取用户 1 的角色列表
```

### 失败日志
```
Token: 不存在
Authorization Header: 未设置
未认证请求：/api/xxx, Authorization: 
```

## 常见错误

### 错误 1：Token 格式错误
```
Authorization: eyJhbGci...  // ❌ 缺少 Bearer
Authorization: Bearer eyJhbGci...  // ✅ 正确
```

### 错误 2：Token 已过期
```
{
  "code": 401,
  "message": "token 已过期，请重新登录"
}
```

### 错误 3：JWT 签名不匹配
```
JWT signature does not match locally computed signature
```
原因：密钥不匹配，需要重新登录。

## 总结

401 错误的根本原因是**Authorization Header 为空或无效**。

**最佳实践**：
1. ✅ 使用 LoginManager 统一管理
2. ✅ 页面加载时验证 Token
3. ✅ API 请求统一处理 401
4. ✅ 提供友好的重新登录流程
5. ✅ 定期清理过期 Token

**不要**：
1. ❌ 手动清除 localStorage
2. ❌ 忽略 401 错误
3. ❌ 强制自动跳转
4. ❌ 不提示用户
