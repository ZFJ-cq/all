# 宗门系统 API 接口文档

## 基础信息

- **基础 URL**: `http://localhost:8088/api`
- **数据格式**: JSON
- **认证方式**: Token（后续实现）

---

## 前端宗门页面 API

### 1. 获取角色宗门成员信息

```http
GET /api/clan/member/role/{roleId}
```

**响应示例**:
```json
{
  "id": 1,
  "roleId": 1001,
  "clanId": 10,
  "position": "精英",
  "contribution": 1200,
  "joinTime": "2024-01-01 10:00:00"
}
```

### 2. 获取宗门详细信息

```http
GET /api/clan/{clanId}
```

**响应示例**:
```json
{
  "id": 10,
  "name": "天道盟",
  "level": 5,
  "memberCount": 50,
  "maxMembers": 100,
  "activity": 8500,
  "nextLevelActivity": 10000,
  "createTime": "2023-06-15 08:00:00",
  "status": "normal"
}
```

### 3. 获取宗门成员列表

```http
GET /api/clan/{clanId}/members
```

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "张三",
    "position": "宗主",
    "contribution": 50000,
    "spiritRoot": "fire",
    "online": true,
    "joinTime": "2023-06-15 08:00:00"
  },
  {
    "id": 2,
    "name": "李四",
    "position": "长老",
    "contribution": 30000,
    "spiritRoot": "water",
    "online": false,
    "joinTime": "2023-06-20 14:30:00"
  }
]
```

### 4. 获取宗门资源

```http
GET /api/clan/{clanId}/resources
```

**响应示例**:
```json
{
  "lingshi": 1000000,
  "gongxian": 500000,
  "material": 256,
  "item": 89
}
```

### 5. 获取宗门公告

```http
GET /api/clan/{clanId}/announcement
```

**响应示例**:
```json
{
  "id": 1,
  "clanId": 10,
  "title": "欢迎来到天道盟",
  "content": "欢迎各位道友加入天道盟！希望大家齐心协力，共创辉煌！",
  "publisher": "张三",
  "publishTime": "2024-01-15 10:30:00"
}
```

### 6. 叛出宗门

```http
POST /api/clan/member/{memberId}/leave
```

**响应**:
```json
{
  "success": true,
  "message": "操作成功"
}
```

---

## 后台宗门管理 API

### 7. 获取宗门列表（分页 + 筛选）

```http
GET /api/clan/list?page=1&size=20&name=天道盟&level=5&sizeRange=51-100&createDate=2024-01-01
```

**响应示例**:
```json
{
  "total": 100,
  "totalPages": 5,
  "page": 1,
  "size": 20,
  "list": [
    {
      "id": 10,
      "name": "天道盟",
      "level": 5,
      "memberCount": 50,
      "maxMembers": 100,
      "leaderName": "张三",
      "activity": 8500,
      "activityLevel": "活跃",
      "activityPercent": 85,
      "createTime": "2023-06-15 08:00:00",
      "status": "normal"
    }
  ]
}
```

### 8. 获取宗门统计数据

```http
GET /api/clan/statistics
```

**响应示例**:
```json
{
  "totalClans": 150,
  "activeClans": 120,
  "totalMembers": 8500,
  "avgLevel": 4.5,
  "todayActive": 95,
  "warningClans": 3
}
```

### 9. 获取所有宗门（用于下拉选择）

```http
GET /api/clan/all
```

**响应示例**:
```json
[
  {
    "id": 10,
    "name": "天道盟",
    "level": 5
  },
  {
    "id": 11,
    "name": "逍遥宗",
    "level": 3
  }
]
```

### 10. 获取宗门完整档案

```http
GET /api/clan/{clanId}/detail
```

**响应示例**:
```json
{
  "id": 10,
  "name": "天道盟",
  "level": 5,
  "leaderName": "张三",
  "createTime": "2023-06-15 08:00:00",
  "memberCount": 50,
  "activity": 8500,
  "totalContribution": 250000,
  "treasureValue": 5000000,
  "members": [
    {
      "id": 1,
      "name": "张三",
      "position": "宗主",
      "contribution": 50000,
      "online": true,
      "joinTime": "2023-06-15 08:00:00"
    }
  ],
  "announcements": [
    {
      "title": "宗门活动通知",
      "content": "本周六晚 8 点举行宗门比武",
      "publisher": "张三",
      "publishTime": "2024-01-15 10:30:00"
    }
  ],
  "treasureLogs": [
    {
      "time": "2024-01-15 14:00:00",
      "type": "in",
      "itemName": "灵石",
      "quantity": 10000,
      "operator": "李四",
      "remark": "任务上交"
    }
  ]
}
```

### 11. 发布系统公告

```http
POST /api/clan/announcement
```

**请求体**:
```json
{
  "type": "clan",
  "clanId": 10,
  "title": "系统通知",
  "content": "本周将进行宗门系统维护",
  "forceOverride": true
}
```

**响应**:
```json
{
  "success": true,
  "message": "公告发布成功"
}
```

### 12. 调整宗门资源

```http
POST /api/clan/resource/adjust
```

**请求体**:
```json
{
  "clanId": 10,
  "resourceType": "lingshi",
  "amount": 100000,
  "reason": "活动补偿"
}
```

**响应**:
```json
{
  "success": true,
  "message": "资源调整成功"
}
```

### 13. 获取宗门资源详情

```http
GET /api/clan/{clanId}/resources
```

**响应示例**:
```json
{
  "resources": {
    "lingshi": 1000000,
    "gongxian": 500000,
    "material": 256,
    "item": 89
  }
}
```

### 14. 保存宗门配置

```http
POST /api/clan/config
```

**请求体**:
```json
{
  "minRealm": 2,
  "minLevel": 10,
  "createCost": 100000,
  "level1Max": 30,
  "level5Max": 50,
  "level10Max": 100,
  "upgrade2Contribution": 10000,
  "upgrade5Contribution": 100000,
  "upgrade10Contribution": 1000000,
  "dailyTaskMax": 10,
  "warCooldown": 24,
  "autoKickDays": 30
}
```

**响应**:
```json
{
  "success": true,
  "message": "配置保存成功"
}
```

### 15. 获取统计数据（活跃度趋势）

```http
GET /api/clan/stats?period=7
```

**响应示例**:
```json
{
  "activityData": [
    {"label": "01-01", "value": 5000},
    {"label": "01-02", "value": 6000},
    {"label": "01-03", "value": 7500}
  ],
  "outputData": [
    {"label": "灵石", "value": 100000},
    {"label": "材料", "value": 500}
  ],
  "consumeData": [
    {"label": "修炼", "value": 50000},
    {"label": "任务", "value": 30000}
  ]
}
```

### 16. 解散宗门

```http
POST /api/clan/{clanId}/dissolve
```

**请求体**:
```json
{
  "reason": "宗主违规操作"
}
```

**响应**:
```json
{
  "success": true,
  "message": "宗门已解散"
}
```

### 17. 踢出成员

```http
POST /api/clan/{clanId}/member/{memberId}/kick
```

**响应**:
```json
{
  "success": true,
  "message": "成员已踢出"
}
```

### 18. 任命成员职位

```http
POST /api/clan/{clanId}/member/{memberId}/promote
```

**请求体**:
```json
{
  "position": "长老"
}
```

**响应**:
```json
{
  "success": true,
  "message": "任命成功"
}
```

---

## 错误处理

### 通用错误响应

```json
{
  "success": false,
  "code": 404,
  "message": "宗门不存在"
}
```

### 常见错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 前端页面说明

### 前端宗门页面 (clan-home.html)

**功能特性**:
- ✅ 宗门基本信息展示（名称、等级、成员数）
- ✅ 宗门公告显示
- ✅ 成员列表（在线状态、贡献度、职位）
- ✅ 宗门仓库资源展示
- ✅ 活跃度进度条
- ✅ 快捷功能入口（任务、商店、宝库等）
- ✅ 叛出宗门功能

**API 调用流程**:
1. 页面加载 → 获取角色宗门成员信息
2. 根据 clanId → 获取宗门详细信息
3. 并行获取 → 成员列表、资源、公告
4. 更新页面显示

### 后台宗门管理页面 (clan-management.html)

**功能特性**:
- ✅ 全量宗门列表（分页 + 筛选）
- ✅ 宗门详情档案（成员快照、历史公告、仓库流水）
- ✅ 系统公告推送（全服/指定宗门）
- ✅ 成员调整（踢出、任命）
- ✅ 资源调控（手动增减）
- ✅ 配置化规则（创建门槛、人数上限等）
- ✅ 数据统计（活跃度趋势、产出消耗比）
- ✅ 异常预警监控

**Tab 页结构**:
1. **宗门列表** - 查看所有宗门，支持筛选
2. **宗门详情** - 完整档案展示
3. **公告管理** - 发布系统公告
4. **资源调控** - 手动调整资源
5. **配置规则** - 系统参数配置
6. **数据统计** - 可视化图表
7. **异常预警** - 监控告警信息

---

## 数据字典

### 宗门职位

| 职位 | 说明 |
|------|------|
| 宗主 | 宗门创始人，最高权限 |
| 长老 | 宗门管理层，协助宗主 |
| 精英 | 核心成员，享有特权 |
| 普通 | 普通成员 |

### 宗门等级

| 等级 | 人数上限 | 说明 |
|------|----------|------|
| 1 级 | 30 人 | 初始等级 |
| 2-4 级 | 30-50 人 | 初级宗门 |
| 5-7 级 | 50-80 人 | 中级宗门 |
| 8-10 级 | 80-100 人 | 高级宗门 |

### 活跃度等级

| 活跃度 | 等级 | 说明 |
|--------|------|------|
| ≥8000 | 火爆 | 非常活跃 |
| ≥5000 | 活跃 | 正常活跃 |
| ≥2000 | 一般 | 活跃度一般 |
| <2000 | 冷清 | 活跃度较低 |

### 资源类型

| 类型 | 说明 |
|------|------|
| lingshi | 灵石（宗门货币） |
| gongxian | 贡献点（成员贡献） |
| material | 材料（炼器炼丹） |
| item | 道具（各种物品） |

---

## 安全建议

1. **权限控制**: 后台管理接口需要管理员权限验证
2. **操作日志**: 所有修改操作应记录操作人和时间
3. **参数校验**: 严格校验输入参数，防止 SQL 注入
4. **频率限制**: 对敏感接口进行限流
5. **数据备份**: 定期备份宗门数据

---

## 版本历史

- **v1.0** (2024-01-15): 初始版本，包含基础 CRUD 接口
- **v1.1** (2024-01-16): 新增统计数据和异常监控接口
