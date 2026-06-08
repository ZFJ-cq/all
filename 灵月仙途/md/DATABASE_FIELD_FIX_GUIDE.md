# 灵月仙途 - 数据库字段与 API 接口兼容性修复指南

## 📋 概述

本文档提供了完整的项目数据库表结构检测、API 接口调用链路分析以及字段缺失修复方案。

## 🎯 修复目标

1. ✅ 遍历项目全量数据库表
2. ✅ 扫描所有 API 接口调用链路
3. ✅ 智能检测数据库缺失字段
4. ✅ 自动修复字段不匹配问题
5. ✅ 确保数据结构与接口交互完全兼容

## 📁 生成的修复文件

### 1. 主修复脚本
- **文件**: `check_and_fix_all_missing_fields.sql`
- **用途**: 修复 35 个核心表的缺失字段
- **执行方式**: 
  ```bash
  ./run_database_fix.sh
  ```
  或手动执行:
  ```bash
  mysql -h localhost -P 3306 -u root -p lingyuexiantu < check_and_fix_all_missing_fields.sql
  ```

### 2. 数据库修复 Shell 脚本
- **文件**: `run_database_fix.sh`
- **用途**: 自动化执行数据库备份和修复
- **功能**:
  - 自动备份数据库
  - 执行修复 SQL 脚本
  - 验证修复结果
  - 生成修复日志

### 3. API 兼容性检测工具
- **文件**: `check_api_database_compatibility.py`
- **用途**: Python 脚本，智能分析 API 与数据库字段匹配性
- **执行方式**:
  ```bash
  python3 check_api_database_compatibility.py
  ```
- **输出**:
  - `API_DATABASE_COMPATIBILITY_REPORT.md` - 兼容性检测报告
  - `fix_api_database_compatibility.sql` - API 字段修复脚本

## 🔧 修复步骤

### 步骤 1: 执行数据库字段修复

```bash
# 赋予执行权限
chmod +x run_database_fix.sh

# 设置数据库连接环境变量 (可选)
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=lingyuexiantu
export DB_USER=root
export DB_PASSWORD=你的密码

# 执行修复
./run_database_fix.sh
```

### 步骤 2: 运行 API 兼容性检测

```bash
# 赋予执行权限
chmod +x check_api_database_compatibility.py

# 运行检测
python3 check_api_database_compatibility.py
```

### 步骤 3: 查看检测报告

打开生成的 `API_DATABASE_COMPATIBILITY_REPORT.md` 文件，查看:
- 字段不匹配详情
- API 端点列表
- 修复建议

### 步骤 4: 执行 API 字段修复 (如有需要)

```bash
mysql -h localhost -P 3306 -u root -p lingyuexiantu < fix_api_database_compatibility.sql
```

## 📊 修复的表清单

### 核心角色表 (15 个)
1. `game_role` - 游戏角色主表
2. `role_asset` - 角色资产表
3. `role_skill` - 角色技能表
4. `role_equipment` - 角色装备表
5. `role_item` - 角色物品表
6. `role_task` - 角色任务表
7. `role_realm` - 角色境界表
8. `role_body_cultivation` - 角色体修表
9. `role_body_part_progress` - 身体部位修炼进度
10. `role_activity` - 角色活动表
11. `role_achievement` - 角色成就表
12. `role_checkin` - 角色签到表
13. `role_resource` - 角色资源表
14. `role_clans` - 角色宗门表
15. `role_map_node` - 角色地图节点表

### 宗门相关表 (2 个)
16. `clan` - 宗门表
17. `clan_member` - 宗门成员表

### 物品相关表 (3 个)
18. `inventory` - 背包表
19. `asset_types` - 资产类型表
20. `item` - 物品表

### 配置表 (5 个)
21. `announcement` - 公告表
22. `mail` - 邮件表
23. `mail_item` - 邮件附件表
24. `friend` - 好友表
25. `task` - 任务表

### 系统表 (10 个)
26. `activity` - 活动表
27. `skill` - 技能表
28. `equipment` - 装备表
29. `gift` - 礼物表
30. `shop_item` - 商店物品表
31. `cultivation_task` - 修炼任务表
32. `breakthrough_history` - 突破历史表
33. `stat_operation_log` - 属性操作日志表
34. `t_role_attribute_cache` - 角色属性缓存表
35. `cfg_attribute_rule` - 属性配置规则表

## 🔍 修复的字段类型

### 1. 基础信息字段
- `age`, `max_age` - 年龄信息
- `life_status`, `death_time` - 生命状态
- `reincarnation_count` - 轮回次数
- `cultivation_base` - 修炼基础
- `longevity_bonus` - 寿命加成

### 2. 装备物品字段
- `item_id`, `item_name`, `item_type` - 物品信息
- `quantity`, `rarity` - 数量和品质
- `durability`, `max_durability` - 耐久度
- `base_stats`, `affixes` - 属性和附加属性
- `spirit`, `spirit_level` - 器灵信息

### 3. 技能修炼字段
- `skill_level`, `experience` - 技能等级和熟练度
- `equipped` - 是否装备
- `trigger_rate` - 触发概率
- `breakthrough_count` - 突破次数

### 4. 宗门社交字段
- `position`, `contribution` - 职位和贡献
- `join_date`, `leave_time` - 加入离开时间
- `intimacy`, `remark` - 亲密度和备注
- `rank` - 宗门排名

### 5. 任务活动字段
- `task_type`, `task_difficulty` - 任务类型和难度
- `reward_claimed` - 奖励领取状态
- `activity_type`, `join_condition` - 活动类型和条件
- `time_limit`, `repeat_count` - 时间限制和重复次数

### 6. 系统配置字段
- `icon`, `icon_path` - 图标路径
- `decimal_precision` - 小数精度
- `tradable`, `droppable` - 交易和掉落属性
- `destroy_policy` - 销毁策略
- `modules`, `is_system` - 模块和系统标识

## ✅ 验证修复结果

### 方法 1: 使用修复脚本自动验证
```bash
./run_database_fix.sh
```
脚本会自动验证关键表的字段数量。

### 方法 2: 手动验证
```sql
-- 检查 game_role 表
DESC game_role;

-- 检查 role_skill 表
DESC role_skill;

-- 检查 role_equipment 表
DESC role_equipment;

-- 检查 role_clans 表
DESC role_clans;
```

### 方法 3: 运行项目测试
1. 启动后端服务器
2. 访问关键 API 接口
3. 检查是否有字段相关的错误

## 🐛 常见问题处理

### 问题 1: "表不存在" 错误
**解决方案**: 
```sql
-- 先创建基础表结构
source /path/to/mock_data.sql;
```

### 问题 2: "字段已存在" 错误
**说明**: 这是正常提示，表示字段已经修复过
**解决方案**: 可以忽略该错误

### 问题 3: 外键约束失败
**解决方案**:
```sql
-- 临时禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 执行修复脚本

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;
```

### 问题 4: 数据库连接失败
**解决方案**:
```bash
# 检查 MySQL 服务状态
mysqladmin -u root -p status

# 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES LIKE 'lingyuexiantu';"
```

## 📈 性能优化建议

### 1. 索引优化
修复脚本已自动创建以下索引:
- 角色相关表的 `role_id` 索引
- 物品类型表的 `item_type` 索引
- 任务活动表的 `status` 索引

### 2. 数据清理
```sql
-- 清理过期数据
DELETE FROM mail WHERE expire_time < NOW();
DELETE FROM friend WHERE block_status = 1;

-- 优化表
OPTIMIZE TABLE game_role;
OPTIMIZE TABLE role_asset;
OPTIMIZE TABLE role_skill;
```

### 3. 缓存配置
确保 Redis 缓存配置正确:
```properties
redis.host=localhost
redis.port=6379
redis.password=
redis.database=0
```

## 📝 修复日志

修复过程会生成 `fix_log.txt` 文件，包含:
- 每个表的修复详情
- SQL 执行结果
- 错误和警告信息

查看日志:
```bash
cat fix_log.txt
```

## 🎓 最佳实践

### 1. 定期执行检测
建议每周执行一次 API 与数据库兼容性检测:
```bash
# 添加到 crontab
0 2 * * 0 cd /path/to/project && python3 check_api_database_compatibility.py
```

### 2. 数据库备份
修复前务必备份数据库:
```bash
mysqldump -h localhost -u root -p lingyuexiantu > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. 版本控制
将修复脚本提交到版本控制:
```bash
git add check_and_fix_all_missing_fields.sql
git add run_database_fix.sh
git add check_api_database_compatibility.py
git commit -m "添加数据库字段自动修复脚本"
```

## 📞 技术支持

如遇到问题，请提供以下信息:
1. 数据库版本：`SELECT VERSION();`
2. 修复日志：`fix_log.txt`
3. 检测报告：`API_DATABASE_COMPATIBILITY_REPORT.md`

## 📄 相关文档

- [API 定义文件](api-definitions.yaml)
- [数据库迁移脚本](lingyuexiantu-server/src/main/resources/db/migration/)
- [实体类目录](lingyuexiantu-server/src/main/java/com/lingyue/entity/)
- [Controller 目录](lingyuexiantu-server/src/main/java/com/lingyue/controller/)

---

**生成时间**: 2026-04-01  
**版本**: v1.0  
**适用项目**: 灵月仙途
