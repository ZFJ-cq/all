# 宗门列表页面修改说明

## 已完成的修改

### 1. 前端页面修改
- ✅ 移除了所有固定的宗门卡片 HTML 代码
- ✅ 修改 API 地址从 `http://localhost:8089/api` 改为 `http://localhost:8088/api`
- ✅ 添加了从数据库动态加载宗门列表的功能
- ✅ 添加了宗门卡片渲染函数
- ✅ 添加了空状态和错误状态显示
- ✅ 保留了筛选功能（基于 data-type 属性）

### 2. 后端测试数据
创建了 SQL 测试数据脚本：`/Users/macbook/前端项目/灵月仙途/docs/init-clan-data.sql`

包含 12 个宗门的测试数据：
1. 青云宗（一流宗门，元素系）
2. 天剑宗（顶级宗门，特殊系）
3. 御兽门（二流宗门，特殊系）
4. 合欢派（二流宗门，特殊系）
5. 血煞教（二流宗门，特殊系）
6. 药王谷（一流宗门，元素系）
7. 万妖谷（三流宗门，特殊系）
8. 天机阁（三流宗门，特殊系）
9. 焚天谷（二流宗门，元素系）
10. 玄冰门（二流宗门，元素系）
11. 雷神宗（一流宗门，元素系）
12. 幽冥教（三流宗门，特殊系）

## 需要执行的操作

### 步骤 1：执行 SQL 脚本导入测试数据
```bash
# 登录 MySQL
mysql -u root -p

# 选择数据库
use lingyue_xiantu;

# 执行 SQL 脚本
source /Users/macbook/前端项目/灵月仙途/docs/init-clan-data.sql;
```

或者使用 Navicat/Sequel Pro 等数据库管理工具直接执行 SQL 文件。

### 步骤 2：验证后端 API
确保后端服务已启动，并测试以下 API 接口：

```bash
# 获取宗门列表
curl http://localhost:8088/api/clan/list?page=1&size=50

# 获取单个宗门详情
curl http://localhost:8088/api/clan/1
```

### 步骤 3：测试前端页面
1. 打开浏览器访问：`http://localhost:8080/clan/clan-list.html`
2. 检查是否正确显示宗门列表
3. 测试筛选功能（全部/顶级宗门/元素宗门/特殊宗门）
4. 点击"详情"查看宗门详细信息
5. 点击"申请加入"测试加入功能

## API 接口说明

### 宗门列表接口
```
GET /api/clan/list?page=1&size=50
```

响应格式：
```json
{
  "total": 12,
  "totalPages": 1,
  "page": 1,
  "size": 50,
  "list": [
    {
      "id": 1,
      "name": "青云宗",
      "description": "青云宗以修习仙剑之道为主...",
      "level": 1,
      "strength": 9500,
      "memberCount": 120,
      "maxMembers": 200,
      "joinDifficulty": 85,
      "minRealm": 4,
      "joinContribution": 5000,
      "recommendedAttributes": "木、金",
      "type": "element",
      "status": "normal"
    }
  ]
}
```

### 宗门详情接口
```
GET /api/clan/{clanId}
```

### 加入宗门接口
```
POST /api/role/clans/{roleId}/join/{clanId}
```

## 注意事项

1. **API 端口**：确保后端服务运行在 8088 端口
2. **数据库连接**：确保 MySQL 数据库已启动且可访问
3. **CORS 配置**：如果前端和后端不在同一域名，需要配置 CORS
4. **数据字段映射**：确保后端返回的字段名与前端期望的一致

## 字段映射说明

| 前端字段 | 后端数据库字段 | 说明 |
|---------|--------------|------|
| id | id | 宗门 ID |
| name | name | 宗门名称 |
| description | description | 宗门描述 |
| level | level | 宗门等级（1-5） |
| strength | strength | 宗门实力值 |
| memberCount | member_count | 当前成员数 |
| maxMembers | max_members | 最大成员数 |
| joinDifficulty | join_difficulty | 加入难度（0-100） |
| minRealm | min_realm | 最低境界要求（1-9） |
| joinContribution | join_contribution | 贡献要求 |
| recommendedAttributes | recommended_attributes | 推荐属性 |
| type | type | 宗门类型（element/top/special） |
| status | status | 状态（normal/dissolved） |

## 问题排查

如果页面显示异常，检查以下几点：

1. **浏览器控制台**：查看是否有 JavaScript 错误
2. **网络请求**：检查 API 请求是否成功（状态码 200）
3. **数据格式**：确认后端返回的数据格式是否符合预期
4. **CORS 错误**：如果有跨域错误，需要在后端添加 CORS 配置

## 联系支持

如有问题，请查看：
- 后端日志：`lingyuexiantu-server/logs/`
- 前端控制台：浏览器开发者工具
- 数据库日志：MySQL error log
