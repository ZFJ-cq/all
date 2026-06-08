# 灵月仙途 - 全局配置使用指南

## 📚 目录

1. [概述](#概述)
2. [核心功能](#核心功能)
3. [使用方法](#使用方法)
4. [API 参考](#api-参考)
5. [示例代码](#示例代码)
6. [已适配的页面](#已适配的页面)

---

## 概述

`js/config.js` 是灵月仙途前端项目的全局配置文件，提供：

- ✅ 统一的 API 基础路径管理
- ✅ 自动角色 ID 获取和存储
- ✅ 统一的 API 调用方法
- ✅ 友好的错误提示和 UI 工具

---

## 核心功能

### 1. APP_CONFIG - 全局配置对象

```javascript
window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:8088/api',
    currentUserId: null,      // 当前用户 ID
    currentRoleId: null,      // 当前角色 ID
    userInfo: null,           // 用户信息
    
    async init()              // 初始化方法
    async fetchUserInfo()     // 获取用户信息
    clearUserInfo()           // 清除用户信息
}
```

### 2. apiService - API 调用工具

```javascript
window.apiService = {
    // 基础方法
    call(endpoint, options)   // 统一调用
    get(endpoint)            // GET 请求
    post(endpoint, data)     // POST 请求
    put(endpoint, data)      // PUT 请求
    delete(endpoint)         // DELETE 请求
    
    // 用户相关
    getUserProfile(roleId)   // 获取用户资料
    getUserInfo(userId)      // 获取用户信息
    getRole(userId)          // 获取角色列表
    
    // 修炼相关
    getCultivationStatus(roleId)  // 修炼状态
    cultivate(roleId)             // 执行修炼
    breakthrough(roleId)          // 境界突破
    
    // 锻体相关
    getBodyCultivation(roleId)    // 锻体信息
    bodyTrain(roleId, bodyPart)   // 锻体修炼
    
    // 任务相关
    getTasks(roleId)              // 任务列表
    acceptTask(roleId, taskId)    // 接受任务
    claimTaskReward(roleId, taskId) // 领取奖励
    
    // 背包相关
    getInventory(roleId)          // 背包信息
    useItem(roleId, itemId)       // 使用物品
    
    // 资产相关
    getAssets(roleId)             // 资产列表
    
    // 宗门相关
    getClans()                    // 宗门列表
    joinClan(roleId, clanId)      // 加入宗门
    
    // 其他
    getNews()                     // 新闻/活动
    getStatistics()               // 统计数据
}
```

### 3. uiUtils - UI 工具函数

```javascript
window.uiUtils = {
    showLoading(containerId, message)   // 显示加载
    showError(containerId, message, showRetry)  // 显示错误
    showToast(message, type)            // 显示提示
}
```

---

## 使用方法

### 1. 在 HTML 中引用

在所有需要调用 API 的页面中，**第一个**引用 config.js：

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 其他标签 -->
    <script src="js/config.js"></script>
    <!-- 其他脚本 -->
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

### 2. 获取角色 ID

```javascript
// 方法 1: 从全局配置获取
const roleId = window.APP_CONFIG.currentRoleId;

// 方法 2: 从 localStorage 获取
const roleId = localStorage.getItem('roleId');

// 方法 3: 自动获取（推荐）
async function initPage() {
    let roleId = window.APP_CONFIG.currentRoleId || localStorage.getItem('roleId');
    
    if (!roleId) {
        const userId = localStorage.getItem('userId');
        if (userId) {
            const roles = await apiService.getRole(userId);
            if (roles && roles.length > 0) {
                roleId = roles[0].id;
                localStorage.setItem('roleId', roleId);
                window.APP_CONFIG.currentRoleId = roleId;
            }
        }
    }
    
    if (!roleId) {
        uiUtils.showToast('请先创建角色！', 'error');
        window.location.href = '../character-create/character-create-step1.html';
        return;
    }
    
    // 继续页面逻辑...
}
```

### 3. 调用 API

```javascript
// 示例 1: 获取修炼状态
async function loadCultivationStatus() {
    try {
        const data = await apiService.getCultivationStatus(roleId);
        console.log('修炼状态:', data);
    } catch (error) {
        uiUtils.showToast('加载失败', 'error');
    }
}

// 示例 2: 执行修炼
async function doCultivate() {
    try {
        const result = await apiService.cultivate(roleId);
        if (result.code === 200) {
            uiUtils.showToast('修炼成功！', 'success');
        }
    } catch (error) {
        uiUtils.showToast(error.message, 'error');
    }
}

// 示例 3: 获取任务列表
async function loadTasks() {
    try {
        const tasks = await apiService.getTasks(roleId);
        renderTasks(tasks);
    } catch (error) {
        uiUtils.showError('taskContainer', error.message);
    }
}
```

### 4. 显示加载状态

```javascript
// 显示加载
uiUtils.showLoading('containerId', '正在加载数据...');

// 显示错误
uiUtils.showError('containerId', '加载失败，请重试', true);

// 显示提示
uiUtils.showToast('操作成功！', 'success');
uiUtils.showToast('操作失败', 'error');
```

---

## API 参考

### 用户相关

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getUserProfile(roleId)` | roleId: number | Promise | 获取用户资料 |
| `getUserInfo(userId)` | userId: number | Promise | 获取用户信息 |
| `getRole(userId)` | userId: number | Promise | 获取角色列表 |

### 修炼相关

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getCultivationStatus(roleId)` | roleId: number | Promise | 获取修炼状态 |
| `cultivate(roleId)` | roleId: number | Promise | 执行修炼 |
| `breakthrough(roleId)` | roleId: number | Promise | 境界突破 |

### 锻体相关

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getBodyCultivation(roleId)` | roleId: number | Promise | 获取锻体信息 |
| `bodyTrain(roleId, bodyPart)` | roleId, bodyPart | Promise | 锻体修炼 |

### 任务相关

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getTasks(roleId)` | roleId: number | Promise | 获取任务列表 |
| `acceptTask(roleId, taskId)` | roleId, taskId | Promise | 接受任务 |
| `claimTaskReward(roleId, taskId)` | roleId, taskId | Promise | 领取奖励 |

### 背包相关

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getInventory(roleId)` | roleId: number | Promise | 获取背包 |
| `useItem(roleId, itemId, count)` | roleId, itemId, count | Promise | 使用物品 |

### 资产相关

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getAssets(roleId)` | roleId: number | Promise | 获取资产 |

### 宗门相关

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getClans()` | 无 | Promise | 获取宗门列表 |
| `joinClan(roleId, clanId)` | roleId, clanId | Promise | 加入宗门 |

### 其他

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getNews()` | 无 | Promise | 获取新闻/活动 |
| `getStatistics()` | 无 | Promise | 获取统计数据 |

---

## 示例代码

### 完整页面示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>示例页面</title>
    <script src="js/config.js"></script>
</head>
<body>
    <div id="content">
        <div id="loading">加载中...</div>
        <div id="data" style="display:none;"></div>
    </div>

    <script>
        let roleId = null;

        document.addEventListener('DOMContentLoaded', async () => {
            await initPage();
        });

        async function initPage() {
            // 获取角色 ID
            roleId = window.APP_CONFIG.currentRoleId || localStorage.getItem('roleId');
            
            if (!roleId) {
                const userId = localStorage.getItem('userId');
                if (userId) {
                    const roles = await apiService.getRole(userId);
                    if (roles && roles.length > 0) {
                        roleId = roles[0].id;
                        localStorage.setItem('roleId', roleId);
                        window.APP_CONFIG.currentRoleId = roleId;
                    }
                }
            }
            
            if (!roleId) {
                uiUtils.showToast('请先创建角色！', 'error');
                setTimeout(() => {
                    window.location.href = 'character-create-step1.html';
                }, 1000);
                return;
            }
            
            // 加载数据
            await loadData();
        }

        async function loadData() {
            try {
                const [profile, assets] = await Promise.all([
                    apiService.getUserProfile(roleId),
                    apiService.getAssets(roleId)
                ]);
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('data').style.display = 'block';
                document.getElementById('data').textContent = 
                    JSON.stringify({ profile, assets }, null, 2);
                    
            } catch (error) {
                uiUtils.showError('content', error.message, true);
            }
        }
    </script>
</body>
</html>
```

---

## 已适配的页面

### ✅ 已适配

| 页面 | 路径 | 状态 |
|------|------|------|
| 资产管理 | `assets/assets.html` | ✅ 完成 |
| 修炼 | `cultivation.html` | ✅ 完成 |
| 锻体修炼 | `body-training.html` | ✅ 完成 |
| 任务系统 | `tasks/tasks.html` | ✅ 完成 |
| 背包 | `inventory/inventory.html` | ✅ 完成 |
| 技能 | `skills/skills.html` | ✅ 完成 |
| 排行榜 | `leaderboard.html` | ✅ 完成 |
| 角色详情 | `character/character.html` | ✅ 完成 |
| 宗门首页 | `clan/index.html` | ✅ 完成 |
| 宗门列表 | `clan/clan-list.html` | ✅ 完成 |
| 宗门详情 | `clan/clan.html` | ✅ 完成 |
| 地图 | `map/map.html` | ✅ 完成 |
| 战斗 | `combat/combat.html` | ✅ 完成 |
| 签到 | `checkin.html` | ✅ 完成 |

### 📝 待适配

以下页面也需要添加 config.js 引用：

- `body-cultivation/index.html` - 锻体系统
- `clan/buildings.html` - 宗门建筑
- `clan/shop.html` - 宗门商店
- `clan/members.html` - 宗门成员
- `clan/chat.html` - 宗门聊天
- `clan/treasure.html` - 宗门仓库
- `clan/war.html` - 宗门战
- `map/map-new.html` - 新地图
- `map/map3.html` - 3D 地图
- `social/social.html` - 社交
- `trade/trade.html` - 交易
- `beast-island/index.html` - 灵兽岛
- 等等...

---

## 常见问题

### Q1: 为什么角色 ID 总是 null？

**A**: 检查以下几点：
1. 是否正确引用了 `config.js`
2. 用户是否已登录（localStorage 中有 userId）
3. 用户是否有角色（调用 getRole 检查）

### Q2: API 调用失败怎么办？

**A**: 
1. 检查后端服务是否运行
2. 检查 API_BASE_URL 是否正确
3. 查看浏览器控制台错误信息
4. 使用 uiUtils.showToast 显示错误

### Q3: 如何清除用户信息？

**A**: 
```javascript
window.APP_CONFIG.clearUserInfo();
// 或直接操作 localStorage
localStorage.removeItem('userId');
localStorage.removeItem('roleId');
```

### Q4: 如何调试？

**A**: 
```javascript
// 在控制台查看全局配置
console.log(window.APP_CONFIG);

// 查看角色 ID
console.log('Role ID:', window.APP_CONFIG.currentRoleId);

// 测试 API
apiService.getRole(1).then(console.log);
```

---

## 更新日志

### 2026-03-18
- ✅ 创建 js/config.js
- ✅ 添加 APP_CONFIG 全局配置
- ✅ 添加 apiService 统一 API 调用
- ✅ 添加 uiUtils UI 工具
- ✅ 适配 13 个核心页面

---

## 联系与支持

如有问题，请查看：
- [功能修复完成报告.md](功能修复完成报告.md)
- [功能问题修复方案.md](功能问题修复方案.md)
