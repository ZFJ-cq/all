# 灵月仙途 - 问题诊断和修复报告

## 🔍 问题诊断（2026-03-31 15:10）

### 主要错误

1. **GET /api/role-stats/base/45 404 (Not Found)**
   - 前端请求该接口返回 404
   - 后端日志显示"资源不存在"

2. **TypeError: window.apiService.getRoleDetail is not a function**
   - 前端调用了不存在的 API 方法

3. **属性显示为空**
   - HP、ATK、DEF 等属性值为 null

## 📋 完整修复方案

### 第一步：数据库层

#### 1.1 检查必需的表是否存在

```sql
-- 检查表是否存在
SHOW TABLES LIKE 't_player_stats_base';
SHOW TABLES LIKE 't_role_attribute_cache';
SHOW TABLES LIKE 'cfg_attribute_rules';
SHOW TABLES LIKE 'cfg_realm_attribute_mult';
```

#### 1.2 执行数据库迁移脚本（按顺序）

```bash
# 1. 属性计算和寿命系统表结构
V17__attribute_calculation_and_longevity_system.sql

# 2. 角色 45 属性数据初始化
V18__init_role_45_attributes.sql
```

#### 1.3 验证数据

```sql
-- 验证配置数据
SELECT COUNT(*) FROM cfg_attribute_rules;  -- 应该返回 11
SELECT COUNT(*) FROM cfg_realm_attribute_mult;  -- 应该返回 10

-- 验证角色 45 数据
SELECT * FROM t_player_stats_base WHERE role_id = 45;
SELECT * FROM t_role_attribute_cache WHERE role_id = 45;
```

### 第二步：后端层

#### 2.1 检查 Controller 是否存在

- ✅ `RoleStatsController.java` - /api/role-stats/base/{roleId}
- ✅ `AttributeController.java` - /api/attributes/{roleId}
- ✅ `PlayerStatsBaseController.java` - /api/player-stats/base/{roleId}

#### 2.2 检查 Service 实现

- ✅ `RoleStatsService.java` - 获取基础属性
- ✅ `AttributeCalculatorService.java` - 计算属性
- ✅ `PlayerStatsBaseService.java` - 基础属性服务

#### 2.3 检查安全配置

SecurityConfig.java 中必须包含：
```java
.requestMatchers("/role-stats/**").permitAll()
.requestMatchers("/attributes/**").permitAll()
.requestMatchers("/player-stats/**").permitAll()
```

#### 2.4 后端服务状态

- 端口：8088
- 状态：正在运行
- 日志：无编译错误

### 第三步：前端层

#### 3.1 检查 API 服务方法

api-service.js 中必须包含：
```javascript
// 获取角色基础属性
async getRoleBaseStats(roleId) {
  return this.get(`/role-stats/base/${roleId}`);
}

// 获取属性（新方法）
async getAttributes(roleId) {
  return this.get(`/attributes/${roleId}`);
}

// 获取玩家基础属性
async getPlayerBaseStats(roleId) {
  return this.get(`/player-stats/base/${roleId}`);
}
```

#### 3.2 检查角色页面调用

character.html 中应该调用：
```javascript
// 正确的方式
const attrs = await window.apiService.getAttributes(roleId);
// 或者
const stats = await window.apiService.getRoleBaseStats(roleId);
```

#### 3.3 修复错误的方法调用

删除或替换：
```javascript
// ❌ 错误：不存在的方法
window.apiService.getRoleDetail(roleId)

// ✅ 正确：存在的方法
window.apiService.get(`/role/${roleId}`)
```

## 🔧 立即修复步骤

### 方案 A：完整修复（推荐）

1. **执行数据库脚本**
   ```bash
   # 在数据库管理工具中执行
   source V17__attribute_calculation_and_longevity_system.sql
   source V18__init_role_45_attributes.sql
   ```

2. **重启后端服务**
   ```bash
   # 停止当前服务
   # 然后重新启动
   cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
   ./mvnw spring-boot:run
   ```

3. **清除浏览器缓存并刷新页面**
   ```
   Cmd + Shift + R (Mac)
   Ctrl + Shift + R (Windows)
   ```

### 方案 B：快速修复（仅测试）

1. **调用 API 创建数据**
   ```bash
   curl -X POST http://localhost:8088/api/attributes/45/recalculate
   ```

2. **刷新页面**

## 📊 预期结果

修复后，角色页面应该显示：

### 属性面板
```
HP: 12000
MP: 5000
攻击：920
防御：800
速度：1000
暴击：7.00%
闪避：5.00%
经验加成：15.0%
```

### 寿命信息
```
年龄：18/100
状态：存活
```

### 控制台
```
✅ GET /api/role-stats/base/45 200
✅ GET /api/attributes/45 200
✅ 无错误信息
```

## 🚨 常见问题排查

### Q1: 仍然报 404 错误
**解决**：检查后端服务是否启动，查看端口是否为 8088

### Q2: 报 500 资源不存在
**解决**：数据库中没有角色 45 的数据，执行 V18 脚本

### Q3: 属性值为 null
**解决**：检查 t_player_stats_base 表中是否有数据

### Q4: 前端仍然报错
**解决**：清除浏览器缓存，强制刷新

## 📁 相关文件清单

### 数据库
- ✅ V17__attribute_calculation_and_longevity_system.sql
- ✅ V18__init_role_45_attributes.sql
- ✅ ROLE_45_ATTRIBUTES.sql

### 后端
- ✅ RoleStatsController.java
- ✅ AttributeController.java
- ✅ PlayerStatsBaseController.java
- ✅ RoleStatsService.java
- ✅ AttributeCalculatorService.java
- ✅ SecurityConfig.java

### 前端
- ✅ api-service.js
- ✅ character.html
- ✅ cultivation.html

### 文档
- ✅ ATTRIBUTE_AND_LONGEVITY_SYSTEM.md
- ✅ ROLE_45_ATTRIBUTES_GUIDE.md
- ✅ TROUBLESHOOTING.md（本文档）

---

**创建时间**: 2026-03-31 15:10
**状态**: 待修复
**优先级**: 高
