# 修炼系统问题诊断与修复指南

## 问题现象
- 境界显示为"凡人"或"无"
- 修为显示为 `0 / 0` 或 `1680 / 0`
- 进度条显示 0%
- 控制台显示"响应格式错误"

## 根本原因分析

### 1. 数据库表缺失
**问题**: `realm_breakthrough` 表不存在（实际应为 `cfg_realm_breakthrough`）

**解决方案**: 境界配置存储在 `cfg_realm_breakthrough` 表中，不是 `realm_breakthrough`

### 2. 修为资源缺失
**问题**: 角色 45 在 `role_resource` 表中没有修为资源记录

**解决方案**: 插入修为资源初始数据

### 3. 前端代码逻辑问题
**问题**: 
- 响应数据处理不正确
- 缺少调试日志

**解决方案**: 已添加详细日志

## 完整修复步骤

### 步骤 1: 在数据库客户端执行以下 SQL 脚本

```sql
USE lingyuexiantu;

-- ============================================
-- 1. 检查并修复境界配置表
-- ============================================

-- 检查境界配置表数据
SELECT '=== 当前境界配置 ===' AS info;
SELECT * FROM cfg_realm_breakthrough ORDER BY id;

-- 如果表为空，插入完整的境界配置数据
INSERT INTO cfg_realm_breakthrough 
  (from_realm, to_realm, xiuwei_requirement, pill_name, success_rate, failure_penalty)
SELECT * FROM (
  SELECT 
    '凡人' AS from_realm,
    '炼气期' AS to_realm,
    100 AS xiuwei_requirement,
    '聚气丹' AS pill_name,
    0.9500 AS success_rate,
    '损失 10% 修为' AS failure_penalty
  UNION ALL SELECT '炼气期', '筑基期', 500, '筑基丹', 0.9000, '损失 20% 修为'
  UNION ALL SELECT '筑基期', '金丹期', 2000, '金丹散', 0.8000, '损失 30% 修为'
  UNION ALL SELECT '金丹期', '元婴期', 10000, '化婴果', 0.7000, '损失 40% 修为'
  UNION ALL SELECT '元婴期', '化神期', 50000, '凝神草', 0.6000, '损失 50% 修为'
  UNION ALL SELECT '化神期', '炼虚期', 200000, '虚灵液', 0.5000, '损失 60% 修为'
  UNION ALL SELECT '炼虚期', '合体期', 1000000, '合神丹', 0.4000, '损失 70% 修为'
  UNION ALL SELECT '合体期', '大乘期', 5000000, '渡劫散', 0.3000, '损失 80% 修为'
  UNION ALL SELECT '大乘期', '真仙期', 20000000, '飞升丹', 0.2000, '损失 90% 修为'
  UNION ALL SELECT '真仙期', '更高境界', 100000000, '仙缘果', 0.1000, '重修'
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM cfg_realm_breakthrough WHERE from_realm = '凡人');

-- 验证插入结果
SELECT '=== 插入后的境界配置 ===' AS info;
SELECT id, from_realm, to_realm, xiuwei_requirement, pill_name, success_rate 
FROM cfg_realm_breakthrough ORDER BY id;

-- ============================================
-- 2. 检查并修复角色 45 的修为资源
-- ============================================

-- 检查资源类型
SELECT '=== 资源类型 ===' AS info;
SELECT id, code, name, unit FROM resource_type;

-- 检查角色 45 的现有资源
SELECT '=== 角色 45 的现有资源 ===' AS info;
SELECT 
    rr.id,
    rr.role_id,
    rr.resource_type_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45;

-- 插入修为资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'xiuwei') AS resource_type_id,
    1680 AS quantity,  -- 初始修为
    NOW() AS create_time,
    NOW() AS update_time
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource 
    WHERE role_id = 45 
    AND resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
);

-- 插入灵石资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'lingshi') AS resource_type_id,
    1000 AS quantity,  -- 初始灵石
    NOW() AS create_time,
    NOW() AS update_time
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource 
    WHERE role_id = 45 
    AND resource_type_id = (SELECT id FROM resource_type WHERE code = 'lingshi')
);

-- 验证插入结果
SELECT '=== 插入后的角色 45 资源 ===' AS info;
SELECT 
    rr.role_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rt.code;

-- ============================================
-- 3. 检查角色 45 的境界
-- ============================================

SELECT '=== 角色 45 的境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;

-- 确保角色 45 的境界为"凡人"
UPDATE game_role SET realm = '凡人' WHERE id = 45 AND (realm IS NULL OR realm = '');

-- ============================================
-- 4. 最终验证
-- ============================================

SELECT '=== 最终验证 ===' AS info;
SELECT 
    g.id AS role_id,
    g.name AS role_name,
    g.realm AS current_realm,
    rr_xiuwei.quantity AS current_xiuwei,
    rb.xiuwei_requirement AS required_xiuwei,
    rb.to_realm AS next_realm,
    CASE 
        WHEN rr_xiuwei.quantity >= rb.xiuwei_requirement THEN '✅ 可以突破'
        ELSE '❌ 修为不足'
    END AS breakthrough_status
FROM game_role g
LEFT JOIN role_resource rr_xiuwei ON g.id = rr_xiuwei.role_id 
    AND rr_xiuwei.resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
LEFT JOIN cfg_realm_breakthrough rb ON g.realm = rb.from_realm
WHERE g.id = 45;

SELECT '✅ 修复完成！请刷新页面验证。' AS message;
```

### 步骤 2: 重启后端服务

```bash
# 停止当前运行的后端服务
# 重新启动 Spring Boot 应用
```

### 步骤 3: 刷新前端页面

1. 打开修炼页面：`http://127.0.0.1:5502/cultivation.html?type=immortal`
2. 按 `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) 强制刷新
3. 打开浏览器控制台查看日志

### 步骤 4: 验证功能

检查控制台日志，应该看到：
```
=== 开始加载修炼状态 ===
角色数据：{id: 45, name: "XXX", realm: "凡人"}
当前境界：凡人
尝试获取境界配置...
境界配置响应状态：200
境界配置数据：[{fromRealm: "凡人", toRealm: "炼气期", xiuweiRequirement: 100, ...}]
当前境界配置：{fromRealm: "凡人", toRealm: "炼气期", xiuweiRequirement: 100, ...}
下一境界：炼气期 修为需求：100
requiredXiuwei 最终值：100
开始加载角色资源，roleId: 45
资源类型列表：[{id: 1, code: "lingshi", ...}, {id: 2, code: "xiuwei", ...}]
资源类型映射：1 -> lingshi
资源类型映射：2 -> xiuwei
角色资源数据：[{resourceTypeId: 1, quantity: 1000}, {resourceTypeId: 2, quantity: 1680}]
处理资源：{resourceTypeId: 1, quantity: 1000}
设置资源：lingshi = 1000
处理资源：{resourceTypeId: 2, quantity: 1680}
设置资源：xiuwei = 1680
最终资源映射：{lingshi: 1000, xiuwei: 1680}
更新修为进度：1680 / 100 进度：100%
=== 修炼状态加载完成 ===
```

页面应该显示：
- ✅ 境界：**凡人**
- ✅ 修为：**1680 / 100**
- ✅ 进度条：**100%**（绿色）
- ✅ 突破按钮：**可点击状态**

## 常见问题排查

### 问题 1: 境界配置接口 404
**原因**: 后端服务未启动或端口不对

**解决**: 
```bash
# 检查后端是否在 8088 端口运行
curl http://localhost:8088/api/config/realm-breakthrough
```

### 问题 2: 修为仍然显示 0
**原因**: 资源数据未正确加载

**解决**:
```sql
-- 手动查询角色 45 的资源
SELECT rr.*, rt.code, rt.name 
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45;
```

### 问题 3: 控制台显示"资源类型不是数组"
**原因**: `/resource/types` 接口返回格式错误

**解决**: 检查后端日志，确认 `resource_type` 表有数据

### 问题 4: 突破按钮灰色不可点击
**原因**: 修为不足或 requiredXiuwei 为 0

**解决**: 
1. 检查 `cfg_realm_breakthrough` 表是否有"凡人"的配置
2. 检查角色境界是否为"凡人"
3. 检查修为资源是否大于 0

## 数据库表结构说明

### cfg_realm_breakthrough (境界配置表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| from_realm | VARCHAR(20) | 当前境界 |
| to_realm | VARCHAR(20) | 突破后境界 |
| xiuwei_requirement | BIGINT | 修为需求 |
| pill_name | VARCHAR(50) | 突破丹药名称 |
| success_rate | DECIMAL(5,4) | 基础成功率 (0.9500 = 95%) |
| failure_penalty | VARCHAR(100) | 失败惩罚 |

### role_resource (角色资源表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键 |
| role_id | BIGINT | 角色 ID |
| resource_type_id | BIGINT | 资源类型 ID |
| quantity | BIGINT | 资源数量 |

### resource_type (资源类型表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键 |
| code | VARCHAR(50) | 资源代码 (xiuwei, lingshi) |
| name | VARCHAR(50) | 资源名称 (修为，灵石) |
| unit | VARCHAR(10) | 单位 (点，个) |

## 前端代码关键逻辑

### 1. 加载修炼状态流程
```
loadCultivationStatus(roleId)
  ├─ 获取角色信息 → /role/{roleId}
  ├─ 获取境界配置 → /config/realm-breakthrough
  ├─ 加载角色资源 → loadRoleResources(roleId)
  │   ├─ 获取资源类型 → /resource/types
  │   └─ 获取角色资源 → /resource/role/{roleId}
  └─ 更新 UI 显示
```

### 2. 自动修炼流程
```
executeCultivationCycle()
  ├─ 调用自动修炼 API → POST /cultivation/auto
  ├─ 获得修为奖励
  ├─ 刷新资源显示 → loadRoleResources()
  └─ 更新进度条 → updateXiuweiProgress()
```

## 后端 API 接口列表

| 接口 | 方法 | 说明 |
|------|------|------|
| `/role/{roleId}` | GET | 获取角色信息 |
| `/config/realm-breakthrough` | GET | 获取境界配置列表 |
| `/resource/types` | GET | 获取资源类型列表 |
| `/resource/role/{roleId}` | GET | 获取角色资源列表 |
| `/cultivation/auto` | POST | 自动修炼 |
| `/cultivation/breakthrough` | POST | 境界突破 |
| `/cultivation/next-realm?currentRealm=xxx` | GET | 获取下一境界信息 |

## 成功标志

✅ 境界显示正确（凡人）
✅ 修为显示正确（1680 / 100）
✅ 进度条显示 100%
✅ 突破按钮可点击
✅ 倒计时结束后修为增加
✅ 控制台无错误日志
