# 锻体修炼系统 Bug 修复指南

## 🐛 问题诊断

### 控制台错误
1. ❌ `getBodyCultivationLogs is not a function` - 浏览器缓存问题
2. ❌ `POST /body-cultivation/role/45/cultivate 500` - 后端数据库问题

## ✅ 解决方案

### 步骤 1: 检查并修复数据库

#### 1.1 连接到 MySQL 数据库
```bash
mysql -u root -p12345678
```

#### 1.2 选择数据库
```sql
USE lingyuexiantu;
```

#### 1.3 运行检查脚本
```sql
source /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/V9999__check_body_cultivation_status.sql;
```

#### 1.4 查看检查结果

**检查表是否存在：**
```sql
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'lingyuexiantu' AND TABLE_NAME LIKE 'body%';
```

应该看到：
- ✅ body_cultivation_log
- ✅ body_cultivation_material
- ✅ body_cultivation_realm
- ✅ body_mutation
- ✅ body_part

**检查角色 45 的数据：**
```sql
SELECT * FROM role_body_cultivation WHERE role_id = 45;
SELECT * FROM role_body_part_progress WHERE role_id = 45;
```

如果返回空，说明数据未初始化。

### 步骤 2: 运行修复脚本

#### 2.1 运行 V999 修复脚本
```sql
source /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/V999__fix_body_cultivation.sql;
```

#### 2.2 验证修复结果
```sql
-- 检查境界数据
SELECT * FROM body_cultivation_realm;
-- 应该返回：1 | 锻体境 | ...

-- 检查部位数据
SELECT * FROM body_part;
-- 应该返回：1 | 四肢 | limbs | ... 和 2 | 五脏 | organs | ...

-- 检查角色 45 的数据
SELECT * FROM role_body_cultivation WHERE role_id = 45;
-- 应该返回角色 45 的锻体数据

-- 检查部位进度
SELECT rbpp.*, bp.part_name 
FROM role_body_part_progress rbpp
LEFT JOIN body_part bp ON rbpp.part_id = bp.id
WHERE rbpp.role_id = 45;
-- 应该返回两条记录
```

### 步骤 3: 清除浏览器缓存

#### 方法 1: 强制刷新（推荐）
- **Windows/Linux**: 按 `Ctrl + Shift + R`
- **Mac**: 按 `Cmd + Shift + R`

#### 方法 2: 清除缓存
1. 按 `F12` 打开开发者工具
2. 按 `Ctrl + Shift + Delete` (或 Cmd + Shift + Delete)
3. 选择"缓存的图片和文件"
4. 时间范围：过去 1 小时
5. 点击"清除数据"

#### 方法 3: 禁用缓存（开发时使用）
1. 按 `F12` 打开开发者工具
2. 进入 Network 标签
3. 勾选"Disable cache"

### 步骤 4: 重启后端服务

```bash
# 进入项目目录
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server

# 停止当前运行的服务（如果有）
# 按 Ctrl+C

# 重新启动
mvn spring-boot:run
```

### 步骤 5: 测试功能

#### 5.1 访问页面
```
http://127.0.0.1:5502/body-cultivation/index.html
```

#### 5.2 验证功能

**页面加载检查：**
- ✅ 页面正常显示，无白屏
- ✅ 控制台无红色错误
- ✅ 显示角色信息（头像、名称）
- ✅ 显示锻体境界：锻体境
- ✅ 显示炼体经验：0 / 1000

**修炼功能测试：**
1. 点击"四肢"或"五脏"部位
   - ✅ 部位有高亮选中效果
   - ✅ 图标有放大和发光效果

2. 点击"锻体修炼"按钮
   - ✅ 不出现 500 错误
   - ✅ Toast 提示"修炼成功！获得 XX 点经验"
   - ✅ 炼体经验增加
   - ✅ 日志面板显示修炼记录

**数据验证：**
```sql
-- 查看修炼后的数据
SELECT * FROM role_body_cultivation WHERE role_id = 45;
SELECT * FROM role_body_part_progress WHERE role_id = 45;
SELECT * FROM body_cultivation_log WHERE role_id = 45 ORDER BY created_at DESC LIMIT 5;
```

## 🔍 常见问题排查

### 问题 1: 仍然显示 500 错误

**可能原因：**
1. 数据库表不存在
2. 外键约束失败
3. 角色 ID 不存在

**解决方法：**
```sql
-- 检查 game_role 表是否有角色 45
SELECT * FROM game_role WHERE id = 45;

-- 如果没有，创建一个测试角色
INSERT INTO game_role (id, name, user_id, level, realm) 
VALUES (45, '测试角色', 1, 1, '锻体境')
ON DUPLICATE KEY UPDATE name = name;
```

### 问题 2: 仍然显示 getBodyCultivationLogs 错误

**原因：** 浏览器缓存未清除

**解决方法：**
1. 完全关闭浏览器
2. 重新打开浏览器
3. 按 `Ctrl+Shift+R` 强制刷新

或者临时禁用日志加载（已在代码中实现）

### 问题 3: 修炼后经验不增加

**可能原因：**
1. 部位已达到最大等级
2. 数据库事务未提交

**解决方法：**
```sql
-- 检查部位等级
SELECT level, max_level 
FROM role_body_part_progress rbpp
JOIN body_part bp ON rbpp.part_id = bp.id
WHERE rbpp.role_id = 45;

-- 如果 level >= max_level，说明已满级
```

### 问题 4: 后端启动失败

**可能原因：** Flyway 迁移冲突

**解决方法：**
```sql
-- 检查 Flyway 迁移历史
SELECT * FROM flyway_schema_history ORDER BY installed_on DESC;

-- 如果 V999 或 V9999 失败，可以标记为忽略
UPDATE flyway_schema_history 
SET type = 'R' 
WHERE script IN ('V999__fix_body_cultivation.sql', 'V9999__check_body_cultivation_status.sql');
```

## 📝 数据库表结构说明

### body_cultivation_realm (锻体境界表)
| 字段 | 说明 | 示例值 |
|------|------|--------|
| id | 境界 ID | 1 |
| realm_name | 境界名称 | 锻体境 |
| realm_order | 境界顺序 | 1 |
| required_exp | 所需经验 | 1000 |
| pain_growth_rate | 痛苦增长率 | 1.00 |

### body_part (锻体部位表)
| 字段 | 说明 | 示例值 |
|------|------|--------|
| id | 部位 ID | 1 |
| part_name | 部位名称 | 四肢 |
| part_code | 部位代码 | limbs |
| base_exp_requirement | 基础经验需求 | 100 |
| max_level | 最大等级 | 50 |

### role_body_cultivation (角色锻体表)
| 字段 | 说明 | 示例值 |
|------|------|--------|
| id | 主键 ID | 1 |
| role_id | 角色 ID | 45 |
| realm_id | 境界 ID | 1 |
| body_exp | 锻体经验 | 0 |
| pain_value | 痛苦值 | 0.00 |
| tolerance | 耐受度 | 0 |

### role_body_part_progress (角色部位进度表)
| 字段 | 说明 | 示例值 |
|------|------|--------|
| id | 主键 ID | 1 |
| role_id | 角色 ID | 45 |
| part_id | 部位 ID | 1 |
| level | 部位等级 | 1 |
| exp | 部位经验 | 0 |

## 🎯 成功标准

所有功能正常工作时，应该看到：

1. **页面无错误** - 控制台干净，无红色错误
2. **数据显示正确** - 境界、经验、部位进度正确显示
3. **修炼成功** - 点击修炼按钮后获得经验
4. **日志更新** - 修炼日志显示最新记录
5. **数据持久化** - 刷新页面后数据保留

## 📞 需要帮助？

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的完整错误信息
2. 后端日志的错误堆栈
3. 数据库检查脚本的执行结果

祝修复顺利！🎉
