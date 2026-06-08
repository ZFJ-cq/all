# 角色 45 属性数据 SQL 脚本

## 📋 脚本说明

为角色 45 创建完整的属性数据，包括：
- 基础属性（根骨、灵力、身法、悟性、气运）
- 属性缓存（HP、MP、ATK、DEF、Speed、暴击、闪避、经验加成）
- 寿命信息（年龄、最大年龄、生命状态等）

## 🚀 执行方式

### 方法一：使用数据库管理工具（推荐）

1. 打开数据库管理工具（Navicat、DBeaver、MySQL Workbench 等）
2. 连接到 `lingyuexiantu` 数据库
3. 打开并执行 `ROLE_45_ATTRIBUTES.sql` 文件
4. 查看执行结果

### 方法二：使用命令行（如果已安装 MySQL 客户端）

```bash
mysql -u root -p12345678 lingyuexiantu < ROLE_45_ATTRIBUTES.sql
```

### 方法三：通过后端 API 触发计算

如果不想手动执行 SQL，可以调用后端 API 让系统自动计算：

```bash
# 强制重新计算角色 45 的属性
curl -X POST http://localhost:8088/api/attributes/45/recalculate
```

## 📊 角色 45 属性数据

### 基础属性

| 属性 | 值 | 说明 |
|------|-----|------|
| 根骨 (Vit) | 120 | 影响生命值和防御力 |
| 灵力 (Spi) | 100 | 影响攻击力和法力值 |
| 身法 (Agi) | 100 | 影响速度、防御和闪避 |
| 悟性 (Wis) | 15 | 影响经验加成 |
| 气运 (Lck) | 50 | 影响暴击率 |

### 计算结果（凡人境界）

| 属性 | 值 | 计算公式 |
|------|-----|---------|
| **HP** | 12,000 | (120 × 100) × 1.0 |
| **MP** | 5,000 | 100 × 50 |
| **ATK** | 920 | (100 × 8 + 120 × 1) × 1.0 |
| **DEF** | 800 | (120 × 5 + 100 × 2) × 1.0 |
| **Speed** | 1,000 | 100 × 10 |
| **Crit Rate** | 7.00% | (50 × 0.1% + 100 × 0.02%) |
| **Dodge Rate** | 5.00% | (100 × 0.5%) |
| **Exp Bonus** | 1.15x | 1.0 + (15 × 1%) |

### 寿命信息

| 字段 | 值 | 说明 |
|------|-----|------|
| 当前年龄 | 18 岁 | 角色当前年龄 |
| 最大年龄 | 100 岁 | 凡人境界最大寿元 |
| 生命状态 | 0 (存活) | 0-存活，1-坐化中，2-已故 |
| 死亡时间 | NULL | 未死亡 |
| 轮回次数 | 0 | 未轮回 |

## 🔍 验证数据

执行以下 SQL 查询验证数据：

```sql
-- 查看基础属性
SELECT * FROM t_player_stats_base WHERE role_id = 45;

-- 查看属性缓存
SELECT * FROM t_role_attribute_cache WHERE role_id = 45;

-- 查看寿命信息
SELECT id, role_name, age, max_age, life_status, reincarnation_count 
FROM game_role 
WHERE id = 45;

-- 查看完整的属性信息（格式化输出）
SELECT 
    role_id,
    CONCAT('HP:', hp_max, ' | MP:', mp_max, ' | ATK:', atk, ' | DEF:', def, ' | SPD:', speed) AS main_attributes,
    CONCAT('Crit:', crit_rate, '% | Dodge:', dodge_rate, '% | Exp:', exp_bonus, 'x') AS secondary_attributes
FROM t_role_attribute_cache 
WHERE role_id = 45;
```

## 🎯 预期效果

执行 SQL 脚本后，刷新前端页面应该可以看到：

### 角色页面 (character.html)
- ✅ 属性面板显示完整的 HP、MP、ATK、DEF、Speed
- ✅ 显示暴击率、闪避率、经验加成
- ✅ 显示年龄和寿元信息

### 修炼页面 (cultivation.html)
- ✅ 不再报"资源不存在"错误
- ✅ 可以正常显示角色属性

## 📁 相关文件

- **SQL 脚本**: [`ROLE_45_ATTRIBUTES.sql`](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/ROLE_45_ATTRIBUTES.sql)
- **完整初始化**: [`V18__init_role_45_attributes.sql`](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/V18__init_role_45_attributes.sql)
- **属性系统**: [`V17__attribute_calculation_and_longevity_system.sql`](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/V17__attribute_calculation_and_longevity_system.sql)

## ⚠️ 注意事项

1. **执行顺序**: 必须先执行 `V17__attribute_calculation_and_longevity_system.sql` 创建表结构，再执行此脚本
2. **数据备份**: 执行前建议备份数据库
3. **重复执行**: 脚本使用了 `ON DUPLICATE KEY UPDATE`，可以重复执行
4. **境界变化**: 如果角色突破到炼气期，需要重新计算属性（境界倍率会变化）

## 🔄 重新计算属性

当角色的装备、技能、境界等发生变化时，需要重新计算属性：

```bash
# 方法 1: 调用 API
curl -X POST http://localhost:8088/api/attributes/45/recalculate

# 方法 2: 删除缓存让系统自动重新计算
DELETE FROM t_role_attribute_cache WHERE role_id = 45;
# 然后访问角色页面，系统会自动重新计算
```

---

**创建时间**: 2026-03-31  
**适用角色**: 角色 ID 45  
**测试状态**: 待测试
